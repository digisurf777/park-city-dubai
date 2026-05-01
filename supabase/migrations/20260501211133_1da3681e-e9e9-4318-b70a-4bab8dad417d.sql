
-- Add session_id to group messages into chat sessions
ALTER TABLE public.user_messages 
  ADD COLUMN IF NOT EXISTS session_id uuid;

CREATE INDEX IF NOT EXISTS idx_user_messages_session ON public.user_messages(user_id, session_id, created_at);

-- Add status column to track conversation state (open, awaiting_human, resolved, etc.)
ALTER TABLE public.user_messages
  ADD COLUMN IF NOT EXISTS handoff_requested boolean NOT NULL DEFAULT false;
