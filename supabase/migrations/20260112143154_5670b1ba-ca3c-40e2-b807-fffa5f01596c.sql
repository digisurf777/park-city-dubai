-- Update all existing listings to have access device deposit required
-- This fixes the issue where approval emails show "No" instead of "Yes"
UPDATE parking_listings 
SET 
  access_device_deposit_required = true,
  deposit_amount_aed = 500
WHERE access_device_deposit_required = false OR access_device_deposit_required IS NULL;