-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_my_payment_history();

-- Create function for owners to get their own payment history
CREATE OR REPLACE FUNCTION public.get_my_payment_history()
RETURNS TABLE (
  id UUID,
  owner_id UUID,
  listing_id UUID,
  listing_title TEXT,
  booking_id UUID,
  booking_location TEXT,
  booking_zone TEXT,
  booking_start_time TIMESTAMPTZ,
  booking_end_time TIMESTAMPTZ,
  payment_date TIMESTAMPTZ,
  amount_aed NUMERIC,
  payment_period_start DATE,
  payment_period_end DATE,
  payment_method TEXT,
  reference_number TEXT,
  invoice_url TEXT,
  remittance_advice_url TEXT,
  notes TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return payments for the current authenticated user
  RETURN QUERY
  SELECT 
    op.id,
    op.owner_id,
    op.listing_id,
    pl.title as listing_title,
    op.booking_id,
    pb.location as booking_location,
    pb.zone as booking_zone,
    pb.start_time as booking_start_time,
    pb.end_time as booking_end_time,
    op.payment_date,
    op.amount_aed,
    op.payment_period_start,
    op.payment_period_end,
    op.payment_method,
    op.reference_number,
    op.invoice_url,
    op.remittance_advice_url,
    op.notes,
    op.status,
    op.created_at,
    op.updated_at
  FROM public.owner_payments op
  LEFT JOIN public.parking_listings pl ON pl.id = op.listing_id
  LEFT JOIN public.parking_bookings pb ON pb.id = op.booking_id
  WHERE op.owner_id = auth.uid()
  ORDER BY op.payment_date DESC;
END;
$$;