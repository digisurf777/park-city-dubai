-- Add DELETE policy for admins on parking_listings table
CREATE POLICY "Admins can delete all listings" 
ON public.parking_listings 
FOR DELETE 
USING (is_admin(auth.uid()));