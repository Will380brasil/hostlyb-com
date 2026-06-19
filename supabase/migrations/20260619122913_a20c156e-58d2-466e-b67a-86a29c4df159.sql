
-- 1) Fix SELECT policies: compare access_token to the file path's first folder (objects.name), not cleaner name
DROP POLICY IF EXISTS "Cleaner token select cleaning photos" ON storage.objects;
DROP POLICY IF EXISTS "Cleaner token select forgotten items" ON storage.objects;

CREATE POLICY "Cleaner token select cleaning photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'cleaning-photos'
  AND EXISTS (
    SELECT 1 FROM public.cleaning_jobs j
    LEFT JOIN public.cleaners c ON c.id = j.cleaner_id
    WHERE (j.access_token)::text = (storage.foldername(objects.name))[1]
      AND (j.user_id = auth.uid() OR c.auth_user_id = auth.uid())
  )
);

CREATE POLICY "Cleaner token select forgotten items"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'forgotten-items'
  AND EXISTS (
    SELECT 1 FROM public.cleaning_jobs j
    LEFT JOIN public.cleaners c ON c.id = j.cleaner_id
    WHERE (j.access_token)::text = (storage.foldername(objects.name))[1]
      AND (j.user_id = auth.uid() OR c.auth_user_id = auth.uid())
  )
);

-- 2) Restrict uploads to authenticated cleaner bound to job (or owner). Removes anon role.
DROP POLICY IF EXISTS "Cleaner token upload cleaning photos" ON storage.objects;
DROP POLICY IF EXISTS "Cleaner token upload forgotten items" ON storage.objects;

CREATE POLICY "Cleaner token upload cleaning photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cleaning-photos'
  AND EXISTS (
    SELECT 1 FROM public.cleaning_jobs j
    LEFT JOIN public.cleaners c ON c.id = j.cleaner_id
    WHERE (j.access_token)::text = (storage.foldername(objects.name))[1]
      AND j.status = ANY (ARRAY['agendado','em_andamento'])
      AND (j.user_id = auth.uid() OR c.auth_user_id = auth.uid())
  )
);

CREATE POLICY "Cleaner token upload forgotten items"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'forgotten-items'
  AND EXISTS (
    SELECT 1 FROM public.cleaning_jobs j
    LEFT JOIN public.cleaners c ON c.id = j.cleaner_id
    WHERE (j.access_token)::text = (storage.foldername(objects.name))[1]
      AND j.status = ANY (ARRAY['agendado','em_andamento'])
      AND (j.user_id = auth.uid() OR c.auth_user_id = auth.uid())
  )
);

-- 3) Admin access on profiles for user management
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
