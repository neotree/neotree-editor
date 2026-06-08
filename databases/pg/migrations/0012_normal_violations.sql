DO $$ BEGIN
 CREATE TYPE "public"."apk_release_status" AS ENUM('uploaded', 'validated', 'approved', 'available', 'deprecated', 'revoked', 'rolled_back');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."app_update_delivery_mode" AS ENUM('in_app', 'mdm', 'hybrid', 'manual');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."device_rollout_state" AS ENUM('pending', 'policy_seen', 'mdm_push_requested', 'mdm_push_acknowledged', 'download_started', 'download_completed', 'install_started', 'installed', 'failed', 'rolled_back');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."mdm_enrollment_status" AS ENUM('pending', 'enrolled', 'unenrolled', 'failed', 'unknown');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."mdm_management_state" AS ENUM('managed', 'unmanaged', 'unknown', 'blocked', 'stolen', 'revoked');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."mdm_provider" AS ENUM('headwind');
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
	"apk_delivery_mode" "app_update_delivery_mode" DEFAULT 'in_app' NOT NULL,
	"apk_force_install" boolean DEFAULT false NOT NULL,
	"apk_grace_period_hours" integer,
	"apk_force_after" timestamp,
	"apk_install_window" text DEFAULT 'on_restart',
	"apk_message_title" text DEFAULT '',
	"apk_message_body" text DEFAULT '',
	"current_apk_release_id" uuid,
	"rollback_apk_release_id" uuid,
	"target_scope" text DEFAULT 'country' NOT NULL,
	"target_group_id" text,
	"target_hospital_id" uuid,
	"rollback_enabled" boolean DEFAULT false NOT NULL,
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
	"country_iso" text,
	"android_version" text,
	"android_sdk" integer,
	"manufacturer" text,
	"model" text,
	"device_capabilities" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ota_update_id" text,
	"ota_channel" text,
	"apk_release_id" uuid,
	"last_policy_seen_version" integer,
	"last_policy_seen_at" timestamp,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"reported_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_device_mdm_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"device_id" text NOT NULL,
	"provider" "mdm_provider" DEFAULT 'headwind' NOT NULL,
	"profile_id" uuid,
	"mdm_device_id" text,
	"mdm_config_id" text,
	"mdm_config_name" text,
	"mdm_group_id" text,
	"mdm_group_name" text,
	"country_iso" text,
	"hospital_id" uuid,
	"enrollment_status" "mdm_enrollment_status" DEFAULT 'unknown' NOT NULL,
	"management_state" "mdm_management_state" DEFAULT 'unknown' NOT NULL,
	"serial_number" text,
	"android_version" text,
	"device_capabilities" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_mdm_seen_at" timestamp,
	"last_synced_at" timestamp,
	"last_sync_status" text,
	"last_sync_error" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_device_mdm_links_link_id_unique" UNIQUE("link_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_device_rollout_states" (
	"id" serial PRIMARY KEY NOT NULL,
	"rollout_state_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"device_id" text NOT NULL,
	"apk_release_id" uuid,
	"country_iso" text,
	"delivery_mode" "app_update_delivery_mode" DEFAULT 'in_app' NOT NULL,
	"rollout_state" "device_rollout_state" DEFAULT 'pending' NOT NULL,
	"download_progress" integer DEFAULT 0,
	"mdm_push_requested_at" timestamp,
	"mdm_push_acknowledged_at" timestamp,
	"download_started_at" timestamp,
	"download_completed_at" timestamp,
	"install_started_at" timestamp,
	"install_completed_at" timestamp,
	"rollback_required" boolean DEFAULT false NOT NULL,
	"last_error_code" text,
	"last_error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_device_rollout_states_rollout_state_id_unique" UNIQUE("rollout_state_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_device_update_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"device_id" text NOT NULL,
	"event_type" text NOT NULL,
	"status" text,
	"country_iso" text,
	"app_version" text,
	"runtime_version" text,
	"apk_release_id" uuid,
	"ota_update_id" text,
	"ota_channel" text,
	"error_code" text,
	"error_message" text,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_device_update_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_files_aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_id" uuid,
	"alias" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_mdm_provider_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"provider" "mdm_provider" DEFAULT 'headwind' NOT NULL,
	"country_iso" text NOT NULL,
	"hospital_id" uuid,
	"environment" text DEFAULT 'production',
	"is_shared_instance" boolean DEFAULT false NOT NULL,
	"base_url" text NOT NULL,
	"api_key" text,
	"default_kiosk_policy" text,
	"provider_capabilities" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"last_connection_status" text,
	"last_connection_checked_at" timestamp,
	"last_connection_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_mdm_provider_profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
ALTER TABLE "nt_devices" ADD COLUMN "device_auth_secret" text;--> statement-breakpoint
ALTER TABLE "nt_devices" ADD COLUMN "device_auth_secret_rotated_at" timestamp;--> statement-breakpoint
ALTER TABLE "nt_scripts" ADD COLUMN "eligibility_criteria" jsonb;--> statement-breakpoint
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
 ALTER TABLE "nt_app_update_policies" ADD CONSTRAINT "nt_app_update_policies_target_hospital_id_nt_hospitals_hospital_id_fk" FOREIGN KEY ("target_hospital_id") REFERENCES "public"."nt_hospitals"("hospital_id") ON DELETE set null ON UPDATE no action;
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
DO $$ BEGIN
 ALTER TABLE "nt_device_mdm_links" ADD CONSTRAINT "nt_device_mdm_links_device_id_nt_devices_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."nt_devices"("device_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_device_mdm_links" ADD CONSTRAINT "nt_device_mdm_links_profile_id_nt_mdm_provider_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."nt_mdm_provider_profiles"("profile_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_device_mdm_links" ADD CONSTRAINT "nt_device_mdm_links_hospital_id_nt_hospitals_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."nt_hospitals"("hospital_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_device_rollout_states" ADD CONSTRAINT "nt_device_rollout_states_apk_release_id_nt_apk_releases_apk_release_id_fk" FOREIGN KEY ("apk_release_id") REFERENCES "public"."nt_apk_releases"("apk_release_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_device_update_events" ADD CONSTRAINT "nt_device_update_events_apk_release_id_nt_apk_releases_apk_release_id_fk" FOREIGN KEY ("apk_release_id") REFERENCES "public"."nt_apk_releases"("apk_release_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_files_aliases" ADD CONSTRAINT "nt_files_aliases_file_id_nt_files_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."nt_files"("file_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_mdm_provider_profiles" ADD CONSTRAINT "nt_mdm_provider_profiles_hospital_id_nt_hospitals_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."nt_hospitals"("hospital_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "apk_release_unique_version" ON "nt_apk_releases" USING btree ("runtime_version","version_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apk_release_status_index" ON "nt_apk_releases" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "device_app_state_unique" ON "nt_device_app_states" USING btree ("device_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "device_mdm_link_device_provider_unique" ON "nt_device_mdm_links" USING btree ("device_id","provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_mdm_links_device_idx" ON "nt_device_mdm_links" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_mdm_links_mdm_device_idx" ON "nt_device_mdm_links" USING btree ("mdm_device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_mdm_links_profile_idx" ON "nt_device_mdm_links" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_mdm_links_country_idx" ON "nt_device_mdm_links" USING btree ("country_iso");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "device_rollout_state_device_apk_unique" ON "nt_device_rollout_states" USING btree ("device_id","apk_release_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_rollout_states_device_idx" ON "nt_device_rollout_states" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_rollout_states_release_idx" ON "nt_device_rollout_states" USING btree ("apk_release_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_rollout_states_state_idx" ON "nt_device_rollout_states" USING btree ("rollout_state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_rollout_states_country_idx" ON "nt_device_rollout_states" USING btree ("country_iso");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_update_events_device_idx" ON "nt_device_update_events" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_update_events_type_idx" ON "nt_device_update_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mdm_provider_profiles_provider_idx" ON "nt_mdm_provider_profiles" USING btree ("provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mdm_provider_profiles_country_idx" ON "nt_mdm_provider_profiles" USING btree ("country_iso");