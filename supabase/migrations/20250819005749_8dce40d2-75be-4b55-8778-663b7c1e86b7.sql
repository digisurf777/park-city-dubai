-- Ensure admin can perform all operations on parking listings
DROP POLICY IF EXISTS "Admins can manage all listings" ON public.parking_listings;
CREATE POLICY "Admins can manage all listings" 
ON public.parking_listings 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Ensure explicit delete policy exists
DROP POLICY IF EXISTS "Admins can delete all listings" ON public.parking_listings;
CREATE POLICY "Admins can delete all listings" 
ON public.parking_listings 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Check current policies on parking_listings
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'parking_listings' AND schemaname = 'public';