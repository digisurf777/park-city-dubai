-- Enable pg_net extension for async HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to send custom confirmation emails
CREATE OR REPLACE FUNCTION public.send_custom_confirmation_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  confirmation_url text;
  full_name text;
  user_language text;
  email_redirect_to text;
BEGIN
  -- Only proceed if user needs confirmation
  IF NEW.confirmation_token IS NOT NULL THEN
    -- Get user's full name from metadata
    full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
    
    -- Detect language (default to 'en', check metadata for 'ar')
    user_language := COALESCE(NEW.raw_user_meta_data->>'language', 'en');
    
    -- Get email redirect URL from metadata
    email_redirect_to := COALESCE(
      NEW.raw_user_meta_data->>'emailRedirectTo',
      'https://shazamparking.lovable.app/auth'
    );
    
    -- Build confirmation URL
    confirmation_url := 'https://eoknluyunximjlsnyceb.supabase.co/auth/v1/verify?token=' || 
                       NEW.confirmation_token || 
                       '&type=signup&redirect_to=' || 
                       email_redirect_to;
    
    -- Call edge function asynchronously (non-blocking)
    PERFORM
      net.http_post(
        url := 'https://eoknluyunximjlsnyceb.supabase.co/functions/v1/send-confirmation-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva25sdXl1bnhpbWpsc255Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODE3MzAsImV4cCI6MjA2NzY1NzczMH0.4jSTWaHnman8fJECoz9pJzVp4sOylr-6Bief9fCeAZ8'
        ),
        body := jsonb_build_object(
          'email', NEW.email,
          'fullName', full_name,
          'confirmationUrl', confirmation_url,
          'language', user_language,
          'isResend', false
        )
      );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block signup
    RAISE WARNING 'Failed to send confirmation email for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_send_confirmation ON auth.users;

-- Create trigger on auth.users INSERT
CREATE TRIGGER on_auth_user_created_send_confirmation
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_custom_confirmation_email();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.send_custom_confirmation_email() TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_custom_confirmation_email() TO anon;