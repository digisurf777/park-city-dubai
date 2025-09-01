-- Fix UUID/varchar type mismatch issues in RLS policies and functions
-- This addresses the "operator does not exist: uuid = character varying" error

-- First, fix the has_role function to use proper UUID casting
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::uuid  -- Explicit UUID casting
      AND role = _role
  )
$function$;

-- Fix the is_admin function to use proper UUID casting
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::uuid  -- Explicit UUID casting
      AND role = 'admin'::app_role
  )
$function$;

-- Ensure the admin user exists with proper setup
-- Create the admin user profile if it doesn't exist
INSERT INTO public.profiles (user_id, full_name, user_type, created_at, updated_at)
SELECT 
  '90d513ba-9feb-421d-87d4-aea1a2a0a722'::uuid,
  'Admin User',
  'seeker',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = '90d513ba-9feb-421d-87d4-aea1a2a0a722'::uuid
);

-- Ensure the admin role exists for the admin user
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
  '90d513ba-9feb-421d-87d4-aea1a2a0a722'::uuid,
  'admin'::app_role,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '90d513ba-9feb-421d-87d4-aea1a2a0a722'::uuid 
  AND role = 'admin'::app_role
);

-- Fix any RLS policies that might have UUID/varchar comparison issues
-- Update blog_posts RLS policy to use proper admin check
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (public.is_admin(auth.uid()::uuid))
WITH CHECK (public.is_admin(auth.uid()::uuid));

-- Update news RLS policy to use proper admin check  
DROP POLICY IF EXISTS "Admins can manage all news posts" ON public.news;
CREATE POLICY "Admins can manage all news posts" 
ON public.news 
FOR ALL 
USING (public.is_admin(auth.uid()::uuid))
WITH CHECK (public.is_admin(auth.uid()::uuid));

-- Fix driver_owner_messages policies to use proper UUID handling
DROP POLICY IF EXISTS "Admins can manage all driver-owner messages" ON public.driver_owner_messages;
CREATE POLICY "Admins can manage all driver-owner messages" 
ON public.driver_owner_messages 
FOR ALL 
USING (public.is_admin(auth.uid()::uuid));

-- Update user_roles policies to use proper UUID casting
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin(auth.uid()::uuid));

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_admin(auth.uid()::uuid));

-- Fix profiles policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (public.is_admin(auth.uid()::uuid));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin(auth.uid()::uuid));

-- Ensure auth.uid() returns are properly cast to UUID in all comparisons
-- Update parking_bookings policies
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.parking_bookings;
CREATE POLICY "Admins can view all bookings" 
ON public.parking_bookings 
FOR SELECT 
USING (public.is_admin(auth.uid()::uuid));

DROP POLICY IF EXISTS "Admins can update all bookings" ON public.parking_bookings;
CREATE POLICY "Admins can update all bookings" 
ON public.parking_bookings 
FOR UPDATE 
USING (public.is_admin(auth.uid()::uuid));

-- Update parking_listings policies
DROP POLICY IF EXISTS "admins_full_access_parking_listings" ON public.parking_listings;
CREATE POLICY "admins_full_access_parking_listings" 
ON public.parking_listings 
FOR ALL 
USING (public.is_admin(auth.uid()::uuid))
WITH CHECK (public.is_admin(auth.uid()::uuid));