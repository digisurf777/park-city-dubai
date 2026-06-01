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
  booking_id: string;
  driver_id: string;
  driver_email: string;
  driver_name: string;
  end_time: string;
  is_driver: boolean;
  is_owner: boolean;
  listing_id: string;
  listing_title: string;
  owner_id: string;
  start_time: string;
  status: string;
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
      // Use secure RPC to get booking details safely (bypasses RLS for authorized users)
      const { data, error } = await supabase.rpc('get_booking_details_for_chat', {
        p_booking_id: bookingId
      });

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error('Booking not found or access denied');
        return;
      }
      
      const bookingData = data[0];
      setBooking(bookingData);
      
      // Check if booking is active and user can send messages
      const now = new Date();
      const endTime = new Date(bookingData.end_time);
      
      // Chat available immediately when booking is approved/confirmed and remains until booking ends
      const isChatAvailable = ['confirmed', 'approved'].includes(bookingData.status) && now <= endTime;
      const isExpiredBooking = now > endTime;
      
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
      console.log(`[DriverOwnerChat] Fetching messages for booking ${bookingId} by user ${user.id}`);
      
      // Use secure RPC that enforces access control
      const { data, error } = await supabase.rpc('get_booking_messages', {
        p_booking_id: bookingId
      });

      if (error) {
        console.error('[DriverOwnerChat] Error fetching messages:', error);
        throw error;
      }
      
      console.log(`[DriverOwnerChat] Fetched ${data?.length || 0} messages`);
      setMessages(data || []);

      // Mark messages as read using secure RPC
      if (data && data.length > 0) {
        await markMessagesAsRead();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !bookingId) return;

    try {
      // Mark messages as read - the RPC will handle notification state updates
      const { data: updatedCount, error } = await supabase.rpc('mark_booking_messages_read', {
        p_booking_id: bookingId
      });

      if (error) throw error;

      // Log only if messages were actually marked as read
      if (updatedCount && updatedCount > 0) {
        console.log(`✅ Marked ${updatedCount} messages as read and cancelled notification timer for booking ${bookingId}`);
      }
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
    const lowerMessage = message.toLowerCase();
    
    // Contact-related keywords (English and Arabic)
    const contactKeywords = [
      'call', 'phone', 'whatsapp', 'wa', 'contact', 'number', 'tel', 'mob', 'mobile',
      'اتصل', 'رقم', 'واتساب', 'هاتف', 'موبايل', 'جوال'
    ];
    
    const hasContactKeyword = contactKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    // Only enforce strict checks if message contains contact-related keywords
    if (hasContactKeyword) {
      // Remove all spaces, hyphens, and dots for number detection
      const cleanedMessage = message.replace(/[\s\-\.]/g, '');
      
      // UAE phone number patterns (after cleaning)
      const uaePatterns = [
        /050\d+/,           // 050...
        /^50\d+/,           // 50... at start
        /\+971\d+/,         // +971...
        /00971\d+/,         // 00971...
        /971\d{9}/,         // 971xxxxxxxxx (9 digits after 971)
      ];
      
      // Check for UAE number patterns
      for (const pattern of uaePatterns) {
        if (pattern.test(cleanedMessage)) {
          return { isValid: false, warning: "Phone numbers are not allowed. Use platform chat only." };
        }
      }
      
      // Count total digits in the message
      const digitCount = (cleanedMessage.match(/\d/g) || []).length;
      if (digitCount > 7) {
        return { isValid: false, warning: "Sharing contact numbers is not allowed. Use platform chat only." };
      }
    }
    
    // Email detection (always check)
    const emailKeywords = ['gmail', 'outlook', 'hotmail', 'live.com', 'yahoo', 'icloud', 'proton'];
    const hasEmailKeyword = emailKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasAtSymbol = message.includes('@');
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    
    if (hasAtSymbol || hasEmailKeyword || emailRegex.test(message)) {
      return { isValid: false, warning: "Email addresses are not allowed. Use platform chat only." };
    }
    
    // WhatsApp and external platform references (always check)
    const whatsappRegex = /(whatsapp|whatapp|watsapp|wa\.me)/gi;
    const externalPlatforms = /(telegram|signal|viber|facebook|instagram|snapchat|tiktok)/gi;
    
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
      console.log(`[DriverOwnerChat] Sending message for booking ${bookingId} by user ${user.id}`);
      
      // Use secure RPC that handles all validation and access control
      const { data, error } = await supabase.rpc('send_booking_message', {
        p_booking_id: bookingId,
        p_message: newMessage.trim()
      });

      if (error) {
        console.error('[DriverOwnerChat] Error sending message:', error);
        throw error;
      }

      console.log(`[DriverOwnerChat] Message sent successfully:`, data);
      setNewMessage("");
      toast.success('Message sent successfully');
      
      // Refresh messages to show the new one
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isDriver = booking?.is_driver ?? false;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Booking Chat - {booking?.listing_title}
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
                Chat is available once your booking is approved and remains active until the booking ends.
                {booking && ` (Booking ends: ${format(new Date(booking.end_time), 'MMM d, HH:mm')})`}
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