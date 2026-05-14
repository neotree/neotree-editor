DO $$ BEGIN
 CREATE TYPE "public"."apk_release_status" AS ENUM('uploaded', 'validated', 'approved', 'available', 'deprecated', 'revoked', 'rolled_back');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "change_log_entity" ADD VALUE 'app_update_policy';--> statement-breakpoint
ALTER TYPE "change_log_entity" ADD VALUE 'apk_release';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_apk_releases" (
	"id" serial PRIMARY KEY NOT NULL,
	"apk_release_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"runtime_version" text NOT NULL,
	"version_name" text NOT NULL,
	"version_code" integer NOT NULL,
	"status" "apk_release_status" DEFAULT 'uploaded' NOT NULL,
	"is_available" boolean DEFAULT false NOT NULL,
	"file_id" uuid,
	"file_size" integer,
	"checksum_sha256" text,
	"signature_sha256" text,
	"validated_at" timestamp,
	"approved_at" timestamp,
	"release_notes" text DEFAULT '',
	"released_at" timestamp,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_apk_releases_apk_release_id_unique" UNIQUE("apk_release_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_apk_releases_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"apk_release_draft_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"apk_release_id" uuid,
	"data" jsonb NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_apk_releases_drafts_apk_release_draft_id_unique" UNIQUE("apk_release_draft_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_app_update_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"runtime_version" text NOT NULL,
	"policy_version" integer DEFAULT 1 NOT NULL,
	"ota_enabled" boolean DEFAULT true NOT NULL,
	"ota_channel" text DEFAULT 'production' NOT NULL,
	"apk_auto_download" boolean DEFAULT true NOT NULL,
	"apk_force_install" boolean DEFAULT false NOT NULL,
	"apk_grace_period_hours" integer,
	"apk_force_after" timestamp,
	"apk_install_window" text DEFAULT 'on_restart',
	"apk_message_title" text DEFAULT '',
	"apk_message_body" text DEFAULT '',
	"current_apk_release_id" uuid,
	"rollback_apk_release_id" uuid,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_app_update_policies_policy_id_unique" UNIQUE("policy_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_app_update_policies_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_draft_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"policy_id" uuid,
	"data" jsonb NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_app_update_policies_drafts_policy_draft_id_unique" UNIQUE("policy_draft_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_device_app_states" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"app_version" text NOT NULL,
	"runtime_version" text NOT NULL,
	"ota_update_id" text,
	"ota_channel" text,
	"apk_release_id" uuid,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"reported_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_device_update_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"device_id" text NOT NULL,
	"event_type" text NOT NULL,
	"app_version" text,
	"runtime_version" text,
	"ota_update_id" text,
	"ota_channel" text,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_device_update_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_apk_releases" ADD CONSTRAINT "nt_apk_releases_file_id_nt_files_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."nt_files"("file_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_apk_releases" ADD CONSTRAINT "nt_apk_releases_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_apk_releases_drafts" ADD CONSTRAINT "nt_apk_releases_drafts_apk_release_id_nt_apk_releases_apk_release_id_fk" FOREIGN KEY ("apk_release_id") REFERENCES "public"."nt_apk_releases"("apk_release_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_apk_releases_drafts" ADD CONSTRAINT "nt_apk_releases_drafts_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_app_update_policies" ADD CONSTRAINT "nt_app_update_policies_current_apk_release_id_nt_apk_releases_apk_release_id_fk" FOREIGN KEY ("current_apk_release_id") REFERENCES "public"."nt_apk_releases"("apk_release_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_app_update_policies" ADD CONSTRAINT "nt_app_update_policies_rollback_apk_release_id_nt_apk_releases_apk_release_id_fk" FOREIGN KEY ("rollback_apk_release_id") REFERENCES "public"."nt_apk_releases"("apk_release_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_app_update_policies" ADD CONSTRAINT "nt_app_update_policies_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_app_update_policies_drafts" ADD CONSTRAINT "nt_app_update_policies_drafts_policy_id_nt_app_update_policies_policy_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."nt_app_update_policies"("policy_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_app_update_policies_drafts" ADD CONSTRAINT "nt_app_update_policies_drafts_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_device_app_states" ADD CONSTRAINT "nt_device_app_states_apk_release_id_nt_apk_releases_apk_release_id_fk" FOREIGN KEY ("apk_release_id") REFERENCES "public"."nt_apk_releases"("apk_release_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "apk_release_unique_version" ON "nt_apk_releases" USING btree ("runtime_version","version_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apk_release_status_index" ON "nt_apk_releases" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "device_app_state_unique" ON "nt_device_app_states" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_update_events_device_idx" ON "nt_device_update_events" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_update_events_type_idx" ON "nt_device_update_events" USING btree ("event_type");