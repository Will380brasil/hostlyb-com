
-- 1) Tighten Free tier to 1 property
CREATE OR REPLACE FUNCTION public.can_add_property(_user uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_tier TEXT;
  v_count INT;
BEGIN
  IF _user IS NULL THEN RETURN false; END IF;
  SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE user_id = _user) INTO v_is_admin;
  IF v_is_admin THEN RETURN true; END IF;

  SELECT s.plan_tier INTO v_tier
  FROM public.organization_members m
  JOIN public.subscriptions s ON s.organization_id = m.organization_id
  WHERE m.user_id = _user
    AND (s.status IN ('active','trialing')
         OR (s.status IN ('canceled','past_due') AND s.current_period_end > now()))
  ORDER BY s.created_at DESC LIMIT 1;
  IF v_tier IS NULL THEN v_tier := 'free'; END IF;

  IF v_tier IN ('pro','premium') THEN RETURN true; END IF;

  SELECT COUNT(*) INTO v_count FROM public.properties WHERE user_id = _user AND archived = false;
  RETURN v_count < 1;
END $$;

-- 2) Member-cap helper used at invite/insert time
CREATE OR REPLACE FUNCTION public.can_add_member(_org uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_tier TEXT;
  v_count INT;
  v_max INT;
BEGIN
  SELECT s.plan_tier INTO v_tier
  FROM public.subscriptions s
  WHERE s.organization_id = _org
    AND (s.status IN ('active','trialing')
         OR (s.status IN ('canceled','past_due') AND s.current_period_end > now()))
  ORDER BY s.created_at DESC LIMIT 1;
  IF v_tier IS NULL THEN v_tier := 'free'; END IF;

  v_max := CASE v_tier WHEN 'premium' THEN 999999 WHEN 'pro' THEN 5 ELSE 1 END;

  SELECT COUNT(*) INTO v_count FROM public.organization_members WHERE organization_id = _org;
  RETURN v_count < v_max;
END $$;

-- 3) Photo log (no image bytes stored)
CREATE TABLE IF NOT EXISTS public.cleaning_photo_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cleaning_job_id UUID NOT NULL,
  property_id UUID,
  room_name TEXT,
  cleaner_name TEXT,
  kind TEXT NOT NULL DEFAULT 'cleaning', -- 'cleaning' | 'problem' | 'forgotten'
  description TEXT,
  urgency TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  photo_sent BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_cpl_job ON public.cleaning_photo_log(cleaning_job_id);
CREATE INDEX IF NOT EXISTS idx_cpl_user ON public.cleaning_photo_log(user_id, sent_at DESC);

ALTER TABLE public.cleaning_photo_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CPL select own" ON public.cleaning_photo_log;
CREATE POLICY "CPL select own" ON public.cleaning_photo_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "CPL insert own" ON public.cleaning_photo_log;
CREATE POLICY "CPL insert own" ON public.cleaning_photo_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- inserts from server functions use service role, bypassing RLS

-- 4) Fix sync_guest_to_transaction unique index requirement
CREATE UNIQUE INDEX IF NOT EXISTS uq_tx_guest_auto
  ON public.transactions(guest_id) WHERE origin = 'auto:guest' AND guest_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_tx_cleaning_auto
  ON public.transactions(cleaning_job_id) WHERE origin = 'auto:cleaning' AND cleaning_job_id IS NOT NULL;
