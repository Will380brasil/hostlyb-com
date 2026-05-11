-- ============================================
-- Bloco 3: Storage RLS hardening
-- ============================================
-- Mantém buckets públicos (display via getPublicUrl em produção),
-- mas restringe escrita ao folder {user_id}/* do dono.

-- Helper: extrair o primeiro segmento (user_id) do path
DO $$ BEGIN
  -- Limpar policies antigas (se existirem)
  DROP POLICY IF EXISTS "Users upload own cleaning photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users update own cleaning photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users delete own cleaning photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users upload own forgotten items" ON storage.objects;
  DROP POLICY IF EXISTS "Users update own forgotten items" ON storage.objects;
  DROP POLICY IF EXISTS "Users delete own forgotten items" ON storage.objects;
  DROP POLICY IF EXISTS "Users upload own cleaner avatars" ON storage.objects;
END $$;

CREATE POLICY "Users upload own cleaning photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cleaning-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own cleaning photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'cleaning-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own cleaning photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'cleaning-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own forgotten items" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'forgotten-items' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own forgotten items" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'forgotten-items' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own forgotten items" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'forgotten-items' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own cleaner avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cleaner-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- Revogar acesso público às funções SECURITY DEFINER sensíveis
-- ============================================
DO $$
DECLARE func_rec RECORD;
BEGIN
  FOR func_rec IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND p.proname IN ('handle_new_user','create_alert','update_property_count',
                        'refresh_has_forgotten_items','trigger_guest_status_property',
                        'trigger_forgotten_item_alert','trigger_forgotten_item_resolved_alert',
                        'trigger_cleaning_status_alert','update_updated_at_column')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM anon, authenticated, public',
                   func_rec.proname, func_rec.args);
  END LOOP;
END $$;