-- Create MFA requirements tracking table
CREATE TABLE IF NOT EXISTS public.user_mfa_requirements (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mfa_required BOOLEAN DEFAULT FALSE,
  mfa_enabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_mfa_requirements ENABLE ROW LEVEL SECURITY;

-- Only admins can view MFA requirements
CREATE POLICY "Admins can view MFA requirements"
  ON public.user_mfa_requirements
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Admins can update MFA requirements
CREATE POLICY "Admins can update MFA requirements"
  ON public.user_mfa_requirements
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Create function to automatically require MFA for admins
CREATE OR REPLACE FUNCTION public.require_mfa_for_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user is admin, ensure they have MFA requirement set
  IF NEW.role = 'admin' THEN
    INSERT INTO public.user_mfa_requirements (user_id, mfa_required)
    VALUES (NEW.user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      mfa_required = true, 
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger when admin role is assigned
DROP TRIGGER IF EXISTS enforce_admin_mfa ON public.user_roles;
CREATE TRIGGER enforce_admin_mfa
  AFTER INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  WHEN (NEW.role = 'admin')
  EXECUTE FUNCTION public.require_mfa_for_admins();

-- Update existing admin users to require MFA
INSERT INTO public.user_mfa_requirements (user_id, mfa_required)
SELECT user_id, true
FROM public.user_roles
WHERE role = 'admin'
ON CONFLICT (user_id) DO UPDATE SET mfa_required = true, updated_at = now();

-- Add AAL check to existing admin RLS policies
-- Update parking_bookings admin policy to require AAL2
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.parking_bookings;
CREATE POLICY "Admins with MFA can view all bookings"
  ON public.parking_bookings
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) 
    AND (auth.jwt() ->> 'aal') = 'aal2'
  );

DROP POLICY IF EXISTS "Admins can update booking status" ON public.parking_bookings;
CREATE POLICY "Admins with MFA can update booking status"
  ON public.parking_bookings
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) 
    AND (auth.jwt() ->> 'aal') = 'aal2'
  );

DROP POLICY IF EXISTS "Admins can delete bookings" ON public.parking_bookings;
CREATE POLICY "Admins with MFA can delete bookings"
  ON public.parking_bookings
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) 
    AND (auth.jwt() ->> 'aal') = 'aal2'
  );

-- Update parking_listings admin policy to require AAL2
DROP POLICY IF EXISTS "Admins can view all listings" ON public.parking_listings;
CREATE POLICY "Admins with MFA can view all listings"
  ON public.parking_listings
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) 
    AND (auth.jwt() ->> 'aal') = 'aal2'
  );

DROP POLICY IF EXISTS "Admins can update listings" ON public.parking_listings;
CREATE POLICY "Admins with MFA can update listings"
  ON public.parking_listings
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) 
    AND (auth.jwt() ->> 'aal') = 'aal2'
  );

-- Update user_verifications admin policy to require AAL2
DROP POLICY IF EXISTS "Admins can view all verifications" ON public.user_verifications;
CREATE POLICY "Admins with MFA can view all verifications"
  ON public.user_verifications
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) 
    AND (auth.jwt() ->> 'aal') = 'aal2'
  );

DROP POLICY IF EXISTS "Admins can update verification status" ON public.user_verifications;
CREATE POLICY "Admins with MFA can update verification status"
  ON public.user_verifications
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) 
    AND (auth.jwt() ->> 'aal') = 'aal2'
  );