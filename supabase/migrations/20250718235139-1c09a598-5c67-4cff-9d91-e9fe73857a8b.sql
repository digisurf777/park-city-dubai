-- Create a function to handle new user signup and send custom confirmation email
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  confirmation_url text;
BEGIN
  -- Build the confirmation URL
  confirmation_url := 'https://eoknluyunximjlsnyceb.supabase.co/auth/v1/verify?token=' || NEW.confirmation_token || '&type=signup&redirect_to=' || encode(TG_ARGV[0], 'base64');
  
  -- Call the edge function to send confirmation email
  PERFORM 
    net.http_post(
      url := 'https://eoknluyunximjlsnyceb.supabase.co/functions/v1/send-confirmation-email',
      headers := json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva25sdXl1bnhpbWpsc255Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODE3MzAsImV4cCI6MjA2NzY1NzczMH0.4jSTWaHnman8fJECoz9pJzVp4sOylr-6Bief9fCeAZ8'
      ),
      body := json_build_object(
        'email', NEW.email,
        'fullName', COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        'confirmationUrl', confirmation_url
      )::text
    );

  RETURN NEW;
END;
$$;

-- Create trigger for new user signups (only if confirmation_token is present)
-- Note: This will only work if email confirmation is enabled in Supabase Auth settings
DROP TRIGGER IF EXISTS on_new_user_signup ON auth.users;

-- Enable email confirmation requirement and ensure the custom email process works
-- Update the profiles trigger to also handle email confirmation status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type, email_confirmed_at)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'seeker'),
    NEW.email_confirmed_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email_confirmed_at = NEW.email_confirmed_at;
    
  RETURN NEW;
END;
$$;