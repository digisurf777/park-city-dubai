-- Create notifications for existing pending bookings
-- This migration will help populate the admin_notifications table with existing pending bookings

INSERT INTO public.admin_notifications (
    notification_type,
    title,
    message,
    booking_id,
    user_id,
    priority,
    created_at
)
SELECT 
    'new_booking' as notification_type,
    'New Booking Pending Approval' as title,
    'A new parking booking request has been submitted and requires admin approval.' as message,
    pb.id as booking_id,
    pb.user_id,
    'high' as priority,
    pb.created_at
FROM public.parking_bookings pb
LEFT JOIN public.admin_notifications an ON an.booking_id = pb.id
WHERE pb.status = 'pending' 
AND an.id IS NULL; -- Only create notifications if they don't already exist