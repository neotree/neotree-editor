-- Adds calculation templates: named, reusable formulas written in plain language with {placeholders}
-- for the keys a user picks (e.g. BMI = "{weight} divided by ({height} divided by 100) squared").
-- Shown in the calculation editor under "Use a template"; administrators manage them on the
-- "Calculation Templates" page.
--
-- nt_calculation_templates
--   slug         stable machine name, unique (the seeded ones are bmi, bsa, map, edd)
--   formula      plain language with {input_id} placeholders; compiled by the normal calculation compiler
--   inputs       jsonb array of { id, label, type: 'number' | 'date' } (one entry per placeholder)
--   result_type  'number' | 'date': the editor only offers templates matching the field it is editing
--
-- Seeds BMI, BSA (Mosteller), MAP and EDD, but ONLY when the table is first created, so re-running this
-- file never brings back a template an administrator edited or deleted. Safe to re-run.

DO $mig$
BEGIN
  IF to_regclass('nt_calculation_templates') IS NULL THEN
    CREATE TABLE "nt_calculation_templates" (
      "id" serial PRIMARY KEY NOT NULL,
      "template_id" uuid DEFAULT gen_random_uuid() NOT NULL,
      "slug" text NOT NULL,
      "name" text NOT NULL,
      "description" text DEFAULT '' NOT NULL,
      "result_type" text NOT NULL,
      "formula" text NOT NULL,
      "inputs" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "sort_order" integer DEFAULT 0 NOT NULL,
      "updated_by_user_id" uuid,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "nt_calculation_templates_template_id_unique" UNIQUE ("template_id"),
      CONSTRAINT "nt_calculation_templates_slug_unique" UNIQUE ("slug"),
      CONSTRAINT "nt_calculation_templates_result_type_check" CHECK ("result_type" IN ('number', 'date')),
      CONSTRAINT "nt_calculation_templates_updated_by_user_id_fk"
        FOREIGN KEY ("updated_by_user_id") REFERENCES "nt_users"("user_id") ON DELETE SET NULL
    );

    INSERT INTO "nt_calculation_templates" ("slug", "name", "description", "result_type", "formula", "inputs", "sort_order") VALUES
    ('bmi', 'BMI', 'Body mass index: weight in kilograms divided by height in metres squared.', 'number', '{weight} divided by ({height} divided by 100) squared', '[{"id":"weight","label":"Weight (kg)","type":"number"},{"id":"height","label":"Height (cm)","type":"number"}]'::jsonb, 10),
    ('bsa', 'Body surface area (Mosteller)', 'Square root of (height in cm × weight in kg ÷ 3600), in m².', 'number', 'square root of ({height} times {weight} divided by 3600)', '[{"id":"height","label":"Height (cm)","type":"number"},{"id":"weight","label":"Weight (kg)","type":"number"}]'::jsonb, 20),
    ('map', 'Mean arterial pressure (MAP)', 'Diastolic plus one third of the pulse pressure (systolic minus diastolic).', 'number', '{diastolic} plus ({systolic} minus {diastolic}) divided by 3', '[{"id":"systolic","label":"Systolic BP (mmHg)","type":"number"},{"id":"diastolic","label":"Diastolic BP (mmHg)","type":"number"}]'::jsonb, 30),
    ('edd', 'Expected date of delivery (EDD)', 'Last menstrual period plus 280 days (Naegele''s rule).', 'date', '{lmp} + 280 days', '[{"id":"lmp","label":"Last menstrual period (date)","type":"date"}]'::jsonb, 40);
  END IF;
END
$mig$;
