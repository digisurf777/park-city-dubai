-- Fix the update_parking_space_status function to resolve column ambiguity
CREATE OR REPLACE FUNCTION public.update_parking_space_status(space_id uuid, new_status text, is_override boolean DEFAULT false, override_reason text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
  space_record RECORD;
  old_status_value TEXT;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Validate status
  IF new_status NOT IN ('available', 'booked', 'maintenance', 'reserved') THEN
    RAISE EXCEPTION 'Invalid status. Must be: available, booked, maintenance, or reserved';
  END IF;

  -- Get the current status before updating
  SELECT ps.space_status INTO old_status_value
  FROM public.parking_spaces ps
  WHERE ps.id = space_id;

  IF old_status_value IS NULL THEN
    RAISE EXCEPTION 'Parking space not found';
  END IF;

  -- Update the space
  UPDATE public.parking_spaces 
  SET 
    space_status = new_status,
    override_status = is_override,
    override_reason = CASE WHEN is_override THEN override_reason ELSE NULL END,
    override_by = CASE WHEN is_override THEN auth.uid() ELSE NULL END,
    updated_at = now()
  WHERE id = space_id
  RETURNING * INTO space_record;

  -- Log the status change in audit table
  INSERT INTO public.parking_space_audit_log (
    space_id, old_status, new_status, changed_by, is_override, override_reason, changed_at
  ) VALUES (
    space_id, 
    old_status_value,
    new_status,
    auth.uid(),
    is_override,
    override_reason,
    now()
  );

  result := json_build_object(
    'success', true,
    'space_id', space_record.id,
    'new_status', space_record.space_status,
    'override_status', space_record.override_status,
    'message', 'Space status updated successfully'
  );

  RETURN result;
END;
$function$;