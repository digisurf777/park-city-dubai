-- Update get_parking_spaces_overview to include both approved and published listings
CREATE OR REPLACE FUNCTION public.get_parking_spaces_overview()
 RETURNS TABLE(listing_id uuid, listing_title text, listing_address text, listing_zone text, space_id uuid, space_number text, space_status text, override_status boolean, override_reason text, override_by uuid, last_updated timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    pl.id as listing_id,
    pl.title as listing_title,
    pl.address as listing_address,
    pl.zone as listing_zone,
    ps.id as space_id,
    ps.space_number,
    ps.space_status,
    ps.override_status,
    ps.override_reason,
    ps.override_by,
    ps.updated_at as last_updated
  FROM public.parking_listings pl
  LEFT JOIN public.parking_spaces ps ON pl.id = ps.listing_id
  WHERE pl.status IN ('approved', 'published')
  ORDER BY pl.title, ps.space_number;
END;
$function$;