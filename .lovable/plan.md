

# Remove Hours Display from Booking UI

## What
Stop displaying raw hours in booking-related UI. Instead, show duration as months only (or hide duration altogether since start/end dates already convey the period).

## Changes

### 1. `src/components/LiveBookingControl.tsx` (~line 562-568)
Replace the duration badge that shows `{duration_hours}h` or `{X} month(s)` with just the month-based display, or remove it entirely. Change to show only months (rounded), e.g. "2 months" instead of "1464h".

### 2. `src/components/AdminNotifications.tsx` (~line 806-812)
Same change — replace `{duration_hours} hours` fallback with a months-only or days-based display. Remove the raw hours text.

### 3. `src/components/ActiveBookingChats.tsx` (~line 59)
Remove `duration_hours` from the Supabase select query since it's not displayed in this component (cleanup only).

## Summary
Two UI files need their duration display updated to show months instead of hours. No schema or migration changes needed.

