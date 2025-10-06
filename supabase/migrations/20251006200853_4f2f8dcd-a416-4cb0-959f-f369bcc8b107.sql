-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to check for expiring bookings daily at 9 AM
SELECT cron.schedule(
  'check-expiring-bookings-daily',
  '0 9 * * *', -- Run at 9:00 AM every day
  $$
  SELECT
    net.http_post(
      url:='https://eoknluyunximjlsnyceb.supabase.co/functions/v1/check-expiring-bookings',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva25sdXl1bnhpbWpsc255Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODE3MzAsImV4cCI6MjA2NzY1NzczMH0.4jSTWaHnman8fJECoz9pJzVp4sOylr-6Bief9fCeAZ8"}'::jsonb
    ) as request_id;
  $$
);

-- Add comment for documentation
COMMENT ON EXTENSION pg_cron IS 'Scheduled job execution for automatic booking expiration notifications';
