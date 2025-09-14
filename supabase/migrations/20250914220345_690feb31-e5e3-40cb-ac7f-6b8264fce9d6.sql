-- Add pre-authorization specific fields to parking_bookings table
ALTER TABLE public.parking_bookings 
ADD COLUMN IF NOT EXISTS pre_authorization_amount integer,
ADD COLUMN IF NOT EXISTS pre_authorization_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS capture_amount integer,
ADD COLUMN IF NOT EXISTS security_deposit_amount integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS authorization_extended_count integer DEFAULT 0;

-- Update payment_status enum to include new pre-authorization statuses
DO $$ 
BEGIN
  -- Add new enum values if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pre_authorized' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'text')) THEN
    -- Since we're using text instead of enum, we just need to update the check constraints or policies
    -- No action needed for text fields
  END IF;
END $$;

-- Add indexes for better performance on pre-authorization queries
CREATE INDEX IF NOT EXISTS idx_parking_bookings_pre_auth_expires 
ON public.parking_bookings (pre_authorization_expires_at) 
WHERE pre_authorization_expires_at IS NOT NULL;

-- Create function to extend authorization period
CREATE OR REPLACE FUNCTION public.extend_authorization_period(
  booking_id uuid, 
  additional_days integer DEFAULT 7
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
  booking_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get booking record
  SELECT * INTO booking_record
  FROM public.parking_bookings 
  WHERE id = booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Extend the authorization period
  UPDATE public.parking_bookings 
  SET 
    pre_authorization_expires_at = COALESCE(pre_authorization_expires_at, now()) + (additional_days || ' days')::interval,
    authorization_extended_count = authorization_extended_count + 1,
    updated_at = now()
  WHERE id = booking_id;

  result := json_build_object(
    'success', true,
    'booking_id', booking_id,
    'new_expiry', COALESCE(booking_record.pre_authorization_expires_at, now()) + (additional_days || ' days')::interval,
    'extension_count', booking_record.authorization_extended_count + 1,
    'message', 'Authorization period extended successfully'
  );

  RETURN result;
END;
$function$;

-- Create function to get pre-authorization overview for admins
CREATE OR REPLACE FUNCTION public.get_pre_authorization_overview()
RETURNS TABLE(
  booking_id uuid,
  user_full_name text,
  location text,
  zone text,
  pre_authorization_amount integer,
  capture_amount integer,
  security_deposit_amount integer,
  pre_authorization_expires_at timestamp with time zone,
  payment_status text,
  authorization_extended_count integer,
  days_until_expiry integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    pb.id as booking_id,
    p.full_name as user_full_name,
    pb.location,
    pb.zone,
    pb.pre_authorization_amount,
    pb.capture_amount,
    pb.security_deposit_amount,
    pb.pre_authorization_expires_at,
    pb.payment_status,
    pb.authorization_extended_count,
    CASE 
      WHEN pb.pre_authorization_expires_at IS NOT NULL THEN
        EXTRACT(DAY FROM pb.pre_authorization_expires_at - now())::integer
      ELSE NULL
    END as days_until_expiry,
    pb.created_at
  FROM public.parking_bookings pb
  LEFT JOIN public.profiles p ON p.user_id = pb.user_id
  WHERE pb.payment_status IN ('pending', 'pre_authorized', 'partially_captured')
    AND pb.pre_authorization_amount IS NOT NULL
  ORDER BY pb.pre_authorization_expires_at ASC NULLS LAST;
END;
$function$;