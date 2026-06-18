-- Adds first-class NeoTree OTA release tracking for mobile app-state reports
-- and update telemetry events. Safe to run more than once.

ALTER TABLE nt_device_app_states
  ADD COLUMN IF NOT EXISTS update_release TEXT;

ALTER TABLE nt_device_update_events
  ADD COLUMN IF NOT EXISTS update_release TEXT;

CREATE INDEX IF NOT EXISTS device_app_states_update_release_idx
  ON nt_device_app_states(update_release);

CREATE INDEX IF NOT EXISTS device_update_events_update_release_idx
  ON nt_device_update_events(update_release);

