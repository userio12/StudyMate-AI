DROP INDEX "idx_chunks_embedding_hnsw";--> statement-breakpoint
CREATE INDEX "idx_chunks_embedding" ON "chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "is_pinned";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "progress";--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "is_pinned";