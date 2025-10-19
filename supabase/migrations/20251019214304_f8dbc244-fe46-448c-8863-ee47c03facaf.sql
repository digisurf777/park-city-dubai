-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_my_payment_history();
DROP FUNCTION IF EXISTS public.get_owner_payment_history();
DROP FUNCTION IF EXISTS public.get_owner_bookings_for_payment(uuid);

-- Create RPC function to get owner payment history with booking details
CREATE OR REPLACE FUNCTION public.get_my_payment_history()
RETURNS TABLE (
  id uuid,
  listing_title text,
  payment_date timestamp with time zone,
  amount_aed numeric,
  payment_period_start date,
  payment_period_end date,
  payment_method text,
  reference_number text,
  invoice_url text,
  remittance_advice_url text,
  status text,
  booking_id uuid,
  booking_location text,
  booking_zone text,
  booking_start_time timestamp with time zone,
  booking_end_time timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    op.id,
    pl.title as listing_title,
    op.payment_date,
    op.amount_aed,
    op.payment_period_start,
    op.payment_period_end,
    op.payment_method,
    op.reference_number,
    op.invoice_url,
    op.remittance_advice_url,
    op.status,
    op.booking_id,
    pb.location as booking_location,
    pb.zone as booking_zone,
    pb.start_time as booking_start_time,
    pb.end_time as booking_end_time
  FROM public.owner_payments op
  LEFT JOIN public.parking_listings pl ON op.listing_id = pl.id
  LEFT JOIN public.parking_bookings pb ON op.booking_id = pb.id
  WHERE op.owner_id = auth.uid()
  ORDER BY op.payment_date DESC;
END;
$$;

-- Create RPC function to get all owner payment history for admins with booking details
CREATE OR REPLACE FUNCTION public.get_owner_payment_history()
RETURNS TABLE (
  id uuid,
  owner_id uuid,
  owner_name text,
  owner_email text,
  listing_id uuid,
  listing_title text,
  payment_date timestamp with time zone,
  amount_aed numeric,
  payment_period_start date,
  payment_period_end date,
  payment_method text,
  reference_number text,
  invoice_url text,
  remittance_advice_url text,
  notes text,
  status text,
  booking_id uuid,
  booking_location text,
  booking_zone text,
  booking_start_time timestamp with time zone,
  booking_end_time timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    op.id,
    op.owner_id,
    COALESCE(p.full_name, au.raw_user_meta_data->>'full_name', 'Unknown Owner') as owner_name,
    COALESCE(p.email, au.email, '') as owner_email,
    op.listing_id,
    pl.title as listing_title,
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
    op.booking_id,
    pb.location as booking_location,
    pb.zone as booking_zone,
    pb.start_time as booking_start_time,
    pb.end_time as booking_end_time
  FROM public.owner_payments op
  LEFT JOIN auth.users au ON op.owner_id = au.id
  LEFT JOIN public.profiles p ON op.owner_id = p.user_id
  LEFT JOIN public.parking_listings pl ON op.listing_id = pl.id
  LEFT JOIN public.parking_bookings pb ON op.booking_id = pb.id
  ORDER BY op.payment_date DESC;
END;
$$;

-- Create RPC function to get bookings for an owner's listings
CREATE OR REPLACE FUNCTION public.get_owner_bookings_for_payment(p_owner_id uuid)
RETURNS TABLE (
  booking_id uuid,
  location text,
  zone text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  cost_aed numeric,
  status text,
  listing_title text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    pb.id as booking_id,
    pb.location,
    pb.zone,
    pb.start_time,
    pb.end_time,
    pb.cost_aed,
    pb.status,
    pl.title as listing_title
  FROM public.parking_bookings pb
  INNER JOIN public.parking_listings pl ON (
    pl.owner_id = p_owner_id
    AND pl.status IN ('approved', 'published')
    AND (
      (pl.address = pb.location AND pl.zone = pb.zone)
      OR (pb.location ILIKE '%' || pl.title || '%')
      OR (pl.address = pb.location AND pb.zone = 'Find Parking Page')
    )
  )
  WHERE pb.status IN ('confirmed', 'completed', 'approved')
  ORDER BY pb.start_time DESC
  LIMIT 50;
END;
$$;