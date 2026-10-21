-- Remembers where each imported script came from, so that the next import can merge instead of
-- replacing the whole script.
--
-- One row per script on this editor that was imported from another editor (e.g. LIVE <- DEV).
-- - base_snapshot: the source content that this script's PUBLISHED state corresponds to. It is the
--   common ancestor for the next import's three-way merge (keep LIVE-only additions, apply the
--   source's own additions and removals) and holds the source-id -> local-id map that keeps screen,
--   diagnosis and problem ids stable across imports.
-- - pending_snapshot: the same, for an import saved as drafts but not yet published. Publishing
--   promotes it to base_snapshot; discarding the drafts clears it.
--
-- target_script_id has no foreign key on purpose: a newly imported script may exist only as a draft.

CREATE TABLE IF NOT EXISTS "nt_script_import_sources" (
  "id" serial PRIMARY KEY NOT NULL,
  "target_script_id" uuid NOT NULL,
  "source_site_id" uuid,
  "source_site_link" text,
  "source_script_id" uuid NOT NULL,
  "base_snapshot" jsonb,
  "pending_snapshot" jsonb,
  "pending_by_user_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "nt_script_import_sources_target_script_id_unique" UNIQUE("target_script_id")
);

DO $$ BEGIN
  ALTER TABLE "nt_script_import_sources"
    ADD CONSTRAINT "nt_script_import_sources_pending_by_user_id_nt_users_user_id_fk"
    FOREIGN KEY ("pending_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "script_import_sources_source_index"
  ON "nt_script_import_sources" USING btree ("source_site_id", "source_script_id");



-- Content sync between two editors (e.g. DEV = source, LIVE = target). See lib/content-sync.ts.
--
-- 1. nt_editor_info.content_sync: the settings (role, linked site, editing lock, hotfixes, ...).
--    Empty means "off": everything behaves as before.
-- 2. nt_content_sync_hotfixes: hotfixes opened by admins on a target editor, one script at a time.
-- 3. nt_script_import_sources: the last sync point of each imported script (fingerprints of the imported
--    source content and of this editor's published content right after the import was published).
--
-- Run after 2026-10-20_add_script_import_sources.sql.

ALTER TABLE "nt_editor_info" ADD COLUMN IF NOT EXISTS "content_sync" jsonb DEFAULT '{}'::jsonb NOT NULL;

CREATE TABLE IF NOT EXISTS "nt_content_sync_hotfixes" (
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

DO $$ BEGIN
  ALTER TABLE "nt_content_sync_hotfixes"
    ADD CONSTRAINT "nt_content_sync_hotfixes_opened_by_user_id_nt_users_user_id_fk"
    FOREIGN KEY ("opened_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "nt_content_sync_hotfixes"
    ADD CONSTRAINT "nt_content_sync_hotfixes_closed_by_user_id_nt_users_user_id_fk"
    FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "content_sync_hotfixes_script_index" ON "nt_content_sync_hotfixes" USING btree ("script_id");

ALTER TABLE "nt_script_import_sources" ADD COLUMN IF NOT EXISTS "source_fingerprint" text;
ALTER TABLE "nt_script_import_sources" ADD COLUMN IF NOT EXISTS "target_fingerprint" text;
ALTER TABLE "nt_script_import_sources" ADD COLUMN IF NOT EXISTS "synced_at" timestamp;
ALTER TABLE "nt_script_import_sources" ADD COLUMN IF NOT EXISTS "pending_source_fingerprint" text;
