DO $$ BEGIN
 CREATE TYPE "public"."change_log_action" AS ENUM('create', 'update', 'delete', 'publish', 'restore', 'rollback', 'merge');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."change_log_entity" AS ENUM('script', 'screen', 'diagnosis', 'config_key', 'drugs_library', 'data_key', 'alias');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."drug_type" AS ENUM('drug', 'fluid', 'feed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."dff_item_validation_type" AS ENUM('default', 'condition');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."list_style" AS ENUM('none', 'number', 'bullet');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."mailer_service" AS ENUM('gmail', 'smtp');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role_name" AS ENUM('user', 'admin', 'super_user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."screen_type" AS ENUM('diagnosis', 'checklist', 'form', 'management', 'multi_select', 'single_select', 'progress', 'timer', 'yesno', 'drugs', 'fluids', 'feeds', 'zw_edliz_summary_table', 'mwi_edliz_summary_table', 'edliz_summary_table', 'dynamic_form');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."script_type" AS ENUM('admission', 'discharge', 'neolab', 'drecord');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."site_env" AS ENUM('production', 'stage', 'development', 'demo');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."site_type" AS ENUM('nodeapi', 'webeditor');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"api_key_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"api_key" text NOT NULL,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_api_keys_api_key_id_unique" UNIQUE("api_key_id"),
	CONSTRAINT "nt_api_keys_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_auth_clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"client_token" text NOT NULL,
	"user_id" uuid,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_auth_clients_client_id_unique" UNIQUE("client_id"),
	CONSTRAINT "nt_auth_clients_client_token_unique" UNIQUE("client_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_change_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"change_log_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"entity_type" "change_log_entity" NOT NULL,
	"entity_id" uuid NOT NULL,
	"parent_version" integer,
	"merged_from_version" integer,
	"script_id" uuid,
	"screen_id" uuid,
	"diagnosis_id" uuid,
	"config_key_id" uuid,
	"drugs_library_item_id" uuid,
	"data_key_id" uuid,
	"alias_id" uuid,
	"action" "change_log_action" NOT NULL,
	"changes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"full_snapshot" jsonb NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"change_reason" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"superseded_by" integer,
	"superseded_at" timestamp,
	"user_id" uuid NOT NULL,
	"date_of_change" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"data_version" integer,
	CONSTRAINT "nt_change_logs_change_log_id_unique" UNIQUE("change_log_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_config_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_key_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"old_config_key_id" text,
	"position" integer NOT NULL,
	"version" integer NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"summary" text NOT NULL,
	"source" text DEFAULT 'editor',
	"preferences" jsonb DEFAULT '{"fontSize":{},"fontWeight":{},"fontStyle":{},"textColor":{},"backgroundColor":{},"highlight":{}}' NOT NULL,
	"publish_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_config_keys_config_key_id_unique" UNIQUE("config_key_id"),
	CONSTRAINT "nt_config_keys_old_config_key_id_unique" UNIQUE("old_config_key_id"),
	CONSTRAINT "nt_config_keys_key_unique" UNIQUE("key"),
	CONSTRAINT "nt_config_keys_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_config_keys_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_key_draft_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"config_key_id" uuid,
	"position" integer NOT NULL,
	"data" jsonb NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_config_keys_drafts_config_key_draft_id_unique" UNIQUE("config_key_draft_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_config_keys_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"config_key_id" uuid NOT NULL,
	"restore_key" uuid,
	"data" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"device_hash" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_devices_device_id_unique" UNIQUE("device_id"),
	CONSTRAINT "nt_devices_device_hash_unique" UNIQUE("device_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_diagnoses" (
	"id" serial PRIMARY KEY NOT NULL,
	"diagnosis_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"old_diagnosis_id" text,
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
	CONSTRAINT "nt_diagnoses_diagnosis_id_unique" UNIQUE("diagnosis_id"),
	CONSTRAINT "nt_diagnoses_old_diagnosis_id_unique" UNIQUE("old_diagnosis_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_diagnoses_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"diagnosis_draft_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"diagnosis_id" uuid,
	"script_id" uuid,
	"script_draft_id" uuid,
	"position" integer NOT NULL,
	"data" jsonb NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_diagnoses_drafts_diagnosis_draft_id_unique" UNIQUE("diagnosis_draft_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_diagnoses_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"diagnosis_id" uuid NOT NULL,
	"script_id" uuid NOT NULL,
	"restore_key" text,
	"data" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_drugs_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"key_id" text DEFAULT '' NOT NULL,
	"type" "drug_type" DEFAULT 'drug' NOT NULL,
	"drug" text DEFAULT '' NOT NULL,
	"min_gestation" double precision,
	"max_gestation" double precision,
	"min_weight" double precision,
	"max_weight" double precision,
	"min_age" double precision,
	"max_age" double precision,
	"hourly_feed" double precision,
	"hourly_feed_divider" double precision,
	"dosage" double precision,
	"dosage_multiplier" double precision,
	"day_of_life" text DEFAULT '' NOT NULL,
	"dosage_text" text DEFAULT '' NOT NULL,
	"management_text" text DEFAULT '' NOT NULL,
	"gestation_key" text DEFAULT '' NOT NULL,
	"weight_key" text DEFAULT '' NOT NULL,
	"diagnosis_key" text DEFAULT '' NOT NULL,
	"age_key" text DEFAULT '' NOT NULL,
	"age_key_id" text DEFAULT '' NOT NULL,
	"gestation_key_id" text DEFAULT '' NOT NULL,
	"weight_key_id" text DEFAULT '' NOT NULL,
	"diagnosis_key_id" text DEFAULT '' NOT NULL,
	"administration_frequency" text DEFAULT '' NOT NULL,
	"drug_unit" text DEFAULT '' NOT NULL,
	"route_of_administration" text DEFAULT '' NOT NULL,
	"position" integer NOT NULL,
	"condition" text DEFAULT '' NOT NULL,
	"validation_type" "dff_item_validation_type" DEFAULT 'default',
	"version" integer NOT NULL,
	"publish_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_drugs_library_item_id_unique" UNIQUE("item_id"),
	CONSTRAINT "nt_drugs_library_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_drugs_library_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_draft_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid,
	"key" text NOT NULL,
	"type" "drug_type" DEFAULT 'drug' NOT NULL,
	"position" integer NOT NULL,
	"data" jsonb NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_drugs_library_drafts_item_draft_id_unique" UNIQUE("item_draft_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_drugs_library_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"item_id" uuid NOT NULL,
	"restore_key" uuid,
	"data" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_editor_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"data_version" integer DEFAULT 1 NOT NULL,
	"last_publish_date" timestamp,
	"last_data_keys_sync_date" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"data" jsonb NOT NULL,
	CONSTRAINT "nt_email_templates_template_id_unique" UNIQUE("template_id"),
	CONSTRAINT "nt_email_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_files_file_id_unique" UNIQUE("file_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_files_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"chunk_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"data" "bytea" NOT NULL,
	CONSTRAINT "nt_files_chunks_chunk_id_unique" UNIQUE("chunk_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_hospitals" (
	"id" serial PRIMARY KEY NOT NULL,
	"hospital_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"old_hospital_id" text,
	"name" text NOT NULL,
	"country" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_hospitals_hospital_id_unique" UNIQUE("hospital_id"),
	CONSTRAINT "nt_hospitals_old_hospital_id_unique" UNIQUE("old_hospital_id"),
	CONSTRAINT "nt_hospitals_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"iso" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_languages_name_unique" UNIQUE("name"),
	CONSTRAINT "nt_languages_iso_unique" UNIQUE("iso")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_mailer_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"setting_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"service" "mailer_service" NOT NULL,
	"auth_username" text NOT NULL,
	"auth_password" text NOT NULL,
	"auth_type" text,
	"auth_method" text,
	"host" text DEFAULT '' NOT NULL,
	"port" integer,
	"encryption" text DEFAULT '' NOT NULL,
	"from_address" text DEFAULT '' NOT NULL,
	"from_name" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"secure" boolean DEFAULT false NOT NULL,
	CONSTRAINT "nt_mailer_settings_setting_id_unique" UNIQUE("setting_id"),
	CONSTRAINT "nt_mailer_settings_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_pending_deletion" (
	"id" serial PRIMARY KEY NOT NULL,
	"script_id" uuid,
	"screen_id" uuid,
	"screen_script_id" uuid,
	"diagnosis_id" uuid,
	"diagnosis_script_id" uuid,
	"config_key_id" uuid,
	"drugs_library_item_id" uuid,
	"script_draft_id" uuid,
	"screen_draft_id" uuid,
	"diagnosis_draft_id" uuid,
	"config_key_draft_id" uuid,
	"drugs_library_item_draft_id" uuid,
	"data_key_id" uuid,
	"data_key_draft_id" uuid,
	"alias_id" uuid,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_screens" (
	"id" serial PRIMARY KEY NOT NULL,
	"screen_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"old_screen_id" text,
	"old_script_id" text,
	"version" integer NOT NULL,
	"script_id" uuid NOT NULL,
	"type" "screen_type" NOT NULL,
	"position" integer NOT NULL,
	"source" text DEFAULT 'editor',
	"section_title" text NOT NULL,
	"preview_title" text DEFAULT '' NOT NULL,
	"preview_print_title" text DEFAULT '' NOT NULL,
	"condition" text DEFAULT '' NOT NULL,
	"skip_to_condition" text DEFAULT '' NOT NULL,
	"skip_to_screen_id" text,
	"epic_id" text DEFAULT '' NOT NULL,
	"story_id" text DEFAULT '' NOT NULL,
	"ref_id" text DEFAULT '' NOT NULL,
	"ref_id_data_key" text DEFAULT '' NOT NULL,
	"ref_key" text DEFAULT '' NOT NULL,
	"ref_key_data_key" text DEFAULT '' NOT NULL,
	"step" text DEFAULT '' NOT NULL,
	"action_text" text DEFAULT '' NOT NULL,
	"content_text" text DEFAULT '' NOT NULL,
	"content_text_image" jsonb,
	"info_text" text DEFAULT '' NOT NULL,
	"title" text NOT NULL,
	"title1" text DEFAULT '' NOT NULL,
	"title2" text DEFAULT '' NOT NULL,
	"title3" text DEFAULT '' NOT NULL,
	"title4" text DEFAULT '' NOT NULL,
	"text1" text DEFAULT '' NOT NULL,
	"text2" text DEFAULT '' NOT NULL,
	"text3" text DEFAULT '' NOT NULL,
	"image1" jsonb,
	"image2" jsonb,
	"image3" jsonb,
	"instructions" text DEFAULT '' NOT NULL,
	"instructions2" text DEFAULT '' NOT NULL,
	"instructions3" text DEFAULT '' NOT NULL,
	"instructions4" text DEFAULT '' NOT NULL,
	"hcw_diagnoses_instructions" text DEFAULT '' NOT NULL,
	"suggested_diagnoses_instructions" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"data_type" text DEFAULT '' NOT NULL,
	"key" text DEFAULT '' NOT NULL,
	"key_id" text DEFAULT '' NOT NULL,
	"label" text DEFAULT '' NOT NULL,
	"negative_label" text DEFAULT '' NOT NULL,
	"positive_label" text DEFAULT '' NOT NULL,
	"timer_value" integer,
	"multiplier" integer,
	"min_value" integer,
	"max_value" integer,
	"exportable" boolean DEFAULT true NOT NULL,
	"printable" boolean,
	"skippable" boolean DEFAULT false NOT NULL,
	"confidential" boolean DEFAULT false NOT NULL,
	"pre_populate" jsonb DEFAULT '[]' NOT NULL,
	"fields" jsonb DEFAULT '[]' NOT NULL,
	"items" jsonb DEFAULT '[]' NOT NULL,
	"preferences" jsonb DEFAULT '{"fontSize":{},"fontWeight":{},"fontStyle":{},"textColor":{},"backgroundColor":{},"highlight":{}}' NOT NULL,
	"drugs" jsonb DEFAULT '[]' NOT NULL,
	"fluids" jsonb DEFAULT '[]' NOT NULL,
	"feeds" jsonb DEFAULT '[]' NOT NULL,
	"reasons" jsonb DEFAULT '[]' NOT NULL,
	"list_style" "list_style" DEFAULT 'none' NOT NULL,
	"publish_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"collection_name" text DEFAULT '' NOT NULL,
	"collection_label" text DEFAULT '' NOT NULL,
	"repeatable" boolean,
	CONSTRAINT "nt_screens_screen_id_unique" UNIQUE("screen_id"),
	CONSTRAINT "nt_screens_old_screen_id_unique" UNIQUE("old_screen_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_screens_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"screen_draft_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"screen_id" uuid,
	"script_id" uuid,
	"script_draft_id" uuid,
	"type" "screen_type" NOT NULL,
	"position" integer NOT NULL,
	"data" jsonb NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_screens_drafts_screen_draft_id_unique" UNIQUE("screen_draft_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_screens_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"screen_id" uuid NOT NULL,
	"script_id" uuid NOT NULL,
	"restore_key" text,
	"data" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_scripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"script_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"old_script_id" text,
	"version" integer NOT NULL,
	"type" "script_type" DEFAULT 'admission' NOT NULL,
	"position" integer NOT NULL,
	"source" text DEFAULT 'editor',
	"title" text NOT NULL,
	"print_title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"hospital_id" uuid,
	"exportable" boolean DEFAULT true NOT NULL,
	"nuid_search_enabled" boolean DEFAULT false NOT NULL,
	"nuid_search_fields" jsonb DEFAULT '[]' NOT NULL,
	"reviewable" boolean DEFAULT false NOT NULL,
	"review_configurations" jsonb DEFAULT '[]' NOT NULL,
	"preferences" jsonb DEFAULT '{"fontSize":{},"fontWeight":{},"fontStyle":{},"textColor":{},"backgroundColor":{},"highlight":{}}' NOT NULL,
	"print_config" jsonb DEFAULT '{
              "headerFormat": "",
              "headerFields": [],
              "footerFields": [],
              "sections": []
            }' NOT NULL,
	"print_sections" jsonb DEFAULT '[]' NOT NULL,
	"publish_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_scripts_script_id_unique" UNIQUE("script_id"),
	CONSTRAINT "nt_scripts_old_script_id_unique" UNIQUE("old_script_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_scripts_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"script_draft_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid,
	"position" integer NOT NULL,
	"hospital_id" uuid,
	"data" jsonb NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_scripts_drafts_script_draft_id_unique" UNIQUE("script_draft_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_scripts_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"script_id" uuid NOT NULL,
	"restore_key" uuid,
	"data" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_sites" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"link" text NOT NULL,
	"api_key" text NOT NULL,
	"type" "site_type" NOT NULL,
	"env" "site_env" DEFAULT 'production' NOT NULL,
	"display_name" text,
	"country_iso" text,
	"country_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_sites_site_id_unique" UNIQUE("site_id"),
	CONSTRAINT "nt_sites_name_unique" UNIQUE("name"),
	CONSTRAINT "nt_sites_link_unique" UNIQUE("link")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_sys" (
	"_id" serial PRIMARY KEY NOT NULL,
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "nt_sys_id_unique" UNIQUE("id"),
	CONSTRAINT "nt_sys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" integer NOT NULL,
	"user_id" uuid,
	"valid_until" timestamp NOT NULL,
	CONSTRAINT "nt_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" "role_name" NOT NULL,
	"description" text,
	CONSTRAINT "nt_user_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"role" "role_name" DEFAULT 'user' NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"display_name" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"avatar" text,
	"avatar_sm" text,
	"avatar_md" text,
	"activation_date" timestamp,
	"last_login_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "nt_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_data_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
	"unique_key" uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
	"name" text NOT NULL,
	"label" text DEFAULT '' NOT NULL,
	"ref_id" text,
	"data_type" text NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer NOT NULL,
	"publish_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_data_keys_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "nt_data_keys_unique_key_unique" UNIQUE("unique_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_data_keys_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
	"name" text NOT NULL,
	"unique_key" uuid NOT NULL,
	"data_key_id" uuid,
	"data" jsonb NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_data_keys_drafts_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_data_keys_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"data_key_id" uuid NOT NULL,
	"restore_key" uuid,
	"data" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
	"name" text NOT NULL,
	"alias" text NOT NULL,
	"script" text NOT NULL,
	"old_script" text,
	"publish_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "nt_aliases_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_auth_clients" ADD CONSTRAINT "nt_auth_clients_user_id_nt_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_screen_id_nt_screens_screen_id_fk" FOREIGN KEY ("screen_id") REFERENCES "public"."nt_screens"("screen_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_diagnosis_id_nt_diagnoses_diagnosis_id_fk" FOREIGN KEY ("diagnosis_id") REFERENCES "public"."nt_diagnoses"("diagnosis_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_config_key_id_nt_config_keys_config_key_id_fk" FOREIGN KEY ("config_key_id") REFERENCES "public"."nt_config_keys"("config_key_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_drugs_library_item_id_nt_drugs_library_item_id_fk" FOREIGN KEY ("drugs_library_item_id") REFERENCES "public"."nt_drugs_library"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_data_key_id_nt_data_keys_uuid_fk" FOREIGN KEY ("data_key_id") REFERENCES "public"."nt_data_keys"("uuid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_alias_id_nt_aliases_uuid_fk" FOREIGN KEY ("alias_id") REFERENCES "public"."nt_aliases"("uuid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_user_id_nt_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_config_keys_drafts" ADD CONSTRAINT "nt_config_keys_drafts_config_key_id_nt_config_keys_config_key_id_fk" FOREIGN KEY ("config_key_id") REFERENCES "public"."nt_config_keys"("config_key_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_config_keys_drafts" ADD CONSTRAINT "nt_config_keys_drafts_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_config_keys_history" ADD CONSTRAINT "nt_config_keys_history_config_key_id_nt_config_keys_config_key_id_fk" FOREIGN KEY ("config_key_id") REFERENCES "public"."nt_config_keys"("config_key_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_diagnoses" ADD CONSTRAINT "nt_diagnoses_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_diagnoses_drafts" ADD CONSTRAINT "nt_diagnoses_drafts_diagnosis_id_nt_diagnoses_diagnosis_id_fk" FOREIGN KEY ("diagnosis_id") REFERENCES "public"."nt_diagnoses"("diagnosis_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_diagnoses_drafts" ADD CONSTRAINT "nt_diagnoses_drafts_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_diagnoses_drafts" ADD CONSTRAINT "nt_diagnoses_drafts_script_draft_id_nt_scripts_drafts_script_draft_id_fk" FOREIGN KEY ("script_draft_id") REFERENCES "public"."nt_scripts_drafts"("script_draft_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_diagnoses_drafts" ADD CONSTRAINT "nt_diagnoses_drafts_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_diagnoses_history" ADD CONSTRAINT "nt_diagnoses_history_diagnosis_id_nt_diagnoses_diagnosis_id_fk" FOREIGN KEY ("diagnosis_id") REFERENCES "public"."nt_diagnoses"("diagnosis_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_diagnoses_history" ADD CONSTRAINT "nt_diagnoses_history_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_drugs_library_drafts" ADD CONSTRAINT "nt_drugs_library_drafts_item_id_nt_drugs_library_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."nt_drugs_library"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_drugs_library_drafts" ADD CONSTRAINT "nt_drugs_library_drafts_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_drugs_library_history" ADD CONSTRAINT "nt_drugs_library_history_item_id_nt_drugs_library_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."nt_drugs_library"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_files" ADD CONSTRAINT "nt_files_owner_id_nt_users_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."nt_users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_files_chunks" ADD CONSTRAINT "nt_files_chunks_file_id_nt_files_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."nt_files"("file_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_screen_id_nt_screens_screen_id_fk" FOREIGN KEY ("screen_id") REFERENCES "public"."nt_screens"("screen_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_screen_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("screen_script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_diagnosis_id_nt_diagnoses_diagnosis_id_fk" FOREIGN KEY ("diagnosis_id") REFERENCES "public"."nt_diagnoses"("diagnosis_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_diagnosis_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("diagnosis_script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_config_key_id_nt_config_keys_config_key_id_fk" FOREIGN KEY ("config_key_id") REFERENCES "public"."nt_config_keys"("config_key_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_drugs_library_item_id_nt_drugs_library_item_id_fk" FOREIGN KEY ("drugs_library_item_id") REFERENCES "public"."nt_drugs_library"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_script_draft_id_nt_scripts_drafts_script_draft_id_fk" FOREIGN KEY ("script_draft_id") REFERENCES "public"."nt_scripts_drafts"("script_draft_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_screen_draft_id_nt_screens_drafts_screen_draft_id_fk" FOREIGN KEY ("screen_draft_id") REFERENCES "public"."nt_screens_drafts"("screen_draft_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_diagnosis_draft_id_nt_diagnoses_drafts_diagnosis_draft_id_fk" FOREIGN KEY ("diagnosis_draft_id") REFERENCES "public"."nt_diagnoses_drafts"("diagnosis_draft_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_config_key_draft_id_nt_config_keys_drafts_config_key_draft_id_fk" FOREIGN KEY ("config_key_draft_id") REFERENCES "public"."nt_config_keys_drafts"("config_key_draft_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_drugs_library_item_draft_id_nt_drugs_library_drafts_item_draft_id_fk" FOREIGN KEY ("drugs_library_item_draft_id") REFERENCES "public"."nt_drugs_library_drafts"("item_draft_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_data_key_id_nt_data_keys_uuid_fk" FOREIGN KEY ("data_key_id") REFERENCES "public"."nt_data_keys"("uuid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_data_key_draft_id_nt_data_keys_uuid_fk" FOREIGN KEY ("data_key_draft_id") REFERENCES "public"."nt_data_keys"("uuid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_alias_id_nt_aliases_uuid_fk" FOREIGN KEY ("alias_id") REFERENCES "public"."nt_aliases"("uuid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_pending_deletion" ADD CONSTRAINT "nt_pending_deletion_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_screens" ADD CONSTRAINT "nt_screens_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_screens_drafts" ADD CONSTRAINT "nt_screens_drafts_screen_id_nt_screens_screen_id_fk" FOREIGN KEY ("screen_id") REFERENCES "public"."nt_screens"("screen_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_screens_drafts" ADD CONSTRAINT "nt_screens_drafts_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_screens_drafts" ADD CONSTRAINT "nt_screens_drafts_script_draft_id_nt_scripts_drafts_script_draft_id_fk" FOREIGN KEY ("script_draft_id") REFERENCES "public"."nt_scripts_drafts"("script_draft_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_screens_drafts" ADD CONSTRAINT "nt_screens_drafts_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_screens_history" ADD CONSTRAINT "nt_screens_history_screen_id_nt_screens_screen_id_fk" FOREIGN KEY ("screen_id") REFERENCES "public"."nt_screens"("screen_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_screens_history" ADD CONSTRAINT "nt_screens_history_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_scripts" ADD CONSTRAINT "nt_scripts_hospital_id_nt_hospitals_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."nt_hospitals"("hospital_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_scripts_drafts" ADD CONSTRAINT "nt_scripts_drafts_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_scripts_drafts" ADD CONSTRAINT "nt_scripts_drafts_hospital_id_nt_hospitals_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."nt_hospitals"("hospital_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_scripts_drafts" ADD CONSTRAINT "nt_scripts_drafts_created_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_scripts_history" ADD CONSTRAINT "nt_scripts_history_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_tokens" ADD CONSTRAINT "nt_tokens_user_id_nt_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_users" ADD CONSTRAINT "nt_users_role_nt_user_roles_name_fk" FOREIGN KEY ("role") REFERENCES "public"."nt_user_roles"("name") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_data_keys_drafts" ADD CONSTRAINT "nt_data_keys_drafts_data_key_id_nt_data_keys_uuid_fk" FOREIGN KEY ("data_key_id") REFERENCES "public"."nt_data_keys"("uuid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_data_keys_history" ADD CONSTRAINT "nt_data_keys_history_data_key_id_nt_data_keys_uuid_fk" FOREIGN KEY ("data_key_id") REFERENCES "public"."nt_data_keys"("uuid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_version_per_entity" ON "nt_change_logs" USING btree ("entity_id","version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_version_index" ON "nt_change_logs" USING btree ("entity_id","is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "change_logs_entity_index" ON "nt_change_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "version_chain_index" ON "nt_change_logs" USING btree ("entity_id","parent_version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "change_logs_user_index" ON "nt_change_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "change_logs_date_index" ON "nt_change_logs" USING btree ("date_of_change");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "change_logs_data_version_index" ON "nt_change_logs" USING btree ("data_version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "config_keys_search_index" ON "nt_config_keys" USING gin ((
                    to_tsvector('english', "key") ||
                    to_tsvector('english', "label") ||
                    to_tsvector('english', "summary")
                ));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "diagnoses_search_index" ON "nt_diagnoses" USING gin ((
                    to_tsvector('english', "name")
                ));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hospitals_search_index" ON "nt_hospitals" USING gin ((
                    to_tsvector('english', "name")
                ));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "screens_search_index" ON "nt_screens" USING gin ((
                    to_tsvector('english', "title")
                ));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scripts_search_index" ON "nt_scripts" USING gin ((
                    to_tsvector('english', "title") ||
                    to_tsvector('english', "description")
                ));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_search_index" ON "nt_users" USING gin ((
                    to_tsvector('english', "email") ||
                    to_tsvector('english', "display_name") ||
                    to_tsvector('english', "first_name") ||
                    to_tsvector('english', "last_name")
                ));