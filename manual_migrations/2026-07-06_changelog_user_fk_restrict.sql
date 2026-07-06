-- Changelog rows are the audit trail: deleting a user must not orphan or null them.
-- The previous ON DELETE SET NULL could never succeed anyway (user_id is NOT NULL);
-- RESTRICT makes the intent explicit and gives a clean error instead.
ALTER TABLE "nt_change_logs" DROP CONSTRAINT IF EXISTS "nt_change_logs_user_id_nt_users_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nt_change_logs" ADD CONSTRAINT "nt_change_logs_user_id_nt_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."nt_users"("user_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;