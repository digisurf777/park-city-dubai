-- Add payout email tracking columns to owner_payments
ALTER TABLE public.owner_payments 
ADD COLUMN IF NOT EXISTS payout_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payout_email_sent_at TIMESTAMPTZ;

-- Add monthly followup timestamp to parking_bookings
ALTER TABLE public.parking_bookings 
ADD COLUMN IF NOT EXISTS monthly_followup_sent_at TIMESTAMPTZ;