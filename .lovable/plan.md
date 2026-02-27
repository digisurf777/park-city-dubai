
# Fix: Ensure Customers Always Receive Payment Links

## Problem
When a booking is submitted, three emails are sent back-to-back with no delay:
1. Admin notification (via edge function call)
2. "Booking Received" email (via fetch call)
3. **Confirmation email with payment link** (via Resend directly)

Resend enforces a rate limit of 2 requests per second. The third email -- the one containing the payment link -- fails with "Too many requests", so customers never receive their payment link.

## Solution

Add 1.5-second delays between each email call in `supabase/functions/submit-booking-request/index.ts`.

### Changes (single file)

**File:** `supabase/functions/submit-booking-request/index.ts`

1. **After line 193** (end of admin notification try/catch): Insert a 1.5-second delay before the "Booking Received" email
2. **After line 229** (end of booking received try/catch): Insert a 1.5-second delay before the detailed confirmation email with the payment link

Each insertion is a single line:
```typescript
await new Promise(resolve => setTimeout(resolve, 1500));
```

### Why This Works
- Resend allows 2 requests per second
- A 1.5-second gap between each call ensures we never exceed the limit
- The payment link email (the most critical one) will reliably deliver
- Total added delay is ~3 seconds, which is acceptable for a booking submission flow

### What Stays the Same
- Pre-authorization payment flow (manual capture) is unchanged
- All three emails still send in the same order
- Email content and payment link generation are untouched
- The edge function will be automatically redeployed after the code change
