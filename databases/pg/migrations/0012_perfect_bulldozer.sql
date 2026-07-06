CREATE TABLE IF NOT EXISTS "nt_files_aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_id" uuid,
	"alias" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nt_change_logs" DROP CONSTRAINT "nt_change_logs_user_id_nt_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "nt_config_keys" ALTER COLUMN "preferences" SET DEFAULT '{"fontSize":{},"fontWeight":{},"fontStyle":{},"textColor":{},"backgroundColor":{},"highlight":{},"enableSeverityRanking":false}';--> statement-breakpoint
ALTER TABLE "nt_diagnoses" ALTER COLUMN "preferences" SET DEFAULT '{"fontSize":{},"fontWeight":{},"fontStyle":{},"textColor":{},"backgroundColor":{},"highlight":{},"enableSeverityRanking":false}';--> statement-breakpoint
ALTER TABLE "nt_problems" ALTER COLUMN "preferences" SET DEFAULT '{"fontSize":{},"fontWeight":{},"fontStyle":{},"textColor":{},"backgroundColor":{},"highlight":{},"enableSeverityRanking":false}';--> statement-breakpoint
ALTER TABLE "nt_screens" ALTER COLUMN "preferences" SET DEFAULT '{"fontSize":{},"fontWeight":{},"fontStyle":{},"textColor":{},"backgroundColor":{},"highlight":{},"enableSeverityRanking":false}';--> statement-breakpoint
ALTER TABLE "nt_scripts" ALTER COLUMN "preferences" SET DEFAULT '{"fontSize":{},"fontWeight":{},"fontStyle":{},"textColor":{},"backgroundColor":{},"highlight":{},"enableSeverityRanking":false}';--> statement-breakpoint
ALTER TABLE "nt_scripts" ADD COLUMN "eligibility_criteria" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_files_aliases" ADD CONSTRAINT "nt_files_aliases_file_id_nt_files_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."nt_files"("file_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_user_id_nt_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
