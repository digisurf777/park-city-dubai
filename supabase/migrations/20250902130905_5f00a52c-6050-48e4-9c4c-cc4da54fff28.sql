-- Fix UUID casting issues in admin functions and RLS policies
-- This addresses the "operator does not exist: uuid = character varying" errors

-- 1. Fix the is_admin function with proper UUID casting
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'::app_role
  )
$$;

-- 2. Fix the has_role function with proper UUID casting
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Ensure the specific admin user has admin role
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user ID for the admin email
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'anwerhammad479@gmail.com'
  LIMIT 1;
  
  -- Insert admin role if user exists
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- 4. Fix all admin RLS policies to use the corrected is_admin function
-- This ensures consistent UUID handling across all policies

-- Fix blog_posts admin policy
DROP POLICY IF EXISTS "Admins full access blog_posts" ON public.blog_posts;
CREATE POLICY "Admins full access blog_posts" 
ON public.blog_posts 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix news admin policy
DROP POLICY IF EXISTS "Admins full access news" ON public.news;
CREATE POLICY "Admins full access news" 
ON public.news 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix profiles admin policy
DROP POLICY IF EXISTS "Admins full access profiles" ON public.profiles;
CREATE POLICY "Admins full access profiles" 
ON public.profiles 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix parking_listings admin policy
DROP POLICY IF EXISTS "admins_full_access_parking_listings" ON public.parking_listings;
CREATE POLICY "Admins full access parking_listings" 
ON public.parking_listings 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix parking_bookings admin policy
DROP POLICY IF EXISTS "Admins full access parking_bookings" ON public.parking_bookings;
CREATE POLICY "Admins full access parking_bookings" 
ON public.parking_bookings 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix user_roles admin policy
DROP POLICY IF EXISTS "Admins full access user_roles" ON public.user_roles;
CREATE POLICY "Admins full access user_roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix user_verifications admin policy
DROP POLICY IF EXISTS "Admins full access user_verifications" ON public.user_verifications;
CREATE POLICY "Admins full access user_verifications" 
ON public.user_verifications 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));