

# Plan: Integrate 500 AED Access Card Deposit into Booking Flow

## Overview

When a parking listing has `access_device_deposit_required = true`, the booking flow should display the 500 AED refundable deposit, include it in the Stripe pre-authorization amount, and allow admin to handle it during capture.

## Current State

- **Database:** `parking_listings` has `access_device_deposit_required` and `deposit_amount_aed` columns.
- **Booking modal:** `ParkingSpot` interface has no deposit fields. The modal doesn't know if a listing requires a deposit.
- **submit-booking-request:** Hardcodes `securityDeposit: 0` when calling `create-pre-authorization`.
- **create-pre-authorization:** Already accepts `securityDeposit` parameter and adds it to the Stripe amount.
- **capture-pre-authorization:** Already supports `captureSecurityDeposit` flag.
- **useParkingAvailability hook:** Doesn't pass deposit fields through to the UI.

## Changes

### 1. Add deposit fields to data pipeline

**File: `src/hooks/useParkingAvailability.tsx`** (transform block ~line 69-85)
- Add `accessDeviceDepositRequired` and `depositAmountAed` to the returned object, sourced from `spot.access_device_deposit_required` and `spot.deposit_amount_aed`.
- Add these fields to `ParkingSpotWithAvailability` interface.

**Note:** The RPC `get_public_parking_listings_with_availability` must already return these columns. If not, the DB function needs updating to include them.

### 2. Pass deposit info into booking modal

**File: `src/components/ParkingBookingModal.tsx`**
- Add `accessDeviceDepositRequired?: boolean` and `depositAmountAed?: number` to the `ParkingSpot` interface.
- Compute `depositAmount = parkingSpot.accessDeviceDepositRequired ? (parkingSpot.depositAmountAed || 500) : 0`.

### 3. Show deposit in Price Breakdown UI

**File: `src/components/ParkingBookingModal.tsx`** (~line 770-800)
- After the discount line, add a conditional row:
  ```
  if depositAmount > 0:
    "Refundable Access Card Deposit    AED 500"
  ```
- Update the Total to `finalPrice + depositAmount`.
- Add a note: "The deposit is fully refundable upon return of the access card."
- Update the button text to show the total including deposit.

### 4. Include deposit in booking request

**File: `src/components/ParkingBookingModal.tsx`** (~line 387-398)
- Add `securityDeposit: depositAmount` to `bookingData`.

### 5. Pass deposit to pre-authorization

**File: `supabase/functions/submit-booking-request/index.ts`** (~line 133-140)
- Read `securityDeposit` from the request body (add to `BookingRequest` interface).
- Replace `securityDeposit: 0` with `securityDeposit: securityDeposit || 0`.
- Store the deposit amount on the booking: update the insert to include `security_deposit_amount: securityDeposit || 0`.

### 6. Show deposit in admin notification card

**File: `src/components/AdminNotifications.tsx`** (rendering section)
- When displaying booking details, if `booking.security_deposit_amount > 0`, show a line: "Access Card Deposit: AED 500 (refundable)".

### 7. Show deposit in confirmation/admin emails

**File: `supabase/functions/submit-booking-request/index.ts`** (email HTML section)
- Add a row to the booking details table showing the deposit amount when > 0.
- Update the admin notification body to include the deposit info.

### 8. Verify DB function returns deposit columns

- Check if `get_public_parking_listings_with_availability` RPC returns `access_device_deposit_required` and `deposit_amount_aed`. If not, update the DB function via migration.

## Technical Details

- The `parking_bookings.security_deposit_amount` column already exists (integer, default 0) -- it will store the deposit per booking.
- `create-pre-authorization` already handles `securityDeposit` by adding it to the Stripe amount.
- `capture-pre-authorization` already supports `captureSecurityDeposit` boolean for selective capture.
- No new DB tables or columns needed (all infrastructure exists).

## Summary

This is primarily a wiring task: passing the deposit flag from `parking_listings` through the data pipeline to the booking modal UI and the edge function call. The Stripe and DB infrastructure already supports it.

