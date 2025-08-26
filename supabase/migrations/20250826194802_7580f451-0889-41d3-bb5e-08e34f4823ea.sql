-- Fix email confirmation URLs to use production domain

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_new_user_signup ON auth.users;

-- Update the signup function to use correct production URL
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Just log that a new user signed up with production URL context
  -- The confirmation email will be handled by the client-side flow with correct redirect URL
  RAISE LOG 'New user signup: % with email: % - will redirect to: https://shazamparking.ae/email-confirmed', NEW.id, NEW.email;
  RETURN NEW;
END;
$$;

-- Create new trigger
CREATE TRIGGER on_new_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.confirmation_token IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user_signup();