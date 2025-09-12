-- Fix RLS so admins and owners can see parking listings in Admin Panel
-- 1) Drop overly restrictive policy that blocked all access
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'parking_listings' 
      AND policyname = 'No public access - use public table instead'
  ) THEN
    EXECUTE 'ALTER TABLE public.parking_listings DROP POLICY "No public access - use public table instead"';
  END IF;
END $$;

-- 2) Ensure permissive SELECT policy for admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'parking_listings' 
      AND policyname = 'Admins can view all listings (permissive)'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all listings (permissive)" 
      ON public.parking_listings 
      FOR SELECT 
      USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- 3) Ensure permissive SELECT policy for owners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'parking_listings' 
      AND policyname = 'Owners can view own listings (permissive)'
  ) THEN
    EXECUTE 'CREATE POLICY "Owners can view own listings (permissive)" 
      ON public.parking_listings 
      FOR SELECT 
      USING (auth.uid() = owner_id)';
  END IF;
END $$;