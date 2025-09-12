-- Adjust audit log FK to allow deleting spaces while keeping log
ALTER TABLE public.parking_space_audit_log
  DROP CONSTRAINT IF EXISTS parking_space_audit_log_space_id_fkey;

ALTER TABLE public.parking_space_audit_log
  ALTER COLUMN space_id DROP NOT NULL;

ALTER TABLE public.parking_space_audit_log
  ADD CONSTRAINT parking_space_audit_log_space_id_fkey
  FOREIGN KEY (space_id)
  REFERENCES public.parking_spaces(id)
  ON DELETE SET NULL;

-- Recreate delete function: log first, then delete
CREATE OR REPLACE FUNCTION public.delete_parking_space(space_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  space_record public.parking_spaces%ROWTYPE;
  result JSON;
BEGIN
  -- Check admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Fetch the space
  SELECT * INTO space_record
  FROM public.parking_spaces
  WHERE id = delete_parking_space.space_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No parking space found with ID: %', space_id;
  END IF;

  -- Log deletion BEFORE deleting; FK will set null after delete
  INSERT INTO public.parking_space_audit_log (
    space_id, old_status, new_status, changed_by, is_override, override_reason, changed_at
  ) VALUES (
    space_record.id,
    space_record.space_status,
    'deleted',
    auth.uid(),
    true,
    'Space deleted by admin',
    now()
  );

  -- Now delete the space
  DELETE FROM public.parking_spaces WHERE id = space_id;

  result := json_build_object(
    'success', true,
    'deleted_id', space_record.id,
    'space_number', space_record.space_number,
    'message', 'Parking space deleted successfully'
  );

  RETURN result;
END;
$function$;