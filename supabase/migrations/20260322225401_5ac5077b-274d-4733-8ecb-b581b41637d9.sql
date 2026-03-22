CREATE OR REPLACE FUNCTION public.admin_delete_parking_listing_complete(listing_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_record public.parking_listings%ROWTYPE;
  owner_record RECORD;
  customer_record RECORD;
  result JSON;
  customers_cancelled INTEGER := 0;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get the listing first
  SELECT * INTO deleted_record 
  FROM public.parking_listings 
  WHERE id = admin_delete_parking_listing_complete.listing_id;
  
  IF deleted_record.id IS NULL THEN
    RAISE EXCEPTION 'No listing found with ID: %', admin_delete_parking_listing_complete.listing_id;
  END IF;

  -- Get owner details
  SELECT 
    COALESCE(p.email, au.email) as email,
    COALESCE(p.full_name, au.raw_user_meta_data->>'full_name', 'Property Owner') as full_name,
    deleted_record.owner_id as user_id
  INTO owner_record
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  WHERE au.id = deleted_record.owner_id;

  -- Cancel all active/pending bookings (no emails, no in-app messages)
  FOR customer_record IN (
    SELECT DISTINCT pb.id as booking_id
    FROM public.parking_bookings pb
    WHERE pb.listing_id = admin_delete_parking_listing_complete.listing_id
    AND pb.status IN ('confirmed', 'approved', 'pending', 'payment_sent', 'pre_authorized')
  )
  LOOP
    UPDATE public.parking_bookings 
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = customer_record.booking_id;

    customers_cancelled := customers_cancelled + 1;
  END LOOP;

  -- Internal admin notification record only
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
    CASE WHEN customers_cancelled > 0 THEN customers_cancelled || ' customer booking(s) were cancelled.' ELSE 'No active bookings were affected.' END,
    'listing_deleted',
    'normal',
    false,
    NOW()
  );

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
    'owner_notified', false,
    'customers_cancelled', customers_cancelled
  );

  RETURN result;
END;
$$;