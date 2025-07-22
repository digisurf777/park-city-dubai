
-- Add payment-related columns to parking_bookings table
ALTER TABLE public.parking_bookings 
ADD COLUMN stripe_payment_intent_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'pre_authorized', 'confirmed', 'refunded', 'failed')),
ADD COLUMN payment_type TEXT CHECK (payment_type IN ('one_time', 'recurring')),
ADD COLUMN confirmation_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN payment_link_url TEXT,
ADD COLUMN payment_amount_cents INTEGER;

-- Update the status column to include more booking statuses
ALTER TABLE public.parking_bookings DROP CONSTRAINT IF EXISTS parking_bookings_status_check;
ALTER TABLE public.parking_bookings ADD CONSTRAINT parking_bookings_status_check 
CHECK (status IN ('pending', 'payment_sent', 'pre_authorized', 'confirmed', 'cancelled', 'completed', 'rejected'));

-- Create function to auto-expire unconfirmed bookings
CREATE OR REPLACE FUNCTION expire_unconfirmed_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update bookings that have passed their confirmation deadline
  UPDATE public.parking_bookings 
  SET 
    status = 'cancelled',
    payment_status = 'refunded',
    updated_at = NOW()
  WHERE 
    confirmation_deadline < NOW() 
    AND status IN ('pending', 'payment_sent', 'pre_authorized')
    AND payment_status = 'pre_authorized';
END;
$$;
