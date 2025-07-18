-- Create a trigger to send custom confirmation emails when users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Send confirmation email via edge function
  PERFORM
    net.http_post(
      url := 'https://eoknluyunximjlsnyceb.supabase.co/functions/v1/send-confirmation-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.jwt_secret', true)
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'fullName', COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
        'confirmationUrl', 'https://1f056007-f350-4973-ab3d-3d7b5c7cd1db.lovableproject.com/email-confirmed'
      )
    );
  RETURN NEW;
END;
$$;

-- Create trigger for new user confirmation emails
DROP TRIGGER IF EXISTS on_auth_user_created_send_confirmation ON auth.users;
CREATE TRIGGER on_auth_user_created_send_confirmation
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_new_user_confirmation();