-- Adds an explicit OTA release ledger.
-- Device telemetry remains the source for adoption; this table records the
-- release labels published through EAS so the editor can manage OTA history.

CREATE TABLE IF NOT EXISTS nt_ota_releases (
  id SERIAL PRIMARY KEY,
  ota_release_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  app_version TEXT,
  runtime_version TEXT NOT NULL,
  channel TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'android',
  eas_update_group_id TEXT,
  eas_update_id TEXT,
  message TEXT DEFAULT '',
  published_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by_user_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ota_release_unique_label_channel_runtime
  ON nt_ota_releases(label, channel, runtime_version);

CREATE INDEX IF NOT EXISTS ota_release_channel_idx
  ON nt_ota_releases(channel);

CREATE INDEX IF NOT EXISTS ota_release_runtime_idx
  ON nt_ota_releases(runtime_version);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nt_users')
     AND NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_name = 'nt_ota_releases'
        AND constraint_name = 'nt_ota_releases_created_by_user_id_fkey'
    ) THEN
    ALTER TABLE nt_ota_releases
      ADD CONSTRAINT nt_ota_releases_created_by_user_id_fkey
      FOREIGN KEY (created_by_user_id)
      REFERENCES nt_users(user_id)
      ON DELETE SET NULL;
  END IF;
END $$;
