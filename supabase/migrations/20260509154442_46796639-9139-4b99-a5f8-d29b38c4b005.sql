
-- Helper: returns true if user is admin, has active subscription, or within 7-day trial.
CREATE OR REPLACE FUNCTION public.user_can_access_app(_user uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _created timestamptz;
  _has_active boolean;
  _is_admin boolean;
BEGIN
  IF _user IS NULL THEN RETURN false; END IF;

  SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE user_id = _user) INTO _is_admin;
  IF _is_admin THEN RETURN true; END IF;

  SELECT EXISTS(
    SELECT 1
    FROM public.organization_members m
    JOIN public.subscriptions s ON s.organization_id = m.organization_id
    WHERE m.user_id = _user
      AND (
        s.status IN ('active','trialing')
        OR (s.status IN ('canceled','past_due') AND s.current_period_end > now())
      )
  ) INTO _has_active;
  IF _has_active THEN RETURN true; END IF;

  SELECT created_at INTO _created FROM auth.users WHERE id = _user;
  IF _created IS NOT NULL AND _created + interval '7 days' > now() THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Helper macro to apply: drop old, create new policies that AND the access check.
-- properties
DROP POLICY IF EXISTS "Properties select own" ON public.properties;
DROP POLICY IF EXISTS "Properties insert own" ON public.properties;
DROP POLICY IF EXISTS "Properties update own" ON public.properties;
DROP POLICY IF EXISTS "Properties delete own" ON public.properties;
CREATE POLICY "Properties select own" ON public.properties FOR SELECT USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Properties insert own" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Properties update own" ON public.properties FOR UPDATE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Properties delete own" ON public.properties FOR DELETE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));

-- guests
DROP POLICY IF EXISTS "Guests select own" ON public.guests;
DROP POLICY IF EXISTS "Guests insert own" ON public.guests;
DROP POLICY IF EXISTS "Guests update own" ON public.guests;
DROP POLICY IF EXISTS "Guests delete own" ON public.guests;
CREATE POLICY "Guests select own" ON public.guests FOR SELECT USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Guests insert own" ON public.guests FOR INSERT WITH CHECK (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Guests update own" ON public.guests FOR UPDATE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Guests delete own" ON public.guests FOR DELETE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));

-- cleaning_jobs
DROP POLICY IF EXISTS "CJ select own" ON public.cleaning_jobs;
DROP POLICY IF EXISTS "CJ insert own" ON public.cleaning_jobs;
DROP POLICY IF EXISTS "CJ update own" ON public.cleaning_jobs;
DROP POLICY IF EXISTS "CJ delete own" ON public.cleaning_jobs;
CREATE POLICY "CJ select own" ON public.cleaning_jobs FOR SELECT USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "CJ insert own" ON public.cleaning_jobs FOR INSERT WITH CHECK (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "CJ update own" ON public.cleaning_jobs FOR UPDATE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "CJ delete own" ON public.cleaning_jobs FOR DELETE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));

-- cleaners
DROP POLICY IF EXISTS "Cleaners select own" ON public.cleaners;
DROP POLICY IF EXISTS "Cleaners insert own" ON public.cleaners;
DROP POLICY IF EXISTS "Cleaners update own" ON public.cleaners;
DROP POLICY IF EXISTS "Cleaners delete own" ON public.cleaners;
CREATE POLICY "Cleaners select own" ON public.cleaners FOR SELECT USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Cleaners insert own" ON public.cleaners FOR INSERT WITH CHECK (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Cleaners update own" ON public.cleaners FOR UPDATE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Cleaners delete own" ON public.cleaners FOR DELETE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));

-- alerts
DROP POLICY IF EXISTS "Alerts select own" ON public.alerts;
DROP POLICY IF EXISTS "Alerts insert own" ON public.alerts;
DROP POLICY IF EXISTS "Alerts update own" ON public.alerts;
DROP POLICY IF EXISTS "Alerts delete own" ON public.alerts;
CREATE POLICY "Alerts select own" ON public.alerts FOR SELECT USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Alerts insert own" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Alerts update own" ON public.alerts FOR UPDATE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "Alerts delete own" ON public.alerts FOR DELETE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));

-- calendar_events
DROP POLICY IF EXISTS "CE select own" ON public.calendar_events;
DROP POLICY IF EXISTS "CE insert own" ON public.calendar_events;
DROP POLICY IF EXISTS "CE update own" ON public.calendar_events;
DROP POLICY IF EXISTS "CE delete own" ON public.calendar_events;
CREATE POLICY "CE select own" ON public.calendar_events FOR SELECT USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "CE insert own" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "CE update own" ON public.calendar_events FOR UPDATE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "CE delete own" ON public.calendar_events FOR DELETE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));

-- ical_feeds
DROP POLICY IF EXISTS "ical select own" ON public.ical_feeds;
DROP POLICY IF EXISTS "ical insert own" ON public.ical_feeds;
DROP POLICY IF EXISTS "ical update own" ON public.ical_feeds;
DROP POLICY IF EXISTS "ical delete own" ON public.ical_feeds;
CREATE POLICY "ical select own" ON public.ical_feeds FOR SELECT USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "ical insert own" ON public.ical_feeds FOR INSERT WITH CHECK (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "ical update own" ON public.ical_feeds FOR UPDATE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "ical delete own" ON public.ical_feeds FOR DELETE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));

-- forgotten_items
DROP POLICY IF EXISTS "FI select own" ON public.forgotten_items;
DROP POLICY IF EXISTS "FI insert own" ON public.forgotten_items;
DROP POLICY IF EXISTS "FI update own" ON public.forgotten_items;
DROP POLICY IF EXISTS "FI delete own" ON public.forgotten_items;
CREATE POLICY "FI select own" ON public.forgotten_items FOR SELECT USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "FI insert own" ON public.forgotten_items FOR INSERT WITH CHECK (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "FI update own" ON public.forgotten_items FOR UPDATE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "FI delete own" ON public.forgotten_items FOR DELETE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));

-- property_cleaners
DROP POLICY IF EXISTS "PC select own" ON public.property_cleaners;
DROP POLICY IF EXISTS "PC insert own" ON public.property_cleaners;
DROP POLICY IF EXISTS "PC delete own" ON public.property_cleaners;
CREATE POLICY "PC select own" ON public.property_cleaners FOR SELECT USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "PC insert own" ON public.property_cleaners FOR INSERT WITH CHECK (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));
CREATE POLICY "PC delete own" ON public.property_cleaners FOR DELETE USING (auth.uid() = user_id AND public.user_can_access_app(auth.uid()));

-- demo_leads: track access count for 2-login limit (in addition to existing columns)
ALTER TABLE public.demo_leads ADD COLUMN IF NOT EXISTS access_count integer NOT NULL DEFAULT 1;
ALTER TABLE public.demo_leads ADD COLUMN IF NOT EXISTS last_access_at timestamptz NOT NULL DEFAULT now();
