ALTER TYPE "public"."data_key_merge_status" ADD VALUE 'published';--> statement-breakpoint
ALTER TYPE "public"."data_key_merge_status" ADD VALUE 'discarded';--> statement-breakpoint
ALTER TABLE "nt_data_key_merges" ADD COLUMN "published_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "nt_data_key_merges" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "nt_data_key_merges" ADD COLUMN "published_data_version" integer;--> statement-breakpoint
ALTER TABLE "nt_data_key_merges" ADD COLUMN "discarded_at" timestamp;--> statement-breakpoint
ALTER TABLE "nt_data_key_merges" ADD CONSTRAINT "nt_data_key_merges_published_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("published_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;