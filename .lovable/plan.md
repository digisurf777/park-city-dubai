

## Email Notification Issue - Analysis and Fix Plan

### Problem Identified

You're receiving repeated email notifications about chat messages because the system is working exactly as designed - but **without a maximum limit on reminders**.

### Current Behavior

| Setting | Value |
|---------|-------|
| Initial delay | 3 minutes after message |
| Cooldown between emails | 15 minutes |
| Follow-up reminders | Unlimited (sends every 15 min if unread) |

### What's Happening

Looking at the database, I found two chats causing the repeated emails:

1. **Booking 1b528ebb**: Message from "Hi Tayler, was everything okay this morning?" sent Jan 28 - **unread for 6+ days**
2. **Booking ea7595be**: Message "Please may I check whether all worked fine yesterday?" sent Jan 30 - **unread for 4+ days**

Since these remain unread and the bookings are active, the system sends a reminder every 15 minutes (about 96 emails per day per chat).

---

### Proposed Fix

Add a maximum notification limit to prevent spam while still ensuring users get reminded about important messages.

**New notification rules:**

| Setting | Current | Proposed |
|---------|---------|----------|
| Initial delay | 3 minutes | 3 minutes (no change) |
| Cooldown between reminders | 15 minutes | 15 minutes (no change) |
| Maximum reminders | Unlimited | 3 reminders (then daily max 1) |
| Daily notification cap | None | 1 per day after initial 3 |

**Implementation:**

1. **Add tracking column** to `chat_notification_state` table:
   - `notification_count` - tracks how many notifications sent for current unread message

2. **Update the database function** `get_chats_needing_notification`:
   - Add condition to limit notifications to 3 within first hour
   - After 3 reminders, only send once per 24 hours
   - Stop entirely after 7 days

3. **Update edge function** to increment the notification count

---

### Technical Changes

**Database Migration:**
```sql
-- Add notification count tracking
ALTER TABLE chat_notification_state 
ADD COLUMN IF NOT EXISTS notification_count INTEGER DEFAULT 0;

-- Update function to limit notifications
-- Max 3 in first hour, then once daily, stop after 7 days
```

**Edge Function Update:**
- Increment `notification_count` when sending notification
- Reset count when user opens chat

---

### Immediate Relief Option

Before implementing the fix, I can also reset the notification state for the stuck chats to stop the current spam:

```sql
UPDATE chat_notification_state 
SET notification_cooldown_until = NOW() + INTERVAL '7 days'
WHERE booking_id IN (
  '1b528ebb-6c7e-4543-9bf6-af9d83c63574',
  'ea7595be-4d78-4884-ac80-c57c477e7fe9'
);
```

This would pause notifications for those specific chats for a week.

---

### Summary

The email system is functioning correctly but needs a cap to prevent notification fatigue. The fix will:

1. Send up to 3 reminders in the first hour (at 3min, 18min, 33min)
2. Then send at most 1 reminder per day
3. Stop entirely after 7 days of no response
4. Reset counter when user opens the chat

