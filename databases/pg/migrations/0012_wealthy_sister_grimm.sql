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
DROP INDEX IF EXISTS "active_version_index";--> statement-breakpoint
ALTER TABLE "nt_data_keys" ALTER COLUMN "unique_key" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "nt_diagnoses_drafts" ADD COLUMN "draft_origin" text;--> statement-breakpoint
ALTER TABLE "nt_editor_info" ADD COLUMN "integrity_policy" jsonb DEFAULT '{"enforcementMode":"block_new_issues_only","scanScope":"affected_scripts_only","triggerSources":{"scriptEdits":true,"dataKeyLibraryEdits":false,"deletions":true},"useBaseline":true}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_editor_info" ADD COLUMN "integrity_baseline" jsonb DEFAULT '{"capturedAt":null,"capturedByUserId":null,"totalBlockingIssues":0,"totalScripts":0,"fingerprintVersion":1,"ruleSetVersion":"2026-04-26","fingerprints":[]}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_problems" ADD COLUMN "symptoms" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_problems_drafts" ADD COLUMN "draft_origin" text;--> statement-breakpoint
ALTER TABLE "nt_screens_drafts" ADD COLUMN "draft_origin" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_admin_audit_logs" ADD CONSTRAINT "nt_admin_audit_logs_actor_user_id_nt_users_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_logs_area_index" ON "nt_admin_audit_logs" USING btree ("area");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_logs_action_index" ON "nt_admin_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_logs_actor_user_index" ON "nt_admin_audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_logs_created_at_index" ON "nt_admin_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "change_logs_single_active_version_idx" ON "nt_change_logs" USING btree ("entity_type","entity_id") WHERE "nt_change_logs"."is_active" = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_version_index" ON "nt_change_logs" USING btree ("entity_type","entity_id","is_active");