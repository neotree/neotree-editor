CREATE TABLE "nt_content_sync_hotfixes" (
	"id" serial PRIMARY KEY NOT NULL,
	"hotfix_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"opened_by_user_id" uuid,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"closed_by_user_id" uuid,
	"closed_at" timestamp,
	"close_note" text,
	CONSTRAINT "nt_content_sync_hotfixes_hotfix_id_unique" UNIQUE("hotfix_id")
);
--> statement-breakpoint
CREATE TABLE "nt_script_import_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"target_script_id" uuid NOT NULL,
	"source_site_id" uuid,
	"source_site_link" text,
	"source_script_id" uuid NOT NULL,
	"base_snapshot" jsonb,
	"pending_snapshot" jsonb,
	"pending_by_user_id" uuid,
	"source_fingerprint" text,
	"target_fingerprint" text,
	"synced_at" timestamp,
	"pending_source_fingerprint" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nt_script_import_sources_target_script_id_unique" UNIQUE("target_script_id")
);
--> statement-breakpoint
ALTER TABLE "nt_editor_info" ADD COLUMN "content_sync" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_screens" ADD COLUMN "confidential_label_only" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_data_keys" ADD COLUMN "confidential_label_only" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_content_sync_hotfixes" ADD CONSTRAINT "nt_content_sync_hotfixes_opened_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("opened_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nt_content_sync_hotfixes" ADD CONSTRAINT "nt_content_sync_hotfixes_closed_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nt_script_import_sources" ADD CONSTRAINT "nt_script_import_sources_pending_by_user_id_nt_users_user_id_fk" FOREIGN KEY ("pending_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_sync_hotfixes_script_index" ON "nt_content_sync_hotfixes" USING btree ("script_id");--> statement-breakpoint
CREATE INDEX "script_import_sources_source_index" ON "nt_script_import_sources" USING btree ("source_site_id","source_script_id");