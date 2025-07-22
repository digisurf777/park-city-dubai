import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Message {
  id: string;
  listing_id: string;
  driver_id: string;
  owner_id: string;
  message: string;
  from_driver: boolean;
  read_status: boolean;
  created_at: string;
}

interface DriverOwnerChatProps {
  listingId: string;
  ownerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DriverOwnerChat = ({ listingId, ownerId, isOpen, onClose }: DriverOwnerChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
      setupRealtimeSubscription();
    }
  }, [isOpen, user, listingId]);

  const fetchMessages = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('driver_owner_messages')
        .select('*')
        .eq('listing_id', listingId)
        .or(`driver_id.eq.${user.id},owner_id.eq.${user.id}`)
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
    if (!user) return;

    const unreadMessages = messagesList.filter(
      msg => !msg.read_status && 
      ((user.id === msg.driver_id && !msg.from_driver) || 
       (user.id === msg.owner_id && msg.from_driver))
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
    if (!user) return;

    const channel = supabase
      .channel('driver-owner-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'driver_owner_messages',
          filter: `listing_id=eq.${listingId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.driver_id === user.id || newMessage.owner_id === user.id) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const isDriver = user.id !== ownerId;
      
      const { error } = await supabase
        .from('driver_owner_messages')
        .insert({
          listing_id: listingId,
          driver_id: isDriver ? user.id : ownerId,
          owner_id: ownerId,
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

  const isDriver = user?.id !== ownerId;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with {isDriver ? 'Owner' : 'Driver'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-96">
            {loading ? (
              <div className="text-center py-4">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages yet. Start the conversation!
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
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {isOwnMessage ? 'You' : (isDriver ? 'Owner' : 'Driver')}
                        </span>
                        <div className="flex items-center gap-1 text-xs opacity-70">
                          <Clock className="h-3 w-3" />
                          {format(new Date(message.created_at), 'HH:mm')}
                        </div>
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
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
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
            Press Enter to send, Shift+Enter for new line
          </p>
        </CardContent>
      </Card>
    </div>
  );
};