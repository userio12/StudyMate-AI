import { index, pgTable, text, timestamp, integer, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  sessionCount: integer('session_count').default(0).notNull(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('idx_users_email').on(table.email),
  clerkIdIdx: index('idx_users_clerk_id').on(table.clerkId),
}));
