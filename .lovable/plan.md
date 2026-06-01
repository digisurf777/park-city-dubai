## Mobile QA Findings & Fix Plan

I tested the site at a 390×844 mobile viewport (homepage, Find Parking, navigation). The core layout, hero, sections, footer and scroll behavior all render correctly. I found two real bugs plus one minor polish item.

### Bug 1 — Broken support-chat script (console errors on every page)
`src/components/TawkToChat.tsx` loads `https://embed.tawk.to/YOUR_PROPERTY_ID/YOUR_WIDGET_ID` — placeholder IDs that were never replaced. This throws a CORS error and a failed network request on every page load (confirmed in the console). The app already has its own working `ChatWidget`, so this component does nothing but generate errors.

**Fix:** Remove the `TawkToChat` usage from `src/App.tsx` (and stop rendering the placeholder script). This eliminates the errors with no loss of functionality since `ChatWidget` already provides support chat.

### Bug 2 — Mobile menu background is see-through (readability)
In `src/components/Navbar.tsx`, the open mobile menu uses `bg-white/95` over a `backdrop-blur`. In practice page content bleeds through behind the menu items, making the menu hard to read, and the panel only covers its own content height (page shows below it).

**Fix:** Make the mobile menu opaque and cover the screen:
- Change the panel background to a solid `bg-white` (drop the `/95` translucency).
- Extend it to full available height below the navbar so no page content shows through behind it.

### Polish — Find Parking hero subtitle overlap
On the Find Parking hero, the subtitle ("Browse secure monthly bays across Dubai") slightly overlaps the heading on small screens. Minor spacing adjustment to the hero text block so the lines don't collide on mobile.

### Verification
After the changes I'll re-check on the mobile viewport: confirm no Tawk.to console errors, open the hamburger menu and confirm the panel is fully opaque/readable, and confirm the Find Parking hero text no longer overlaps.

### Out of scope
No changes to business logic, data, auth, payments, or the existing `ChatWidget` behavior — these are presentation/cleanup fixes only.