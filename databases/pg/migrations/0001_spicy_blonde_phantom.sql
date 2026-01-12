ALTER TABLE "nt_change_logs" DROP CONSTRAINT "nt_change_logs_script_id_nt_scripts_script_id_fk";
--> statement-breakpoint
ALTER TABLE "nt_change_logs" DROP CONSTRAINT "nt_change_logs_screen_id_nt_screens_screen_id_fk";
--> statement-breakpoint
ALTER TABLE "nt_change_logs" DROP CONSTRAINT "nt_change_logs_diagnosis_id_nt_diagnoses_diagnosis_id_fk";
--> statement-breakpoint
ALTER TABLE "nt_change_logs" DROP CONSTRAINT "nt_change_logs_config_key_id_nt_config_keys_config_key_id_fk";
--> statement-breakpoint
ALTER TABLE "nt_change_logs" DROP CONSTRAINT "nt_change_logs_drugs_library_item_id_nt_drugs_library_item_id_fk";
--> statement-breakpoint
ALTER TABLE "nt_change_logs" DROP CONSTRAINT "nt_change_logs_data_key_id_nt_data_keys_uuid_fk";
--> statement-breakpoint
ALTER TABLE "nt_change_logs" DROP CONSTRAINT "nt_change_logs_alias_id_nt_aliases_uuid_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_script_id_nt_scripts_script_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."nt_scripts"("script_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_screen_id_nt_screens_screen_id_fk" FOREIGN KEY ("screen_id") REFERENCES "public"."nt_screens"("screen_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_diagnosis_id_nt_diagnoses_diagnosis_id_fk" FOREIGN KEY ("diagnosis_id") REFERENCES "public"."nt_diagnoses"("diagnosis_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_config_key_id_nt_config_keys_config_key_id_fk" FOREIGN KEY ("config_key_id") REFERENCES "public"."nt_config_keys"("config_key_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_drugs_library_item_id_nt_drugs_library_item_id_fk" FOREIGN KEY ("drugs_library_item_id") REFERENCES "public"."nt_drugs_library"("item_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_data_key_id_nt_data_keys_uuid_fk" FOREIGN KEY ("data_key_id") REFERENCES "public"."nt_data_keys"("uuid") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_alias_id_nt_aliases_uuid_fk" FOREIGN KEY ("alias_id") REFERENCES "public"."nt_aliases"("uuid") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;