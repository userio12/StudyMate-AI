import { index, pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { quizzes } from './quizzes.js';
import { users } from './users.js';

export const quizAttempts = pgTable(
  'quiz_attempts',
  {
    id: text('id').primaryKey(),
    quizId: text('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    answers: jsonb('answers').default({}).notNull(),
    score: integer('score'),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    quizIdIdx: index('idx_quiz_attempts_quiz_id').on(table.quizId),
    userIdIdx: index('idx_quiz_attempts_user_id').on(table.userId),
  }),
);
