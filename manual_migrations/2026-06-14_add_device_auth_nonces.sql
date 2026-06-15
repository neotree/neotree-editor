-- Replay protection for signed mobile device requests (#3).
-- Each signed request carries a unique nonce; we persist it for the duration of the
-- signature validity window and reject any repeat (deviceId, nonce) pair.

CREATE TABLE IF NOT EXISTS nt_device_auth_nonces (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS device_auth_nonce_unique
  ON nt_device_auth_nonces (device_id, nonce);

CREATE INDEX IF NOT EXISTS device_auth_nonce_expires_idx
  ON nt_device_auth_nonces (expires_at);
