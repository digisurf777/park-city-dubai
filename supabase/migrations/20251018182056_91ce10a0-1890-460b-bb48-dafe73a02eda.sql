-- Create RPC function to get unread chat count for current user
CREATE OR REPLACE FUNCTION public.get_unread_chat_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  total_unread integer;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN 0;
  END IF;

  WITH driver_bookings AS (
    SELECT id FROM public.parking_bookings pb
    WHERE pb.user_id = current_user_id
  ),
  owner_bookings AS (
    SELECT pb.id
    FROM public.parking_bookings pb
    JOIN public.parking_listings pl ON (
      pl.owner_id = current_user_id
      AND pl.status IN ('approved', 'published')
      AND (
        (pl.address = pb.location AND pl.zone = pb.zone)
        OR (pb.location ILIKE '%' || pl.title || '%')
        OR (pl.address = pb.location AND pb.zone = 'Find Parking Page')
      )
    )
  )
  SELECT COALESCE((
    SELECT COUNT(*)
    FROM public.driver_owner_messages dom
    WHERE dom.read_status = false
      AND (
        (dom.booking_id IN (SELECT id FROM driver_bookings) AND dom.from_driver = false)
        OR
        (dom.booking_id IN (SELECT id FROM owner_bookings) AND dom.from_driver = true)
      )
  ), 0) INTO total_unread;

  RETURN total_unread;
END;
$$;