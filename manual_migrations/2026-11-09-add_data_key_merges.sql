-- Data key harmonisation: operation history and duplicate dismissals.
--
-- nt_data_key_merges records every data key operation — merge, delete/replace,
-- replace or remove in selected scripts, and unlink from a parent:
--   - what was asked (request) and what changed in each script (report);
--   - the draft rows in scope before and after it (snapshot), which is what makes
--     "Revert" possible: while the drafts are still exactly as the operation left
--     them, the "before" rows are put back;
--   - its status, which follows publishing:
--       applied   -> saved as drafts, can be reverted
--       published -> its drafts went out in a release (who, when, which version)
--       discarded -> its drafts were discarded, so it never reached the app
--       reverted  -> undone before publishing
--     Once published or discarded the snapshot is cleared (no revert any more).
--
-- nt_data_key_duplicate_dismissals holds duplicate groups marked "not a
-- duplicate", keyed by the sorted uniqueKeys of the group, so the same group
-- stays hidden on the harmonise page until it is restored.
--
-- Matches databases/pg/schema.ts (dataKeyMerges, dataKeyDuplicateDismissals).
--
-- Works on a fresh database and on one that already has an earlier version of
-- these tables (it only adds what is missing). Idempotent: safe to run more than
-- once.
--
-- Run it with plain psql, NOT inside BEGIN/COMMIT: PostgreSQL cannot use a new
-- enum value in the transaction that added it (step 3 uses the ones step 2 adds
-- on an older database). psql's default autocommit is fine:
--   psql "$POSTGRES_DB_URL" -f manual_migrations/2026-11-09-add_data_key_merges.sql

-- gen_random_uuid() needs pgcrypto before Postgres 13. Existing databases
-- already have it; this keeps the file working on a fresh one.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tables ---------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "public"."data_key_merge_status" AS ENUM ('applied', 'reverted', 'published', 'discarded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "nt_data_key_merges" (
  "id" serial PRIMARY KEY NOT NULL,
  "merge_id" uuid DEFAULT gen_random_uuid() NOT NULL,
  -- merge | delete | scripts | unlink
  "kind" text DEFAULT 'merge' NOT NULL,
  -- readable summary shown in the history list
  "title" text DEFAULT '' NOT NULL,
  "status" "data_key_merge_status" DEFAULT 'applied' NOT NULL,
  "scope" text NOT NULL,
  "survivor_unique_key" text NOT NULL,
  "survivor_name" text DEFAULT '' NOT NULL,
  "merged_unique_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "script_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "request" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "report" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_by_user_id" uuid,
  "reverted_by_user_id" uuid,
  "published_by_user_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "reverted_at" timestamp,
  "published_at" timestamp,
  -- the release (editor data version) it went out in
  "published_data_version" integer,
  "discarded_at" timestamp,
  CONSTRAINT "nt_data_key_merges_merge_id_unique" UNIQUE ("merge_id")
);

CREATE TABLE IF NOT EXISTS "nt_data_key_duplicate_dismissals" (
  "id" serial PRIMARY KEY NOT NULL,
  "group_key" text NOT NULL,
  "unique_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "reason" text DEFAULT '' NOT NULL,
  "created_by_user_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "nt_data_key_duplicate_dismissals_group_key_unique" UNIQUE ("group_key")
);

-- 2. What an earlier version of these tables lacks (no-ops on a fresh database)

ALTER TYPE "public"."data_key_merge_status" ADD VALUE IF NOT EXISTS 'published';
ALTER TYPE "public"."data_key_merge_status" ADD VALUE IF NOT EXISTS 'discarded';

ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "kind" text DEFAULT 'merge' NOT NULL;
ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "title" text DEFAULT '' NOT NULL;
ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "published_by_user_id" uuid;
ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "published_at" timestamp;
ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "published_data_version" integer;
ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "discarded_at" timestamp;

-- Users can be removed without losing the history: the link is cleared.
DO $$ BEGIN
  ALTER TABLE "nt_data_key_merges"
    ADD CONSTRAINT "nt_data_key_merges_created_by_user_id_nt_users_user_id_fk"
    FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "nt_data_key_merges"
    ADD CONSTRAINT "nt_data_key_merges_reverted_by_user_id_nt_users_user_id_fk"
    FOREIGN KEY ("reverted_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "nt_data_key_merges"
    ADD CONSTRAINT "nt_data_key_merges_published_by_user_id_nt_users_user_id_fk"
    FOREIGN KEY ("published_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "nt_data_key_duplicate_dismissals"
    ADD CONSTRAINT "nt_data_key_duplicate_dismissals_created_by_user_id_nt_users_user_id_fk"
    FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "data_key_merges_status_index" ON "nt_data_key_merges" USING btree ("status");
CREATE INDEX IF NOT EXISTS "data_key_merges_created_at_index" ON "nt_data_key_merges" USING btree ("created_at");

-- 3. Backfill for operations recorded before statuses followed publishing ----
--    (a no-op on a fresh database). An operation still "applied" whose drafts
--    are all gone was published or discarded since. It counts as published when
--    the keys it deleted are gone from the library (merges and library deletes);
--    for an operation that deletes no key, when a publish happened after it.
--    Otherwise it was discarded. The exact release is unknown, so published_at /
--    published_data_version stay empty for these. Operations whose drafts still
--    exist are untouched.
WITH ops AS (
    SELECT
        m.id,
        m.created_at,
        -- Rows written by older drizzle versions hold the JSON as a string.
        CASE jsonb_typeof(m.snapshot) WHEN 'string' THEN (m.snapshot #>> '{}')::jsonb ELSE m.snapshot END AS snap,
        CASE jsonb_typeof(m.report) WHEN 'string' THEN (m.report #>> '{}')::jsonb ELSE m.report END AS rep
    FROM "nt_data_key_merges" m
    WHERE m.status = 'applied'
),
settled AS (
    SELECT o.*
    FROM ops o
    WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(o.snap->'after'->'scriptsDrafts', '[]'::jsonb)) r JOIN "nt_scripts_drafts" d ON d.id = (r->>'id')::int)
      AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(o.snap->'after'->'screensDrafts', '[]'::jsonb)) r JOIN "nt_screens_drafts" d ON d.id = (r->>'id')::int)
      AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(o.snap->'after'->'diagnosesDrafts', '[]'::jsonb)) r JOIN "nt_diagnoses_drafts" d ON d.id = (r->>'id')::int)
      AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(o.snap->'after'->'problemsDrafts', '[]'::jsonb)) r JOIN "nt_problems_drafts" d ON d.id = (r->>'id')::int)
      AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(o.snap->'after'->'dataKeysDrafts', '[]'::jsonb)) r JOIN "nt_data_keys_drafts" d ON d.id = (r->>'id')::int)
      AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(o.snap->'after'->'pendingDeletion', '[]'::jsonb)) r JOIN "nt_pending_deletion" d ON d.id = (r->>'id')::int)
),
outcome AS (
    SELECT
        s.id,
        CASE
            WHEN jsonb_array_length(COALESCE(s.rep->'deletedDataKeyIds', '[]'::jsonb)) > 0 THEN NOT EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text(s.rep->'deletedDataKeyIds') deleted(uuid)
                JOIN "nt_data_keys" k ON k.uuid::text = deleted.uuid
                WHERE k.deleted_at IS NULL
            )
            ELSE COALESCE((SELECT ei.last_publish_date > s.created_at FROM "nt_editor_info" ei LIMIT 1), false)
        END AS published
    FROM settled s
)
UPDATE "nt_data_key_merges" m
SET
    status = CASE WHEN o.published THEN 'published'::data_key_merge_status ELSE 'discarded'::data_key_merge_status END,
    discarded_at = CASE WHEN o.published THEN NULL ELSE now() END,
    snapshot = '{}'::jsonb
FROM outcome o
WHERE m.id = o.id;
