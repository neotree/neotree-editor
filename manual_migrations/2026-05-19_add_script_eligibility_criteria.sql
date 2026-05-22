-- Adds optional script-level eligibility criteria configuration.
--
-- Mapping note:
-- - Published script fields live on nt_scripts as columns.
-- - Draft script edits live in nt_scripts_drafts.data as a JSONB copy of the
--   script payload, so no additional draft-table column is required.
-- - Script history/change-log tables already store JSON payloads and do not
--   need a dedicated column for this field.

ALTER TABLE "nt_scripts"
  ADD COLUMN IF NOT EXISTS "eligibility_criteria" jsonb;
