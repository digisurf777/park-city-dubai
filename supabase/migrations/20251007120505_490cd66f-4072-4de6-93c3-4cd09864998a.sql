-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_all_driver_owner_chats();
DROP FUNCTION IF EXISTS public.get_booking_chat_messages(uuid);

-- Recreate get_all_driver_owner_chats with correct owner_id usage
CREATE OR REPLACE FUNCTION public.get_all_driver_owner_chats()
RETURNS TABLE(
  booking_id uuid,
  driver_id uuid,
  driver_name text,
  owner_id uuid,
  owner_name text,
  last_message text,
  last_message_time timestamp with time zone,
  unread_count bigint,
  booking_status text,
  is_expired boolean
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
  WITH latest_messages AS (
    SELECT DISTINCT ON (dom.booking_id)
      dom.booking_id,
      dom.driver_id,
      dom.owner_id,
      dom.message,
      dom.created_at,
      dom.is_expired
    FROM public.driver_owner_messages dom
    ORDER BY dom.booking_id, dom.created_at DESC
  )
  SELECT 
    lm.booking_id,
    lm.driver_id,
    COALESCE(
      driver_profile.full_name,
      driver_auth.raw_user_meta_data->>'full_name',
      driver_auth.email,
      'Driver'
    ) as driver_name,
    lm.owner_id,
    COALESCE(
      owner_profile.full_name,
      owner_auth.raw_user_meta_data->>'full_name',
      owner_auth.email,
      'Owner'
    ) as owner_name,
    lm.message as last_message,
    lm.created_at as last_message_time,
    COALESCE(unread_counts.unread, 0) as unread_count,
    pb.status as booking_status,
    lm.is_expired
  FROM latest_messages lm
  LEFT JOIN public.parking_bookings pb ON pb.id = lm.booking_id
  LEFT JOIN auth.users driver_auth ON driver_auth.id = lm.driver_id
  LEFT JOIN public.profiles driver_profile ON driver_profile.user_id = lm.driver_id
  LEFT JOIN auth.users owner_auth ON owner_auth.id = lm.owner_id
  LEFT JOIN public.profiles owner_profile ON owner_profile.user_id = lm.owner_id
  LEFT JOIN (
    SELECT 
      dom2.booking_id,
      COUNT(*) as unread
    FROM public.driver_owner_messages dom2
    WHERE dom2.read_status = false
    GROUP BY dom2.booking_id
  ) unread_counts ON unread_counts.booking_id = lm.booking_id
  ORDER BY lm.created_at DESC;
END;
$$;

-- Recreate get_booking_chat_messages with correct owner_id usage
CREATE OR REPLACE FUNCTION public.get_booking_chat_messages(p_booking_id uuid)
RETURNS TABLE(
  id uuid,
  booking_id uuid,
  driver_id uuid,
  owner_id uuid,
  message text,
  from_driver boolean,
  read_status boolean,
  created_at timestamp with time zone,
  driver_name text,
  owner_name text,
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
    dom.booking_id,
    dom.driver_id,
    dom.owner_id,
    dom.message,
    dom.from_driver,
    dom.read_status,
    dom.created_at,
    COALESCE(
      driver_profile.full_name,
      driver_auth.raw_user_meta_data->>'full_name',
      driver_auth.email,
      'Driver'
    ) as driver_name,
    COALESCE(
      owner_profile.full_name,
      owner_auth.raw_user_meta_data->>'full_name',
      owner_auth.email,
      'Owner'
    ) as owner_name,
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