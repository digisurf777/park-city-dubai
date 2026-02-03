-- Security Fixes Migration
-- Fixes: Function search_path, RLS policies with WITH CHECK (true)

-- ============================================================
-- FIX 1: Functions missing search_path
-- ============================================================

-- Fix create_chat_thread_on_booking function (trigger)
CREATE OR REPLACE FUNCTION public.create_chat_thread_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notification state entry for the booking when status becomes approved/confirmed
  IF (NEW.status IN ('approved', 'confirmed') AND (OLD.status IS NULL OR OLD.status NOT IN ('approved', 'confirmed'))) THEN
    INSERT INTO public.chat_notification_state (booking_id)
    VALUES (NEW.id)
    ON CONFLICT (booking_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix ensure_profile_email function (returns void, not trigger)
CREATE OR REPLACE FUNCTION public.ensure_profile_email()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update any profiles missing emails
  UPDATE public.profiles 
  SET email = au.email 
  FROM auth.users au 
  WHERE profiles.user_id = au.id 
  AND (profiles.email IS NULL OR profiles.email = '');
END;
$$;

-- ============================================================
-- FIX 2: RLS policies with overly permissive WITH CHECK (true)
-- ============================================================

-- banking_details_access_audit: Restrict to authenticated users
DROP POLICY IF EXISTS "System can insert audit logs" ON public.banking_details_access_audit;
CREATE POLICY "Authenticated can insert audit logs" 
ON public.banking_details_access_audit
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- chat_notification_state: Restrict to authenticated users  
DROP POLICY IF EXISTS "System can insert notification state" ON public.chat_notification_state;
CREATE POLICY "Authenticated can insert notification state" 
ON public.chat_notification_state
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- driver_owner_messages: Fix WITH CHECK to match USING
DROP POLICY IF EXISTS "Users can update read status of their booking messages" ON public.driver_owner_messages;
CREATE POLICY "Users can update read status of their booking messages" 
ON public.driver_owner_messages
FOR UPDATE
USING (EXISTS (
  SELECT 1
  FROM parking_bookings pb
  WHERE pb.id = driver_owner_messages.booking_id
  AND (
    pb.user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM parking_listings pl
      WHERE pl.owner_id = auth.uid()
      AND pl.status = ANY (ARRAY['approved'::text, 'published'::text])
      AND pb.listing_id = pl.id
    )
  )
))
WITH CHECK (EXISTS (
  SELECT 1
  FROM parking_bookings pb
  WHERE pb.id = driver_owner_messages.booking_id
  AND (
    pb.user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM parking_listings pl
      WHERE pl.owner_id = auth.uid()
      AND pl.status = ANY (ARRAY['approved'::text, 'published'::text])
      AND pb.listing_id = pl.id
    )
  )
));

-- news_images: Add proper admin check instead of USING (true)
DROP POLICY IF EXISTS "Admins can manage news images" ON public.news_images;
CREATE POLICY "Admins can manage news images" 
ON public.news_images
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- photo_repair_reports: Restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can insert photo repair logs" ON public.photo_repair_reports;
CREATE POLICY "Authenticated can insert photo repair logs" 
ON public.photo_repair_reports
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- secure_document_access_log: Restrict to authenticated users
DROP POLICY IF EXISTS "System can insert secure access logs" ON public.secure_document_access_log;
CREATE POLICY "Authenticated can insert secure access logs" 
ON public.secure_document_access_log
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- user_verifications: Restrict to user's own records
DROP POLICY IF EXISTS "Users can create verification requests" ON public.user_verifications;
CREATE POLICY "Users can create their own verification requests" 
ON public.user_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- verification_audit_log: Restrict to authenticated users
DROP POLICY IF EXISTS "System can insert audit logs" ON public.verification_audit_log;
CREATE POLICY "Authenticated can insert verification audit logs" 
ON public.verification_audit_log
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);