ALTER TABLE public.nt_scripts_drafts DROP transaction_id;
ALTER TABLE public.nt_screens_drafts DROP transaction_id;
ALTER TABLE public.nt_problems_drafts DROP transaction_id;
ALTER TABLE public.nt_hospitals_drafts DROP transaction_id;
ALTER TABLE public.nt_drugs_library_drafts DROP transaction_id;
ALTER TABLE public.nt_diagnoses_drafts DROP transaction_id;
ALTER TABLE public.nt_data_keys_drafts DROP transaction_id;
ALTER TABLE public.nt_config_keys_drafts DROP transaction_id;
ALTER TABLE public.nt_pending_deletion DROP transaction_id;

ALTER TABLE public.nt_scripts_drafts DROP remote_id;
ALTER TABLE public.nt_screens_drafts DROP remote_id;
ALTER TABLE public.nt_problems_drafts DROP remote_id;
ALTER TABLE public.nt_hospitals_drafts DROP remote_id;
ALTER TABLE public.nt_drugs_library_drafts DROP remote_id;
ALTER TABLE public.nt_diagnoses_drafts DROP remote_id;
ALTER TABLE public.nt_data_keys_drafts DROP remote_id;
ALTER TABLE public.nt_config_keys_drafts DROP remote_id;

ALTER TABLE public.nt_scripts_drafts DROP CONSTRAINT nt_scripts_drafts_transaction_id_nt_tmp_transactions_transactio;
ALTER TABLE public.nt_screens_drafts DROP CONSTRAINT nt_screens_drafts_transaction_id_nt_tmp_transactions_transactio;
ALTER TABLE public.nt_problems_drafts DROP CONSTRAINT nt_problems_drafts_transaction_id_nt_tmp_transactions_transactio;
ALTER TABLE public.nt_hospitals_drafts DROP CONSTRAINT nt_hospitals_drafts_transaction_id_nt_tmp_transactions_transactio;
ALTER TABLE public.nt_drugs_library_drafts DROP CONSTRAINT nt_drugs_library_drafts_transaction_id_nt_tmp_transactions_id_f;
ALTER TABLE public.nt_diagnoses_drafts DROP CONSTRAINT nt_diagnoses_drafts_transaction_id_nt_tmp_transactions_transactio;
ALTER TABLE public.nt_data_keys_drafts DROP CONSTRAINT nt_data_keys_drafts_transaction_id_nt_tmp_transactions_transactio;
ALTER TABLE public.nt_config_keys_drafts DROP CONSTRAINT nt_config_keys_drafts_transaction_id_nt_tmp_transactions_transactio;
ALTER TABLE public.nt_pending_deletion DROP CONSTRAINT nt_pending_deletion_transaction_id_nt_tmp_transactions_transactio;

DROP TABLE public.nt_tmp_transactions;

CREATE TABLE public.nt_tmp_transactions (
	id serial4 NOT NULL,
	"uuid" uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
	transaction_id uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NULL,
	"name" text NOT NULL,
	metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL
);

ALTER TABLE public.nt_tmp_transactions ADD CONSTRAINT nt_tmp_transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.nt_tmp_transactions ADD CONSTRAINT nt_tmp_transactions_uuid_unique UNIQUE (uuid);
ALTER TABLE public.nt_tmp_transactions ADD CONSTRAINT nt_tmp_transactions_transaction_id_unique UNIQUE (transaction_id);

ALTER TABLE public.nt_scripts_drafts ADD transaction_id uuid NULL;
ALTER TABLE public.nt_scripts_drafts ADD remote_id uuid NULL;
ALTER TABLE public.nt_scripts_drafts ADD CONSTRAINT nt_scripts_drafts_transaction_id_nt_tmp_transactions_transactio FOREIGN KEY (transaction_id) REFERENCES nt_tmp_transactions(transaction_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.nt_screens_drafts ADD transaction_id uuid NULL;
ALTER TABLE public.nt_screens_drafts ADD remote_id uuid NULL;
ALTER TABLE public.nt_screens_drafts ADD CONSTRAINT nt_screens_drafts_transaction_id_nt_tmp_transactions_transactio FOREIGN KEY (transaction_id) REFERENCES nt_tmp_transactions(transaction_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.nt_problems_drafts ADD transaction_id uuid NULL;
ALTER TABLE public.nt_problems_drafts ADD remote_id uuid NULL;
ALTER TABLE public.nt_problems_drafts ADD CONSTRAINT nt_problems_drafts_transaction_id_nt_tmp_transactions_transactio FOREIGN KEY (transaction_id) REFERENCES nt_tmp_transactions(transaction_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.nt_hospitals_drafts ADD transaction_id uuid NULL;
ALTER TABLE public.nt_hospitals_drafts ADD remote_id uuid NULL;
ALTER TABLE public.nt_hospitals_drafts ADD CONSTRAINT nt_hospitals_drafts_transaction_id_nt_tmp_transactions_transactio FOREIGN KEY (transaction_id) REFERENCES nt_tmp_transactions(transaction_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.nt_drugs_library_drafts ADD transaction_id uuid NULL;
ALTER TABLE public.nt_drugs_library_drafts ADD remote_id uuid NULL;
ALTER TABLE public.nt_drugs_library_drafts ADD CONSTRAINT nt_drugs_library_drafts_transaction_id_nt_tmp_transactions_id_f FOREIGN KEY (transaction_id) REFERENCES nt_tmp_transactions(transaction_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.nt_diagnoses_drafts ADD transaction_id uuid NULL;
ALTER TABLE public.nt_diagnoses_drafts ADD remote_id uuid NULL;
ALTER TABLE public.nt_diagnoses_drafts ADD CONSTRAINT nt_diagnoses_drafts_transaction_id_nt_tmp_transactions_transactio FOREIGN KEY (transaction_id) REFERENCES nt_tmp_transactions(transaction_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.nt_data_keys_drafts ADD transaction_id uuid NULL;
ALTER TABLE public.nt_data_keys_drafts ADD remote_id uuid NULL;
ALTER TABLE public.nt_data_keys_drafts ADD CONSTRAINT nt_data_keys_drafts_transaction_id_nt_tmp_transactions_transactio FOREIGN KEY (transaction_id) REFERENCES nt_tmp_transactions(transaction_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.nt_config_keys_drafts ADD transaction_id uuid NULL;
ALTER TABLE public.nt_config_keys_drafts ADD remote_id uuid NULL;
ALTER TABLE public.nt_config_keys_drafts ADD CONSTRAINT nt_config_keys_drafts_transaction_id_nt_tmp_transactions_transactio FOREIGN KEY (transaction_id) REFERENCES nt_tmp_transactions(transaction_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.nt_pending_deletion ADD transaction_id uuid NULL;
ALTER TABLE public.nt_pending_deletion ADD CONSTRAINT nt_pending_deletion_transaction_id_nt_tmp_transactions_transactio FOREIGN KEY (transaction_id) REFERENCES nt_tmp_transactions(transaction_id) ON UPDATE CASCADE ON DELETE CASCADE;

DROP TABLE public.nt_tmp_transaction_dump;

CREATE TABLE public.nt_tmp_transaction_dump (
	id serial4 NOT NULL,
	transaction_uuid uuid NOT NULL,
	"name" text NOT NULL,
	"data" jsonb NULL
);

ALTER TABLE public.nt_tmp_transaction_dump ADD CONSTRAINT nt_tmp_transaction_dump_pkey PRIMARY KEY (id);
ALTER TABLE public.nt_tmp_transaction_dump ADD CONSTRAINT nt_tmp_transaction_dump_transaction_uuid_nt_tmp_transactions_uu FOREIGN KEY (transaction_uuid) REFERENCES public.nt_tmp_transactions("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
