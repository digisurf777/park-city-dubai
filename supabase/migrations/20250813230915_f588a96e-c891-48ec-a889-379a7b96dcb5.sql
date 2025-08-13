-- Fix function search paths for better security
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT public.has_role(_user_id, 'admin')
$function$;

CREATE OR REPLACE FUNCTION public.expire_booking_chats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.driver_owner_messages 
  SET is_expired = true
  WHERE booking_id IN (
    SELECT id FROM public.parking_bookings 
    WHERE end_time < now() AND status IN ('confirmed', 'completed')
  )
  AND NOT is_expired;
END;
$function$;

CREATE OR REPLACE FUNCTION public.setup_admin_user()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the current authenticated user
    admin_user_id := auth.uid();
    
    -- If user is authenticated, make them admin
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.expire_unconfirmed_bookings()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Update bookings that have passed their confirmation deadline
  UPDATE public.parking_bookings 
  SET 
    status = 'cancelled',
    payment_status = 'refunded',
    updated_at = NOW()
  WHERE 
    confirmation_deadline < NOW() 
    AND status IN ('pending', 'payment_sent', 'pre_authorized')
    AND payment_status = 'pre_authorized';
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Insert into profiles table with user metadata
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    user_type, 
    email_confirmed_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'seeker'),
    NEW.email_confirmed_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    user_type = COALESCE(EXCLUDED.user_type, public.profiles.user_type),
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    updated_at = NOW();
    
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$function$;