-- First, let's ensure each listing has only one space by removing duplicates
-- Delete duplicate spaces, keeping only one per listing
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY listing_id ORDER BY created_at ASC) as rn
  FROM public.parking_spaces
)
DELETE FROM public.parking_spaces 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Update create_parking_spaces_for_listing to only create one space per listing
CREATE OR REPLACE FUNCTION public.create_parking_spaces_for_listing(p_listing_id uuid, space_count integer DEFAULT 1, space_prefix text DEFAULT 'Space'::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
  existing_count INTEGER;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Check if spaces already exist for this listing
  SELECT COUNT(*) INTO existing_count
  FROM public.parking_spaces 
  WHERE listing_id = p_listing_id;

  IF existing_count > 0 THEN
    result := json_build_object(
      'success', false,
      'listing_id', p_listing_id,
      'spaces_created', 0,
      'total_requested', space_count,
      'message', 'Spaces already exist for this listing. Each car park can only have one space.'
    );
    RETURN result;
  END IF;

  -- Create only ONE space per listing (ignore space_count parameter)
  INSERT INTO public.parking_spaces (listing_id, space_number, space_status)
  VALUES (p_listing_id, 'Main Space', 'available')
  ON CONFLICT (listing_id, space_number) DO NOTHING;

  result := json_build_object(
    'success', true,
    'listing_id', p_listing_id,
    'spaces_created', 1,
    'total_requested', 1,
    'message', 'One space created successfully for the car park'
  );

  RETURN result;
END;
$function$;