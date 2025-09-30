-- Add email tracking fields to parking_bookings table
ALTER TABLE public.parking_bookings 
ADD COLUMN IF NOT EXISTS customer_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS customer_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS customer_email_error TEXT,
ADD COLUMN IF NOT EXISTS admin_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS booking_received_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS booking_received_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add index for querying failed emails
CREATE INDEX IF NOT EXISTS idx_bookings_email_failures 
ON public.parking_bookings(customer_email_sent) 
WHERE customer_email_sent = false;