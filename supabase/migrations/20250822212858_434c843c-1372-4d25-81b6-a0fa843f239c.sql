-- Fix function search path security warnings
-- This ensures all functions have a secure search_path to prevent SQL injection

-- Update existing functions to have secure search_path
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.setup_admin_user() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_new_user_signup() SET search_path = public;
ALTER FUNCTION public.expire_booking_chats() SET search_path = public;
ALTER FUNCTION public.expire_unconfirmed_bookings() SET search_path = public;
ALTER FUNCTION public.refresh_parking_listings_public() SET search_path = public;

-- Update trigger functions to have secure search_path
ALTER FUNCTION public.check_booking_expiry() SET search_path = public;
ALTER FUNCTION public.sync_parking_listings_public() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_blog_posts_updated_at() SET search_path = public;

-- All our new security functions already have SET search_path = public, but let's make sure
-- log_payment_data_access, get_user_bookings_safe, get_booking_payment_details, update_my_booking_safe
-- are already secure as they were created with SET search_path = public

-- Log the security path fix
INSERT INTO public.payment_access_audit (
  booking_id,
  accessed_by,
  access_type,
  payment_fields_accessed,
  accessed_at
) VALUES (
  '00000000-0000-0000-0000-000000000000'::UUID,
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
  'function_search_path_security_fix',
  ARRAY['search_path_vulnerabilities_patched'],
  now()
);