-- Index the script_id foreign keys on the entity tables.
--
-- Postgres does not index a foreign key automatically, so every
-- "where script_id in (...)" — the conditional-expression report computation,
-- the duplicate-field-key scan, and the report cache signatures — was doing a
-- sequential scan whose cost grew with the whole table rather than with the
-- scripts being asked about.
--
-- CONCURRENTLY so the tables stay writable while these build. It cannot run
-- inside a transaction block: apply this file statement by statement (psql
-- without -1), not through a wrapping BEGIN/COMMIT.

CREATE INDEX CONCURRENTLY IF NOT EXISTS nt_screens_script_id_idx ON nt_screens (script_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS nt_screens_drafts_script_id_idx ON nt_screens_drafts (script_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS nt_diagnoses_script_id_idx ON nt_diagnoses (script_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS nt_diagnoses_drafts_script_id_idx ON nt_diagnoses_drafts (script_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS nt_problems_script_id_idx ON nt_problems (script_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS nt_problems_drafts_script_id_idx ON nt_problems_drafts (script_id);
