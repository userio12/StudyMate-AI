import { pgTable, integer, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  targetHours: integer('target_hours').notNull(),
  currentHours: integer('current_hours').default(0).notNull(),
  deadline: timestamp('deadline'),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
