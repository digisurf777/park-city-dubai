

# Plan: Fix Phone Number Field Mismatch in Booking Flow

## Problem
The booking modal sends the phone as `phone` in the request body (line 426 of ParkingBookingModal.tsx), but the `submit-booking-request` edge function destructures it as `userPhone` (line 8/62). This means the phone is always `undefined` in the edge function, falling back to profile data or "Not provided".

## Changes

### 1. Fix field name in ParkingBookingModal.tsx
**File: `src/components/ParkingBookingModal.tsx`** (line 426)
- Change `phone: userPhone.trim()` to `userPhone: userPhone.trim()` in the `bookingData` object so it matches what the edge function expects.

That single rename fixes the "Phone: Not provided" issue in admin booking notification emails. No edge function changes needed -- the backend already handles `userPhone` correctly.

## Technical Detail
- The edge function (line 160) does: `const customerPhone = userPhone || userProfile?.phone || "Not provided"`
- With this fix, `userPhone` will be populated from the form, so the phone will always appear in emails.
- Phone is already validated as mandatory before submission (line 365-372).

