DROP TABLE IF EXISTS public.ical_feeds CASCADE;
ALTER TABLE public.guests DROP COLUMN IF EXISTS ical_uid;