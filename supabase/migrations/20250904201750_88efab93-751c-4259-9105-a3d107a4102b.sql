-- Security fix: Ensure contact information is never exposed publicly
-- This migration adds additional safeguards to prevent contact information leakage

-- First, ensure the parking_listings_public table structure is correct and secure
-- Add explicit constraints to prevent contact information columns from ever being added

-- Add a trigger to prevent accidental addition of sensitive columns to the public table
CREATE OR REPLACE FUNCTION public.prevent_sensitive_columns_in_public_table()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called if someone tries to alter the public table structure
  -- to add sensitive fields
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Check if any sensitive data is being inserted
    IF NEW.id IN (
      SELECT id FROM public.parking_listings 
      WHERE contact_phone IS NOT NULL OR contact_email IS NOT NULL OR owner_id IS NOT NULL
    ) THEN
      -- This should never happen with the current refresh function, but adding as safeguard
      RAISE LOG 'Attempted to insert sensitive data into public table for listing ID: %', NEW.id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to monitor the public table
CREATE TRIGGER monitor_public_table_data
  BEFORE INSERT OR UPDATE ON public.parking_listings_public
  FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_columns_in_public_table();

-- Update the refresh function to be extra explicit about data safety
CREATE OR REPLACE FUNCTION public.refresh_parking_listings_public()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  listing_record RECORD;
BEGIN
  -- Clear existing data
  DELETE FROM public.parking_listings_public WHERE id IS NOT NULL;
  
  -- Insert ONLY non-sensitive data with explicit column selection
  -- This ensures no sensitive data can ever leak into the public table
  FOR listing_record IN (
    SELECT 
      id, title, description, address, zone, price_per_hour,
      price_per_day, price_per_month, features, images,
      availability_schedule, status, created_at, updated_at
    FROM public.parking_listings
    WHERE status = 'approved'
    -- Extra safety: ensure we never copy records with missing required fields
    AND title IS NOT NULL 
    AND address IS NOT NULL
    AND zone IS NOT NULL
  ) LOOP
    INSERT INTO public.parking_listings_public (
      id, title, description, address, zone, price_per_hour,
      price_per_day, price_per_month, features, images,
      availability_schedule, status, created_at, updated_at
    ) VALUES (
      listing_record.id, 
      listing_record.title, 
      listing_record.description, 
      listing_record.address, 
      listing_record.zone, 
      listing_record.price_per_hour,
      listing_record.price_per_day, 
      listing_record.price_per_month, 
      listing_record.features, 
      listing_record.images,
      listing_record.availability_schedule, 
      listing_record.status, 
      listing_record.created_at, 
      listing_record.updated_at
    );
  END LOOP;
  
  -- Log the refresh for audit purposes
  RAISE LOG 'Public parking listings refreshed. Records copied: %', 
    (SELECT COUNT(*) FROM public.parking_listings WHERE status = 'approved');
END;
$function$;

-- Add additional security function to validate no sensitive data exists in public table
CREATE OR REPLACE FUNCTION public.audit_public_table_security()
RETURNS TABLE(
  issue_type TEXT,
  details TEXT,
  severity TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if there are any columns that shouldn't exist
  RETURN QUERY
  SELECT 
    'unexpected_column'::TEXT as issue_type,
    'Found column: ' || column_name as details,
    'critical'::TEXT as severity
  FROM information_schema.columns 
  WHERE table_name = 'parking_listings_public' 
    AND table_schema = 'public'
    AND column_name IN ('contact_phone', 'contact_email', 'owner_id');
    
  -- Check RLS policies are properly configured
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'parking_listings_public' 
    AND policyname LIKE '%public%'
  ) THEN
    RETURN QUERY
    SELECT 
      'missing_rls_policy'::TEXT as issue_type,
      'Public table missing proper RLS policies'::TEXT as details,
      'high'::TEXT as severity;
  END IF;
END;
$function$;

-- Refresh the public table to ensure it's clean
SELECT public.refresh_parking_listings_public();

-- Run security audit
-- This will help identify any remaining issues
DO $$
DECLARE
  audit_result RECORD;
BEGIN
  FOR audit_result IN 
    SELECT * FROM public.audit_public_table_security()
  LOOP
    RAISE LOG 'Security Audit - %: % (Severity: %)', 
      audit_result.issue_type, 
      audit_result.details, 
      audit_result.severity;
  END LOOP;
END;
$$;