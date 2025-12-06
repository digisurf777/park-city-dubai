-- Add monthly_followup_sent column to parking_bookings for tracking 30-day follow-up emails
ALTER TABLE public.parking_bookings 
ADD COLUMN IF NOT EXISTS monthly_followup_sent boolean DEFAULT false;

-- Create an index for efficient querying of bookings needing follow-up
CREATE INDEX IF NOT EXISTS idx_bookings_monthly_followup 
ON public.parking_bookings (start_time, status, monthly_followup_sent) 
WHERE status = 'confirmed' AND (monthly_followup_sent IS NULL OR monthly_followup_sent = false);