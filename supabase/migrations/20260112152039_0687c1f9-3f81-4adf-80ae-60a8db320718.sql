-- CRITICAL FIX: Replace original database functions with exact listing_id matching
-- This prevents cross-building data leaks by ensuring owners only see their OWN listings

-- 1. Fix get_owner_active_bookings() - the ORIGINAL function with no parameters
DROP FUNCTION IF EXISTS get_owner_active_bookings();

CREATE OR REPLACE FUNCTION get_owner_active_bookings()
RETURNS TABLE(
  booking_id uuid,
  listing_id uuid,
  driver_id uuid,
  driver_name text,
  driver_email text,
  listing_title text,
  start_time timestamptz,
  end_time timestamptz,
  status text,
  has_unread_messages boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT 
    pb.id as booking_id,
    pb.listing_id,
    pb.user_id as driver_id,
    COALESCE(p.full_name, 'Driver') as driver_name,
    COALESCE(p.email, '') as driver_email,
    pl.title as listing_title,
    pb.start_time,
    pb.end_time,
    pb.status::text,
    EXISTS (
      SELECT 1 FROM driver_owner_messages dom 
      WHERE dom.booking_id = pb.id 
      AND dom.from_driver = true 
      AND dom.read_status = false
    ) as has_unread_messages
  FROM parking_bookings pb
  -- CRITICAL: Use exact listing_id matching via JOIN, not fuzzy string matching
  JOIN parking_listings pl ON pb.listing_id = pl.id
  LEFT JOIN profiles p ON pb.user_id = p.id
  WHERE pl.owner_id = current_user_id  -- Owner determined by exact listing_id join
  AND pb.status IN ('confirmed', 'approved')
  AND pb.end_time >= NOW()
  ORDER BY pb.start_time ASC;
END;
$$;

-- 2. Fix send_booking_message(uuid, text) - the ORIGINAL function with 2 parameters
DROP FUNCTION IF EXISTS send_booking_message(uuid, text);

CREATE OR REPLACE FUNCTION send_booking_message(p_booking_id uuid, p_message text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  v_driver_id uuid;
  v_owner_id uuid;
  v_from_driver boolean;
  v_booking_status text;
  v_end_time timestamptz;
  new_message_id uuid;
BEGIN
  -- Get booking details with EXACT listing_id matching for owner lookup
  SELECT 
    pb.user_id,
    pl.owner_id,  -- Owner from the listing via listing_id join
    pb.status,
    pb.end_time
  INTO v_driver_id, v_owner_id, v_booking_status, v_end_time
  FROM parking_bookings pb
  -- CRITICAL: Use exact listing_id matching, not fuzzy string matching
  JOIN parking_listings pl ON pb.listing_id = pl.id
  WHERE pb.id = p_booking_id;

  -- Verify booking exists
  IF v_driver_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
  END IF;

  -- Check if user is authorized (must be driver or owner of THIS specific listing)
  IF current_user_id != v_driver_id AND current_user_id != v_owner_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized for this booking');
  END IF;

  -- Check booking status
  IF v_booking_status NOT IN ('confirmed', 'approved') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Chat not available for this booking status');
  END IF;

  -- Check if booking has ended
  IF v_end_time < NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking has ended');
  END IF;

  -- Determine sender type
  v_from_driver := (current_user_id = v_driver_id);

  -- Insert message
  INSERT INTO driver_owner_messages (booking_id, driver_id, owner_id, message, from_driver)
  VALUES (p_booking_id, v_driver_id, v_owner_id, p_message, v_from_driver)
  RETURNING id INTO new_message_id;

  RETURN jsonb_build_object(
    'success', true, 
    'message_id', new_message_id,
    'from_driver', v_from_driver
  );
END;
$$;

-- 3. Fix get_unread_chat_count() - the ORIGINAL function with no parameters
DROP FUNCTION IF EXISTS get_unread_chat_count();

CREATE OR REPLACE FUNCTION get_unread_chat_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  unread_count integer := 0;
BEGIN
  -- Count unread messages for the current user
  -- For drivers: count unread messages from owners
  -- For owners: count unread messages from drivers on THEIR SPECIFIC listings only
  
  WITH driver_bookings AS (
    SELECT id FROM parking_bookings WHERE user_id = current_user_id
  ),
  owner_bookings AS (
    SELECT pb.id 
    FROM parking_bookings pb
    -- CRITICAL: Use exact listing_id matching for owner lookup
    JOIN parking_listings pl ON pb.listing_id = pl.id
    WHERE pl.owner_id = current_user_id
  )
  SELECT COUNT(*)::integer INTO unread_count
  FROM driver_owner_messages dom
  WHERE dom.read_status = false
  AND (
    -- Messages to driver (from owner)
    (dom.booking_id IN (SELECT id FROM driver_bookings) AND dom.from_driver = false)
    OR
    -- Messages to owner (from driver) - only for THEIR specific listings
    (dom.booking_id IN (SELECT id FROM owner_bookings) AND dom.from_driver = true)
  );

  RETURN unread_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_owner_active_bookings() TO authenticated;
GRANT EXECUTE ON FUNCTION send_booking_message(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_chat_count() TO authenticated;