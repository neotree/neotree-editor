ALTER TABLE "nt_data_keys" ADD COLUMN "confidential" boolean;

UPDATE "nt_data_keys"
SET "confidential" = false
WHERE "confidential" IS NULL;

UPDATE "nt_data_keys" dk
SET "confidential" = true
WHERE dk."confidential" = false
  AND (
    EXISTS (
      SELECT 1
      FROM "nt_screens" s
      WHERE (
        s."key_id" = dk."unique_key"::text
        AND s."confidential" = true
      )
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(COALESCE(s."fields", '[]'::jsonb)) f
        WHERE f->>'keyId' = dk."unique_key"::text
          AND lower(COALESCE(f->>'confidential', 'false')) = 'true'
      )
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(COALESCE(s."items", '[]'::jsonb)) i
        WHERE i->>'keyId' = dk."unique_key"::text
          AND lower(COALESCE(i->>'confidential', 'false')) = 'true'
      )
    )
    OR EXISTS (
      SELECT 1
      FROM "nt_screens_drafts" sd
      WHERE (
        sd."data"->>'keyId' = dk."unique_key"::text
        AND lower(COALESCE(sd."data"->>'confidential', 'false')) = 'true'
      )
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(COALESCE(sd."data"->'fields', '[]'::jsonb)) f
        WHERE f->>'keyId' = dk."unique_key"::text
          AND lower(COALESCE(f->>'confidential', 'false')) = 'true'
      )
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(COALESCE(sd."data"->'items', '[]'::jsonb)) i
        WHERE i->>'keyId' = dk."unique_key"::text
          AND lower(COALESCE(i->>'confidential', 'false')) = 'true'
      )
    )
  );

ALTER TABLE "nt_data_keys" ALTER COLUMN "confidential" SET DEFAULT true;
ALTER TABLE "nt_data_keys" ALTER COLUMN "confidential" SET NOT NULL;
