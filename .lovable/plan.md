
## Plan

### What’s happening
The screenshot is from the admin booking email. In the current code, the booking modal already blocks submission if the phone number is missing, but the backend function still treats `userPhone` as optional and falls back to `"Not provided"`.

That means the app currently has:
- client-side requirement in the booking modal
- no strict server-side requirement in the booking edge function
- email template that still allows missing phone text

### What I would change

1. **Harden the booking backend requirement**
   - Update `supabase/functions/submit-booking-request/index.ts` so `userPhone` is validated server-side before anything is saved or any emails are sent.
   - Reject the request if the phone is empty/too short instead of allowing `"Not provided"`.

2. **Remove the fallback for admin booking emails**
   - Update the admin notification flow so it sends the validated phone number only.
   - Stop using `"Not provided"` in this booking path once validation is enforced.

3. **Keep the existing UI requirement**
   - The booking modal validation in `src/components/ParkingBookingModal.tsx` is already present, so I would keep it and align the backend with it.

4. **Optional hardening**
   - Save/update the user’s phone in `profiles` during booking submission if needed, so later admin tools and booking-related flows always have a phone on record.

### Expected result
After this change, a booking request cannot be submitted unless a valid phone number is included, and the admin booking notification email will always contain the customer’s phone number instead of showing “Not provided”.

### Technical details
- Frontend check already exists in `src/components/ParkingBookingModal.tsx` (`userPhone.trim().length < 5`)
- Backend still allows missing phone in `supabase/functions/submit-booking-request/index.ts`
- Admin email currently renders:
  - `customerPhone = userPhone || userProfile?.phone || "Not provided"`
  - email template uses `${userPhone || 'Not provided'}`

So the real fix is to make the backend enforce the requirement too, not just the form.
