-- Create a function to handle email verification with custom template
CREATE OR REPLACE FUNCTION public.send_custom_verification_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_metadata jsonb;
  full_name text;
BEGIN
  -- Only send email if email is not yet confirmed
  IF NEW.email_confirmed_at IS NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Get user metadata
    user_metadata := NEW.raw_user_meta_data;
    full_name := COALESCE(user_metadata ->> 'full_name', 'User');
    
    -- Call the edge function to send custom verification email
    -- This will be handled by the application layer instead of database
    RAISE LOG 'User % needs email verification with name %', NEW.email, full_name;
  END IF;
  
  RETURN NEW;
END;
$function$

-- Create trigger to send custom verification emails
-- Note: This trigger just logs for now, actual email sending will be handled in the application
CREATE OR REPLACE TRIGGER on_auth_user_created_verification
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_custom_verification_email();