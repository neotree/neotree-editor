-- Data key harmonisation: merge audit trail and duplicate dismissals.
--
-- nt_data_key_merges records every data key merge: what was asked (request),
-- what changed in each script (report), and the draft rows in scope before and
-- after the merge (snapshot). The snapshot is what makes "Revert merge"
-- possible: while the drafts are still exactly as the merge left them, the
-- "before" rows are put back. Once they are published, discarded or edited,
-- a revert is refused.
--
-- nt_data_key_duplicate_dismissals holds duplicate groups marked "not a
-- duplicate", keyed by the sorted uniqueKeys of the group, so the same group
-- stays hidden on the harmonise page until it is restored.
--
-- Same schema as databases/pg/migrations/0014_silly_sugar_man.sql. Idempotent:
-- safe to run more than once.

-- gen_random_uuid() needs pgcrypto before Postgres 13. Existing databases
-- already have it; this keeps the file working on a fresh one.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE "public"."data_key_merge_status" AS ENUM ('applied', 'reverted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "nt_data_key_merges" (
  "id" serial PRIMARY KEY NOT NULL,
  "merge_id" uuid DEFAULT gen_random_uuid() NOT NULL,
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
  "created_at" timestamp DEFAULT now() NOT NULL,
  "reverted_at" timestamp,
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

-- Users can be removed without losing the audit trail: the link is cleared.
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
  ALTER TABLE "nt_data_key_duplicate_dismissals"
    ADD CONSTRAINT "nt_data_key_duplicate_dismissals_created_by_user_id_nt_users_user_id_fk"
    FOREIGN KEY ("created_by_user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "data_key_merges_status_index" ON "nt_data_key_merges" USING btree ("status");
CREATE INDEX IF NOT EXISTS "data_key_merges_created_at_index" ON "nt_data_key_merges" USING btree ("created_at");
