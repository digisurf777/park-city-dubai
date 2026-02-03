

## Fix Driver-Owner Chat Email Notifications

### Problem Identified

The chat email notification system is **partially working** but has a critical gap:

| Status | Details |
|--------|---------|
| Cron Job | Running every minute (check-chat-notifications) |
| Edge Function | Deployed and functional |
| Initial Notifications | Working correctly (3-minute delay, then sends) |
| Follow-up Notifications | **NOT WORKING** for stuck unread messages |

**Evidence of working notifications:**
- Brendan McDonald: Email sent Jan 30 at 04:01
- Tayler Jade Sani: Email sent Jan 28 at 04:43  
- Edward Sollis: Email sent Jan 27 at 11:58

**Current issue:** 3 bookings have unread messages from days ago but are not getting re-notified because `notification_timer_active = false` and there's no mechanism to reactivate it.

### Root Cause Analysis

The notification flow has a gap:

```text
Message Sent (unread)
       ↓
Trigger fires → Sets notification_timer_active = TRUE
       ↓
After 3 minutes → Email notification sent
       ↓
notification_timer_active = FALSE
cooldown set for 15 minutes
       ↓
Cooldown expires BUT message still unread
       ↓
[GAP] Nothing reactivates notification_timer_active!
       ↓
User never gets reminded again
```

The function `get_chats_needing_notification` has this condition:

```sql
WHERE cns.notification_timer_active = TRUE  -- This is always FALSE after first notification!
```

### Solution

Update the `get_chats_needing_notification` database function to include chats where:
1. The cooldown has expired
2. There are still unread messages
3. The chat hasn't been read since the unread messages arrived

This removes the dependency on `notification_timer_active` for follow-up notifications.

### Technical Implementation

**Database Migration: Update get_chats_needing_notification function**

```sql
CREATE OR REPLACE FUNCTION public.get_chats_needing_notification()
 RETURNS TABLE(
   booking_id uuid, 
   driver_id uuid, 
   owner_id uuid, 
   driver_email text, 
   owner_email text, 
   first_unread_message_at timestamp with time zone, 
   recipient_is_driver boolean, 
   sender_name text, 
   latest_message_preview text, 
   booking_location text, 
   booking_zone text, 
   recipient_name text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cns.booking_id,
    pb.user_id as driver_id,
    public.get_booking_owner_id(cns.booking_id) as owner_id,
    driver_profile.email as driver_email,
    owner_profile.email as owner_email,
    cns.first_unread_message_at,
    NOT (latest_msg.from_driver) as recipient_is_driver,
    CASE 
      WHEN latest_msg.from_driver THEN COALESCE(driver_profile.full_name, 'Driver')
      ELSE COALESCE(owner_profile.full_name, 'Owner')
    END as sender_name,
    LEFT(latest_msg.message_text, 100) as latest_message_preview,
    pb.location as booking_location,
    pb.zone as booking_zone,
    CASE 
      WHEN latest_msg.from_driver THEN COALESCE(owner_profile.full_name, 'Owner')
      ELSE COALESCE(driver_profile.full_name, 'Driver')
    END as recipient_name
  FROM public.chat_notification_state cns
  INNER JOIN public.parking_bookings pb ON pb.id = cns.booking_id
  INNER JOIN (
    SELECT DISTINCT ON (dom.booking_id)
      dom.booking_id,
      dom.from_driver,
      dom.message as message_text,
      dom.created_at
    FROM public.driver_owner_messages dom
    WHERE dom.read_status = false
    ORDER BY dom.booking_id, dom.created_at DESC
  ) latest_msg ON latest_msg.booking_id = cns.booking_id
  LEFT JOIN public.profiles driver_profile ON driver_profile.user_id = pb.user_id
  LEFT JOIN public.profiles owner_profile ON owner_profile.user_id = public.get_booking_owner_id(cns.booking_id)
  WHERE 
    -- Key change: check for unread messages that need notification
    cns.first_unread_message_at IS NOT NULL
    -- Wait 3 minutes before notifying
    AND cns.first_unread_message_at < (NOW() - INTERVAL '3 minutes')
    -- Either: timer is active (new notification cycle)
    -- OR: cooldown expired and message still unread (follow-up notification)
    AND (
      cns.notification_timer_active = TRUE
      OR (
        cns.notification_cooldown_until IS NOT NULL 
        AND cns.notification_cooldown_until < NOW()
        AND (cns.last_read_at IS NULL OR cns.last_read_at < cns.first_unread_message_at)
      )
    )
    -- Only for active bookings
    AND pb.status IN ('confirmed', 'approved')
    -- Booking hasn't expired yet
    AND pb.end_time > NOW();
END;
$function$;
```

### Key Changes

1. **Added follow-up notification logic**: When cooldown expires AND message is still unread AND user hasn't read the chat, send another notification

2. **Added booking expiry check**: Don't send notifications for expired bookings (`pb.end_time > NOW()`)

3. **Preserved existing 3-minute delay**: Messages must be unread for 3+ minutes before notification

4. **Maintained 15-minute cooldown**: After each notification, wait 15 minutes before sending again

### Expected Behavior After Fix

```text
Message Sent (unread)
       ↓
After 3 minutes → First email notification sent
       ↓
cooldown set for 15 minutes
       ↓
Cooldown expires, message still unread
       ↓
[NEW] Function detects: cooldown expired + unread + not read
       ↓
After 15 more minutes → Second email notification sent
       ↓
This continues every 15 minutes until user reads the chat
```

### Immediate Impact

Once deployed, these 3 bookings will immediately receive follow-up notifications:
- **Brendan McDonald** (4+ days without reply)
- **Tayler Jade Sani** (6+ days without reply)
- **Marcin Godek** (3+ weeks without reply)

### Files to Modify

| File | Change |
|------|--------|
| Database migration | Update `get_chats_needing_notification` function |

