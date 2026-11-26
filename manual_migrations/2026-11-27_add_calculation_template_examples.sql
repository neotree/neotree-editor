-- Adds a worked example to calculation templates: sample values for the inputs and the answer the
-- author expects. The editor refuses to save a template whose formula doesn't give that answer, which
-- proves the formula means what its author meant (the grammar check alone can't).
--
-- nt_calculation_templates.example   jsonb  { "values": { "<input id>": "<sample>" }, "expected": "<answer>" }
--
-- Fills in the example for the four starter templates (BMI, BSA, MAP, EDD) where they have none yet, so
-- an administrator's own edits are never overwritten. Templates an administrator added earlier keep a
-- NULL example until they are next edited, which then requires one.
--
-- Also changes the EDD template's formula from "{lmp} + 280 days" to
-- "{lmp} + 280 days or {lmp} plus 7 days - 3 months + 1 year", but only while it is still the original
-- one, so an administrator's own version is never overwritten. (Both give the same date for the worked
-- example: 1 Jan 2026 gives 8 Oct 2026.)
--
-- Run after 2026-11-25_add_calculation_templates.sql. Safe to re-run.

ALTER TABLE "nt_calculation_templates" ADD COLUMN IF NOT EXISTS "example" jsonb;

UPDATE "nt_calculation_templates" SET "example" = '{"values":{"weight":"70","height":"175"},"expected":"22.9"}'::jsonb WHERE "slug" = 'bmi' AND "example" IS NULL;
UPDATE "nt_calculation_templates" SET "example" = '{"values":{"height":"180","weight":"80"},"expected":"2"}'::jsonb WHERE "slug" = 'bsa' AND "example" IS NULL;
UPDATE "nt_calculation_templates" SET "example" = '{"values":{"systolic":"120","diastolic":"90"},"expected":"100"}'::jsonb WHERE "slug" = 'map' AND "example" IS NULL;
UPDATE "nt_calculation_templates" SET "example" = '{"values":{"lmp":"2026-01-01"},"expected":"2026-10-08"}'::jsonb WHERE "slug" = 'edd' AND "example" IS NULL;

UPDATE "nt_calculation_templates" SET "formula" = '{lmp} + 280 days or {lmp} plus 7 days - 3 months + 1 year' WHERE "slug" = 'edd' AND "formula" = '{lmp} + 280 days';
