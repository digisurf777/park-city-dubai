

# Fix: Deposit Display Consistency in All Listing Emails

## Current State

The code flow has been partially fixed but has two remaining issues:

### Issue 1: Customer confirmation email missing deposit info
In `src/pages/RentOutYourSpace.tsx` (line 295-305), the `send-listing-confirmation` call does NOT pass `accessDeviceDeposit` in the body. So even though the edge function supports it, it always receives `undefined`, which renders as "No".

### Issue 2: Rate limit between listing emails
The admin notification and customer confirmation emails fire back-to-back with no delay — same Resend rate limit issue as the booking flow.

### Issue 3: Existing Vida listing has stale data
Listing `2c465d55` was created before the fix, so `access_device_deposit_required` is `null`/`false` in the database even though the owner selected deposit. This is why the approval email showed "No" while the admin notification (sent at submission with form data) showed "Yes".

## Changes

### 1. Add `accessDeviceDeposit` to customer confirmation email call
**File:** `src/pages/RentOutYourSpace.tsx` (line 295-305)
- Add `accessDeviceDeposit: formData.accessDeviceDeposit ? 500 : 0` to the `send-listing-confirmation` body

### 2. Add delay between listing email sends
**File:** `src/pages/RentOutYourSpace.tsx`
- Add `await new Promise(resolve => setTimeout(resolve, 1500));` between the admin notification and customer confirmation calls (after line 291)

### 3. Fix Vida listing in database
- Update `access_device_deposit_required = true` and `deposit_amount_aed = 500` for listing `2c465d55` via a Supabase query so the next approval-related email for this listing is correct

## Summary of Deposit Logic After Fix

| Email | Source of deposit value | Status |
|-------|------------------------|--------|
| Admin notification (submission) | Form data → `formData.accessDeviceDeposit ? 500 : 0` | Already fixed |
| Customer confirmation (submission) | Form data → needs adding | **Fix needed** |
| Approval email (admin action) | DB → `access_device_deposit_required` field | Already fixed for new listings |

