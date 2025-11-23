-- Fix ambiguous column reference in admin_delete_parking_listing_complete
CREATE OR REPLACE FUNCTION public.admin_delete_parking_listing_complete(listing_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_record parking_listings%ROWTYPE;
  owner_email TEXT;
  owner_name TEXT;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get listing record
  SELECT * INTO deleted_record
  FROM public.parking_listings
  WHERE id = admin_delete_parking_listing_complete.listing_id;  -- Fully qualify parameter

  -- Check if listing exists
  IF deleted_record.id IS NULL THEN
    RAISE EXCEPTION 'No listing found with ID: %', admin_delete_parking_listing_complete.listing_id;
  END IF;

  -- Get owner information separately
  SELECT 
    COALESCE(au.email, ''),
    COALESCE(
      NULLIF(au.raw_user_meta_data->>'full_name', ''),
      NULLIF(p.full_name, ''),
      'Property Owner'
    )
  INTO owner_email, owner_name
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  WHERE au.id = deleted_record.owner_id;

  -- Delete related parking spaces first
  DELETE FROM public.parking_spaces WHERE parking_spaces.listing_id = deleted_record.id;

  -- Delete related records
  DELETE FROM public.driver_owner_messages 
  WHERE driver_owner_messages.listing_id = deleted_record.id;

  -- Delete the listing (use deleted_record.id to avoid ambiguity)
  DELETE FROM public.parking_listings 
  WHERE parking_listings.id = deleted_record.id;

  -- Send delisting notification (async, non-blocking)
  BEGIN
    IF owner_email IS NOT NULL AND owner_email != '' THEN
      PERFORM net.http_post(
        url := 'https://eoknluyunximjlsnyceb.supabase.co/functions/v1/send-listing-delisted',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva25sdXl1bnhpbWpsc255Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODE3MzAsImV4cCI6MjA2NzY1NzczMH0.4jSTWaHnman8fJECoz9pJzVp4sOylr-6Bief9fCeAZ8'
        ),
        body := jsonb_build_object(
          'userEmail', owner_email,
          'userName', owner_name,
          'listingDetails', jsonb_build_object(
            'title', deleted_record.title,
            'address', deleted_record.address,
            'zone', deleted_record.zone,
            'listingId', deleted_record.id::TEXT
          )
        )
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail the deletion
    RAISE WARNING 'Failed to send delisting notification: %', SQLERRM;
  END;

  -- Return success result
  result := json_build_object(
    'success', true,
    'deleted_id', deleted_record.id,
    'message', 'Listing deleted successfully and owner notified'
  );

  RETURN result;
END;
$function$;