ALTER TABLE "nt_scripts"
  ADD COLUMN IF NOT EXISTS "archived" boolean NOT NULL DEFAULT false;

ALTER TABLE "nt_scripts_drafts"
  ADD COLUMN IF NOT EXISTS "archived" boolean NOT NULL DEFAULT false;
