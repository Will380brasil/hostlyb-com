
-- 1) Storage policies for cleaning-thumbnails (owner-scoped to first-folder = auth.uid)
CREATE POLICY "thumbs insert own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cleaning-thumbnails'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "thumbs update own"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cleaning-thumbnails'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'cleaning-thumbnails'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "thumbs delete own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cleaning-thumbnails'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2) Replace public SELECT on properties with SECURITY DEFINER RPC exposing only safe fields
DROP POLICY IF EXISTS "Public can read active guidebooks" ON public.properties;

CREATE OR REPLACE FUNCTION public.get_public_guidebook(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_prop RECORD;
  v_tier text := 'free';
  v_org uuid;
  v_sub RECORD;
BEGIN
  SELECT id, name, address, city, user_id, guidebook_data
  INTO v_prop
  FROM public.properties
  WHERE guidebook_slug = p_slug
    AND guidebook_enabled = true
  LIMIT 1;

  IF v_prop.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT organization_id INTO v_org
  FROM public.organization_members
  WHERE user_id = v_prop.user_id
  LIMIT 1;

  IF v_org IS NOT NULL THEN
    SELECT plan_tier, status, current_period_end INTO v_sub
    FROM public.subscriptions
    WHERE organization_id = v_org
    ORDER BY created_at DESC
    LIMIT 1;
    IF v_sub.plan_tier IS NOT NULL THEN
      IF v_sub.status IN ('active','trialing')
         OR ((v_sub.status IN ('canceled','past_due')) AND v_sub.current_period_end > now())
      THEN
        v_tier := v_sub.plan_tier;
      END IF;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'id', v_prop.id,
    'name', v_prop.name,
    'address', v_prop.address,
    'city', v_prop.city,
    'guidebook_data', v_prop.guidebook_data,
    'ownerTier', v_tier
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_guidebook(text) TO anon, authenticated;
