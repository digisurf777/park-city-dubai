

# Plan: Remove Delisting Notifications from Delete Actions

## Problem
When an admin deletes a parking space/listing, the system sends the same "Your Parking Listing Has Been Removed" email as when delisting. The user wants these notifications only when delisting (unpublishing), not when permanently deleting.

## Changes

### 1. Remove notification emails from SpaceManagement `deleteCarPark`
**File: `src/components/SpaceManagement.tsx`** (lines 369-462)
- Remove the entire notification block: customer emails (`send-booking-cancelled-delisting`), admin email (`send-admin-delisting-notification`), and owner email (`send-listing-delisted`).
- Keep the deletion logic, toast, and data refresh.

### 2. Remove notification emails from AdminPanel `deleteListing`
**File: `src/pages/AdminPanel.tsx`** (lines 1017-1110)
- Remove the same three notification blocks: customer emails, admin email, and owner email.
- Keep the deletion logic, local state update, and toast.

### 3. Keep notifications on unpublish (delist) -- no change needed
**File: `src/pages/AdminPanel.tsx`** (lines 784-818)
- The `updateListingStatus` function already correctly sends notifications only when going from `published` → `approved` (unpublish/delist). This stays as-is.

## Summary
Two functions lose their email notification blocks. The unpublish flow keeps its notifications. No edge function or backend changes needed.

