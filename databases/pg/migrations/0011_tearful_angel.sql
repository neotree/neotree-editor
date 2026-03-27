ALTER TYPE "change_log_entity" ADD VALUE 'problem';--> statement-breakpoint
ALTER TYPE "screen_type" ADD VALUE 'problems';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_problems" (
	"id" serial PRIMARY KEY NOT NULL,
	"problem_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"old_script_id" text,
	"version" integer NOT NULL,
	"script_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"source" text DEFAULT 'editor',
	"expression" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"key" text DEFAULT '',
	"key_id" text DEFAULT '' NOT NULL,
	"severity_order" integer,
	"expression_meaning" text DEFAULT '' NOT NULL,
	"text1" text DEFAULT '' NOT NULL,
	"text2" text DEFAULT '' NOT NULL,
	"text3" text DEFAULT '' NOT NULL,
	"image1" jsonb,
	"image2" jsonb,
	"image3" jsonb,
	"preferences" jsonb DEFAULT '{"fontSize":{},"fontWeight":{},"fontStyle":{},"textColor":{},"backgroundColor":{},"highlight":{}}' NOT NULL,
	"publish_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_problems_problem_id_unique" UNIQUE("problem_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_problems_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"problem_draft_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid,
	"script_id" uuid,
	"script_draft_id" uuid,
	"position" integer NOT NULL,
	"data" jsonb NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_problems_drafts_problem_draft_id_unique" UNIQUE("problem_draft_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_problems_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"problem_id" uuid NOT NULL,
	"script_id" uuid NOT NULL,
	"restore_key" text,
	"data" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nt_change_logs" ADD COLUMN "problem_id" uuid;--> statement-breakpoint
ALTER TABLE "nt_pending_deletion" ADD COLUMN "problem_id" uuid;--> statement-breakpoint
ALTER TABLE "nt_pending_deletion" ADD COLUMN "problem_script_id" uuid;--> statement-breakpoint
ALTER TABLE "nt_pending_deletion" ADD COLUMN "problem_draft_id" uuid;--> statement-breakpoint
ALTER TABLE "nt_screens" ADD COLUMN "hcw_problems_instructions" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_screens" ADD COLUMN "suggested_problems_instructions" text DEFAULT '' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_problems" ADD CONSTRAINT "nt_problems_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_problems_drafts" ADD CONSTRAINT "nt_problems_drafts_problem_id_nt_problems_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."nt_problems"("problem_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_problems_drafts" ADD CONSTRAINT "nt_problems_drafts_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_problems_drafts" ADD CONSTRAINT "nt_problems_drafts_script_draft_id_nt_scripts_drafts_script_draft_id_fk" FOREIGN KEY ("script_draft_id") REFERENCES "public"."nt_scripts_drafts"("script_draft_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_problems_drafts" ADD CONSTRAINT "nt_problems_drafts_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_problems_history" ADD CONSTRAINT "nt_problems_history_problem_id_nt_problems_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."nt_problems"("problem_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_problems_history" ADD CONSTRAINT "nt_problems_history_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "problems_search_index" ON "nt_problems" USING gin ((
                    to_tsvector('english', "name")
                ));--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_problem_id_nt_problems_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."nt_problems"("problem_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_problem_id_nt_problems_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."nt_problems"("problem_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_problem_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("problem_script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_problem_draft_id_nt_problems_drafts_problem_draft_id_fk" FOREIGN KEY ("problem_draft_id") REFERENCES "public"."nt_problems_drafts"("problem_draft_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
