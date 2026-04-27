ALTER TABLE "nt_screens_drafts"
ADD COLUMN "draft_origin" text;

ALTER TABLE "nt_diagnoses_drafts"
ADD COLUMN "draft_origin" text;

ALTER TABLE "nt_problems_drafts"
ADD COLUMN "draft_origin" text;
