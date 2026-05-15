
-- Fix 1: blog_posts management restricted to admins
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Fix 2: parking_listings — require MFA for admin write access
DROP POLICY IF EXISTS "admins_full_access_parking_listings" ON public.parking_listings;

CREATE POLICY "Admins with MFA can insert listings"
ON public.parking_listings
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  AND ((auth.jwt() ->> 'aal') = 'aal2')
);

CREATE POLICY "Admins with MFA can delete listings"
ON public.parking_listings
FOR DELETE
TO authenticated
USING (
  public.is_admin(auth.uid())
  AND ((auth.jwt() ->> 'aal') = 'aal2')
);
