-- Update RLS policy for driver_owner_messages to allow chat immediately after booking approval
DROP POLICY IF EXISTS "Users can create messages when booking is approved" ON public.driver_owner_messages;

CREATE POLICY "Users can create messages when booking is approved"
ON public.driver_owner_messages
FOR INSERT
WITH CHECK (
  NOT is_expired 
  AND EXISTS (
    SELECT 1 FROM public.parking_bookings pb
    WHERE pb.id = driver_owner_messages.booking_id
    AND pb.status IN ('confirmed', 'approved')
    AND now() <= pb.end_time  -- Removed 48-hour restriction
    AND (
      pb.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.parking_listings pl
        WHERE pl.owner_id = auth.uid()
        AND pl.status IN ('approved', 'published')
        AND (
          (pl.address = pb.location AND pl.zone = pb.zone)
          OR (pb.location ILIKE '%' || pl.title || '%')
          OR (pl.address = pb.location AND pb.zone = 'Find Parking Page')
        )
      )
    )
  )
);

-- Update get_owner_active_bookings function to reflect immediate chat availability
CREATE OR REPLACE FUNCTION public.get_owner_active_bookings()
RETURNS TABLE(
  id uuid,
  location text,
  zone text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  status text,
  driver_name text,
  unread_messages bigint,
  chat_available boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT 
    pb.id,
    pb.location,
    pb.zone,
    pb.start_time,
    pb.end_time,
    pb.status,
    COALESCE(p.full_name, 'Driver') as driver_name,
    COALESCE(msg_count.unread_count, 0) as unread_messages,
    CASE 
      WHEN pb.status IN ('confirmed', 'approved') AND now() <= pb.end_time
      THEN true
      ELSE false
    END as chat_available
  FROM public.parking_bookings pb
  INNER JOIN public.parking_listings pl ON (
    pl.owner_id = current_user_id
    AND pl.status IN ('approved', 'published')
    AND (
      (pl.address = pb.location AND pl.zone = pb.zone)
      OR (pb.location ILIKE '%' || pl.title || '%')
      OR (pl.address = pb.location AND pb.zone = 'Find Parking Page')
    )
  )
  LEFT JOIN public.profiles p ON p.user_id = pb.user_id
  LEFT JOIN (
    SELECT 
      dom.booking_id,
      COUNT(*) as unread_count
    FROM public.driver_owner_messages dom
    WHERE dom.from_driver = true 
    AND dom.read_status = false
    GROUP BY dom.booking_id
  ) msg_count ON msg_count.booking_id = pb.id
  WHERE pb.status IN ('confirmed', 'approved', 'pending')
  AND pb.end_time >= now()
  ORDER BY pb.start_time ASC;
END;
$function$;