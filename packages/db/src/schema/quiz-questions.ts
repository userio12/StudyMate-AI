import { index, pgTable, text, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { quizzes } from './quizzes.js';

export const questionTypeEnum = pgEnum('question_type', ['multiple_choice', 'true_false', 'short_answer']);

export const quizQuestions = pgTable(
  'quiz_questions',
  {
    id: text('id').primaryKey(),
    quizId: text('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    questionType: questionTypeEnum('question_type').notNull(),
    question: text('question').notNull(),
    options: jsonb('options').default([]),
    correctAnswer: text('correct_answer').notNull(),
    explanation: text('explanation'),
    sourceChunkId: text('source_chunk_id'),
    order: integer('order').notNull(),
  },
  (table) => ({
    quizIdIdx: index('idx_quiz_questions_quiz_id').on(table.quizId),
  }),
);
