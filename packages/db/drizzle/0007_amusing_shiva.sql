ALTER TABLE "conversations" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;