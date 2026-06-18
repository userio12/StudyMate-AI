CREATE TABLE "room_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_active_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_room_messages_room_id" ON "room_messages" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "idx_room_messages_created_at" ON "room_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_chunks_embedding" ON "chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_room_members_room_user_unique" ON "room_members" USING btree ("room_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_rooms_created_by" ON "rooms" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_clerk_id" ON "users" USING btree ("clerk_id");