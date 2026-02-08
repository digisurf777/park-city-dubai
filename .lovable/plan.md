

# Add Authorization Confirmation Checkbox to Listing Form

## What will change

A second mandatory checkbox will be added to the "Rent Out Your Space" form, placed directly below the existing "Terms & Conditions" checkbox. This restores the authorization disclaimer that was previously part of the form.

## Checkbox text

> "I confirm that I am authorized to list this parking space and that my listing complies with all applicable building rules and regulations."

## Changes needed

### 1. Add `agreeToAuthorization` to form state (line 47)

Add a new field `agreeToAuthorization: false` to the `formData` state object, alongside the existing `agreeToTerms`.

### 2. Add validation check (after line 228)

Add a validation block that checks `formData.agreeToAuthorization` and shows a toast error if unchecked, preventing form submission -- similar to the existing `agreeToTerms` check.

### 3. Add the checkbox UI (after line 605)

Insert a new checkbox block below the Terms & Conditions checkbox with:
- Checkbox bound to `formData.agreeToAuthorization`
- Label displaying the authorization confirmation text
- Same styling as the existing Terms checkbox

### 4. Reset the field on form submission (line 314)

Add `agreeToAuthorization: false` to the form reset block that runs after successful submission.

## No backend changes needed

This is a frontend-only change -- the authorization confirmation is a UI-level disclaimer and does not need to be stored in the database.

