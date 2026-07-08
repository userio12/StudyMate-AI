ALTER TABLE "chunks" ALTER COLUMN "embedding" SET DATA TYPE vector(768);--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "progress" integer DEFAULT 0 NOT NULL;