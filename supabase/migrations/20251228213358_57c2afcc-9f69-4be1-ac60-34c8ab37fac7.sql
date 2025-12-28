-- Remove the monthly followup cron job to stop sending monthly update emails
SELECT cron.unschedule('check-monthly-followups-daily');