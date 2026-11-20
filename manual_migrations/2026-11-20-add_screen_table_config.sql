-- NEOAPP-1575 (Mummytree CR01): table display for repeatable form screens.
--
-- A repeatable form screen can be shown and printed as a table: its fields are
-- the columns and each collection entry is a row. "table_config" holds the
-- table settings (name, whether rows are added during capture or fixed, the
-- fixed row headings, optional row limits). NULL means the screen is an
-- ordinary repeatable form, so existing screens are unchanged.
--
-- Mapping note:
-- - nt_screens carries the published value.
-- - Draft/history tables already store the whole screen as a JSON payload and
--   do not need a dedicated column.
-- - The other changes in this ticket need no migration: fraction fields live
--   inside the "fields" JSONB column, and the print orientation lives inside
--   the scripts "print_config" JSONB column.

ALTER TABLE "nt_screens"
  ADD COLUMN IF NOT EXISTS "table_config" jsonb;
