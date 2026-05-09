
-- Public read + anon insert for cleaner-portal buckets (path is prefixed by access_token UUID)
DO $$ BEGIN
  CREATE POLICY "Public read cleaning-photos" ON storage.objects FOR SELECT USING (bucket_id = 'cleaning-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read forgotten-items" ON storage.objects FOR SELECT USING (bucket_id = 'forgotten-items');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anon insert cleaning-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cleaning-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anon insert forgotten-items" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'forgotten-items');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Make buckets public for read
UPDATE storage.buckets SET public = true WHERE id IN ('cleaning-photos','forgotten-items');
