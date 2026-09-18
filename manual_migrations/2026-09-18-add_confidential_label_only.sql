-- Adds a "confidential (label only)" flag alongside the existing "confidential"
-- flag, for data keys and screens whose LABEL is sensitive (e.g. a healthcare
-- worker's name shown as a dropdown option) but whose VALUE is not and should
-- still be exportable.
--
-- A field can be confidential, confidential-label-only, or neither, but never
-- both — the CHECK constraints enforce that at the database level in addition
-- to the application-level validation in _saveDataKeys/_publishDataKeys.
--
-- Mapping note:
-- - nt_data_keys carries the source-of-truth flag for a data key.
-- - nt_screens carries the whole-screen flag (mirrors its existing
--   "confidential" column); per-field/per-item flags live inside the
--   "fields"/"items" JSONB columns on nt_screens and nt_screens_drafts and
--   need no dedicated column.
-- - Draft/history tables already store JSON payloads and do not need a
--   dedicated column for this field.

ALTER TABLE "nt_data_keys"
  ADD COLUMN IF NOT EXISTS "confidential_label_only" boolean NOT NULL DEFAULT false;

ALTER TABLE "nt_data_keys"
  ADD CONSTRAINT "nt_data_keys_confidential_xor_label_only"
  CHECK (NOT ("confidential" AND "confidential_label_only"));

ALTER TABLE "nt_screens"
  ADD COLUMN IF NOT EXISTS "confidential_label_only" boolean NOT NULL DEFAULT false;

ALTER TABLE "nt_screens"
  ADD CONSTRAINT "nt_screens_confidential_xor_label_only"
  CHECK (NOT ("confidential" AND "confidential_label_only"));
