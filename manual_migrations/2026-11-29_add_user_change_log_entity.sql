-- Deactivating / reactivating a user is recorded in the change log under a new "user" entity type.
-- (On PostgreSQL < 12 this statement cannot run inside a transaction block.)
ALTER TYPE change_log_entity ADD VALUE IF NOT EXISTS 'user';
