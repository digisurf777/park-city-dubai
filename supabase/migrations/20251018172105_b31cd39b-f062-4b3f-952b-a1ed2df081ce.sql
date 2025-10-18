-- Create function to send verification approval emails
CREATE OR REPLACE FUNCTION public.notify_verification_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  admin_email TEXT := 'support@shazamparking.ae';
BEGIN
  -- Only send emails when status changes to 'approved' or 'rejected'
  IF (NEW.verification_status IN ('approved', 'rejected')) AND 
     (OLD.verification_status IS NULL OR OLD.verification_status != NEW.verification_status) THEN
    
    -- Get user email and name from auth.users and profiles
    SELECT 
      COALESCE(p.email, au.email),
      COALESCE(p.full_name, au.raw_user_meta_data->>'full_name', 'User')
    INTO user_email, user_name
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.user_id = au.id
    WHERE au.id = NEW.user_id;

    -- Send email to customer
    PERFORM net.http_post(
      url := 'https://eoknluyunximjlsnyceb.supabase.co/functions/v1/send-verification-approval',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva25sdXl1bnhpbWpsc255Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODE3MzAsImV4cCI6MjA2NzY1NzczMH0.4jSTWaHnman8fJECoz9pJzVp4sOylr-6Bief9fCeAZ8'
      ),
      body := jsonb_build_object(
        'userId', NEW.user_id,
        'userEmail', user_email,
        'userName', user_name,
        'isApproved', (NEW.verification_status = 'approved')
      )
    );

    -- Send notification to admin about status change
    PERFORM net.http_post(
      url := 'https://eoknluyunximjlsnyceb.supabase.co/functions/v1/send-admin-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva25sdXl1bnhpbWpsc255Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODE3MzAsImV4cCI6MjA2NzY1NzczMH0.4jSTWaHnman8fJECoz9pJzVp4sOylr-6Bief9fCeAZ8'
      ),
      body := jsonb_build_object(
        'type', 'verification_status_update',
        'userEmail', user_email,
        'userName', user_name,
        'details', jsonb_build_object(
          'verificationStatus', NEW.verification_status,
          'documentType', NEW.document_type,
          'nationality', NEW.nationality,
          'submittedAt', NEW.created_at
        )
      )
    );

    RAISE LOG 'Verification status change emails triggered for user: %, status: %', user_name, NEW.verification_status;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_verification_status_change ON public.user_verifications;

-- Create trigger on user_verifications table
CREATE TRIGGER trigger_verification_status_change
  AFTER UPDATE OF verification_status ON public.user_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_verification_status_change();