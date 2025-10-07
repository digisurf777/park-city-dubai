-- Drop and recreate get_all_driver_owner_chats with all required fields
DROP FUNCTION IF EXISTS public.get_all_driver_owner_chats();

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
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  WITH booking_message_stats AS (
    SELECT 
      dom.booking_id,
      dom.driver_id,
      dom.owner_id,
      COUNT(*) as total_messages,
      COUNT(*) FILTER (WHERE dom.from_driver = true AND dom.read_status = false) as unread_from_driver,
      COUNT(*) FILTER (WHERE dom.from_driver = false AND dom.read_status = false) as unread_from_owner,
      COUNT(*) FILTER (WHERE dom.admin_flagged = true) as flagged_messages,
      MAX(dom.created_at) as last_message_at,
      BOOL_OR(dom.is_expired) as chat_expired
    FROM public.driver_owner_messages dom
    GROUP BY dom.booking_id, dom.driver_id, dom.owner_id
  )
  SELECT 
    pb.id as booking_id,
    pb.location,
    pb.zone,
    pb.start_time,
    pb.end_time,
    pb.status as booking_status,
    stats.driver_id,
    COALESCE(
      driver_profile.full_name,
      driver_auth.raw_user_meta_data->>'full_name',
      driver_auth.email,
      'Driver'
    ) as driver_name,
    stats.owner_id,
    COALESCE(
      owner_profile.full_name,
      owner_auth.raw_user_meta_data->>'full_name',
      owner_auth.email,
      'Owner'
    ) as owner_name,
    stats.total_messages,
    stats.unread_from_driver,
    stats.unread_from_owner,
    stats.flagged_messages,
    stats.last_message_at,
    stats.chat_expired
  FROM booking_message_stats stats
  INNER JOIN public.parking_bookings pb ON pb.id = stats.booking_id
  LEFT JOIN auth.users driver_auth ON driver_auth.id = stats.driver_id
  LEFT JOIN public.profiles driver_profile ON driver_profile.user_id = stats.driver_id
  LEFT JOIN auth.users owner_auth ON owner_auth.id = stats.owner_id
  LEFT JOIN public.profiles owner_profile ON owner_profile.user_id = stats.owner_id
  ORDER BY stats.last_message_at DESC;
END;
$$;

-- Drop and recreate get_booking_chat_messages with sender_name field
DROP FUNCTION IF EXISTS public.get_booking_chat_messages(uuid);

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
SET search_path TO 'public'
AS $$
BEGIN
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
        driver_auth.email,
        'Driver'
      )
      ELSE COALESCE(
        owner_profile.full_name,
        owner_auth.raw_user_meta_data->>'full_name',
        owner_auth.email,
        'Owner'
      )
    END as sender_name,
    dom.created_at,
    dom.read_status,
    dom.admin_flagged,
    dom.contains_violation
  FROM public.driver_owner_messages dom
  LEFT JOIN auth.users driver_auth ON driver_auth.id = dom.driver_id
  LEFT JOIN public.profiles driver_profile ON driver_profile.user_id = dom.driver_id
  LEFT JOIN auth.users owner_auth ON owner_auth.id = dom.owner_id
  LEFT JOIN public.profiles owner_profile ON owner_profile.user_id = dom.owner_id
  WHERE dom.booking_id = p_booking_id
  ORDER BY dom.created_at ASC;
END;
$$;