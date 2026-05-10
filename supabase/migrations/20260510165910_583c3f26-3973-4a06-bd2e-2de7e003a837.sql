
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS property_tier INT NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS billing_currency TEXT NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS current_property_count INT NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_property_tier_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_property_tier_check CHECK (property_tier IN (5,10,20,50,999));
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_billing_interval_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_billing_interval_check CHECK (billing_interval IN ('monthly','yearly'));
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_billing_currency_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_billing_currency_check CHECK (billing_currency IN ('EUR','BRL','USD'));

-- Backfill current count
UPDATE public.profiles p
SET current_property_count = COALESCE((
  SELECT COUNT(*) FROM public.properties WHERE user_id = p.id AND archived = false
), 0);

CREATE OR REPLACE FUNCTION public.can_add_property(_user uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_tier INT;
  v_count INT;
  v_created TIMESTAMPTZ;
  v_is_admin BOOLEAN;
BEGIN
  IF _user IS NULL THEN RETURN false; END IF;

  SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE user_id = _user) INTO v_is_admin;
  IF v_is_admin THEN RETURN true; END IF;

  SELECT created_at INTO v_created FROM auth.users WHERE id = _user;
  IF v_created IS NOT NULL AND v_created + interval '7 days' > now() THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.organization_members m
    JOIN public.subscriptions s ON s.organization_id = m.organization_id
    WHERE m.user_id = _user
      AND s.status IN ('active','trialing')
  ) THEN
    -- has active sub: respect tier
    SELECT property_tier, current_property_count INTO v_tier, v_count
    FROM public.profiles WHERE id = _user;
    IF v_tier IS NULL THEN v_tier := 5; END IF;
    RETURN v_count < v_tier;
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_property_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET current_property_count = current_property_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET current_property_count = GREATEST(current_property_count - 1, 0) WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_property_change_count ON public.properties;
CREATE TRIGGER on_property_change_count
  AFTER INSERT OR DELETE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_property_count();
