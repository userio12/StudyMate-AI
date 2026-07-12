import { pgTable, text, primaryKey } from 'drizzle-orm/pg-core';
import { quizzes } from './quizzes.js';
import { documents } from './documents.js';

export const quizDocuments = pgTable(
  'quiz_documents',
  {
    quizId: text('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    documentId: text('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.quizId, table.documentId] }),
  }),
);
