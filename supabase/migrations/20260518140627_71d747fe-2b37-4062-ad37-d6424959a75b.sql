
-- Table for premium thumbnails
CREATE TABLE IF NOT EXISTS public.cleaning_photo_thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID,
  cleaning_job_id UUID NOT NULL,
  thumbnail_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_cpt_job ON public.cleaning_photo_thumbnails(cleaning_job_id);
CREATE INDEX IF NOT EXISTS idx_cpt_user ON public.cleaning_photo_thumbnails(user_id);
CREATE INDEX IF NOT EXISTS idx_cpt_expires ON public.cleaning_photo_thumbnails(expires_at);

ALTER TABLE public.cleaning_photo_thumbnails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CPT select own" ON public.cleaning_photo_thumbnails
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "CPT insert own" ON public.cleaning_photo_thumbnails
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "CPT delete own" ON public.cleaning_photo_thumbnails
  FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cleaning-thumbnails', 'cleaning-thumbnails', false)
ON CONFLICT (id) DO NOTHING;

-- Owners can read their own files: path starts with `${user_id}/`
CREATE POLICY "thumbs read own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cleaning-thumbnails'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- pg_cron: daily cleanup of expired rows (storage objects are removed by webhook below)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$ BEGIN
  PERFORM cron.unschedule('cleanup-expired-thumbnails');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'cleanup-expired-thumbnails',
  '17 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--32030262-a635-4b63-8c3e-bd56f65463a4.lovable.app/api/public/hooks/cleanup-thumbnails',
    headers := jsonb_build_object('Content-Type','application/json','apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cWJmb2lqYnloenlzbHhzY3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjU3MDksImV4cCI6MjA5Mzg0MTcwOX0.AwlDZ_voeghfFRqRy5C8IPazUxC827524SOs1LCKA30'),
    body := '{}'::jsonb
  );
  $$
);
