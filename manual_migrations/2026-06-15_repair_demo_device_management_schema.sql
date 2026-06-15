-- Repair migration for non-fresh demo/staging databases that had partial
-- App Updates / Device Management migrations applied before the final schema.
--
-- Safe to run more than once. Take a DB backup first on any shared server.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mdm_provider') THEN
    CREATE TYPE mdm_provider AS ENUM ('headwind');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mdm_management_state') THEN
    CREATE TYPE mdm_management_state AS ENUM ('managed', 'unmanaged', 'unknown', 'blocked', 'stolen', 'revoked');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mdm_enrollment_status') THEN
    CREATE TYPE mdm_enrollment_status AS ENUM ('pending', 'enrolled', 'unenrolled', 'failed', 'unknown');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mdm_inventory_match_status') THEN
    CREATE TYPE mdm_inventory_match_status AS ENUM ('unmatched', 'auto_linked', 'manually_linked', 'needs_review', 'conflict', 'ignored');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_update_delivery_mode') THEN
    CREATE TYPE app_update_delivery_mode AS ENUM ('in_app', 'mdm', 'hybrid', 'manual');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_rollout_state') THEN
    CREATE TYPE device_rollout_state AS ENUM (
      'pending',
      'policy_seen',
      'mdm_push_requested',
      'mdm_push_acknowledged',
      'download_started',
      'download_completed',
      'install_started',
      'installed',
      'failed',
      'rolled_back'
    );
  END IF;
END $$;

-- Device app-state fields used by update policy targeting and capability checks.
ALTER TABLE nt_device_app_states
  ADD COLUMN IF NOT EXISTS country_iso TEXT,
  ADD COLUMN IF NOT EXISTS android_version TEXT,
  ADD COLUMN IF NOT EXISTS android_sdk INTEGER,
  ADD COLUMN IF NOT EXISTS manufacturer TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS device_capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_policy_seen_version INTEGER,
  ADD COLUMN IF NOT EXISTS last_policy_seen_at TIMESTAMP;

ALTER TABLE nt_device_update_events
  ADD COLUMN IF NOT EXISTS country_iso TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS apk_release_id UUID,
  ADD COLUMN IF NOT EXISTS error_code TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'nt_device_update_events'
      AND constraint_name = 'nt_device_update_events_apk_release_id_fkey'
  ) THEN
    ALTER TABLE nt_device_update_events
      ADD CONSTRAINT nt_device_update_events_apk_release_id_fkey
      FOREIGN KEY (apk_release_id)
      REFERENCES nt_apk_releases(apk_release_id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Provider profiles. Some old demo DBs have this table but not the country and
-- sync-health columns now used by Device Management overview queries.
CREATE TABLE IF NOT EXISTS nt_mdm_provider_profiles (
  id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider mdm_provider NOT NULL DEFAULT 'headwind',
  country_iso TEXT NOT NULL DEFAULT 'ZW',
  hospital_id UUID,
  environment TEXT DEFAULT 'production',
  is_shared_instance BOOLEAN NOT NULL DEFAULT false,
  base_url TEXT NOT NULL DEFAULT '',
  api_key TEXT,
  default_kiosk_policy TEXT,
  provider_capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  last_connection_status TEXT,
  last_connection_checked_at TIMESTAMP,
  last_connection_error TEXT,
  last_device_sync_status TEXT,
  last_device_sync_at TIMESTAMP,
  last_device_sync_error TEXT,
  auto_sync_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_link_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_link_min_confidence INTEGER NOT NULL DEFAULT 95,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP
);

ALTER TABLE nt_mdm_provider_profiles
  ADD COLUMN IF NOT EXISTS country_iso TEXT,
  ADD COLUMN IF NOT EXISTS hospital_id UUID,
  ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'production',
  ADD COLUMN IF NOT EXISTS is_shared_instance BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS default_kiosk_policy TEXT,
  ADD COLUMN IF NOT EXISTS provider_capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_connection_status TEXT,
  ADD COLUMN IF NOT EXISTS last_connection_checked_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_connection_error TEXT,
  ADD COLUMN IF NOT EXISTS last_device_sync_status TEXT,
  ADD COLUMN IF NOT EXISTS last_device_sync_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_device_sync_error TEXT,
  ADD COLUMN IF NOT EXISTS auto_sync_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_link_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_link_min_confidence INTEGER NOT NULL DEFAULT 95,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

UPDATE nt_mdm_provider_profiles
SET country_iso = 'ZW'
WHERE country_iso IS NULL OR country_iso = '';

ALTER TABLE nt_mdm_provider_profiles
  ALTER COLUMN country_iso SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nt_hospitals')
     AND NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_name = 'nt_mdm_provider_profiles'
        AND constraint_name = 'nt_mdm_provider_profiles_hospital_id_fkey'
    ) THEN
    ALTER TABLE nt_mdm_provider_profiles
      ADD CONSTRAINT nt_mdm_provider_profiles_hospital_id_fkey
      FOREIGN KEY (hospital_id)
      REFERENCES nt_hospitals(hospital_id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS mdm_provider_profiles_provider_idx
  ON nt_mdm_provider_profiles(provider);

CREATE INDEX IF NOT EXISTS mdm_provider_profiles_country_idx
  ON nt_mdm_provider_profiles(country_iso);

-- NeoTree device <-> MDM device links.
CREATE TABLE IF NOT EXISTS nt_device_mdm_links (
  id SERIAL PRIMARY KEY,
  link_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  provider mdm_provider NOT NULL DEFAULT 'headwind',
  profile_id UUID,
  mdm_device_id TEXT,
  mdm_config_id TEXT,
  mdm_config_name TEXT,
  mdm_group_id TEXT,
  mdm_group_name TEXT,
  country_iso TEXT,
  hospital_id UUID,
  enrollment_status mdm_enrollment_status NOT NULL DEFAULT 'unknown',
  management_state mdm_management_state NOT NULL DEFAULT 'unknown',
  serial_number TEXT,
  android_version TEXT,
  device_capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_mdm_seen_at TIMESTAMP,
  last_synced_at TIMESTAMP,
  last_sync_status TEXT,
  last_sync_error TEXT,
  link_source TEXT NOT NULL DEFAULT 'manual',
  match_confidence INTEGER,
  match_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE nt_device_mdm_links
  ADD COLUMN IF NOT EXISTS profile_id UUID,
  ADD COLUMN IF NOT EXISTS mdm_config_id TEXT,
  ADD COLUMN IF NOT EXISTS mdm_config_name TEXT,
  ADD COLUMN IF NOT EXISTS mdm_group_id TEXT,
  ADD COLUMN IF NOT EXISTS mdm_group_name TEXT,
  ADD COLUMN IF NOT EXISTS country_iso TEXT,
  ADD COLUMN IF NOT EXISTS hospital_id UUID,
  ADD COLUMN IF NOT EXISTS device_capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_sync_status TEXT,
  ADD COLUMN IF NOT EXISTS last_sync_error TEXT,
  ADD COLUMN IF NOT EXISTS link_source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS match_confidence INTEGER,
  ADD COLUMN IF NOT EXISTS match_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS device_mdm_link_device_provider_unique
  ON nt_device_mdm_links(device_id, provider);

CREATE INDEX IF NOT EXISTS device_mdm_links_device_idx
  ON nt_device_mdm_links(device_id);

CREATE INDEX IF NOT EXISTS device_mdm_links_mdm_device_idx
  ON nt_device_mdm_links(mdm_device_id);

CREATE INDEX IF NOT EXISTS device_mdm_links_profile_idx
  ON nt_device_mdm_links(profile_id);

CREATE INDEX IF NOT EXISTS device_mdm_links_country_idx
  ON nt_device_mdm_links(country_iso);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'nt_device_mdm_links'
      AND constraint_name = 'nt_device_mdm_links_profile_id_fkey'
  ) THEN
    ALTER TABLE nt_device_mdm_links
      ADD CONSTRAINT nt_device_mdm_links_profile_id_fkey
      FOREIGN KEY (profile_id)
      REFERENCES nt_mdm_provider_profiles(profile_id)
      ON DELETE SET NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nt_hospitals')
     AND NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_name = 'nt_device_mdm_links'
        AND constraint_name = 'nt_device_mdm_links_hospital_id_fkey'
    ) THEN
    ALTER TABLE nt_device_mdm_links
      ADD CONSTRAINT nt_device_mdm_links_hospital_id_fkey
      FOREIGN KEY (hospital_id)
      REFERENCES nt_hospitals(hospital_id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- MDM inventory review table used by automatic sync and auto-link review.
CREATE TABLE IF NOT EXISTS nt_mdm_device_inventory (
  id SERIAL PRIMARY KEY,
  inventory_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  provider mdm_provider NOT NULL DEFAULT 'headwind',
  profile_id UUID NOT NULL,
  mdm_device_id TEXT NOT NULL,
  suggested_device_id TEXT,
  linked_device_id TEXT,
  country_iso TEXT,
  mdm_config_id TEXT,
  mdm_config_name TEXT,
  mdm_group_id TEXT,
  mdm_group_name TEXT,
  enrollment_status mdm_enrollment_status NOT NULL DEFAULT 'unknown',
  management_state mdm_management_state NOT NULL DEFAULT 'unknown',
  serial_number TEXT,
  android_version TEXT,
  android_sdk INTEGER,
  manufacturer TEXT,
  model TEXT,
  device_capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_mdm_seen_at TIMESTAMP,
  match_status mdm_inventory_match_status NOT NULL DEFAULT 'unmatched',
  match_confidence INTEGER NOT NULL DEFAULT 0,
  match_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  review_note TEXT,
  ignored_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by_user_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at TIMESTAMP NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE nt_mdm_device_inventory
  ADD COLUMN IF NOT EXISTS suggested_device_id TEXT,
  ADD COLUMN IF NOT EXISTS linked_device_id TEXT,
  ADD COLUMN IF NOT EXISTS country_iso TEXT,
  ADD COLUMN IF NOT EXISTS mdm_config_id TEXT,
  ADD COLUMN IF NOT EXISTS mdm_config_name TEXT,
  ADD COLUMN IF NOT EXISTS mdm_group_id TEXT,
  ADD COLUMN IF NOT EXISTS mdm_group_name TEXT,
  ADD COLUMN IF NOT EXISTS android_sdk INTEGER,
  ADD COLUMN IF NOT EXISTS manufacturer TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS device_capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS match_status mdm_inventory_match_status NOT NULL DEFAULT 'unmatched',
  ADD COLUMN IF NOT EXISTS match_confidence INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS match_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS review_note TEXT,
  ADD COLUMN IF NOT EXISTS ignored_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS reviewed_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMP NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS mdm_device_inventory_profile_device_unique
  ON nt_mdm_device_inventory(profile_id, mdm_device_id);

CREATE INDEX IF NOT EXISTS mdm_device_inventory_profile_idx
  ON nt_mdm_device_inventory(profile_id);

CREATE INDEX IF NOT EXISTS mdm_device_inventory_match_idx
  ON nt_mdm_device_inventory(match_status);

CREATE INDEX IF NOT EXISTS mdm_device_inventory_country_idx
  ON nt_mdm_device_inventory(country_iso);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'nt_mdm_device_inventory'
      AND constraint_name = 'nt_mdm_device_inventory_profile_id_fkey'
  ) THEN
    ALTER TABLE nt_mdm_device_inventory
      ADD CONSTRAINT nt_mdm_device_inventory_profile_id_fkey
      FOREIGN KEY (profile_id)
      REFERENCES nt_mdm_provider_profiles(profile_id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- App update policy targeting and delivery mode additions.
ALTER TABLE nt_app_update_policies
  ADD COLUMN IF NOT EXISTS apk_delivery_mode app_update_delivery_mode NOT NULL DEFAULT 'in_app',
  ADD COLUMN IF NOT EXISTS target_scope TEXT NOT NULL DEFAULT 'country',
  ADD COLUMN IF NOT EXISTS target_group_id TEXT,
  ADD COLUMN IF NOT EXISTS target_hospital_id UUID,
  ADD COLUMN IF NOT EXISTS target_country_iso TEXT,
  ADD COLUMN IF NOT EXISTS rollback_enabled BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nt_hospitals')
     AND NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_name = 'nt_app_update_policies'
        AND constraint_name = 'nt_app_update_policies_target_hospital_id_fkey'
    ) THEN
    ALTER TABLE nt_app_update_policies
      ADD CONSTRAINT nt_app_update_policies_target_hospital_id_fkey
      FOREIGN KEY (target_hospital_id)
      REFERENCES nt_hospitals(hospital_id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Current rollout state per device/release.
CREATE TABLE IF NOT EXISTS nt_device_rollout_states (
  id SERIAL PRIMARY KEY,
  rollout_state_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  apk_release_id UUID,
  country_iso TEXT,
  delivery_mode app_update_delivery_mode NOT NULL DEFAULT 'in_app',
  rollout_state device_rollout_state NOT NULL DEFAULT 'pending',
  download_progress INTEGER DEFAULT 0,
  mdm_push_requested_at TIMESTAMP,
  mdm_push_acknowledged_at TIMESTAMP,
  download_started_at TIMESTAMP,
  download_completed_at TIMESTAMP,
  install_started_at TIMESTAMP,
  install_completed_at TIMESTAMP,
  rollback_required BOOLEAN NOT NULL DEFAULT false,
  last_error_code TEXT,
  last_error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS device_rollout_state_device_apk_unique
  ON nt_device_rollout_states(device_id, apk_release_id);

CREATE INDEX IF NOT EXISTS device_rollout_states_device_idx
  ON nt_device_rollout_states(device_id);

CREATE INDEX IF NOT EXISTS device_rollout_states_release_idx
  ON nt_device_rollout_states(apk_release_id);

CREATE INDEX IF NOT EXISTS device_rollout_states_state_idx
  ON nt_device_rollout_states(rollout_state);

CREATE INDEX IF NOT EXISTS device_rollout_states_country_idx
  ON nt_device_rollout_states(country_iso);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'nt_device_rollout_states'
      AND constraint_name = 'nt_device_rollout_states_apk_release_id_fkey'
  ) THEN
    ALTER TABLE nt_device_rollout_states
      ADD CONSTRAINT nt_device_rollout_states_apk_release_id_fkey
      FOREIGN KEY (apk_release_id)
      REFERENCES nt_apk_releases(apk_release_id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Replay protection for signed mobile device requests.
CREATE TABLE IF NOT EXISTS nt_device_auth_nonces (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS device_auth_nonce_unique
  ON nt_device_auth_nonces(device_id, nonce);

CREATE INDEX IF NOT EXISTS device_auth_nonce_expires_idx
  ON nt_device_auth_nonces(expires_at);
