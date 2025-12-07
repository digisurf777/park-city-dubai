-- Update admin_delete_parking_listing_complete to add admin notification
CREATE OR REPLACE FUNCTION public.admin_delete_parking_listing_complete(listing_id uuid)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_record public.parking_listings%ROWTYPE;
  owner_record RECORD;
  customer_record RECORD;
  result JSON;
  supabase_url TEXT := 'https://eoknluyunximjlsnyceb.supabase.co';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva25sdXl1bnhpbWpsc255Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODE3MzAsImV4cCI6MjA2NzY1NzczMH0.4jSTWaHnman8fJECoz9pJzVp4sOylr-6Bief9fCeAZ8';
  customers_notified INTEGER := 0;
  admin_notif_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get the listing first to have details for notifications
  SELECT * INTO deleted_record 
  FROM public.parking_listings 
  WHERE id = admin_delete_parking_listing_complete.listing_id;
  
  -- Check if listing exists
  IF deleted_record.id IS NULL THEN
    RAISE EXCEPTION 'No listing found with ID: %', admin_delete_parking_listing_complete.listing_id;
  END IF;

  -- Get owner details for notification
  SELECT 
    COALESCE(p.email, au.email) as email,
    COALESCE(p.full_name, au.raw_user_meta_data->>'full_name', 'Property Owner') as full_name,
    deleted_record.owner_id as user_id
  INTO owner_record
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  WHERE au.id = deleted_record.owner_id;

  -- NOTIFY ALL CUSTOMERS WITH ACTIVE/PENDING BOOKINGS
  FOR customer_record IN (
    SELECT DISTINCT 
      pb.id as booking_id,
      pb.user_id,
      pb.start_time,
      pb.end_time,
      pb.location,
      pb.zone,
      pb.status,
      COALESCE(p.email, au.email) as customer_email,
      COALESCE(p.full_name, au.raw_user_meta_data->>'full_name', 'Valued Customer') as customer_name
    FROM public.parking_bookings pb
    LEFT JOIN auth.users au ON au.id = pb.user_id
    LEFT JOIN public.profiles p ON p.user_id = pb.user_id
    WHERE pb.listing_id = admin_delete_parking_listing_complete.listing_id
    AND pb.status IN ('confirmed', 'approved', 'pending', 'payment_sent', 'pre_authorized')
  )
  LOOP
    -- Send in-app chat notification to customer
    INSERT INTO public.user_messages (
      user_id,
      subject,
      message,
      from_admin,
      read_status,
      created_at,
      updated_at
    ) VALUES (
      customer_record.user_id,
      'Booking Cancellation Notice',
      'Dear ' || customer_record.customer_name || ', Your parking booking for "' || deleted_record.title || '" in ' || deleted_record.zone || ' from ' || to_char(customer_record.start_time, 'DD Mon YYYY') || ' to ' || to_char(customer_record.end_time, 'DD Mon YYYY') || ' has been cancelled because the listing has been removed from the ShazamParking platform. If you have made any payment, a full refund will be processed. Please contact us at support@shazamparking.ae if you have any questions.',
      true,
      false,
      NOW(),
      NOW()
    );

    -- Update booking status to cancelled
    UPDATE public.parking_bookings 
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = customer_record.booking_id;

    -- Send email notification to customer
    IF customer_record.customer_email IS NOT NULL THEN
      PERFORM net.http_post(
        url := supabase_url || '/functions/v1/send-booking-cancelled-delisting',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || anon_key
        ),
        body := jsonb_build_object(
          'customerEmail', customer_record.customer_email,
          'customerName', customer_record.customer_name,
          'listingTitle', deleted_record.title,
          'zone', deleted_record.zone,
          'startDate', customer_record.start_time,
          'endDate', customer_record.end_time,
          'bookingId', customer_record.booking_id
        )
      );
    END IF;

    customers_notified := customers_notified + 1;
    RAISE LOG 'Notified customer % about booking cancellation for listing %', customer_record.customer_email, deleted_record.title;
  END LOOP;

  -- CREATE ADMIN NOTIFICATION for the deletion (after counting customers)
  INSERT INTO public.admin_notifications (
    title,
    message,
    notification_type,
    priority,
    is_read,
    created_at
  ) VALUES (
    'Parking Listing Deleted',
    'Listing "' || deleted_record.title || '" in ' || deleted_record.zone || ' has been deleted. ' ||
    CASE WHEN customers_notified > 0 THEN customers_notified || ' customer booking(s) were cancelled and notified.' ELSE 'No active bookings were affected.' END,
    'listing_deleted',
    'normal',
    false,
    NOW()
  );

  -- Send in-app notification to owner
  IF owner_record.user_id IS NOT NULL THEN
    INSERT INTO public.user_messages (
      user_id,
      subject,
      message,
      from_admin,
      read_status,
      created_at,
      updated_at
    ) VALUES (
      owner_record.user_id,
      'Listing Removed from Platform',
      'Dear ' || owner_record.full_name || ', Your parking listing "' || deleted_record.title || '" in ' || deleted_record.zone || ' has been removed from the ShazamParking platform and is no longer available to customers. If you have any questions about the decision behind this update, please contact us at support@shazamparking.ae and we will be happy to assist. Thank you for being part of ShazamParking.',
      true,
      false,
      NOW(),
      NOW()
    );
  END IF;

  -- Send email notification to owner
  IF owner_record.email IS NOT NULL THEN
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/send-listing-delisted',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := jsonb_build_object(
        'userEmail', owner_record.email,
        'userName', owner_record.full_name,
        'listingDetails', jsonb_build_object(
          'title', deleted_record.title,
          'address', deleted_record.address,
          'zone', deleted_record.zone,
          'listingId', deleted_record.id
        )
      )
    );
  END IF;

  -- Delete all related parking spaces
  DELETE FROM public.parking_spaces 
  WHERE parking_spaces.listing_id = admin_delete_parking_listing_complete.listing_id;

  -- Delete the listing
  DELETE FROM public.parking_listings 
  WHERE parking_listings.id = admin_delete_parking_listing_complete.listing_id;

  -- Build result
  result := json_build_object(
    'success', true,
    'deleted_listing', json_build_object(
      'id', deleted_record.id,
      'title', deleted_record.title,
      'zone', deleted_record.zone,
      'address', deleted_record.address
    ),
    'owner_notified', owner_record.email IS NOT NULL,
    'customers_notified', customers_notified
  );

  RETURN result;
END;
$$;