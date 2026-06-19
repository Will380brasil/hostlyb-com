
-- 1) Move pg_net out of public (drop + recreate; only API surface, no app data stored in it)
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2) Set search_path on the email queue helper functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;

-- 3) Revoke EXECUTE from anon/authenticated on internal SECURITY DEFINER functions.
DO $$
DECLARE
  fn text;
  internal_fns text[] := ARRAY[
    'public.handle_new_user()',
    'public.update_property_count()',
    'public.update_updated_at_column()',
    'public.refresh_has_forgotten_items()',
    'public.cleaning_jobs_timing()',
    'public.set_maintenance_resolved_at()',
    'public.on_maintenance_issue_created()',
    'public.sync_cleaning_to_transaction()',
    'public.sync_guest_to_transaction()',
    'public.sync_maintenance_to_transaction()',
    'public.sync_maintenance_tx()',
    'public.trigger_cleaning_status_alert()',
    'public.trigger_forgotten_item_alert()',
    'public.trigger_forgotten_item_resolved_alert()',
    'public.trigger_guest_status_property()',
    'public.create_alert(uuid, text, text, text, text, uuid, uuid, uuid, text, text)',
    'public.enqueue_email(text, jsonb)',
    'public.delete_email(text, bigint)',
    'public.read_email_batch(text, integer, integer)',
    'public.move_to_dlq(text, text, bigint, jsonb)'
  ];
BEGIN
  FOREACH fn IN ARRAY internal_fns LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', fn);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, authenticated', fn);
  END LOOP;
END $$;

-- 4) Tighten demo_leads insert policy
DROP POLICY IF EXISTS "Anyone can insert demo lead" ON public.demo_leads;
CREATE POLICY "Anyone can insert demo lead"
ON public.demo_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email ~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
  AND length(phone) BETWEEN 6 AND 32
);
