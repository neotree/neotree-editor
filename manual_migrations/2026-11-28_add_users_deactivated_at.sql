-- Users can be deactivated (and reactivated) instead of deleted.
-- A deactivated user cannot sign in to the editor or the mobile app and cannot do anything else;
-- all of their existing work stays linked to them. NULL = active.
ALTER TABLE nt_users ADD COLUMN IF NOT EXISTS deactivated_at timestamp;
