-- Create function to delete parking space
CREATE OR REPLACE FUNCTION public.delete_parking_space(space_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_record parking_spaces%ROWTYPE;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Delete the space with explicit WHERE clause
  DELETE FROM public.parking_spaces 
  WHERE id = space_id
  RETURNING * INTO deleted_record;

  -- Check if anything was deleted
  IF deleted_record.id IS NULL THEN
    RAISE EXCEPTION 'No parking space found with ID: %', space_id;
  END IF;

  -- Log the deletion in audit table
  INSERT INTO public.parking_space_audit_log (
    space_id, old_status, new_status, changed_by, is_override, override_reason, changed_at
  ) VALUES (
    deleted_record.id, 
    deleted_record.space_status,
    'deleted',
    auth.uid(),
    true,
    'Space deleted by admin',
    now()
  );

  -- Return success result
  result := json_build_object(
    'success', true,
    'deleted_id', deleted_record.id,
    'space_number', deleted_record.space_number,
    'message', 'Parking space deleted successfully'
  );

  RETURN result;
END;
$function$;