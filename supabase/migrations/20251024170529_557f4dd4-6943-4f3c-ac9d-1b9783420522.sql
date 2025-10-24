-- Function to send support chat notification for verification status changes
CREATE OR REPLACE FUNCTION public.send_verification_chat_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only send for approved/rejected status changes
  IF NEW.verification_status IN ('approved', 'rejected') 
     AND (OLD.verification_status IS NULL OR OLD.verification_status != NEW.verification_status) THEN
    
    INSERT INTO public.user_messages (
      user_id,
      subject,
      message,
      from_admin,
      read_status
    ) VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.verification_status = 'approved' THEN 'ID Verification Approved ✅'
        ELSE 'ID Verification Update'
      END,
      CASE 
        WHEN NEW.verification_status = 'approved' THEN 
          'Great news! Your ID verification has been approved! 🎉' || E'\n\n' ||
          'You can now:' || E'\n' ||
          '✅ Book parking spaces' || E'\n' ||
          '✅ List your parking spaces' || E'\n' ||
          '✅ Access all platform features' || E'\n\n' ||
          'Thank you for completing the verification process.'
        WHEN NEW.verification_status = 'rejected' THEN
          'We''re sorry, but your ID verification was not approved.' || E'\n\n' ||
          'Please resubmit your documents with the correct information. ' ||
          'If you have questions, contact us at support@shazamparking.ae'
        ELSE
          'Your ID verification status has been updated to: ' || NEW.verification_status
      END,
      TRUE,
      FALSE
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for verification status changes
DROP TRIGGER IF EXISTS verification_support_chat_trigger ON public.user_verifications;
CREATE TRIGGER verification_support_chat_trigger
  AFTER UPDATE ON public.user_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_verification_chat_notification();

-- Function to send support chat notification for listing status changes
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
        WHEN NEW.status IN ('approved', 'published') THEN 'Parking Listing Approved! 🎉'
        ELSE 'Parking Listing Update'
      END,
      CASE 
        WHEN NEW.status IN ('approved', 'published') THEN 
          'Excellent news! Your parking listing has been approved and is now live! 🚗' || E'\n\n' ||
          '📍 Location: ' || NEW.address || E'\n' ||
          '💰 Price: ' || NEW.price_per_hour::text || ' AED/hour' || E'\n\n' ||
          'Your listing is now visible to customers. You''ll receive notifications when booking requests come in.' || E'\n\n' ||
          'If you need to make any changes, you can edit your listing from your account dashboard.'
        WHEN NEW.status = 'rejected' THEN
          'We''re sorry, but your parking listing could not be approved at this time.' || E'\n\n' ||
          '📍 Location: ' || NEW.address || E'\n\n' ||
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

-- Trigger for listing status changes
DROP TRIGGER IF EXISTS listing_support_chat_trigger ON public.parking_listings;
CREATE TRIGGER listing_support_chat_trigger
  AFTER UPDATE ON public.parking_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.send_listing_chat_notification();