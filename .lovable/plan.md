## Goal
On mobile, when an admin taps a conversation in the **Live Chat Management** tab, open the chat in a focused full-screen view (header + messages + reply box always visible) instead of having to scroll down past the conversation list and message area to type a reply.

## Why the earlier fix didn't help
The previous change was applied to `src/components/admin/SupportDashboard.tsx` (the "Support Inbox" tab), which already works on mobile. The chat the admin actually uses is the **"Live Chat Management"** tab rendered inline in `src/pages/AdminPanel.tsx` (around lines 2934–3093). That section still uses a simple stacked grid (`grid-cols-1 lg:grid-cols-3`), so on mobile the conversation list sits on top, then a fixed `h-96` message box, then the reply composer — forcing the admin to scroll to reach the input.

## What I'll change (mobile only, desktop layout untouched)
In the "Live Chat Management" `TabsContent` in `src/pages/AdminPanel.tsx`:

1. Detect mobile (the page can use the existing `useIsMobile` hook) and, when a conversation is selected on mobile, render the messages + composer as a focused full-screen panel:
   - A compact sticky top bar with a "← Back" button that clears the selected user and returns to the conversation list.
   - The messages area scrolls internally and fills the available height (instead of the fixed `h-96`).
   - The reply composer (AI-draft button, textarea, send button) pinned to the bottom so it's always visible without scrolling.
2. On mobile, hide the conversation list while a chat is open, and hide the chat panel until one is selected (so the admin sees the list first, taps a conversation, lands directly in the chat).
3. Auto-scroll to the newest message when a conversation opens / new messages arrive (the existing `chatMessagesEndRef` already supports this).
4. On desktop (`lg` and up) keep the current two/three-column layout exactly as it is now.

## Technical details
- File: `src/pages/AdminPanel.tsx`, the `<TabsContent value="chat">` block (~2934–3093).
- Use a conditional `className` (via `cn`) on the chat panel: when `isMobile && selectedChatUser`, apply `fixed inset-0 z-50` full-screen styling with a flex column (sticky header / scrollable messages / pinned composer); otherwise keep the existing grid.
- Replace the fixed `h-96` messages container with a flex-grow scroll region in the mobile full-screen case.
- Reuse existing state/handlers (`selectedChatUser`, `chatMessages`, `chatReply`, `sendChatReply`, `generateDraft`, `markThreadAsRead`, `chatMessagesEndRef`). No backend/data changes.

## Verification
- Mobile (~390px): open Admin → Live Chat Management, tap a conversation → chat opens full-screen, reply box visible immediately at the bottom, messages scroll internally, "Back" returns to the list.
- Desktop: layout unchanged.
