-- Drop and recreate get_my_bookings to include invoice_url
DROP FUNCTION IF EXISTS public.get_my_bookings();

CREATE FUNCTION public.get_my_bookings()
RETURNS TABLE(
  id uuid,
  location text,
  zone text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  duration_hours integer,
  cost_aed numeric,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  confirmation_deadline timestamp with time zone,
  payment_type text,
  payment_status text,
  invoice_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log the safe access
  PERFORM public.log_payment_data_access(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'user_safe_booking_view',
    ARRAY['non_payment_fields_only']
  );

  -- Return booking data including invoice_url so customer can download admin-uploaded invoices
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
    pb.created_at,
    pb.updated_at,
    pb.confirmation_deadline,
    pb.payment_type,
    pb.payment_status,
    pb.invoice_url
  FROM public.parking_bookings pb
  WHERE pb.user_id = auth.uid();
END;
$function$;