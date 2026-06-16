import { Injectable } from '@nestjs/common';

interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  order: number;
}

export interface ScoreResult {
  score: number;
  total: number;
  correct: number;
  incorrect: number;
  details: Array<{
    questionId: string;
    question: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
  }>;
  weakTopics: string[];
}

@Injectable()
export class QuizScorerService {
  score(questions: Question[], answers: Record<string, string>): ScoreResult {
    const details: ScoreResult['details'] = [];
    let correct = 0;

    for (const q of questions) {
      const userAnswer = answers[q.id]?.trim().toLowerCase() ?? '';
      const isCorrect = userAnswer === q.correctAnswer.trim().toLowerCase();

      if (isCorrect) correct++;

      details.push({
        questionId: q.id,
        question: q.question,
        correct: isCorrect,
        userAnswer,
        correctAnswer: q.correctAnswer,
      });
    }

    const score = Math.round((correct / questions.length) * 100);

    const weakTopics = details
      .filter((d) => !d.correct)
      .map((d) => d.question);

    return {
      score,
      total: questions.length,
      correct,
      incorrect: questions.length - correct,
      details,
      weakTopics,
    };
  }
}
