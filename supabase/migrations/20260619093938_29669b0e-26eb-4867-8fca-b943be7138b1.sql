CREATE OR REPLACE FUNCTION public.user_can_access_app(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = _user AND suspended_at IS NOT NULL
    );
$$;

DROP POLICY IF EXISTS "Cleaner token select cleaning photos" ON storage.objects;
DROP POLICY IF EXISTS "Cleaner token select forgotten items" ON storage.objects;
DROP POLICY IF EXISTS "Cleaner token upload forgotten items" ON storage.objects;

CREATE POLICY "Cleaner token select cleaning photos" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'cleaning-photos'
    AND EXISTS (
      SELECT 1
      FROM public.cleaning_jobs j
      LEFT JOIN public.cleaners c ON c.id = j.cleaner_id
      WHERE j.access_token::text = (storage.foldername(name))[1]
        AND (j.user_id = auth.uid() OR c.auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Cleaner token select forgotten items" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'forgotten-items'
    AND EXISTS (
      SELECT 1
      FROM public.cleaning_jobs j
      LEFT JOIN public.cleaners c ON c.id = j.cleaner_id
      WHERE j.access_token::text = (storage.foldername(name))[1]
        AND (j.user_id = auth.uid() OR c.auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Cleaner token upload forgotten items" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'forgotten-items'
    AND EXISTS (
      SELECT 1 FROM public.cleaning_jobs j
      WHERE j.access_token::text = (storage.foldername(name))[1]
        AND j.status IN ('agendado','em_andamento')
    )
  );

DROP POLICY IF EXISTS "invites select invitee" ON public.organization_invites;
CREATE POLICY "invites select invitee" ON public.organization_invites
  FOR SELECT TO authenticated
  USING (
    accepted_at IS NULL
    AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );