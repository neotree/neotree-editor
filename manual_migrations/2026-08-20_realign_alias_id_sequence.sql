-- Realign the nt_aliases serial sequence after restores/imports that inserted
-- explicit IDs without advancing the sequence. Only move the sequence forward;
-- never lower a healthy sequence.
DO $$
DECLARE
  sequence_name text;
  maximum_id bigint;
  sequence_value bigint;
BEGIN
  LOCK TABLE "public"."nt_aliases" IN ACCESS EXCLUSIVE MODE;

  sequence_name := pg_get_serial_sequence('public.nt_aliases', 'id');
  IF sequence_name IS NULL THEN
    RAISE EXCEPTION 'Could not resolve the serial sequence for nt_aliases.id';
  END IF;

  SELECT COALESCE(MAX("id"), 0)
    INTO maximum_id
    FROM "public"."nt_aliases";

  EXECUTE format('SELECT last_value FROM %s', sequence_name)
    INTO sequence_value;

  IF sequence_value <= maximum_id THEN
    PERFORM setval(sequence_name::regclass, maximum_id, true);
  END IF;
END $$;
