import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, integer, vector } from 'drizzle-orm/pg-core';
import { documents } from './documents.js';

export const chunks = pgTable(
  'chunks',
  {
    id: text('id').primaryKey(),
    documentId: text('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    pageNumber: integer('page_number'),
    heading: text('heading'),
    chunkIndex: integer('chunk_index').notNull(),
    tokenCount: integer('token_count').notNull(),
    embedding: vector('embedding', { dimensions: 768 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    documentIdIdx: index('idx_chunks_document_id').on(table.documentId),
    contentGinIdx: index('idx_chunks_content_gin').using(
      'gin',
      sql`to_tsvector('english', ${table.content})`,
    ),
    embeddingIdx: index('idx_chunks_embedding').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ),
  }),
);
