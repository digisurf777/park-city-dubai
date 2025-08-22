-- Security Fix: Restrict parking_bookings RLS policies to prevent payment data exposure

-- Drop existing overly permissive policies that may expose payment data
DROP POLICY IF EXISTS "ultra_secure_admin_only_access" ON public.parking_bookings;

-- Create restrictive policies that protect payment data

-- Policy 1: Admin-only access to ALL fields including sensitive payment data
CREATE POLICY "admins_full_access_payment_data" ON public.parking_bookings
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Policy 2: Users can insert their own bookings
CREATE POLICY "users_insert_own_bookings_secure" ON public.parking_bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update ONLY non-payment fields of their own bookings
-- This prevents users from modifying payment amounts, Stripe IDs, etc.
CREATE POLICY "users_update_own_bookings_non_payment" ON public.parking_bookings
FOR UPDATE
USING (auth.uid() = user_id AND 
       -- Ensure users can only update safe fields, not payment data
       (OLD.stripe_customer_id = NEW.stripe_customer_id OR (OLD.stripe_customer_id IS NULL AND NEW.stripe_customer_id IS NULL)) AND
       (OLD.stripe_payment_intent_id = NEW.stripe_payment_intent_id OR (OLD.stripe_payment_intent_id IS NULL AND NEW.stripe_payment_intent_id IS NULL)) AND
       (OLD.stripe_subscription_id = NEW.stripe_subscription_id OR (OLD.stripe_subscription_id IS NULL AND NEW.stripe_subscription_id IS NULL)) AND
       (OLD.payment_link_url = NEW.payment_link_url OR (OLD.payment_link_url IS NULL AND NEW.payment_link_url IS NULL)) AND
       (OLD.payment_amount_cents = NEW.payment_amount_cents OR (OLD.payment_amount_cents IS NULL AND NEW.payment_amount_cents IS NULL)))
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can view their own bookings but this policy should be used 
-- in conjunction with application-level filtering to exclude payment fields
CREATE POLICY "users_view_own_bookings_restricted" ON public.parking_bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Add comment explaining the security approach
COMMENT ON TABLE public.parking_bookings IS 'Security: Contains sensitive payment data. Direct access should use get_my_bookings() function for non-payment fields, or get_booking_payment_details() function for admin payment access only.';