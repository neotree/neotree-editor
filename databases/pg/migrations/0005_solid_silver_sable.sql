ALTER TYPE "change_log_entity" ADD VALUE 'hospital';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_hospitals_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"hospital_draft_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"hospital_id" uuid,
	"data" jsonb NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_hospitals_drafts_hospital_draft_id_unique" UNIQUE("hospital_draft_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_hospitals_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"hospital_id" uuid NOT NULL,
	"restore_key" uuid,
	"data" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nt_change_logs" ADD COLUMN "hospital_id" uuid;--> statement-breakpoint
ALTER TABLE "nt_hospitals" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_pending_deletion" ADD COLUMN "hospital_id" uuid;--> statement-breakpoint
ALTER TABLE "nt_pending_deletion" ADD COLUMN "hospital_draft_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_hospitals_drafts" ADD CONSTRAINT "nt_hospitals_drafts_hospital_id_nt_hospitals_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."nt_hospitals"("hospital_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_hospitals_drafts" ADD CONSTRAINT "nt_hospitals_drafts_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_hospitals_history" ADD CONSTRAINT "nt_hospitals_history_hospital_id_nt_hospitals_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."nt_hospitals"("hospital_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_hospital_id_nt_hospitals_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."nt_hospitals"("hospital_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_hospital_id_nt_hospitals_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."nt_hospitals"("hospital_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_hospital_draft_id_nt_hospitals_drafts_hospital_draft_id_fk" FOREIGN KEY ("hospital_draft_id") REFERENCES "public"."nt_hospitals_drafts"("hospital_draft_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
