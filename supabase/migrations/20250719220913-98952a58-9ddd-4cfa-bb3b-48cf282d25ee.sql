-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_new_user_signup ON auth.users;

-- Update the function to not use net.http_post since it's not available
-- Instead, we'll rely on the client-side confirmation flow
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Just log that a new user signed up
  -- The confirmation email will be handled by the client-side flow
  RAISE LOG 'New user signup: % with email: %', NEW.id, NEW.email;
  RETURN NEW;
END;
$$;

-- Recreate the trigger without the net.http_post dependency
CREATE TRIGGER on_new_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.confirmation_token IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user_signup();