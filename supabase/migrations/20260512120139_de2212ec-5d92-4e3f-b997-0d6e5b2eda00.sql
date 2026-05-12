-- Tornar buckets privados
UPDATE storage.buckets SET public = false WHERE id IN ('cleaning-photos','forgotten-items','cleaner-avatars');

-- Limpar policies antigas
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users upload own cleaning photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users update own cleaning photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users delete own cleaning photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users select own cleaning photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users upload own forgotten items" ON storage.objects;
  DROP POLICY IF EXISTS "Users update own forgotten items" ON storage.objects;
  DROP POLICY IF EXISTS "Users delete own forgotten items" ON storage.objects;
  DROP POLICY IF EXISTS "Users select own forgotten items" ON storage.objects;
  DROP POLICY IF EXISTS "Users upload own cleaner avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users update own cleaner avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users delete own cleaner avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users select own cleaner avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Cleaner token upload cleaning photos" ON storage.objects;
  DROP POLICY IF EXISTS "Cleaner token select cleaning photos" ON storage.objects;
  DROP POLICY IF EXISTS "Cleaner token upload forgotten items" ON storage.objects;
  DROP POLICY IF EXISTS "Cleaner token select forgotten items" ON storage.objects;
END $$;

-- =====================
-- cleaning-photos: dono
-- =====================
CREATE POLICY "Users select own cleaning photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cleaning-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own cleaning photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cleaning-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own cleaning photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cleaning-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own cleaning photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cleaning-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- cleaning-photos: faxineira via token (anon)
CREATE POLICY "Cleaner token upload cleaning photos" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'cleaning-photos'
    AND EXISTS (
      SELECT 1 FROM public.cleaning_jobs j
      WHERE j.access_token::text = (storage.foldername(name))[1]
        AND j.status IN ('agendado','em_andamento')
    )
  );
CREATE POLICY "Cleaner token select cleaning photos" ON storage.objects FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'cleaning-photos'
    AND EXISTS (
      SELECT 1 FROM public.cleaning_jobs j
      WHERE j.access_token::text = (storage.foldername(name))[1]
    )
  );

-- =====================
-- forgotten-items: dono
-- =====================
CREATE POLICY "Users select own forgotten items" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'forgotten-items' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own forgotten items" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'forgotten-items' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own forgotten items" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'forgotten-items' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own forgotten items" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'forgotten-items' AND auth.uid()::text = (storage.foldername(name))[1]);

-- forgotten-items: faxineira via token
CREATE POLICY "Cleaner token upload forgotten items" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'forgotten-items'
    AND EXISTS (
      SELECT 1 FROM public.cleaning_jobs j
      WHERE j.access_token::text = (storage.foldername(name))[1]
        AND j.status IN ('agendado','em_andamento','concluido')
    )
  );
CREATE POLICY "Cleaner token select forgotten items" ON storage.objects FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'forgotten-items'
    AND EXISTS (
      SELECT 1 FROM public.cleaning_jobs j
      WHERE j.access_token::text = (storage.foldername(name))[1]
    )
  );

-- =====================
-- cleaner-avatars: dono
-- =====================
CREATE POLICY "Users select own cleaner avatars" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cleaner-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own cleaner avatars" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cleaner-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own cleaner avatars" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cleaner-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own cleaner avatars" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cleaner-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);