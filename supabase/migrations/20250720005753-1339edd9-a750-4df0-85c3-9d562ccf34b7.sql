
-- Add RLS policy to allow admins to view all parking bookings
CREATE POLICY "Admins can view all bookings"
ON public.parking_bookings
FOR SELECT
USING (is_admin(auth.uid()));

-- Add RLS policy to allow admins to update all parking bookings (for confirm/deny actions)
CREATE POLICY "Admins can update all bookings"
ON public.parking_bookings
FOR UPDATE
USING (is_admin(auth.uid()));
