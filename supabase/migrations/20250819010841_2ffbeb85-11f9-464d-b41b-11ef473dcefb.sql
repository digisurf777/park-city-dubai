-- Create admin functions for safe deletion with proper WHERE clauses

CREATE OR REPLACE FUNCTION public.admin_delete_parking_listing(listing_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_record parking_listings%ROWTYPE;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Delete the listing with explicit WHERE clause
  DELETE FROM public.parking_listings 
  WHERE id = listing_id
  RETURNING * INTO deleted_record;

  -- Check if anything was deleted
  IF deleted_record.id IS NULL THEN
    RAISE EXCEPTION 'No listing found with ID: %', listing_id;
  END IF;

  -- Return success result
  result := json_build_object(
    'success', true,
    'deleted_id', deleted_record.id,
    'message', 'Listing deleted successfully'
  );

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user_verification(verification_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_record user_verifications%ROWTYPE;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Delete the verification with explicit WHERE clause
  DELETE FROM public.user_verifications 
  WHERE id = verification_id
  RETURNING * INTO deleted_record;

  -- Check if anything was deleted
  IF deleted_record.id IS NULL THEN
    RAISE EXCEPTION 'No verification found with ID: %', verification_id;
  END IF;

  -- Return success result
  result := json_build_object(
    'success', true,
    'deleted_id', deleted_record.id,
    'message', 'Verification deleted successfully'
  );

  RETURN result;
END;
$$;