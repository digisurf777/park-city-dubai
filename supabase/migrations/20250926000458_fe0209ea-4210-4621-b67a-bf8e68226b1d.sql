-- Create RPC function to get booking owner ID (for chat functionality)
CREATE OR REPLACE FUNCTION public.get_booking_owner_id(p_booking_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  booking_record RECORD;
  owner_uuid uuid;
BEGIN
  -- Get booking details
  SELECT location, zone INTO booking_record
  FROM public.parking_bookings 
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Find the listing owner with improved matching logic
  SELECT owner_id INTO owner_uuid
  FROM public.parking_listings
  WHERE (
    -- Exact match first
    (address = booking_record.location AND zone = booking_record.zone)
    OR 
    -- Fallback: match by title if location contains listing title
    (booking_record.location ILIKE '%' || title || '%' AND status IN ('approved', 'published'))
    OR
    -- Fallback: match by address if zone is generic
    (address = booking_record.location AND booking_record.zone = 'Find Parking Page')
  )
  AND status IN ('approved', 'published')
  ORDER BY 
    CASE 
      WHEN address = booking_record.location AND zone = booking_record.zone THEN 1
      WHEN booking_record.location ILIKE '%' || title || '%' THEN 2
      ELSE 3
    END
  LIMIT 1;

  IF owner_uuid IS NULL THEN
    RAISE EXCEPTION 'No matching listing owner found for booking';
  END IF;

  RETURN owner_uuid;
END;
$function$;