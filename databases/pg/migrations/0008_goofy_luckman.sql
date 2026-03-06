ALTER TABLE "nt_data_keys" ADD COLUMN IF NOT EXISTS "confidential" boolean;

UPDATE "nt_data_keys"
SET "confidential" = false
WHERE "confidential" IS NULL;

WITH normalized_screens AS (
  SELECT
    s.*,
    CASE
      WHEN jsonb_typeof(s."fields") = 'array' THEN s."fields"
      WHEN jsonb_typeof(s."fields") = 'string' AND (s."fields" #>> '{}') ~ '^\s*\['
        THEN (s."fields" #>> '{}')::jsonb
      ELSE '[]'::jsonb
    END AS fields_json,
    CASE
      WHEN jsonb_typeof(s."items") = 'array' THEN s."items"
      WHEN jsonb_typeof(s."items") = 'string' AND (s."items" #>> '{}') ~ '^\s*\['
        THEN (s."items" #>> '{}')::jsonb
      ELSE '[]'::jsonb
    END AS items_json
  FROM "nt_screens" s
),
normalized_drafts AS (
  SELECT
    sd.*,
    CASE
      WHEN jsonb_typeof(sd."data") = 'object' THEN sd."data"
      WHEN jsonb_typeof(sd."data") = 'string' AND (sd."data" #>> '{}') ~ '^\s*\{'
        THEN (sd."data" #>> '{}')::jsonb
      ELSE '{}'::jsonb
    END AS data_obj
  FROM "nt_screens_drafts" sd
)
UPDATE "nt_data_keys" dk
SET "confidential" = true
WHERE dk."confidential" = false
  AND (
    EXISTS (
      SELECT 1
      FROM normalized_screens s
      WHERE (
        s."key_id" IN (dk."unique_key"::text, dk."uuid"::text)
        AND s."confidential" = true
      )
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(s.fields_json) f
        WHERE f->>'keyId' IN (dk."unique_key"::text, dk."uuid"::text)
          AND lower(COALESCE(f->>'confidential', 'false')) = 'true'
      )
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(s.items_json) i
        WHERE i->>'keyId' IN (dk."unique_key"::text, dk."uuid"::text)
          AND lower(COALESCE(i->>'confidential', 'false')) = 'true'
      )
    )
    OR EXISTS (
      SELECT 1
      FROM normalized_drafts sd
      WHERE (
        sd.data_obj->>'keyId' IN (dk."unique_key"::text, dk."uuid"::text)
        AND lower(COALESCE(sd.data_obj->>'confidential', 'false')) = 'true'
      )
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(
          CASE
            WHEN jsonb_typeof(sd.data_obj->'fields') = 'array' THEN sd.data_obj->'fields'
            WHEN jsonb_typeof(sd.data_obj->'fields') = 'string' AND (sd.data_obj->'fields' #>> '{}') ~ '^\s*\['
              THEN (sd.data_obj->'fields' #>> '{}')::jsonb
            ELSE '[]'::jsonb
          END
        ) f
        WHERE f->>'keyId' IN (dk."unique_key"::text, dk."uuid"::text)
          AND lower(COALESCE(f->>'confidential', 'false')) = 'true'
      )
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(
          CASE
            WHEN jsonb_typeof(sd.data_obj->'items') = 'array' THEN sd.data_obj->'items'
            WHEN jsonb_typeof(sd.data_obj->'items') = 'string' AND (sd.data_obj->'items' #>> '{}') ~ '^\s*\['
              THEN (sd.data_obj->'items' #>> '{}')::jsonb
            ELSE '[]'::jsonb
          END
        ) i
        WHERE i->>'keyId' IN (dk."unique_key"::text, dk."uuid"::text)
          AND lower(COALESCE(i->>'confidential', 'false')) = 'true'
      )
    )
  );

ALTER TABLE "nt_data_keys" ALTER COLUMN "confidential" SET DEFAULT true;
ALTER TABLE "nt_data_keys" ALTER COLUMN "confidential" SET NOT NULL;
