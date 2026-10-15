-- Data key operation history: record deletes, replacements and unlinks next to
-- merges.
--
-- nt_data_key_merges started as the merge audit trail (see
-- 2026-10-10-add_data_key_merges.sql). Deleting or replacing a data key,
-- replacing/removing it in selected scripts, and unlinking options from a
-- parent are now recorded the same way — with the draft rows before/after — so
-- they show the same exact preview and can be reverted until published.
--
-- kind: merge | delete | scripts | unlink. Existing rows are merges.
-- title: a readable summary shown in the history list.
--
-- Same change as databases/pg/migrations/0015_hard_impossible_man.sql.
-- Idempotent: safe to run more than once.

ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "kind" text DEFAULT 'merge' NOT NULL;
ALTER TABLE "nt_data_key_merges" ADD COLUMN IF NOT EXISTS "title" text DEFAULT '' NOT NULL;
