-- Fix the chat thread creation trigger to handle location/zone matching better
CREATE OR REPLACE FUNCTION public.create_chat_thread_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  listing_owner_id UUID;
BEGIN
  -- Only create chat thread when booking is confirmed/approved
  IF NEW.status IN ('confirmed', 'approved') AND (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    -- Find the listing owner with improved matching logic
    SELECT pl.owner_id INTO listing_owner_id
    FROM public.parking_listings pl
    WHERE (
      -- Exact match first
      (pl.address = NEW.location AND pl.zone = NEW.zone)
      OR 
      -- Fallback: match by title if location contains listing title
      (NEW.location ILIKE '%' || pl.title || '%' AND pl.status IN ('approved', 'published'))
      OR
      -- Fallback: match by address if zone is generic
      (pl.address = NEW.location AND NEW.zone = 'Find Parking Page')
    )
    AND pl.status IN ('approved', 'published')
    ORDER BY 
      CASE 
        WHEN pl.address = NEW.location AND pl.zone = NEW.zone THEN 1
        WHEN NEW.location ILIKE '%' || pl.title || '%' THEN 2
        ELSE 3
      END
    LIMIT 1;

    -- Insert initial system message to create the chat thread
    IF listing_owner_id IS NOT NULL THEN
      INSERT INTO public.driver_owner_messages (
        booking_id,
        driver_id,
        owner_id,
        message,
        from_driver,
        is_expired
      ) VALUES (
        NEW.id,
        NEW.user_id,
        listing_owner_id,
        'Chat thread created for booking. Communication will be available 48 hours before your booking start time.',
        false, -- System message
        false
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create missing chat threads for existing confirmed bookings
DO $$
DECLARE
  booking_record RECORD;
  listing_owner_id UUID;
BEGIN
  FOR booking_record IN (
    SELECT pb.* 
    FROM public.parking_bookings pb
    LEFT JOIN public.driver_owner_messages dom ON pb.id = dom.booking_id
    WHERE pb.status IN ('confirmed', 'approved') 
    AND dom.id IS NULL
  ) LOOP
    -- Find the listing owner for this booking
    SELECT pl.owner_id INTO listing_owner_id
    FROM public.parking_listings pl
    WHERE (
      (pl.address = booking_record.location AND pl.zone = booking_record.zone)
      OR 
      (booking_record.location ILIKE '%' || pl.title || '%' AND pl.status IN ('approved', 'published'))
      OR
      (pl.address = booking_record.location AND booking_record.zone = 'Find Parking Page')
    )
    AND pl.status IN ('approved', 'published')
    ORDER BY 
      CASE 
        WHEN pl.address = booking_record.location AND pl.zone = booking_record.zone THEN 1
        WHEN booking_record.location ILIKE '%' || pl.title || '%' THEN 2
        ELSE 3
      END
    LIMIT 1;

    -- Create chat thread if owner found
    IF listing_owner_id IS NOT NULL THEN
      INSERT INTO public.driver_owner_messages (
        booking_id,
        driver_id,
        owner_id,
        message,
        from_driver,
        is_expired
      ) VALUES (
        booking_record.id,
        booking_record.user_id,
        listing_owner_id,
        'Chat thread created for booking. Communication will be available 48 hours before your booking start time.',
        false,
        false
      );
    END IF;
  END LOOP;
END $$;