

# Plan: Make Phone Number Mandatory

## Current State

1. **MyAccount profile form** (`src/pages/MyAccount.tsx`, line 596-602): Phone field exists but is optional — no validation before saving.
2. **Booking modal** (`src/components/ParkingBookingModal.tsx`): No phone input field at all. Phone is silently pulled from `user.user_metadata?.phone` (line 397), which is often empty.
3. **Rent Out Your Space** (`src/pages/RentOutYourSpace.tsx`): Phone is already required with validation (line 173).
4. **Auth/Signup** (`src/pages/Auth.tsx`): No phone field during signup.

## Changes

### 1. Add phone validation to MyAccount profile form
**File: `src/pages/MyAccount.tsx`**
- Add `*` indicator to Phone Number label.
- In `updateProfile`, validate that `profile.phone` is non-empty before saving. Show toast error if missing.

### 2. Add phone input to booking modal
**File: `src/components/ParkingBookingModal.tsx`**
- Add state `userPhone` initialized from user profile (fetch from `profiles` table on mount).
- Add a phone input field in the booking form (right column) before the date picker.
- Validate phone is filled before allowing booking submission.
- Pass `userPhone` in `bookingData` sent to the edge function.

### 3. Add phone field to signup form
**File: `src/pages/Auth.tsx`**
- Add a phone input field to the signup form.
- Make it required with validation.
- Include phone in the `signUp` call's `options.data` so it's stored in `user_metadata`.
- After signup, insert phone into the `profiles` table.

## Technical Details

- Phone fetched from `profiles` table (not just `user_metadata`) for reliability in booking modal.
- Existing users without a phone will be prompted when they try to book or update their profile.
- The `submit-booking-request` edge function already accepts `userPhone` in the request body — no backend changes needed.

