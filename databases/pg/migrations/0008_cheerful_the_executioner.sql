CREATE INDEX IF NOT EXISTS "nt_data_keys_name_idx" ON "nt_data_keys" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nt_data_keys_name_lower_idx" ON "nt_data_keys" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nt_data_keys_data_type_idx" ON "nt_data_keys" USING btree ("data_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nt_data_keys_deleted_at_idx" ON "nt_data_keys" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nt_data_keys_drafts_name_idx" ON "nt_data_keys_drafts" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nt_data_keys_drafts_unique_key_idx" ON "nt_data_keys_drafts" USING btree ("unique_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nt_data_keys_drafts_data_key_id_idx" ON "nt_data_keys_drafts" USING btree ("data_key_id");