

# Plan: Remove Email Notifications from Delete DB Function

## Root Cause

The `admin_delete_parking_listing_complete` PostgreSQL function (used by both SpaceManagement and AdminPanel delete actions) fires emails directly from the database using `net.http_post`:

1. **Customer cancellation emails** (line 88-103) -- `send-booking-cancelled-delisting` for each affected booking
2. **Owner removal email** (line 150-168) -- `send-listing-delisted`

The previous fix removed the JavaScript notification calls but missed this database-level email sending. The in-app chat messages and admin_notifications insert were also in the DB function.

Additionally, the unpublish (delist) flow in `AdminPanel.tsx` sends both an email AND an in-app message, which is 2 notifications -- acceptable, but should remain as exactly one email.

## Changes

### 1. New migration: Update `admin_delete_parking_listing_complete`
**File: new migration SQL**

Remove from the function:
- The `net.http_post` call to `send-booking-cancelled-delisting` (lines 87-104)
- The `net.http_post` call to `send-listing-delisted` (lines 149-168)
- The in-app `user_messages` insert for owner (lines 128-147)
- The in-app `user_messages` insert for customers in the loop (lines 62-79)

**Keep:**
- Admin check, listing lookup, owner lookup
- Booking status updates to `cancelled` (line 82-84)
- Admin notifications insert (lines 110-126) -- internal admin record
- All deletion logic (spaces, listings)
- The result JSON

This means deleting a listing will silently cancel bookings and remove the listing, with only an internal admin_notification record. No emails or in-app messages to owners or customers on delete.

### 2. No other changes needed
The unpublish flow (AdminPanel `updateListingStatus`, line 784-818) already sends exactly one email (`send-listing-delisted`) plus one in-app message -- this stays as-is.

## Summary
One new migration to strip all email and in-app notification logic from the delete database function. The delist/unpublish flow remains unchanged.

