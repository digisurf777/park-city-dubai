import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { DriverOwnerChat } from "./DriverOwnerChat";

interface ChatConversation {
  listing_id: string;
  listing_title: string;
  listing_zone: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_driver: boolean;
}

export const ChatHistory = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get all conversations for the current user
      const { data: messages, error } = await supabase
        .from('driver_owner_messages')
        .select(`
          listing_id,
          driver_id,
          owner_id,
          message,
          from_driver,
          read_status,
          created_at,
          parking_listings!inner(title, zone, owner_id)
        `)
        .or(`driver_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by listing and get the latest message for each conversation
      const conversationMap = new Map<string, ChatConversation>();

      messages?.forEach((msg: any) => {
        const listingId = msg.listing_id;
        const isUserDriver = user.id === msg.driver_id;
        const otherUserId = isUserDriver ? msg.owner_id : msg.driver_id;
        
        if (!conversationMap.has(listingId)) {
          conversationMap.set(listingId, {
            listing_id: listingId,
            listing_title: msg.parking_listings.title,
            listing_zone: msg.parking_listings.zone,
            other_user_id: otherUserId,
            other_user_name: isUserDriver ? 'Owner' : 'Driver',
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: 0,
            is_driver: isUserDriver
          });
        }

        // Update unread count
        const conversation = conversationMap.get(listingId)!;
        if (!msg.read_status && 
            ((isUserDriver && !msg.from_driver) || (!isUserDriver && msg.from_driver))) {
          conversation.unread_count++;
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('chat-history-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_owner_messages'
        },
        () => {
          fetchConversations(); // Refresh conversations on any message change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const openConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    setChatOpen(true);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please login to view your chat history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start chatting with parking space owners to see your conversations here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.listing_id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openConversation(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{conversation.listing_title}</h4>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count} new
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{conversation.listing_zone}</span>
                          <span>•</span>
                          <User className="h-3 w-3" />
                          <span>Chat with {conversation.other_user_name}</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {conversation.last_message}
                        </p>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3" />
                          {format(new Date(conversation.last_message_time), 'MMM d, HH:mm')}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Modal */}
      {selectedConversation && (
        <DriverOwnerChat
          listingId={selectedConversation.listing_id}
          ownerId={selectedConversation.other_user_id}
          isOpen={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setSelectedConversation(null);
            fetchConversations(); // Refresh to update unread counts
          }}
        />
      )}
    </>
  );
};