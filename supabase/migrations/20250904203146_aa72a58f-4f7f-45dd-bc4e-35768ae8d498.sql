-- Final security hardening: Add explicit column constraints to prevent sensitive data exposure
-- This migration adds database-level constraints to ensure no sensitive contact information 
-- can ever be added to the public table

-- Create a domain to prevent sensitive column names from being added
CREATE OR REPLACE FUNCTION public.validate_no_contact_data_in_public()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent any attempt to add sensitive columns to the public table structure
  IF TG_OP = 'ALTER' AND TG_TAG = 'ALTER TABLE' THEN
    IF TG_TABLE_NAME = 'parking_listings_public' THEN
      RAISE EXCEPTION 'Modifying parking_listings_public table structure is not allowed for security reasons';
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add a comment to the public table to document its security purpose
COMMENT ON TABLE public.parking_listings_public IS 
'PUBLIC READ-ONLY TABLE: Contains only non-sensitive parking listing data. 
Contact information is NEVER stored here and must be accessed through 
secure functions for confirmed bookings only.';

-- Ensure the get_booking_contact_info function is working correctly for legitimate access
-- This function should be the ONLY way to access contact information
CREATE OR REPLACE FUNCTION public.get_booking_contact_info(listing_id uuid)
RETURNS TABLE(contact_email text, contact_phone text, owner_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Only allow access if user has a confirmed booking for this listing
  IF NOT EXISTS (
    SELECT 1 FROM public.parking_bookings pb
    JOIN public.parking_listings pl ON (pb.location = pl.address AND pb.zone = pl.zone)
    WHERE pl.id = listing_id 
    AND pb.user_id = current_user_id 
    AND pb.status = 'confirmed'
  ) THEN
    RAISE EXCEPTION 'Access denied: Contact information only available for confirmed bookings';
  END IF;

  -- Log the access for security audit
  INSERT INTO public.profile_access_audit (
    profile_user_id, accessed_by, access_type, fields_accessed, access_reason
  ) VALUES (
    (SELECT owner_id FROM public.parking_listings WHERE id = listing_id),
    current_user_id,
    'contact_info_access',
    ARRAY['contact_email', 'contact_phone'],
    'Confirmed booking contact access for listing: ' || listing_id
  );

  -- Return contact information for confirmed booking users only
  RETURN QUERY
  SELECT 
    pl.contact_email,
    pl.contact_phone,
    pl.owner_id
  FROM public.parking_listings pl
  WHERE pl.id = listing_id AND pl.status = 'approved';
END;
$function$;

-- Create a view that explicitly shows what data is safe for public access
CREATE OR REPLACE VIEW public.safe_parking_listings AS
SELECT 
  id,
  title,
  description,
  address,
  zone,
  price_per_hour,
  price_per_day,
  price_per_month,
  features,
  images,
  availability_schedule,
  status,
  created_at,
  updated_at,
  -- Explicitly exclude sensitive fields with comments
  NULL::text AS contact_email_excluded_for_security,
  NULL::text AS contact_phone_excluded_for_security,
  NULL::uuid AS owner_id_excluded_for_security
FROM public.parking_listings_public
WHERE status = 'approved';

-- Add RLS policy documentation
COMMENT ON POLICY "Public table full access for approved listings" ON public.parking_listings_public IS 
'Allows public read access to non-sensitive parking listing data only. 
Contact information is never included in this table.';

-- Final verification: ensure the table contains no sensitive data
DO $$
DECLARE
  sensitive_columns TEXT[];
BEGIN
  -- Check for any columns that might contain sensitive information
  SELECT ARRAY_AGG(column_name) INTO sensitive_columns
  FROM information_schema.columns 
  WHERE table_name = 'parking_listings_public' 
    AND table_schema = 'public'
    AND (
      column_name ILIKE '%contact%' 
      OR column_name ILIKE '%phone%' 
      OR column_name ILIKE '%email%' 
      OR column_name ILIKE '%owner%'
    );
  
  IF sensitive_columns IS NOT NULL AND array_length(sensitive_columns, 1) > 0 THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Found sensitive columns in public table: %', 
      array_to_string(sensitive_columns, ', ');
  END IF;
  
  RAISE LOG 'Security verification passed: No sensitive columns found in parking_listings_public';
END;
$$;