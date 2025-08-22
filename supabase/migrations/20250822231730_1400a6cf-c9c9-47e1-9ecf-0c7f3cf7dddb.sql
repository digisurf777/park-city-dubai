-- Security Fix: Restrict parking_bookings RLS policies to prevent payment data exposure

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "ultra_secure_admin_only_access" ON public.parking_bookings;

-- Create secure policies that separate payment data access

-- Policy 1: Users can view their own bookings BUT ONLY non-payment fields
CREATE POLICY "users_view_own_bookings_safe" ON public.parking_bookings
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Admin-only access to all fields including payment data
CREATE POLICY "admins_full_access_all_fields" ON public.parking_bookings
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Policy 3: Users can insert their own bookings
CREATE POLICY "users_insert_own_bookings" ON public.parking_bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update ONLY status field of their own bookings (no payment fields)
CREATE POLICY "users_update_own_booking_status_only" ON public.parking_bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a secure view for user booking access that excludes payment data
CREATE OR REPLACE VIEW public.user_bookings_safe AS
SELECT 
  id,
  user_id,
  location,
  zone,
  start_time,
  end_time,
  duration_hours,
  cost_aed,
  status,
  created_at,
  updated_at,
  confirmation_deadline,
  payment_type,
  payment_status
  -- Deliberately excluding all Stripe and sensitive payment fields:
  -- stripe_customer_id, stripe_payment_intent_id, stripe_subscription_id, 
  -- payment_link_url, payment_amount_cents
FROM public.parking_bookings
WHERE auth.uid() = user_id;

-- Enable RLS on the view
ALTER VIEW public.user_bookings_safe SET (security_barrier = true);

-- Grant access to the safe view
GRANT SELECT ON public.user_bookings_safe TO authenticated;

-- Create RLS policy for the safe view
CREATE POLICY "users_access_safe_booking_view" ON public.user_bookings_safe
FOR SELECT
USING (auth.uid() = user_id);