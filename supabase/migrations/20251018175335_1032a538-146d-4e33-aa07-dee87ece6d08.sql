-- Update the cron job to use service role key for authentication
SELECT cron.unschedule('check-chat-notifications-every-minute');

SELECT cron.schedule(
  'check-chat-notifications-every-minute',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url:='https://eoknluyunximjlsnyceb.supabase.co/functions/v1/check-chat-notifications',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body:='{}'::jsonb
    ) as request_id;
  $$
);