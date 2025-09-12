-- Fix the ambiguous column reference in admin_delete_parking_listing_complete function
CREATE OR REPLACE FUNCTION public.admin_delete_parking_listing_complete(listing_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_record parking_listings%ROWTYPE;
  result JSON;
  image_url TEXT;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get the listing first to access images
  SELECT * INTO deleted_record FROM public.parking_listings WHERE public.parking_listings.id = listing_id;
  
  -- Check if listing exists
  IF deleted_record.id IS NULL THEN
    RAISE EXCEPTION 'No listing found with ID: %', listing_id;
  END IF;

  -- Delete any related records first (prevent foreign key issues)
  DELETE FROM public.driver_owner_messages WHERE public.driver_owner_messages.listing_id = admin_delete_parking_listing_complete.listing_id;
  
  -- Delete any related parking bookings
  DELETE FROM public.parking_bookings WHERE location = deleted_record.address AND zone = deleted_record.zone;

  -- Delete any parking spaces
  DELETE FROM public.parking_spaces WHERE public.parking_spaces.listing_id = admin_delete_parking_listing_complete.listing_id;

  -- Now delete the listing with explicit WHERE clause
  DELETE FROM public.parking_listings WHERE public.parking_listings.id = admin_delete_parking_listing_complete.listing_id;

  -- Return success result with image URLs for frontend cleanup
  result := json_build_object(
    'success', true,
    'deleted_id', deleted_record.id,
    'images', deleted_record.images,
    'message', 'Listing deleted successfully'
  );

  RETURN result;
END;
$function$;