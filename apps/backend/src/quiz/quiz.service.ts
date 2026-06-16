import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { QuizGeneratorService } from './quiz-generator.service.js';
import { QuizScorerService } from './quiz-scorer.service.js';
import { quizzes, quizQuestions, quizAttempts } from '@studymate/db';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class QuizService {
  constructor(
    private db: DatabaseService,
    private generator: QuizGeneratorService,
    private scorer: QuizScorerService,
  ) {}

  async generateQuiz(documentIds: string[], difficulty: string, userId: string, questionCount = 5) {
    const questions = await this.generator.generate(documentIds, difficulty, questionCount);

    const quizId = crypto.randomUUID();

    await this.db.db!.transaction(async (tx) => {
      await tx.insert(quizzes).values({
        id: quizId,
        userId,
        title: `Quiz on ${difficulty} difficulty`,
        documentIds,
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
        questionCount: questions.length,
      });

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]!;
        await tx.insert(quizQuestions).values({
          id: crypto.randomUUID(),
          quizId,
          questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
          question: q.question,
          options: q.options ?? [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          sourceChunkId: q.sourceChunkId,
          order: i,
        });
      }
    });

    return { id: quizId, questionCount: questions.length };
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

    return { ...quiz, questions };
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

    const result = this.scorer.score(questions, answers);

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
