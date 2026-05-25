# Fix Driver-Owner Chat Realtime Stability

## Problem

Two driver-owner chat components reuse the exact bug pattern that was already fixed in `BookingChatsMonitor.tsx` and `MyAccount.tsx`:

1. **`src/components/DriverOwnerChat.tsx`** — uses a static channel name `'booking-messages'`, and the `useEffect` on line 58–64 calls `setupRealtimeSubscription()` but never returns its cleanup. Under React StrictMode (and when the modal is opened/closed/reopened), this can throw `cannot add postgres_changes callbacks for realtime:booking-messages after subscribe()`, leaving the chat without live updates and sometimes crashing the modal.

2. **`src/components/ActiveBookingChats.tsx`** — same pattern: static channel `'active-booking-chats'` and the `useEffect` on line 38–43 does not return the cleanup from `setupRealtimeSubscription()`. The booking list stops auto-refreshing on new messages/booking updates after a remount.

Both lead to "chat between driver/owner not working correctly" symptoms: missing live message updates, stale unread badges, and occasional ErrorBoundary screens.

## Fix

Apply the same two-line pattern we used in `BookingChatsMonitor.tsx`:

1. Make each channel name unique per mount by suffixing a random id.
2. Capture the cleanup returned by `setupRealtimeSubscription()` inside the `useEffect` and return it so React tears the channel down on unmount.

### Files to change

**`src/components/DriverOwnerChat.tsx`**
- `useEffect` (lines 58–64): capture cleanup
  ```ts
  if (isOpen && user && bookingId) {
    fetchBookingDetails();
    fetchMessages();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }
  ```
- `setupRealtimeSubscription` (line 157): use a unique channel name
  ```ts
  .channel(`booking-messages-${bookingId}-${Math.random().toString(36).slice(2)}`)
  ```

**`src/components/ActiveBookingChats.tsx`**
- `useEffect` (lines 38–43): capture cleanup
  ```ts
  if (user) {
    fetchActiveBookings();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }
  ```
- `setupRealtimeSubscription` (line 113): use a unique channel name
  ```ts
  .channel(`active-booking-chats-${user.id}-${Math.random().toString(36).slice(2)}`)
  ```

## Out of scope

- No changes to the `send_booking_message` / `get_booking_messages` / `mark_booking_messages_read` RPCs — those are working correctly per the existing logs.
- No UI/visual changes to the chat modal or booking list.
- No changes to validation rules, notification emails, or admin chat monitor.

## Verification

1. Open `/my-account` → Active Booking Chats → click "Chat Now" on an approved booking. Modal opens without ErrorBoundary.
2. Send a message from the driver side; confirm it appears on the owner side in real time without a manual refresh.
3. Close and reopen the chat modal several times; confirm no "callbacks after subscribe" error in the console and the message list still updates live.
4. Confirm unread badges in `ActiveBookingChats` clear/update live when new messages arrive.
