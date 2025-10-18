-- Re-create cron job to use the ANON key explicitly (valid JWT) for invoking the function
SELECT cron.unschedule('check-chat-notifications-every-minute');

SELECT cron.schedule(
  'check-chat-notifications-every-minute',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url:='https://eoknluyunximjlsnyceb.supabase.co/functions/v1/check-chat-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva25sdXl1bnhpbWpsc255Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODE3MzAsImV4cCI6MjA2NzY1NzczMH0.4jSTWaHnman8fJECoz9pJzVp4sOylr-6Bief9fCeAZ8"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);