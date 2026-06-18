
-- 1) Role + cleaner_id on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'owner';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check CHECK (role IN ('owner','cleaner'));
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cleaner_id uuid REFERENCES public.cleaners(id) ON DELETE SET NULL;

ALTER TABLE public.cleaners
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_cleaners_auth_user ON public.cleaners(auth_user_id);

-- 2) Public RPC: resolve token -> cleaner info (no PII other than name/email already known to the cleaner)
CREATE OR REPLACE FUNCTION public.cleaner_token_lookup(p_token uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  SELECT jsonb_build_object(
    'cleaner_id', c.id,
    'cleaner_email', c.email,
    'cleaner_name', c.name,
    'cleaner_phone', c.phone,
    'has_account', (c.auth_user_id IS NOT NULL),
    'property_name', p.name,
    'scheduled_date', j.scheduled_date,
    'scheduled_time', j.scheduled_time
  ) INTO r
  FROM public.cleaning_jobs j
  JOIN public.properties p ON p.id = j.property_id
  LEFT JOIN public.cleaners c ON c.id = j.cleaner_id
  WHERE j.access_token = p_token;
  RETURN r;
END $$;

REVOKE ALL ON FUNCTION public.cleaner_token_lookup(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleaner_token_lookup(uuid) TO anon, authenticated;

-- 3) Authenticated RPC: bind current auth user to the cleaner referenced by the token
CREATE OR REPLACE FUNCTION public.cleaner_claim_token(p_token uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_cleaner_id uuid; v_existing uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;

  SELECT c.id, c.auth_user_id INTO v_cleaner_id, v_existing
  FROM public.cleaning_jobs j
  JOIN public.cleaners c ON c.id = j.cleaner_id
  WHERE j.access_token = p_token;

  IF v_cleaner_id IS NULL THEN RAISE EXCEPTION 'invalid_token'; END IF;

  -- Bind only if not already bound (idempotent, no hijacking)
  IF v_existing IS NULL THEN
    UPDATE public.cleaners SET auth_user_id = auth.uid() WHERE id = v_cleaner_id;
  ELSIF v_existing <> auth.uid() THEN
    RAISE EXCEPTION 'cleaner_already_bound';
  END IF;

  UPDATE public.profiles
    SET cleaner_id = v_cleaner_id, role = 'cleaner'
    WHERE id = auth.uid();

  RETURN jsonb_build_object('ok', true, 'cleaner_id', v_cleaner_id);
END $$;

REVOKE ALL ON FUNCTION public.cleaner_claim_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleaner_claim_token(uuid) TO authenticated;

-- 4) Update handle_new_user: skip org creation for cleaners
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org UUID;
  v_role TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'owner');

  INSERT INTO public.profiles (id, email, display_name, avatar_url, role)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url',
    v_role)
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  -- Cleaners don't get their own workspace
  IF v_role = 'cleaner' THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = NEW.id) THEN
    INSERT INTO public.organizations (name, owner_id)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)) || '''s workspace', NEW.id)
    RETURNING id INTO v_org;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org, NEW.id, 'owner');
  END IF;

  RETURN NEW;
END;
$function$;

-- 5) Backfill: link existing cleaners to profiles by matching lowercase email
UPDATE public.profiles p
   SET cleaner_id = c.id, role = 'cleaner'
  FROM public.cleaners c
 WHERE c.auth_user_id IS NULL
   AND p.cleaner_id IS NULL
   AND c.email IS NOT NULL
   AND lower(p.email) = lower(c.email);

UPDATE public.cleaners c
   SET auth_user_id = p.id
  FROM public.profiles p
 WHERE c.auth_user_id IS NULL
   AND p.cleaner_id = c.id;
