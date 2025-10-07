-- Secure function to return booked date ranges without exposing PII
CREATE OR REPLACE FUNCTION public.get_booked_date_ranges(
  p_title text,
  p_address text,
  p_zone text
)
RETURNS TABLE(start_date date, end_date date)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    date_trunc('day', pb.start_time)::date AS start_date,
    date_trunc('day', pb.end_time)::date   AS end_date
  FROM public.parking_bookings pb
  WHERE pb.status IN ('approved', 'confirmed')
    AND (
      -- Exact match by address + zone
      (p_address IS NOT NULL AND pb.location = p_address AND pb.zone = p_zone)
      OR
      -- Location contains listing title
      (p_title IS NOT NULL AND pb.location ILIKE '%' || p_title || '%')
      OR
      -- Address match with generic zone used by find parking page
      (p_address IS NOT NULL AND pb.location = p_address AND p_zone = 'Find Parking Page')
    );
END;
$$;

-- Allow both anonymous and authenticated users to execute (only returns dates)
GRANT EXECUTE ON FUNCTION public.get_booked_date_ranges(text, text, text) TO anon, authenticated;