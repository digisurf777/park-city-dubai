-- Update the status check constraint to include proper booking statuses
ALTER TABLE public.parking_bookings DROP CONSTRAINT parking_bookings_status_check;

-- Add new check constraint with proper booking statuses
ALTER TABLE public.parking_bookings ADD CONSTRAINT parking_bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled'));

-- Update the default status to 'pending' for new bookings
ALTER TABLE public.parking_bookings ALTER COLUMN status SET DEFAULT 'pending';