-- Create RPC function to get all driver-owner chat conversations for admins
CREATE OR REPLACE FUNCTION public.get_all_driver_owner_chats()
RETURNS TABLE(
  booking_id uuid,
  location text,
  zone text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  booking_status text,
  driver_id uuid,
  driver_name text,
  owner_id uuid,
  owner_name text,
  total_messages bigint,
  unread_from_driver bigint,
  unread_from_owner bigint,
  flagged_messages bigint,
  last_message_at timestamp with time zone,
  chat_expired boolean
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
    pb.status as booking_status,
    pb.user_id as driver_id,
    COALESCE(
      driver_profile.full_name,
      driver_auth.raw_user_meta_data->>'full_name',
      'Driver'
    ) as driver_name,
    pl.owner_id,
    COALESCE(
      owner_profile.full_name,
      owner_auth.raw_user_meta_data->>'full_name',
      'Owner'
    ) as owner_name,
    COUNT(dom.id) as total_messages,
    COUNT(dom.id) FILTER (WHERE dom.from_driver = true AND dom.read_status = false) as unread_from_driver,
    COUNT(dom.id) FILTER (WHERE dom.from_driver = false AND dom.read_status = false) as unread_from_owner,
    COUNT(dom.id) FILTER (WHERE dom.admin_flagged = true OR dom.contains_violation = true) as flagged_messages,
    MAX(dom.created_at) as last_message_at,
    BOOL_OR(dom.is_expired) as chat_expired
  FROM public.parking_bookings pb
  INNER JOIN public.driver_owner_messages dom ON dom.booking_id = pb.id
  LEFT JOIN public.parking_listings pl ON (
    (pl.address = pb.location AND pl.zone = pb.zone) OR
    (pb.location ILIKE '%' || pl.title || '%') OR
    (pl.address = pb.location AND pb.zone = 'Find Parking Page')
  ) AND pl.status IN ('approved', 'published')
  LEFT JOIN public.profiles driver_profile ON driver_profile.user_id = pb.user_id
  LEFT JOIN auth.users driver_auth ON driver_auth.id = pb.user_id
  LEFT JOIN public.profiles owner_profile ON owner_profile.user_id = pl.owner_id
  LEFT JOIN auth.users owner_auth ON owner_auth.id = pl.owner_id
  WHERE pb.status IN ('confirmed', 'approved', 'completed')
  GROUP BY 
    pb.id, pb.location, pb.zone, pb.start_time, pb.end_time, pb.status, pb.user_id,
    pl.owner_id, driver_profile.full_name, driver_auth.raw_user_meta_data,
    owner_profile.full_name, owner_auth.raw_user_meta_data
  ORDER BY MAX(dom.created_at) DESC;
END;
$$;

-- Create RPC function to get messages for a specific booking
CREATE OR REPLACE FUNCTION public.get_booking_chat_messages(p_booking_id uuid)
RETURNS TABLE(
  id uuid,
  message text,
  from_driver boolean,
  sender_name text,
  created_at timestamp with time zone,
  read_status boolean,
  admin_flagged boolean,
  contains_violation boolean
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
    dom.id,
    dom.message,
    dom.from_driver,
    CASE 
      WHEN dom.from_driver THEN COALESCE(
        driver_profile.full_name,
        driver_auth.raw_user_meta_data->>'full_name',
        'Driver'
      )
      ELSE COALESCE(
        owner_profile.full_name,
        owner_auth.raw_user_meta_data->>'full_name',
        'Owner'
      )
    END as sender_name,
    dom.created_at,
    dom.read_status,
    dom.admin_flagged,
    dom.contains_violation
  FROM public.driver_owner_messages dom
  INNER JOIN public.parking_bookings pb ON pb.id = dom.booking_id
  LEFT JOIN public.profiles driver_profile ON driver_profile.user_id = dom.driver_id
  LEFT JOIN auth.users driver_auth ON driver_auth.id = dom.driver_id
  LEFT JOIN public.profiles owner_profile ON owner_profile.user_id = dom.owner_id
  LEFT JOIN auth.users owner_auth ON owner_auth.id = dom.owner_id
  WHERE dom.booking_id = p_booking_id
  ORDER BY dom.created_at ASC;
END;
$$;