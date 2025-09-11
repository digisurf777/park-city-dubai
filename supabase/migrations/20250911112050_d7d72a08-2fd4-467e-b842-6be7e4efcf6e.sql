-- Fix security warning: Set search_path for functions to prevent SQL injection vulnerabilities
-- This addresses the Function Search Path Mutable security warning

-- Fix the create_admin_booking_notification function
CREATE OR REPLACE FUNCTION public.create_admin_booking_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

-- Fix the create_user_booking_notification function
CREATE OR REPLACE FUNCTION public.create_user_booking_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

-- Fix the check_booking_conflicts function
CREATE OR REPLACE FUNCTION public.check_booking_conflicts(
    p_location TEXT,
    p_zone TEXT, 
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_exclude_booking_id UUID DEFAULT NULL
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

-- Fix the get_admin_booking_stats function
CREATE OR REPLACE FUNCTION public.get_admin_booking_stats()
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;