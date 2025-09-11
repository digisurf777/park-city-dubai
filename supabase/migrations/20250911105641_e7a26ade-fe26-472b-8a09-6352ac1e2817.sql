-- Update booking statuses and add admin notification system
-- First, let's ensure we have the right booking status enum
DO $$ 
BEGIN
    -- Create booking status type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'cancelled');
    END IF;
END $$;

-- Update existing bookings to use 'pending' status by default
UPDATE public.parking_bookings 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'approved', 'rejected', 'completed', 'cancelled');

-- Create admin notifications table for booking approval workflow
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    booking_id UUID REFERENCES public.parking_bookings(id) ON DELETE CASCADE,
    user_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on admin notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admin notifications policies
CREATE POLICY "Admins can manage admin notifications"
ON public.admin_notifications
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create user notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    booking_id UUID REFERENCES public.parking_bookings(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on user notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- User notifications policies
CREATE POLICY "Users can view their own notifications"
ON public.user_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.user_notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user notifications"
ON public.user_notifications
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Function to create admin notification for new bookings
CREATE OR REPLACE FUNCTION public.create_admin_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification for new pending bookings
    IF NEW.status = 'pending' AND (TG_OP = 'INSERT' OR OLD.status != 'pending') THEN
        INSERT INTO public.admin_notifications (
            notification_type,
            title,
            message,
            booking_id,
            user_id,
            priority
        ) VALUES (
            'new_booking',
            'New Booking Pending Approval',
            'A new parking booking request has been submitted and requires admin approval.',
            NEW.id,
            NEW.user_id,
            'high'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user notification for booking status changes
CREATE OR REPLACE FUNCTION public.create_user_booking_notification()
RETURNS TRIGGER AS $$
DECLARE
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    -- Only create notifications for status changes from pending to approved/rejected
    IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
        IF NEW.status = 'approved' THEN
            notification_title := 'Booking Approved';
            notification_message := 'Your parking booking request has been approved. Please complete payment to secure your space.';
        ELSIF NEW.status = 'rejected' THEN
            notification_title := 'Booking Rejected';
            notification_message := 'Your parking booking request has been rejected. Please contact support for more information.';
        END IF;
        
        INSERT INTO public.user_notifications (
            user_id,
            notification_type,
            title,
            message,
            booking_id
        ) VALUES (
            NEW.user_id,
            'booking_status_change',
            notification_title,
            notification_message,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic notifications
DROP TRIGGER IF EXISTS booking_admin_notification_trigger ON public.parking_bookings;
CREATE TRIGGER booking_admin_notification_trigger
    AFTER INSERT OR UPDATE ON public.parking_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.create_admin_booking_notification();

DROP TRIGGER IF EXISTS booking_user_notification_trigger ON public.parking_bookings;
CREATE TRIGGER booking_user_notification_trigger
    AFTER UPDATE ON public.parking_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_booking_notification();

-- Function to check for booking conflicts (double-booking prevention)
CREATE OR REPLACE FUNCTION public.check_booking_conflicts(
    p_location TEXT,
    p_zone TEXT, 
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_exclude_booking_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conflict_count
    FROM public.parking_bookings
    WHERE location = p_location
    AND zone = p_zone
    AND status IN ('approved', 'pending', 'completed')
    AND (
        -- Check for overlapping time ranges
        (start_time <= p_end_time AND end_time >= p_start_time)
    )
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id);
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_booking_stats()
RETURNS JSON AS $$
DECLARE
    pending_count INTEGER;
    approved_count INTEGER;
    rejected_count INTEGER;
    total_revenue NUMERIC;
    result JSON;
BEGIN
    -- Only admins can access this
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    SELECT COUNT(*) INTO pending_count
    FROM public.parking_bookings 
    WHERE status = 'pending';
    
    SELECT COUNT(*) INTO approved_count
    FROM public.parking_bookings 
    WHERE status = 'approved';
    
    SELECT COUNT(*) INTO rejected_count
    FROM public.parking_bookings 
    WHERE status = 'rejected';
    
    SELECT COALESCE(SUM(cost_aed), 0) INTO total_revenue
    FROM public.parking_bookings 
    WHERE status IN ('approved', 'completed');
    
    result := json_build_object(
        'pending_bookings', pending_count,
        'approved_bookings', approved_count,
        'rejected_bookings', rejected_count,
        'total_revenue', total_revenue
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance on booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_status_location_time 
ON public.parking_bookings (status, location, zone, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_type_read 
ON public.admin_notifications (notification_type, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read 
ON public.user_notifications (user_id, is_read, created_at DESC);