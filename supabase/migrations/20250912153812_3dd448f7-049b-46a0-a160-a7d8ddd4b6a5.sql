-- Create a function to get parking listings with availability data
CREATE OR REPLACE FUNCTION public.get_parking_listings_with_availability()
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  total_spaces bigint,
  available_spaces bigint,
  booked_spaces bigint,
  maintenance_spaces bigint,
  is_available boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pl.id,
    pl.title,
    pl.description,
    pl.address,
    pl.zone,
    pl.price_per_hour,
    pl.price_per_day,
    pl.price_per_month,
    pl.features,
    pl.images,
    pl.availability_schedule,
    pl.status,
    pl.created_at,
    pl.updated_at,
    COALESCE(space_stats.total_spaces, 0) as total_spaces,
    COALESCE(space_stats.available_spaces, 0) as available_spaces,
    COALESCE(space_stats.booked_spaces, 0) as booked_spaces,
    COALESCE(space_stats.maintenance_spaces, 0) as maintenance_spaces,
    CASE 
      WHEN space_stats.available_spaces > 0 THEN true
      WHEN space_stats.total_spaces = 0 THEN true -- If no spaces created yet, show as available
      ELSE false
    END as is_available
  FROM public.parking_listings pl
  LEFT JOIN (
    SELECT 
      ps.listing_id,
      COUNT(*) as total_spaces,
      COUNT(*) FILTER (WHERE ps.space_status = 'available') as available_spaces,
      COUNT(*) FILTER (WHERE ps.space_status = 'booked') as booked_spaces,
      COUNT(*) FILTER (WHERE ps.space_status = 'maintenance') as maintenance_spaces
    FROM public.parking_spaces ps
    GROUP BY ps.listing_id
  ) space_stats ON pl.id = space_stats.listing_id
  WHERE pl.status = 'approved'
  ORDER BY pl.created_at DESC;
END;
$function$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_parking_listings_with_availability() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_parking_listings_with_availability() TO anon;