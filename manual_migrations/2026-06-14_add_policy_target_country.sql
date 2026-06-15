-- #3 — Country targeting dimension for app update policies.
-- Lets a policy be isolated to a single country (e.g. on a shared editor) instead
-- of "country" scope meaning every device. Null = applies to all countries
-- (backward compatible with existing policies).

ALTER TABLE nt_app_update_policies
  ADD COLUMN IF NOT EXISTS target_country_iso TEXT;
