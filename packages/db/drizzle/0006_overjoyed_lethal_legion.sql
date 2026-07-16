-- CREATE TABLE "conversation_documents" (
-- 	"conversation_id" text NOT NULL,
-- 	"document_id" text NOT NULL,
-- 	CONSTRAINT "conversation_documents_conversation_id_document_id_pk" PRIMARY KEY("conversation_id","document_id")
-- );
-- --> statement-breakpoint
-- CREATE TABLE "quiz_documents" (
-- 	"quiz_id" text NOT NULL,
-- 	"document_id" text NOT NULL,
-- 	CONSTRAINT "quiz_documents_quiz_id_document_id_pk" PRIMARY KEY("quiz_id","document_id")
-- );
-- --> statement-breakpoint
-- ALTER TABLE "documents" ADD COLUMN "progress" integer DEFAULT 0;--> statement-breakpoint
-- ALTER TABLE "documents" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_documents" ADD CONSTRAINT "conversation_documents_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_documents" ADD CONSTRAINT "conversation_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_documents" ADD CONSTRAINT "quiz_documents_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_documents" ADD CONSTRAINT "quiz_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "document_ids";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "document_ids";