-- Fix the ambiguous column reference in create_parking_spaces_for_listing function
CREATE OR REPLACE FUNCTION public.create_parking_spaces_for_listing(p_listing_id uuid, space_count integer DEFAULT 1, space_prefix text DEFAULT 'Space'::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  i INTEGER;
  result JSON;
  created_count INTEGER := 0;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Validate space count
  IF space_count <= 0 OR space_count > 100 THEN
    RAISE EXCEPTION 'Space count must be between 1 and 100';
  END IF;

  -- Create spaces
  FOR i IN 1..space_count LOOP
    INSERT INTO public.parking_spaces (listing_id, space_number, space_status)
    VALUES (p_listing_id, space_prefix || ' ' || i, 'available')
    ON CONFLICT (listing_id, space_number) DO NOTHING;
    
    IF FOUND THEN
      created_count := created_count + 1;
    END IF;
  END LOOP;

  result := json_build_object(
    'success', true,
    'listing_id', p_listing_id,
    'spaces_created', created_count,
    'total_requested', space_count,
    'message', created_count || ' spaces created successfully'
  );

  RETURN result;
END;
$function$;