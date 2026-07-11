import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { QuizGeneratorService } from './quiz-generator.service.js';
import { QuizScorerService } from './quiz-scorer.service.js';
import { quizzes, quizQuestions, quizAttempts, users } from '@studymate/db';
import { eq, and } from 'drizzle-orm';
import { DEFAULT_QUIZ_QUESTION_COUNT } from '@studymate/shared';

@Injectable()
export class QuizService {
  constructor(
    private db: DatabaseService,
    private generator: QuizGeneratorService,
    private scorer: QuizScorerService,
  ) {}

  async generateQuiz(documentIds: string[], difficulty: string, userId: string, questionCount = DEFAULT_QUIZ_QUESTION_COUNT, customTopic?: string, quizProvider?: string, quizModel?: string) {
    const userRecord = await this.db.db!.query.users.findFirst({
      where: eq(users.id, userId),
    });
    const preferredModel = quizProvider || (userRecord?.metadata as any)?.preferredModel as string | undefined;

    let resolvedDifficulty = difficulty;
    let adaptiveContext: string | undefined = undefined;

    if (difficulty === 'adaptive') {
      const pastAttempts = await this.db.db!.query.quizAttempts.findMany({
        where: eq(quizAttempts.userId, userId),
        orderBy: (a, { desc }) => [desc(a.completedAt)],
        limit: 5,
      });

      const completedAttempts = pastAttempts.filter(a => a.score !== null && a.score !== undefined);
      
      if (completedAttempts.length > 0) {
        const avgScore = completedAttempts.reduce((acc, a) => acc + (a.score ?? 0), 0) / completedAttempts.length;
        
        if (avgScore >= 80) {
          resolvedDifficulty = 'advanced';
          adaptiveContext = "The user has shown high proficiency (average score > 80%). Focus on nuanced edge-cases, synthesis of multiple concepts, and complex application scenarios.";
        } else if (avgScore >= 60) {
          resolvedDifficulty = 'intermediate';
          adaptiveContext = "The user has a solid grasp of the basics (average score ~70%). Provide a balanced mix of fundamental and applied questions.";
        } else {
          resolvedDifficulty = 'beginner';
          adaptiveContext = "The user is currently building foundational knowledge (average score < 60%). Focus heavily on fundamental definitions, core concepts, and straightforward applications.";
        }
      } else {
        // No past data, default to intermediate
        resolvedDifficulty = 'intermediate';
        adaptiveContext = "This is the user's first quiz. Provide a balanced, intermediate-level set of questions to establish a baseline.";
      }
    }

    const quizData = await this.generator.generate(documentIds, resolvedDifficulty, preferredModel, questionCount, adaptiveContext, customTopic, quizModel);

    const quizId = crypto.randomUUID();

    await this.db.db!.transaction(async (tx) => {
      await tx.insert(quizzes).values({
        id: quizId,
        userId,
        title: customTopic || quizData.topic,
        documentIds,
        difficulty: resolvedDifficulty as 'beginner' | 'intermediate' | 'advanced',
        questionCount: quizData.questions.length,
      });

      for (let i = 0; i < quizData.questions.length; i++) {
        const q = quizData.questions[i]!;
        await tx.insert(quizQuestions).values({
          id: crypto.randomUUID(),
          quizId,
          questionType: 'multiple_choice',
          question: q.question,
          options: q.options ?? [],
          correctAnswer: q.options[q.correctOptionIndex] ?? '',
          explanation: q.explanation,
          order: i,
        });
      }
    });

    return { id: quizId, questionCount: quizData.questions.length };
  }

  async listQuizzes(userId: string, limit = 20, offset = 0) {
    return this.db.db!.query.quizzes.findMany({
      where: eq(quizzes.userId, userId),
      orderBy: (q, { desc }) => [desc(q.createdAt)],
      limit,
      offset,
    });
  }

  async getQuiz(id: string, userId: string) {
    const quiz = await this.db.db!.query.quizzes.findFirst({
      where: eq(quizzes.id, id),
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.userId !== userId) throw new ForbiddenException();

    const questions = await this.db.db!.query.quizQuestions.findMany({
      where: eq(quizQuestions.quizId, id),
      orderBy: (q, { asc }) => [asc(q.order)],
    });

    const attempts = await this.db.db!.query.quizAttempts.findMany({
      where: and(eq(quizAttempts.quizId, id), eq(quizAttempts.userId, userId)),
      orderBy: (a, { desc }) => [desc(a.completedAt)],
    });

    return { ...quiz, questions, attempts };
  }

  async updateQuiz(id: string, userId: string, data: { title?: string; isPinned?: boolean }) {
    const quiz = await this.db.db!.query.quizzes.findFirst({
      where: and(eq(quizzes.id, id), eq(quizzes.userId, userId)),
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;

    if (Object.keys(updateData).length > 0) {
      await this.db.db!
        .update(quizzes)
        .set(updateData)
        .where(eq(quizzes.id, id));
    }

    return { ...quiz, ...updateData };
  }

  async deleteQuiz(id: string, userId: string) {
    const quiz = await this.db.db!.query.quizzes.findFirst({
      where: and(eq(quizzes.id, id), eq(quizzes.userId, userId)),
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    await this.db.db!.delete(quizzes).where(eq(quizzes.id, id));
    return { success: true };
  }

  async startAttempt(quizId: string, userId: string) {
    const quiz = await this.db.db!.query.quizzes.findFirst({
      where: eq(quizzes.id, quizId),
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const id = crypto.randomUUID();
    await this.db.db!.insert(quizAttempts).values({
      id,
      quizId,
      userId,
      answers: {},
    });

    return { id, quizId };
  }

  async submitAttempt(quizId: string, attemptId: string, answers: Record<string, string>, userId: string) {
    const attempt = await this.db.db!.query.quizAttempts.findFirst({
      where: and(eq(quizAttempts.id, attemptId), eq(quizAttempts.quizId, quizId)),
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId) throw new ForbiddenException();

    const questions = await this.db.db!.query.quizQuestions.findMany({
      where: eq(quizQuestions.quizId, quizId),
    });

    const result = this.scorer.score(
      questions.map(q => ({ ...q, options: (q.options as string[]) ?? [] })),
      answers
    );

    await this.db.db!
      .update(quizAttempts)
      .set({
        answers,
        score: result.score,
        completedAt: new Date(),
      })
      .where(eq(quizAttempts.id, attemptId));

    return result;
  }

  async listAttempts(userId: string) {
    return this.db.db!.query.quizAttempts.findMany({
      where: eq(quizAttempts.userId, userId),
      orderBy: (a, { desc }) => [desc(a.startedAt)],
    });
  }
}
