
-- Ensure admin full access across relevant tables using the canonical function public.is_admin(auth.uid()::uuid)
-- This normalizes admin privileges and removes conflicting/misleading rules

-- BLOG POSTS
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins full access blog_posts"
  ON public.blog_posts
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- NEWS
DROP POLICY IF EXISTS "Admins can manage all news posts" ON public.news;
CREATE POLICY "Admins full access news"
  ON public.news
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- NEWS COMMENTS (add moderation capability)
DROP POLICY IF EXISTS "Admins can manage all comments" ON public.news_comments;
CREATE POLICY "Admins can manage all comments"
  ON public.news_comments
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- NEWS IMAGES: tighten admin DML, keep public SELECT
DROP POLICY IF EXISTS "Admins can manage news images" ON public.news_images;
CREATE POLICY "Admins full access news_images"
  ON public.news_images
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- DOCUMENTS
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
CREATE POLICY "Admins full access documents"
  ON public.documents
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- PROFILES
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins full access profiles"
  ON public.profiles
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- USER ROLES
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins full access user_roles"
  ON public.user_roles
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- PARKING LISTINGS
DROP POLICY IF EXISTS "admins_full_access_parking_listings" ON public.parking_listings;
CREATE POLICY "admins_full_access_parking_listings"
  ON public.parking_listings
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- PARKING BOOKINGS (consolidate admin rules into one)
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.parking_bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.parking_bookings;
DROP POLICY IF EXISTS "admins_full_access_payment_data" ON public.parking_bookings;
CREATE POLICY "Admins full access parking_bookings"
  ON public.parking_bookings
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- DRIVER/OWNER MESSAGES
DROP POLICY IF EXISTS "Admins can manage all driver-owner messages" ON public.driver_owner_messages;
CREATE POLICY "Admins full access driver_owner_messages"
  ON public.driver_owner_messages
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- USER MESSAGES (already has admin manage, recreate cleanly)
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.user_messages;
CREATE POLICY "Admins full access user_messages"
  ON public.user_messages
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- USER VERIFICATIONS
DROP POLICY IF EXISTS "Admins have full verification access" ON public.user_verifications;
CREATE POLICY "Admins full access user_verifications"
  ON public.user_verifications
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- AUDIT / LOG TABLES: allow admin to update/delete if needed
-- verification_audit_log
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.verification_audit_log;
CREATE POLICY "Admins full access verification_audit_log"
  ON public.verification_audit_log
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- secure_document_access_log
DROP POLICY IF EXISTS "Admins can view secure access logs" ON public.secure_document_access_log;
CREATE POLICY "Admins full access secure_document_access_log"
  ON public.secure_document_access_log
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- photo_repair_reports (broaden admin capabilities)
DROP POLICY IF EXISTS "Admins can delete photo repair logs" ON public.photo_repair_reports;
DROP POLICY IF EXISTS "Admins can view photo repair logs" ON public.photo_repair_reports;
CREATE POLICY "Admins full access photo_repair_reports"
  ON public.photo_repair_reports
  FOR ALL
  USING (public.is_admin(auth.uid()::uuid))
  WITH CHECK (public.is_admin(auth.uid()::uuid));

-- payment_access_audit and profile_access_audit already admin-only; keep as-is

-- SAFETY NOTE:
-- We intentionally DO NOT alter any Supabase-reserved schemas (auth, storage, realtime, supabase_functions, vault).
