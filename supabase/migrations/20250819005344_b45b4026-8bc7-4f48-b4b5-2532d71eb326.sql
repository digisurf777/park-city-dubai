-- Add delete policies for admin operations

-- Allow admins to delete parking listings
DROP POLICY IF EXISTS "Admins can delete all listings" ON public.parking_listings;
CREATE POLICY "Admins can delete all listings" 
ON public.parking_listings 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Allow admins to delete user verifications
DROP POLICY IF EXISTS "Admins can delete verifications" ON public.user_verifications;
CREATE POLICY "Admins can delete verifications" 
ON public.user_verifications 
FOR DELETE 
USING (is_admin(auth.uid()));