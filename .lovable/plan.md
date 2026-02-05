

# Fix Chat Email Notification System

## Problem Summary
The email notification system between owners and drivers is **not working**. Investigation reveals:
- Messages are not being marked as read correctly
- The notification timer is never being activated
- No chat notifications have been sent since Feb 4th

## Root Causes Identified

### 1. Trigger Logic Flaw
The `update_notification_state_on_message` trigger has a condition that fails when:
- A user opens the chat before the first message (updating `last_read_at`)
- Then a message is sent
- The condition `current_state.last_read_at > current_state.first_unread_message_at` behaves unexpectedly when `first_unread_message_at` is NULL

### 2. Mark as Read Not Clearing State Properly
The `mark_booking_messages_read` function resets `notification_timer_active` to FALSE but doesn't clear `first_unread_message_at` to NULL, causing state confusion.

### 3. Notification State Initialization Problem
When `chat_notification_state` is created, `first_unread_message_at` is NULL but subsequent logic doesn't handle this initial state correctly.

---

## Implementation Plan

### Step 1: Fix the Trigger Function
Update `update_notification_state_on_message` to properly handle the NULL case and always activate the timer for new unread messages.

**File:** New SQL migration

```sql
CREATE OR REPLACE FUNCTION public.update_notification_state_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_state RECORD;
BEGIN
  -- Get current notification state
  SELECT * INTO current_state
  FROM public.chat_notification_state
  WHERE booking_id = NEW.booking_id;
  
  IF current_state IS NULL THEN
    -- Create notification state if it doesn't exist
    INSERT INTO public.chat_notification_state (
      booking_id, 
      first_unread_message_at, 
      notification_timer_active
    )
    VALUES (NEW.booking_id, NOW(), TRUE);
    
    RAISE LOG 'Created notification state and activated timer for booking %', NEW.booking_id;
    RETURN NEW;
  END IF;
  
  -- Only activate timer for unread messages
  IF NEW.read_status = false THEN
    -- Check if we should start a new notification cycle:
    -- 1. No previous unread messages (first_unread_message_at is NULL), OR
    -- 2. Previous messages were read (last_read_at is after first_unread_message_at), OR
    -- 3. Cooldown period has passed
    IF current_state.first_unread_message_at IS NULL 
       OR (current_state.last_read_at IS NOT NULL 
           AND current_state.last_read_at >= current_state.first_unread_message_at)
       OR (current_state.notification_cooldown_until IS NOT NULL 
           AND current_state.notification_cooldown_until < NOW()) THEN
      
      -- Start new notification cycle
      UPDATE public.chat_notification_state
      SET 
        first_unread_message_at = NOW(),
        notification_timer_active = TRUE,
        notification_count = 0,  -- Reset notification count for new cycle
        updated_at = NOW()
      WHERE booking_id = NEW.booking_id;
      
      RAISE LOG 'Chat notification timer activated for booking %', NEW.booking_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
```

### Step 2: Fix the Mark Messages Read Function
Update `mark_booking_messages_read` to properly clear `first_unread_message_at` when messages are read.

```sql
CREATE OR REPLACE FUNCTION public.mark_booking_messages_read(p_booking_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  booking_record RECORD;
  is_driver boolean;
  owner_id uuid;
  updated_count integer := 0;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get booking details
  SELECT * INTO booking_record
  FROM public.parking_bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Get owner ID
  owner_id := public.get_booking_owner_id(p_booking_id);

  -- Determine if current user is the driver
  is_driver := (booking_record.user_id = current_user_id);

  -- Verify user is either driver or owner
  IF NOT is_driver AND current_user_id != owner_id THEN
    RAISE EXCEPTION 'Access denied - not driver or owner';
  END IF;

  -- Mark unread messages as read
  UPDATE public.driver_owner_messages
  SET read_status = true, updated_at = NOW()
  WHERE booking_id = p_booking_id
    AND read_status = false
    AND (
      (is_driver AND from_driver = false) OR  -- Driver reading owner messages
      (NOT is_driver AND from_driver = true)  -- Owner reading driver messages
    );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Reset notification state when messages are read
  UPDATE public.chat_notification_state
  SET 
    last_read_at = NOW(),
    notification_timer_active = FALSE,
    first_unread_message_at = NULL,  -- Clear this so new messages trigger properly
    updated_at = NOW()
  WHERE booking_id = p_booking_id;
  
  IF updated_count > 0 THEN
    RAISE LOG 'Marked % messages as read and reset notification state for booking %', updated_count, p_booking_id;
  END IF;
  
  RETURN updated_count;
END;
$$;
```

### Step 3: Fix Existing Broken State
Create a one-time fix to repair existing chat states that have unread messages but incorrect notification state.

```sql
-- Fix existing broken notification states
UPDATE chat_notification_state cns
SET 
  first_unread_message_at = (
    SELECT MIN(dom.created_at)
    FROM driver_owner_messages dom
    WHERE dom.booking_id = cns.booking_id
      AND dom.read_status = false
      AND dom.created_at > COALESCE(cns.last_read_at, '1970-01-01'::timestamp)
  ),
  notification_timer_active = TRUE,
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM driver_owner_messages dom
  JOIN parking_bookings pb ON pb.id = dom.booking_id
  WHERE dom.booking_id = cns.booking_id
    AND dom.read_status = false
    AND pb.status IN ('confirmed', 'approved')
    AND pb.end_time > NOW()
)
AND (cns.notification_timer_active = FALSE OR cns.first_unread_message_at IS NULL);
```

---

## Technical Details

### Files to Modify
1. **New migration file** - Contains all three SQL fixes above

### Testing After Fix
1. Send a test chat message
2. Verify `notification_timer_active` becomes TRUE in `chat_notification_state`
3. Wait 5+ minutes for the cron job to run
4. Check edge function logs for email sending
5. Verify email is received

### Expected Behavior After Fix
1. When a message is sent → Timer activates, `first_unread_message_at` is set
2. After 5 minutes → Email notification is sent to recipient
3. When recipient reads messages → State is properly reset
4. Next new message → Cycle starts fresh

