import { pgTable, integer, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { tasks } from './tasks.js';
import { subjects } from './subjects.js';

export const studySessions = pgTable('study_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  subjectId: uuid('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  durationMinutes: integer('duration_minutes').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});
