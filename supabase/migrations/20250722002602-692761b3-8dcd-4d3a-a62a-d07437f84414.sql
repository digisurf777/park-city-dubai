-- Create driver_owner_messages table for communication between drivers and parking space owners
CREATE TABLE public.driver_owner_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES public.parking_listings(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    message TEXT NOT NULL,
    from_driver BOOLEAN NOT NULL DEFAULT true,
    read_status BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.driver_owner_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for driver access
CREATE POLICY "Drivers can view messages for their conversations"
ON public.driver_owner_messages
FOR SELECT
USING (auth.uid() = driver_id OR auth.uid() = owner_id);

CREATE POLICY "Drivers can create messages in their conversations"
ON public.driver_owner_messages
FOR INSERT
WITH CHECK (auth.uid() = driver_id OR auth.uid() = owner_id);

CREATE POLICY "Users can update read status of messages directed to them"
ON public.driver_owner_messages
FOR UPDATE
USING ((auth.uid() = driver_id AND from_driver = false) OR (auth.uid() = owner_id AND from_driver = true));

-- Create policy for admin access
CREATE POLICY "Admins can manage all driver-owner messages"
ON public.driver_owner_messages
FOR ALL
USING (is_admin(auth.uid()));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_driver_owner_messages_updated_at
BEFORE UPDATE ON public.driver_owner_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();