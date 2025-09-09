-- Create parking spaces table for individual space management
CREATE TABLE public.parking_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.parking_listings(id) ON DELETE CASCADE,
  space_number TEXT NOT NULL,
  space_status TEXT NOT NULL DEFAULT 'available' CHECK (space_status IN ('available', 'booked', 'maintenance', 'reserved')),
  override_status BOOLEAN NOT NULL DEFAULT false,
  override_reason TEXT,
  override_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, space_number)
);

-- Enable RLS
ALTER TABLE public.parking_spaces ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parking_spaces
CREATE POLICY "Admins can manage all parking spaces"
ON public.parking_spaces
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Space owners can view their spaces"
ON public.parking_spaces
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.parking_listings pl
  WHERE pl.id = parking_spaces.listing_id
  AND pl.owner_id = auth.uid()
));

-- Create function to update parking space status with audit trail
CREATE OR REPLACE FUNCTION public.update_parking_space_status(
  space_id UUID,
  new_status TEXT,
  is_override BOOLEAN DEFAULT false,
  override_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
  space_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Validate status
  IF new_status NOT IN ('available', 'booked', 'maintenance', 'reserved') THEN
    RAISE EXCEPTION 'Invalid status. Must be: available, booked, maintenance, or reserved';
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

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parking space not found';
  END IF;

  -- Log the status change
  INSERT INTO public.parking_space_audit_log (
    space_id, old_status, new_status, changed_by, is_override, override_reason, changed_at
  ) VALUES (
    space_id, 
    (SELECT space_status FROM public.parking_spaces WHERE id = space_id),
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
$$;

-- Create audit log table for space status changes
CREATE TABLE public.parking_space_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL REFERENCES public.parking_spaces(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  is_override BOOLEAN NOT NULL DEFAULT false,
  override_reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.parking_space_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.parking_space_audit_log
FOR SELECT
USING (is_admin(auth.uid()));

-- Function to bulk create spaces for a listing
CREATE OR REPLACE FUNCTION public.create_parking_spaces_for_listing(
  listing_id UUID,
  space_count INTEGER DEFAULT 1,
  space_prefix TEXT DEFAULT 'Space'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    VALUES (listing_id, space_prefix || ' ' || i, 'available')
    ON CONFLICT (listing_id, space_number) DO NOTHING;
    
    IF FOUND THEN
      created_count := created_count + 1;
    END IF;
  END LOOP;

  result := json_build_object(
    'success', true,
    'listing_id', listing_id,
    'spaces_created', created_count,
    'total_requested', space_count,
    'message', created_count || ' spaces created successfully'
  );

  RETURN result;
END;
$$;

-- Function to get space management overview
CREATE OR REPLACE FUNCTION public.get_parking_spaces_overview()
RETURNS TABLE(
  listing_id UUID,
  listing_title TEXT,
  listing_address TEXT,
  listing_zone TEXT,
  space_id UUID,
  space_number TEXT,
  space_status TEXT,
  override_status BOOLEAN,
  override_reason TEXT,
  override_by UUID,
  last_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  WHERE pl.status = 'approved'
  ORDER BY pl.title, ps.space_number;
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_parking_spaces_updated_at
BEFORE UPDATE ON public.parking_spaces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();