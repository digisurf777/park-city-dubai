-- Create webhook events log table for audit trail
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payment_intent_id TEXT,
  booking_id UUID,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'processed',
  error_message TEXT,
  raw_event JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view webhook events
CREATE POLICY "Admins can view webhook events" 
ON public.stripe_webhook_events 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create policy for system to insert webhook events
CREATE POLICY "System can insert webhook events" 
ON public.stripe_webhook_events 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id 
ON public.stripe_webhook_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_payment_intent_id 
ON public.stripe_webhook_events(payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_booking_id 
ON public.stripe_webhook_events(booking_id);