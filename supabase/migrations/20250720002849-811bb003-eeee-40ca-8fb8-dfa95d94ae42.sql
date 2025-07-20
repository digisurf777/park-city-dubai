-- Enable realtime for parking_bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE parking_bookings;

-- Set replica identity to capture all changes
ALTER TABLE parking_bookings REPLICA IDENTITY FULL;