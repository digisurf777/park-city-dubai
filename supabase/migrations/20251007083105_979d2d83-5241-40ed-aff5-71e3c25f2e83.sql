-- Function to automatically update parking space status when booking status changes
CREATE OR REPLACE FUNCTION public.auto_update_parking_space_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  space_record RECORD;
BEGIN
  -- When booking is approved or confirmed, mark space as booked
  IF NEW.status IN ('approved', 'confirmed') AND (OLD.status IS NULL OR OLD.status NOT IN ('approved', 'confirmed')) THEN
    
    -- Find the matching parking space using the same logic as RLS policies
    FOR space_record IN (
      SELECT ps.id, ps.listing_id
      FROM parking_spaces ps
      INNER JOIN parking_listings pl ON ps.listing_id = pl.id
      WHERE pl.status IN ('approved', 'published')
      AND (
        -- Exact match: address and zone
        (pl.address = NEW.location AND pl.zone = NEW.zone)
        OR 
        -- Booking location contains listing title
        (NEW.location ILIKE '%' || pl.title || '%')
        OR
        -- Address match with generic zone
        (pl.address = NEW.location AND NEW.zone = 'Find Parking Page')
      )
      LIMIT 1
    ) LOOP
      -- Update space status to booked
      UPDATE parking_spaces 
      SET 
        space_status = 'booked',
        updated_at = now()
      WHERE id = space_record.id;
      
      -- Log the change
      INSERT INTO parking_space_audit_log (
        space_id, old_status, new_status, changed_by, is_override, override_reason, changed_at
      ) VALUES (
        space_record.id,
        'available',
        'booked',
        NEW.user_id,
        false,
        'Automatically booked via booking confirmation',
        now()
      );
    END LOOP;
    
  -- When booking is cancelled or completed, mark space as available
  ELSIF NEW.status IN ('cancelled', 'completed', 'rejected') AND OLD.status IN ('approved', 'confirmed') THEN
    
    -- Find the matching parking space
    FOR space_record IN (
      SELECT ps.id, ps.listing_id
      FROM parking_spaces ps
      INNER JOIN parking_listings pl ON ps.listing_id = pl.id
      WHERE pl.status IN ('approved', 'published')
      AND (
        (pl.address = NEW.location AND pl.zone = NEW.zone)
        OR 
        (NEW.location ILIKE '%' || pl.title || '%')
        OR
        (pl.address = NEW.location AND NEW.zone = 'Find Parking Page')
      )
      LIMIT 1
    ) LOOP
      -- Update space status to available
      UPDATE parking_spaces 
      SET 
        space_status = 'available',
        updated_at = now()
      WHERE id = space_record.id;
      
      -- Log the change
      INSERT INTO parking_space_audit_log (
        space_id, old_status, new_status, changed_by, is_override, override_reason, changed_at
      ) VALUES (
        space_record.id,
        'booked',
        'available',
        NEW.user_id,
        false,
        'Automatically released via booking ' || NEW.status,
        now()
      );
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on parking_bookings
DROP TRIGGER IF EXISTS sync_parking_space_status ON parking_bookings;
CREATE TRIGGER sync_parking_space_status
AFTER INSERT OR UPDATE OF status ON parking_bookings
FOR EACH ROW
EXECUTE FUNCTION auto_update_parking_space_status();

-- Function to update expired bookings (can be called via cron or edge function)
CREATE OR REPLACE FUNCTION public.update_expired_booking_spaces()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record RECORD;
  space_record RECORD;
BEGIN
  -- Find all confirmed bookings that have expired
  FOR booking_record IN (
    SELECT id, location, zone, end_time, user_id
    FROM parking_bookings
    WHERE status IN ('approved', 'confirmed')
    AND end_time < now()
  ) LOOP
    
    -- Update booking status to completed
    UPDATE parking_bookings
    SET 
      status = 'completed',
      updated_at = now()
    WHERE id = booking_record.id;
    
    -- Find and update the corresponding parking space
    FOR space_record IN (
      SELECT ps.id
      FROM parking_spaces ps
      INNER JOIN parking_listings pl ON ps.listing_id = pl.id
      WHERE pl.status IN ('approved', 'published')
      AND (
        (pl.address = booking_record.location AND pl.zone = booking_record.zone)
        OR 
        (booking_record.location ILIKE '%' || pl.title || '%')
        OR
        (pl.address = booking_record.location AND booking_record.zone = 'Find Parking Page')
      )
      LIMIT 1
    ) LOOP
      UPDATE parking_spaces 
      SET 
        space_status = 'available',
        updated_at = now()
      WHERE id = space_record.id;
      
      -- Log the change with NULL user (system action)
      INSERT INTO parking_space_audit_log (
        space_id, old_status, new_status, changed_by, is_override, override_reason, changed_at
      ) VALUES (
        space_record.id,
        'booked',
        'available',
        NULL,
        false,
        'Automatically released - booking expired',
        now()
      );
    END LOOP;
    
  END LOOP;
END;
$$;

-- Manually fix the current booking's parking space status
UPDATE parking_spaces 
SET 
  space_status = 'booked',
  updated_at = now()
WHERE id = '9a5dad57-ee19-497a-988f-da44f7f13199';

-- Log this manual fix with NULL user (system action)
INSERT INTO parking_space_audit_log (
  space_id, old_status, new_status, changed_by, is_override, override_reason, changed_at
) VALUES (
  '9a5dad57-ee19-497a-988f-da44f7f13199',
  'available',
  'booked',
  NULL,
  true,
  'Manual fix - syncing with confirmed booking',
  now()
);