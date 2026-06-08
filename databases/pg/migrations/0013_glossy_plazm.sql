DO $$ BEGIN
 CREATE TYPE "public"."mdm_inventory_match_status" AS ENUM('unmatched', 'auto_linked', 'manually_linked', 'needs_review', 'conflict', 'ignored');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nt_mdm_device_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"inventory_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"provider" "mdm_provider" DEFAULT 'headwind' NOT NULL,
	"profile_id" uuid NOT NULL,
	"mdm_device_id" text NOT NULL,
	"suggested_device_id" text,
	"linked_device_id" text,
	"country_iso" text,
	"mdm_config_id" text,
	"mdm_config_name" text,
	"mdm_group_id" text,
	"mdm_group_name" text,
	"enrollment_status" "mdm_enrollment_status" DEFAULT 'unknown' NOT NULL,
	"management_state" "mdm_management_state" DEFAULT 'unknown' NOT NULL,
	"serial_number" text,
	"android_version" text,
	"android_sdk" integer,
	"manufacturer" text,
	"model" text,
	"device_capabilities" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_mdm_seen_at" timestamp,
	"match_status" "mdm_inventory_match_status" DEFAULT 'unmatched' NOT NULL,
	"match_confidence" integer DEFAULT 0 NOT NULL,
	"match_reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"review_note" text,
	"ignored_at" timestamp,
	"reviewed_at" timestamp,
	"reviewed_by_user_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_mdm_device_inventory_inventory_id_unique" UNIQUE("inventory_id")
);
--> statement-breakpoint
ALTER TABLE "nt_device_mdm_links" ADD COLUMN "link_source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_device_mdm_links" ADD COLUMN "match_confidence" integer;--> statement-breakpoint
ALTER TABLE "nt_device_mdm_links" ADD COLUMN "match_reasons" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_mdm_provider_profiles" ADD COLUMN "last_device_sync_status" text;--> statement-breakpoint
ALTER TABLE "nt_mdm_provider_profiles" ADD COLUMN "last_device_sync_at" timestamp;--> statement-breakpoint
ALTER TABLE "nt_mdm_provider_profiles" ADD COLUMN "last_device_sync_error" text;--> statement-breakpoint
ALTER TABLE "nt_mdm_provider_profiles" ADD COLUMN "auto_sync_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_mdm_provider_profiles" ADD COLUMN "auto_link_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_mdm_provider_profiles" ADD COLUMN "auto_link_min_confidence" integer DEFAULT 95 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_mdm_device_inventory" ADD CONSTRAINT "nt_mdm_device_inventory_profile_id_nt_mdm_provider_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."nt_mdm_provider_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_mdm_device_inventory" ADD CONSTRAINT "nt_mdm_device_inventory_suggested_device_id_nt_devices_device_id_fk" FOREIGN KEY ("suggested_device_id") REFERENCES "public"."nt_devices"("device_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_mdm_device_inventory" ADD CONSTRAINT "nt_mdm_device_inventory_linked_device_id_nt_devices_device_id_fk" FOREIGN KEY ("linked_device_id") REFERENCES "public"."nt_devices"("device_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_mdm_device_inventory" ADD CONSTRAINT "nt_mdm_device_inventory_reviewed_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "mdm_device_inventory_profile_device_unique" ON "nt_mdm_device_inventory" USING btree ("profile_id","mdm_device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mdm_device_inventory_profile_idx" ON "nt_mdm_device_inventory" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mdm_device_inventory_match_status_idx" ON "nt_mdm_device_inventory" USING btree ("match_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mdm_device_inventory_suggested_device_idx" ON "nt_mdm_device_inventory" USING btree ("suggested_device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mdm_device_inventory_linked_device_idx" ON "nt_mdm_device_inventory" USING btree ("linked_device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mdm_device_inventory_serial_idx" ON "nt_mdm_device_inventory" USING btree ("serial_number");