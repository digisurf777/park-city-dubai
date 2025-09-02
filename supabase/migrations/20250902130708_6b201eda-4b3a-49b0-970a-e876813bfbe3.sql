-- Fix admin-related functions and RLS policies for proper UUID handling
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

-- 3. Add unique constraint to user_roles to prevent duplicates
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_role_unique 
UNIQUE (user_id, role);

-- 4. Ensure the specific admin user has admin role
INSERT INTO public.user_roles (user_id, role)
SELECT auth.uid(), 'admin'::app_role
FROM auth.users 
WHERE email = 'anwerhammad479@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Update handle_new_user trigger to be safer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only insert into profiles table, let Supabase handle email confirmation
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
    RAISE LOG 'Error in handle_new_user trigger for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 6. Ensure trigger is only on INSERT, remove any UPDATE triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Normalize all "Admins full access" RLS policies to use consistent function calls
-- This ensures all admin policies use the same pattern and avoid casting issues

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

-- Fix driver_owner_messages admin policy
DROP POLICY IF EXISTS "Admins full access driver_owner_messages" ON public.driver_owner_messages;
CREATE POLICY "Admins full access driver_owner_messages" 
ON public.driver_owner_messages 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix documents admin policy
DROP POLICY IF EXISTS "Admins full access documents" ON public.documents;
CREATE POLICY "Admins full access documents" 
ON public.documents 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix news_images admin policy
DROP POLICY IF EXISTS "Admins full access news_images" ON public.news_images;
CREATE POLICY "Admins full access news_images" 
ON public.news_images 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix user_messages admin policy
DROP POLICY IF EXISTS "Admins full access user_messages" ON public.user_messages;
CREATE POLICY "Admins full access user_messages" 
ON public.user_messages 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix photo_repair_reports admin policy
DROP POLICY IF EXISTS "Admins full access photo_repair_reports" ON public.photo_repair_reports;
CREATE POLICY "Admins full access photo_repair_reports" 
ON public.photo_repair_reports 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix remaining audit tables admin policies
DROP POLICY IF EXISTS "verification_audit_log_admin_only" ON public.verification_audit_log;
CREATE POLICY "Admins full access verification_audit_log" 
ON public.verification_audit_log 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "profile_access_audit_admin_only" ON public.profile_access_audit;
CREATE POLICY "Admins full access profile_access_audit" 
ON public.profile_access_audit 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "payment_access_audit_admin_only" ON public.payment_access_audit;
CREATE POLICY "Admins full access payment_access_audit" 
ON public.payment_access_audit 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins full access secure_document_access_log" ON public.secure_document_access_log;
CREATE POLICY "Admins full access secure_document_access_log" 
ON public.secure_document_access_log 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));