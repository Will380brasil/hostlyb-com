CREATE TABLE public.ical_feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL,
  platform TEXT NOT NULL DEFAULT 'airbnb',
  url TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ical_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ical select own" ON public.ical_feeds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ical insert own" ON public.ical_feeds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ical update own" ON public.ical_feeds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ical delete own" ON public.ical_feeds FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_ical_feeds_updated_at BEFORE UPDATE ON public.ical_feeds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS ical_uid TEXT;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS source TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS guests_ical_uid_user_idx ON public.guests(user_id, ical_uid) WHERE ical_uid IS NOT NULL;