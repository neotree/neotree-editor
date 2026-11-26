-- Adds nt_scripts.id_type: which session ID a script uses, "nuid" (the current FB8E-1230042 format) or
-- "muid" (the M0K7Q-000001R format: 12 characters plus a hyphen, with a check character). Chosen per script in the
-- script's details; the mobile app reads it to decide what ID to generate and what the NUID page accepts.
--
-- Every existing script becomes "nuid", so nothing changes until someone picks MUID. Drafts keep the
-- value inside their JSON data and need no change. Safe to re-run.

ALTER TABLE "nt_scripts" ADD COLUMN IF NOT EXISTS "id_type" text DEFAULT 'nuid' NOT NULL;

DO $mig$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nt_scripts_id_type_check') THEN
    ALTER TABLE "nt_scripts" ADD CONSTRAINT "nt_scripts_id_type_check" CHECK ("id_type" IN ('nuid', 'muid'));
  END IF;
END
$mig$;
