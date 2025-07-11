-- Create user_messages table for admin-user communication
CREATE TABLE public.user_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    from_admin BOOLEAN NOT NULL DEFAULT false,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own messages"
ON public.user_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update read status of their messages"
ON public.user_messages
FOR UPDATE
USING (auth.uid() = user_id AND from_admin = true);

-- Create policy for admin access (admins can manage all messages)
CREATE POLICY "Admins can manage all messages"
ON public.user_messages
FOR ALL
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_messages_updated_at
BEFORE UPDATE ON public.user_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();