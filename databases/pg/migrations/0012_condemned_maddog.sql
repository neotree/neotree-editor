ALTER TABLE "nt_data_keys" ALTER COLUMN "unique_key" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "nt_problems" ADD COLUMN "symptoms" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "change_logs_single_active_version_idx" ON "nt_change_logs" USING btree ("entity_type","entity_id") WHERE "nt_change_logs"."is_active" = true;