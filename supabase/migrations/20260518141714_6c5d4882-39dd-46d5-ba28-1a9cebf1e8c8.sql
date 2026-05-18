
DO $$ BEGIN PERFORM cron.unschedule('hostlyb-automated-emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'hostlyb-automated-emails',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--32030262-a635-4b63-8c3e-bd56f65463a4.lovable.app/api/public/hooks/automated-emails',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cWJmb2lqYnloenlzbHhzY3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjU3MDksImV4cCI6MjA5Mzg0MTcwOX0.AwlDZ_voeghfFRqRy5C8IPazUxC827524SOs1LCKA30"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
