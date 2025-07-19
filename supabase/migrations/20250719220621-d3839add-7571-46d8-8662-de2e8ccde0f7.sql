-- Drop the existing trigger with hardcoded URL
DROP TRIGGER IF EXISTS on_new_user_signup ON auth.users;

-- Create trigger for sending confirmation emails on signup with correct domain
CREATE TRIGGER on_new_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.confirmation_token IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user_signup('https://shazamparking.ae/email-confirmed');