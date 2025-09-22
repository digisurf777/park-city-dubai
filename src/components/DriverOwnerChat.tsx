import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, Send, User, Clock, Shield, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Message {
  id: string;
  booking_id: string;
  driver_id: string;
  owner_id: string;
  message: string;
  from_driver: boolean;
  read_status: boolean;
  is_expired: boolean;
  contains_violation: boolean;
  admin_flagged: boolean;
  created_at: string;
}

interface BookingDetails {
  id: string;
  status: string;
  start_time: string;
  end_time: string;
  location: string;
  zone: string;
  user_id: string;
}

interface DriverOwnerChatProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DriverOwnerChat = ({ bookingId, isOpen, onClose }: DriverOwnerChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [canSendMessages, setCanSendMessages] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (isOpen && user && bookingId) {
      fetchBookingDetails();
      fetchMessages();
      setupRealtimeSubscription();
    }
  }, [isOpen, user, bookingId]);

  const fetchBookingDetails = async () => {
    if (!user || !bookingId) return;

    try {
      // SECURITY FIX: Exclude sensitive payment fields from user access
      const { data, error } = await supabase
        .from('parking_bookings')
        .select(`
          id,
          user_id,
          location,
          zone,
          start_time,
          end_time,
          duration_hours,
          cost_aed,
          status,
          created_at,
          updated_at,
          confirmation_deadline,
          payment_type,
          payment_status
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      
      setBooking(data);
      
      // Check if booking is active and user can send messages
      const now = new Date();
      const startTime = new Date(data.start_time);
      
      // Chat available from booking start time onwards (no end limit)
      const isChatAvailable = data.status === 'confirmed' && now >= startTime;
      const isExpiredBooking = false; // Never expire chat after booking starts
      
      setCanSendMessages(isChatAvailable);
      setIsExpired(isExpiredBooking);
      
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details');
    }
  };

  const fetchMessages = async () => {
    if (!user || !bookingId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('driver_owner_messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      if (data && data.length > 0) {
        await markMessagesAsRead(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (messagesList: Message[]) => {
    if (!user || !booking) return;

    const isDriver = user.id === booking.user_id;
    const unreadMessages = messagesList.filter(
      msg => !msg.read_status && 
      ((isDriver && !msg.from_driver) || (!isDriver && msg.from_driver))
    );

    if (unreadMessages.length === 0) return;

    try {
      const { error } = await supabase
        .from('driver_owner_messages')
        .update({ read_status: true })
        .in('id', unreadMessages.map(msg => msg.id));

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user || !bookingId) return;

    const channel = supabase
      .channel('booking-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'driver_owner_messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'driver_owner_messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const validateMessage = (message: string): { isValid: boolean; warning?: string } => {
    const phoneRegex = /(\+?\d{1,4}[\s-]?)?\(?\d{1,3}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const whatsappRegex = /(whatsapp|whatapp|watsapp|wa\.me)/gi;
    const externalPlatforms = /(telegram|signal|viber|facebook|instagram|snapchat|tiktok)/gi;

    if (phoneRegex.test(message)) {
      return { isValid: false, warning: "Phone numbers are not allowed. Use platform chat only." };
    }
    
    if (emailRegex.test(message)) {
      return { isValid: false, warning: "Email addresses are not allowed. Use platform chat only." };
    }
    
    if (whatsappRegex.test(message)) {
      return { isValid: false, warning: "WhatsApp references are not allowed. Use platform chat only." };
    }
    
    if (externalPlatforms.test(message)) {
      return { isValid: false, warning: "External platform references are not allowed." };
    }

    return { isValid: true };
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim() || !booking || !canSendMessages) return;

    // Validate message content
    const validation = validateMessage(newMessage.trim());
    if (!validation.isValid) {
      toast.error(validation.warning);
      return;
    }

    setIsSubmitting(true);
    try {
      const isDriver = user.id === booking.user_id;
      
      const { error } = await supabase
        .from('driver_owner_messages')
        .insert({
          booking_id: bookingId,
          driver_id: booking.user_id,
          owner_id: isDriver ? booking.user_id : user.id, // This needs to be fetched from listing
          message: newMessage.trim(),
          from_driver: isDriver
        });

      if (error) throw error;

      setNewMessage("");
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isDriver = booking && user?.id === booking.user_id;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Booking Chat - {booking?.location}
            {isExpired && <Badge variant="secondary">Expired</Badge>}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Booking Status Alert */}
          {isExpired ? (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                This booking has ended. You can view past messages but cannot send new ones.
              </AlertDescription>
            </Alert>
          ) : !canSendMessages ? (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Chat is available from booking start time onwards. 
                Booking period: {booking && format(new Date(booking.start_time), 'MMM d, HH:mm')} - {booking && format(new Date(booking.end_time), 'MMM d, HH:mm')}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Communication Rules:</strong> Only discuss booking-related matters. 
                Phone numbers, WhatsApp, and external contacts are prohibited. 
                All conversations are monitored for compliance.
              </AlertDescription>
            </Alert>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-96">
            {loading ? (
              <div className="text-center py-4">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages yet. {canSendMessages ? "Start the conversation!" : ""}
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = 
                  (isDriver && message.from_driver) || 
                  (!isDriver && !message.from_driver);

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      } ${message.admin_flagged ? 'border-2 border-red-500' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {isOwnMessage ? 'You' : (isDriver ? 'Owner' : 'Driver')}
                        </span>
                        <div className="flex items-center gap-1 text-xs opacity-70">
                          <Clock className="h-3 w-3" />
                          {format(new Date(message.created_at), 'MMM d, HH:mm')}
                        </div>
                        {message.admin_flagged && (
                          <Badge variant="destructive" className="text-xs">
                            Flagged
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{message.message}</p>
                      {!message.read_status && !isOwnMessage && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Unread
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          {canSendMessages && !isExpired && (
            <>
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your booking-related message..."
                  className="flex-1 min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSubmitting}
                  size="sm"
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-1">
                Press Enter to send, Shift+Enter for new line. Only booking-related communication allowed.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};