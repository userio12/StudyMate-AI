import { pgTable, text, primaryKey } from 'drizzle-orm/pg-core';
import { conversations } from './conversations.js';
import { documents } from './documents.js';

export const conversationDocuments = pgTable(
  'conversation_documents',
  {
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    documentId: text('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.conversationId, table.documentId] }),
  }),
);
