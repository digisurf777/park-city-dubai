
-- 1) Normalize has_role and is_admin so UUID comparisons are explicit and safe
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::uuid
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::uuid
      AND role = 'admin'::app_role
  )
$function$;

-- 2) Ensure unique constraints are present (safe if they already exist)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id_unique
  ON public.profiles(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_id_role_unique
  ON public.user_roles(user_id, role);

-- 3) Stop public triggers from firing on login by removing UPDATE triggers on auth.users
-- Keep only AFTER INSERT so sign-in updates do not call public functions.
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4) Guarantee the admin role exists for the known admin user (from auth logs: actor_id)
-- If this UUID is wrong, we can run a quick check afterward and update it.
INSERT INTO public.user_roles (user_id, role)
SELECT '90d513ba-9feb-421d-87d4-aea1a2a0a722'::uuid, 'admin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = '90d513ba-9feb-421d-87d4-aea1a2a0a722'::uuid
    AND role = 'admin'::app_role
);

-- 5) Normalize admin-bypass RLS policies across relevant tables.
-- We DROP and recreate only the admin policies, preserving user-facing policies.

-- blog_posts
DROP POLICY IF EXISTS "Admins full access blog_posts" ON public.blog_posts;
CREATE POLICY "Admins full access blog_posts"
  ON public.blog_posts
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- news
DROP POLICY IF EXISTS "Admins full access news" ON public.news;
CREATE POLICY "Admins full access news"
  ON public.news
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- news_comments
DROP POLICY IF EXISTS "Admins can manage all comments" ON public.news_comments;
CREATE POLICY "Admins can manage all comments"
  ON public.news_comments
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- news_images
DROP POLICY IF EXISTS "Admins full access news_images" ON public.news_images;
CREATE POLICY "Admins full access news_images"
  ON public.news_images
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- documents
DROP POLICY IF EXISTS "Admins full access documents" ON public.documents;
CREATE POLICY "Admins full access documents"
  ON public.documents
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- profiles
DROP POLICY IF EXISTS "Admins full access profiles" ON public.profiles;
CREATE POLICY "Admins full access profiles"
  ON public.profiles
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Admins full access user_roles" ON public.user_roles;
CREATE POLICY "Admins full access user_roles"
  ON public.user_roles
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- parking_listings
DROP POLICY IF EXISTS "admins_full_access_parking_listings" ON public.parking_listings;
CREATE POLICY "admins_full_access_parking_listings"
  ON public.parking_listings
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- parking_bookings
DROP POLICY IF EXISTS "Admins full access parking_bookings" ON public.parking_bookings;
CREATE POLICY "Admins full access parking_bookings"
  ON public.parking_bookings
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- driver_owner_messages
DROP POLICY IF EXISTS "Admins full access driver_owner_messages" ON public.driver_owner_messages;
CREATE POLICY "Admins full access driver_owner_messages"
  ON public.driver_owner_messages
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- user_messages
DROP POLICY IF EXISTS "Admins full access user_messages" ON public.user_messages;
CREATE POLICY "Admins full access user_messages"
  ON public.user_messages
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- user_verifications
DROP POLICY IF EXISTS "Admins full access user_verifications" ON public.user_verifications;
CREATE POLICY "Admins full access user_verifications"
  ON public.user_verifications
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- verification_audit_log
DROP POLICY IF EXISTS "Admins full access verification_audit_log" ON public.verification_audit_log;
CREATE POLICY "Admins full access verification_audit_log"
  ON public.verification_audit_log
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- secure_document_access_log
DROP POLICY IF EXISTS "Admins full access secure_document_access_log" ON public.secure_document_access_log;
CREATE POLICY "Admins full access secure_document_access_log"
  ON public.secure_document_access_log
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- photo_repair_reports
DROP POLICY IF EXISTS "Admins full access photo_repair_reports" ON public.photo_repair_reports;
CREATE POLICY "Admins full access photo_repair_reports"
  ON public.photo_repair_reports
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- system_settings
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- payment_access_audit
DROP POLICY IF EXISTS "payment_access_audit_admin_only" ON public.payment_access_audit;
CREATE POLICY "payment_access_audit_admin_only"
  ON public.payment_access_audit
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
