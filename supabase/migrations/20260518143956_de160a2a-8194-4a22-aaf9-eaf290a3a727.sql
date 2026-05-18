
-- Remove public SELECT on cleaning-photos and forgotten-items buckets
DROP POLICY IF EXISTS "Public read cleaning-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read forgotten-items" ON storage.objects;

-- Allow individual subscription owners to read their own subscription
CREATE POLICY "Subscription owner can view own"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- cleaning_photo_log: add UPDATE/DELETE policies (owner-scoped)
CREATE POLICY "CPL update own" ON public.cleaning_photo_log
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "CPL delete own" ON public.cleaning_photo_log
FOR DELETE USING (auth.uid() = user_id);

-- cleaning_photo_thumbnails: add UPDATE policy
CREATE POLICY "CPT update own" ON public.cleaning_photo_thumbnails
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
