-- Fix critical security vulnerability: Protect user personal data in profiles table
-- First enable RLS on all tables (if not already done)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_owner_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_document_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_listings_public ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_access_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_repair_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_access_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secure_document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic profiles policies
DROP POLICY IF EXISTS "profiles_admin_no_direct_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_own_profile" ON public.profiles;

-- Create secure profiles policies that protect personal data
-- 1. Users can only view their own profile
CREATE POLICY "users_can_view_own_profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users can only update their own profile  
CREATE POLICY "users_can_update_own_profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Users can insert their own profile
CREATE POLICY "users_can_insert_own_profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Block all anonymous/public access - no policy means deny by default
-- 5. Admins use secure functions only (no direct table access for better audit trail)

-- Ensure profiles table has proper constraints
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;