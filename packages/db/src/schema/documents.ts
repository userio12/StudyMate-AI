import { index, pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const documentStatusEnum = pgEnum('document_status', ['pending', 'processing', 'ready', 'error']);

export const documents = pgTable(
  'documents',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    fileName: text('file_name').notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: text('mime_type').notNull(),
    s3Key: text('s3_key').notNull(),
    status: documentStatusEnum('status').default('pending').notNull(),
    pageCount: integer('page_count'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_documents_user_id').on(table.userId),
    statusIdx: index('idx_documents_status').on(table.status),
  }),
);
