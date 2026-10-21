-- Data key operation history follows publishing.
--
-- A recorded merge, delete/replace, replace-in-selected-scripts or unlink
-- (nt_data_key_merges) used to stay "applied" after its drafts were published
-- or discarded, so discarded operations still showed in the history. Now:
--   publish  -> "published", with who published it, when, and the release
--               (editor data version) it went out in;
--   discard  -> "discarded" (it never reached the app);
-- and the snapshot (only needed to revert) is cleared at that point. The
-- history lists published operations; unpublished ones are listed separately
-- until they are published, discarded or reverted.
--
-- Same change as databases/pg/migrations/0016_silly_young_avengers.sql, plus a
-- one-off backfill for operations recorded before it (step 3).
--
-- Run the statements one by one, NOT inside BEGIN/COMMIT: PostgreSQL cannot use
-- a new enum value in the transaction that added it (psql's default autocommit
-- is fine).
-- Idempotent: safe to run more than once.

-- 1. New statuses.
ALTER TYPE "public"."data_key_merge_status" ADD VALUE IF NOT EXISTS 'published';
ALTER TYPE "public"."data_key_merge_status" ADD VALUE IF NOT EXISTS 'discarded';

-- 2. Who/when/which release.
ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "published_by_user_id" uuid;
ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "published_at" timestamp;
ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "published_data_version" integer;
ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "discarded_at" timestamp;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'nt_data_key_merges_published_by_user_id_nt_users_user_id_fk'
    ) THEN
        ALTER TABLE "nt_data_key_merges"
            ADD CONSTRAINT "nt_data_key_merges_published_by_user_id_nt_users_user_id_fk"
            FOREIGN KEY ("published_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE set null ON UPDATE no action;
    END IF;
END $$;

-- 3. Backfill. An operation still "applied" whose drafts are all gone was
--    published or discarded before this change. It counts as published when
--    the keys it deleted are gone from the library (merges and library
--    deletes); for an operation that deletes no key, when a publish happened
--    after it. Otherwise it was discarded. The exact release is unknown, so
--    published_at / published_data_version stay empty for these.
--    Operations whose drafts still exist are untouched.
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
