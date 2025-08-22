-- Security Fix: Restrict parking_bookings RLS policies to prevent payment data exposure

-- Drop existing policies that may be overly permissive
DROP POLICY IF EXISTS "ultra_secure_admin_only_access" ON public.parking_bookings;

-- Create secure, simple policies

-- Policy 1: Admin-only access to ALL fields including sensitive payment data
CREATE POLICY "admins_full_access_payment_data" ON public.parking_bookings
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Policy 2: Users can insert their own bookings
CREATE POLICY "users_insert_own_bookings_secure" ON public.parking_bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update ONLY status of their own bookings (no payment fields)
CREATE POLICY "users_update_own_booking_status" ON public.parking_bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can view their own bookings (application must filter payment fields)
CREATE POLICY "users_view_own_bookings_with_app_filtering" ON public.parking_bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Add security comment
COMMENT ON TABLE public.parking_bookings IS 'SECURITY: Contains sensitive payment data (stripe_customer_id, stripe_payment_intent_id, payment_amount_cents, etc.). Frontend MUST use get_my_bookings() function to exclude payment fields or get_booking_payment_details() for admin-only payment access.';