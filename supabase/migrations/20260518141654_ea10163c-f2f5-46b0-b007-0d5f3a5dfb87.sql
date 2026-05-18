
DO $$ BEGIN PERFORM cron.unschedule('hostlyb-automated-emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'hostlyb-automated-emails',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--32030262-a635-4b63-8c3e-bd56f65463a4.lovable.app/api/public/hooks/automated-emails',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'apikey', current_setting('app.settings.anon_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);
