-- Add deposit columns to parking_listings_public
ALTER TABLE public.parking_listings_public 
  ADD COLUMN IF NOT EXISTS access_device_deposit_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_amount_aed integer DEFAULT 0;

-- Drop and recreate the RPC with new return columns
DROP FUNCTION IF EXISTS public.get_public_parking_listings_with_availability();

CREATE OR REPLACE FUNCTION public.get_public_parking_listings_with_availability()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  address text,
  zone text,
  price_per_hour numeric,
  price_per_day numeric,
  price_per_month numeric,
  features text[],
  images text[],
  availability_schedule jsonb,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  total_spaces bigint,
  available_spaces bigint,
  booked_spaces bigint,
  maintenance_spaces bigint,
  is_available boolean,
  access_device_deposit_required boolean,
  deposit_amount_aed integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    plp.id,
    plp.title,
    plp.description,
    plp.address,
    plp.zone,
    plp.price_per_hour,
    plp.price_per_day,
    plp.price_per_month,
    plp.features,
    plp.images,
    plp.availability_schedule,
    plp.status,
    plp.created_at,
    plp.updated_at,
    COALESCE(space_stats.total_spaces, 0) as total_spaces,
    COALESCE(space_stats.available_spaces, 0) as available_spaces,
    COALESCE(space_stats.booked_spaces, 0) as booked_spaces,
    COALESCE(space_stats.maintenance_spaces, 0) as maintenance_spaces,
    CASE 
      WHEN COALESCE(space_stats.available_spaces, 0) > 0 THEN true
      WHEN COALESCE(space_stats.total_spaces, 0) = 0 THEN true
      ELSE false
    END as is_available,
    COALESCE(plp.access_device_deposit_required, false) as access_device_deposit_required,
    COALESCE(plp.deposit_amount_aed, 0) as deposit_amount_aed
  FROM public.parking_listings_public plp
  LEFT JOIN (
    SELECT 
      ps.listing_id,
      COUNT(*) as total_spaces,
      COUNT(*) FILTER (WHERE ps.space_status = 'available') as available_spaces,
      COUNT(*) FILTER (WHERE ps.space_status = 'booked') as booked_spaces,
      COUNT(*) FILTER (WHERE ps.space_status = 'maintenance') as maintenance_spaces
    FROM public.parking_spaces ps
    GROUP BY ps.listing_id
  ) space_stats ON plp.id = space_stats.listing_id
  WHERE plp.status = 'published'
  ORDER BY plp.created_at DESC;
END;
$$;

-- Sync existing deposit data from parking_listings to parking_listings_public
UPDATE public.parking_listings_public plp
SET 
  access_device_deposit_required = pl.access_device_deposit_required,
  deposit_amount_aed = pl.deposit_amount_aed
FROM public.parking_listings pl
WHERE plp.id = pl.id;