ALTER TABLE "nt_data_key_merges" ADD COLUMN "kind" text DEFAULT 'merge' NOT NULL;--> statement-breakpoint
ALTER TABLE "nt_data_key_merges" ADD COLUMN "title" text DEFAULT '' NOT NULL;