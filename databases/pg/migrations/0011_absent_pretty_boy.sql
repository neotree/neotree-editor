DO $$ BEGIN
 CREATE TYPE "public"."draft_origin" AS ENUM('data_key_sync', 'editor', 'import', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."integrity_import_snapshot_status" AS ENUM('pending_review', 'accepted', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "change_log_entity" ADD VALUE 'problem';--> statement-breakpoint
ALTER TYPE "screen_type" ADD VALUE 'problems';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_admin_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"audit_log_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"area" text NOT NULL,
	"action" text NOT NULL,
	"actor_user_id" uuid,
	"before_state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"after_state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_admin_audit_logs_audit_log_id_unique" UNIQUE("audit_log_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_integrity_import_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"status" "integrity_import_snapshot_status" DEFAULT 'pending_review' NOT NULL,
	"source_type" text NOT NULL,
	"source_label" text,
	"imported_script_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"imported_data_key_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"fingerprint_version" integer NOT NULL,
	"rule_set_version" text NOT NULL,
	"total_blocking_issues" integer DEFAULT 0 NOT NULL,
	"total_scripts" integer DEFAULT 0 NOT NULL,
	"fingerprints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by_user_id" uuid,
	"accepted_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	CONSTRAINT "nt_integrity_import_snapshots_snapshot_id_unique" UNIQUE("snapshot_id")
);
--> statement-breakpoint
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
	"symptoms" jsonb DEFAULT '[]' NOT NULL,
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
	"draft_origin" "draft_origin" DEFAULT 'editor' NOT NULL,
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
DROP INDEX IF EXISTS "active_version_index";--> statement-breakpoint
ALTER TABLE "nt_data_keys" ALTER COLUMN "unique_key" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "nt_change_logs" ADD COLUMN "problem_id" uuid;--> statement-breakpoint
ALTER TABLE "nt_diagnoses_drafts" ADD COLUMN "draft_origin" "draft_origin" DEFAULT 'editor' NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_editor_info" ADD COLUMN "integrity_policy" jsonb DEFAULT '{"enforcementMode":"off","scanScope":"affected_scripts_only","triggerSources":{"scriptEdits":false,"dataKeyLibraryEdits":false,"deletions":false,"imports":false},"useBaseline":true}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_editor_info" ADD COLUMN "integrity_baseline" jsonb DEFAULT '{"capturedAt":null,"capturedByUserId":null,"totalBlockingIssues":0,"totalScripts":0,"fingerprintVersion":2,"ruleSetVersion":"2026-04-26","fingerprints":[],"acceptedImportFingerprints":[],"acceptedImportFingerprintRefs":{}}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_pending_deletion" ADD COLUMN "problem_id" uuid;--> statement-breakpoint
ALTER TABLE "nt_pending_deletion" ADD COLUMN "problem_script_id" uuid;--> statement-breakpoint
ALTER TABLE "nt_pending_deletion" ADD COLUMN "problem_draft_id" uuid;--> statement-breakpoint
ALTER TABLE "nt_screens" ADD COLUMN "hcw_problems_instructions" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_screens" ADD COLUMN "suggested_problems_instructions" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_screens_drafts" ADD COLUMN "draft_origin" "draft_origin" DEFAULT 'editor' NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_scripts_drafts" ADD COLUMN "draft_origin" "draft_origin" DEFAULT 'editor' NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_data_keys_drafts" ADD COLUMN "draft_origin" text DEFAULT 'editor' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_admin_audit_logs" ADD CONSTRAINT "nt_admin_audit_logs_actor_user_id_nt_users_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_integrity_import_snapshots" ADD CONSTRAINT "nt_integrity_import_snapshots_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_integrity_import_snapshots" ADD CONSTRAINT "nt_integrity_import_snapshots_accepted_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
CREATE INDEX IF NOT EXISTS "admin_audit_logs_area_index" ON "nt_admin_audit_logs" USING btree ("area");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_logs_action_index" ON "nt_admin_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_logs_actor_user_index" ON "nt_admin_audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_logs_created_at_index" ON "nt_admin_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integrity_import_snapshots_status_index" ON "nt_integrity_import_snapshots" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integrity_import_snapshots_source_type_index" ON "nt_integrity_import_snapshots" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integrity_import_snapshots_created_by_index" ON "nt_integrity_import_snapshots" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integrity_import_snapshots_accepted_by_index" ON "nt_integrity_import_snapshots" USING btree ("accepted_by_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integrity_import_snapshots_created_at_index" ON "nt_integrity_import_snapshots" USING btree ("created_at");--> statement-breakpoint
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
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "change_logs_single_active_version_idx" ON "nt_change_logs" USING btree ("entity_type","entity_id") WHERE "nt_change_logs"."is_active" = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_version_index" ON "nt_change_logs" USING btree ("entity_type","entity_id","is_active");