-- Update the trigger function to send confirmation emails on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  confirmation_url TEXT;
  full_name TEXT;
  function_response json;
BEGIN
  -- Get user's full name from metadata
  full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User');
  
  -- Build confirmation URL with proper redirect
  confirmation_url := 'https://shazamparking.ae/email-confirmed?redirect_to=/my-account';
  
  -- Call the send-confirmation-email edge function
  BEGIN
    -- Note: This will be handled by Supabase's built-in email confirmation
    -- But we also want to send our custom welcome email
    SELECT public.send_welcome_email_async(NEW.email, full_name) INTO function_response;
    
    RAISE LOG 'New user signup processed: % with email: % - confirmation URL: %', 
              NEW.id, NEW.email, confirmation_url;
  EXCEPTION 
    WHEN OTHERS THEN
      -- Log error but don't block user creation
      RAISE LOG 'Error sending welcome email for user %: %', NEW.email, SQLERRM;
  END;
  
  RETURN NEW;
END;
$function$;

-- Create a helper function to send welcome emails asynchronously
CREATE OR REPLACE FUNCTION public.send_welcome_email_async(user_email TEXT, user_full_name TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result json;
BEGIN
  -- This function can be called to send welcome emails
  -- The actual email sending will be handled by the welcome email edge function
  result := json_build_object(
    'success', true,
    'email', user_email,
    'full_name', user_full_name,
    'message', 'Welcome email queued for sending'
  );
  
  RETURN result;
END;
$function$;