-- APK rollout controls: Wi-Fi-only delivery, staged canary rollout + auto-halt,
-- and post-install health window. All columns are additive with safe defaults, so
-- existing policies keep their current behaviour (100% rollout, not halted, any
-- network). Idempotent: safe to run more than once.
--
-- Apply with: psql "$POSTGRES_DB_URL" -f manual_migrations/2026-06-21_add_apk_rollout_controls.sql
-- (or rely on `drizzle-kit push`, which derives the same changes from schema.ts).

ALTER TABLE nt_app_update_policies
  ADD COLUMN IF NOT EXISTS apk_wifi_only BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS apk_rollout_percentage INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS apk_rollout_halted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS apk_rollout_halted_reason TEXT,
  ADD COLUMN IF NOT EXISTS apk_health_check_hours INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS apk_auto_halt_threshold_percent INTEGER NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS apk_auto_halt_min_devices INTEGER NOT NULL DEFAULT 5;

-- Keep the percentage within a sane range even if written directly.
ALTER TABLE nt_app_update_policies
  DROP CONSTRAINT IF EXISTS nt_app_update_policies_rollout_percentage_range;
ALTER TABLE nt_app_update_policies
  ADD CONSTRAINT nt_app_update_policies_rollout_percentage_range
  CHECK (apk_rollout_percentage >= 0 AND apk_rollout_percentage <= 100);
