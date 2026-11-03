-- Adds "Reporting Configurations" (mobile analytics / Superset) support.
--
-- nt_mobile_analytics_config
--   Single-row table holding the Superset URL, inactivity timeout and a
--   monotonically increasing versionNumber for the mobile analytics app.
--   versionNumber is incremented by the application, in the same transaction
--   as the edit, and only when the URL or timeout actually changes.
--
-- nt_mobile_analytics_api_key
--   Single-row table holding the HASH (SHA-256 hex) of the dedicated analytics
--   API key. It is intentionally separate from nt_api_keys so that:
--     * general API keys can never read the analytics endpoints, and
--     * the analytics key can never authenticate any other endpoint.
--   The plaintext key is shown once when generated/regenerated and is never
--   stored. Regenerating replaces the hash, so the previous key stops working.
--
-- No rows are inserted here: the config row is created the first time an
-- administrator saves it, and the key when an administrator generates it
-- (Reporting Configurations page). Safe to re-run.

CREATE TABLE IF NOT EXISTS "nt_mobile_analytics_config" (
  "id" serial PRIMARY KEY NOT NULL,
  "singleton" boolean DEFAULT true NOT NULL,
  "superset_url" text NOT NULL,
  "inactivity_timeout_minutes" integer NOT NULL,
  "version_number" integer DEFAULT 1 NOT NULL,
  "updated_by_user_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "nt_mobile_analytics_config_singleton_unique" UNIQUE ("singleton"),
  CONSTRAINT "nt_mobile_analytics_config_singleton_check" CHECK ("singleton" = true),
  CONSTRAINT "nt_mobile_analytics_config_timeout_check" CHECK ("inactivity_timeout_minutes" > 0),
  CONSTRAINT "nt_mobile_analytics_config_updated_by_user_id_fk"
    FOREIGN KEY ("updated_by_user_id") REFERENCES "nt_users"("user_id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "nt_mobile_analytics_api_key" (
  "id" serial PRIMARY KEY NOT NULL,
  "singleton" boolean DEFAULT true NOT NULL,
  "key_hash" text NOT NULL,
  "key_hint" text NOT NULL,
  "generated_by_user_id" uuid,
  "generated_at" timestamp DEFAULT now() NOT NULL,
  "last_used_at" timestamp,
  CONSTRAINT "nt_mobile_analytics_api_key_singleton_unique" UNIQUE ("singleton"),
  CONSTRAINT "nt_mobile_analytics_api_key_key_hash_unique" UNIQUE ("key_hash"),
  CONSTRAINT "nt_mobile_analytics_api_key_singleton_check" CHECK ("singleton" = true),
  CONSTRAINT "nt_mobile_analytics_api_key_generated_by_user_id_fk"
    FOREIGN KEY ("generated_by_user_id") REFERENCES "nt_users"("user_id") ON DELETE SET NULL
);
