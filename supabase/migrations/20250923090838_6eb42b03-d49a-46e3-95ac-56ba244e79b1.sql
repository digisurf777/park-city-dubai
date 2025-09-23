-- Fix parking spaces to have proper manual control by default
-- Update existing spaces to be manual overrides
UPDATE public.parking_spaces 
SET 
  override_status = true,
  updated_at = now()
WHERE override_status = false;

-- Update the create_parking_spaces_for_listing function to default to manual override
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
  -- Default to manual override (override_status = true) so admins have full control
  INSERT INTO public.parking_spaces (listing_id, space_number, space_status, override_status)
  VALUES (p_listing_id, 'Main Space', 'available', true)
  ON CONFLICT (listing_id, space_number) DO NOTHING;

  result := json_build_object(
    'success', true,
    'listing_id', p_listing_id,
    'spaces_created', 1,
    'total_requested', 1,
    'message', 'One space created successfully for the car park with manual control enabled'
  );

  RETURN result;
END;
$function$