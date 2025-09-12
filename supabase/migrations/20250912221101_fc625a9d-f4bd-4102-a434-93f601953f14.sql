-- Create admin function to delete bookings completely
CREATE OR REPLACE FUNCTION public.admin_delete_booking_complete(booking_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_record parking_bookings%ROWTYPE;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get the booking first to return details
  SELECT * INTO deleted_record FROM public.parking_bookings WHERE id = booking_id;
  
  -- Check if booking exists
  IF deleted_record.id IS NULL THEN
    RAISE EXCEPTION 'No booking found with ID: %', booking_id;
  END IF;

  -- Delete related records first (prevent foreign key issues)
  DELETE FROM public.driver_owner_messages WHERE booking_id = admin_delete_booking_complete.booking_id;
  DELETE FROM public.admin_notifications WHERE booking_id = admin_delete_booking_complete.booking_id;
  DELETE FROM public.user_notifications WHERE booking_id = admin_delete_booking_complete.booking_id;

  -- Now delete the booking
  DELETE FROM public.parking_bookings WHERE id = admin_delete_booking_complete.booking_id;

  -- Return success result
  result := json_build_object(
    'success', true,
    'deleted_id', deleted_record.id,
    'location', deleted_record.location,
    'user_id', deleted_record.user_id,
    'cost_aed', deleted_record.cost_aed,
    'message', 'Booking deleted successfully'
  );

  RETURN result;
END;
$function$;