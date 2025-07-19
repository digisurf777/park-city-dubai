-- Create trigger for sending confirmation emails on signup
CREATE TRIGGER on_new_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.confirmation_token IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user_signup('https://1f056007-f350-4973-ab3d-3d7b5c7cd1db.lovableproject.com/email-confirmed');