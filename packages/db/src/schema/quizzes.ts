import { index, pgTable, text, timestamp, integer, jsonb, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const difficultyLevelEnum = pgEnum('difficulty_level', ['beginner', 'intermediate', 'advanced']);

export const quizzes = pgTable(
  'quizzes',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    documentIds: jsonb('document_ids').default([]).notNull(),
    difficulty: difficultyLevelEnum('difficulty').notNull(),
    questionCount: integer('question_count').notNull(),
    timeLimit: integer('time_limit'),
    isPinned: boolean('is_pinned').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_quizzes_user_id').on(table.userId),
  }),
);
