import { index, pgTable, text, timestamp, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { conversations } from './conversations.js';

export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);

export const messages = pgTable(
  'messages',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: messageRoleEnum('role').notNull(),
    content: text('content').notNull(),
    citations: jsonb('citations').default([]),
    tokenCount: integer('token_count'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    conversationIdIdx: index('idx_messages_conversation_id').on(table.conversationId),
    createdAtIdx: index('idx_messages_created_at').on(table.createdAt),
  }),
);
