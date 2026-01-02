-- Remove hourly pricing from listing approval notification
CREATE OR REPLACE FUNCTION public.send_listing_chat_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only send for approved/rejected status changes from pending
  IF NEW.status IN ('approved', 'published', 'rejected') 
     AND OLD.status = 'pending' 
     AND NEW.status != OLD.status THEN
    
    INSERT INTO public.user_messages (
      user_id,
      subject,
      message,
      from_admin,
      read_status
    ) VALUES (
      NEW.owner_id,
      CASE 
        WHEN NEW.status IN ('approved', 'published') THEN 'Parking Listing Approved!'
        ELSE 'Parking Listing Update'
      END,
      CASE 
        WHEN NEW.status IN ('approved', 'published') THEN 
          'Excellent news! Your parking listing has been approved and is now live!' || E'\n\n' ||
          'Location: ' || NEW.address || E'\n\n' ||
          'Your listing is now visible to customers. You will receive notifications when booking requests come in.' || E'\n\n' ||
          'If you need to make any changes, you can edit your listing from your account dashboard.'
        WHEN NEW.status = 'rejected' THEN
          'We are sorry, but your parking listing could not be approved at this time.' || E'\n\n' ||
          'Location: ' || NEW.address || E'\n\n' ||
          'Please review the listing details and resubmit with accurate information. ' ||
          'Common issues include incomplete information, unclear photos, or incorrect pricing.' || E'\n\n' ||
          'Contact support@shazamparking.ae if you need assistance.'
        ELSE
          'Your parking listing status has been updated.'
      END,
      TRUE,
      FALSE
    );
  END IF;
  
  RETURN NEW;
END;
$$;