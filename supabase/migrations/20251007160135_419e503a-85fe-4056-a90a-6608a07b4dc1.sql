-- Create storage bucket for booking invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-invoices', 'booking-invoices', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for booking-invoices bucket
CREATE POLICY "Users can view their own booking invoices"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'booking-invoices' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "System can upload booking invoices"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'booking-invoices'
);

CREATE POLICY "System can update booking invoices"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'booking-invoices');

-- Add invoice_url column to parking_bookings if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parking_bookings' 
    AND column_name = 'invoice_url'
  ) THEN
    ALTER TABLE public.parking_bookings 
    ADD COLUMN invoice_url text;
  END IF;
END $$;

-- Create helper function to get booking payment details
CREATE OR REPLACE FUNCTION public.get_my_booking_payments()
RETURNS TABLE(
  id uuid,
  location text,
  zone text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  duration_hours integer,
  cost_aed numeric,
  status text,
  payment_status text,
  payment_type text,
  created_at timestamp with time zone,
  invoice_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return only completed/confirmed bookings with payment info for authenticated user
  RETURN QUERY 
  SELECT 
    pb.id,
    pb.location,
    pb.zone,
    pb.start_time,
    pb.end_time,
    pb.duration_hours,
    pb.cost_aed,
    pb.status,
    pb.payment_status,
    pb.payment_type,
    pb.created_at,
    pb.invoice_url
  FROM public.parking_bookings pb
  WHERE pb.user_id = auth.uid()
  AND pb.status IN ('confirmed', 'completed')
  AND pb.payment_status IN ('paid', 'completed')
  ORDER BY pb.created_at DESC;
END;
$$;