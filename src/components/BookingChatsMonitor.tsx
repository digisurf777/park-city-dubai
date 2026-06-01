import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  AlertTriangle,
  Calendar,
  MapPin,
  User,
  Clock,
  Trash2
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface BookingChat {
  booking_id: string;
  location: string;
  zone: string;
  start_time: string;
  end_time: string;
  booking_status: string;
  driver_id: string;
  driver_name: string;
  owner_id: string;
  owner_name: string;
  total_messages: number;
  unread_from_driver: number;
  unread_from_owner: number;
  flagged_messages: number;
  last_message_at: string;
  chat_expired: boolean;
}

interface ChatMessage {
  id: string;
  message: string;
  from_driver: boolean;
  sender_name: string;
  created_at: string;
  read_status: boolean;
  admin_flagged: boolean;
  contains_violation: boolean;
}

export const BookingChatsMonitor = () => {
  const [bookingChats, setBookingChats] = useState<BookingChat[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'flagged'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'message' | 'chat', id: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookingChats();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      fetchMessages(selectedBooking.booking_id);
    }
  }, [selectedBooking]);

  const fetchBookingChats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_driver_owner_chats');
      
      if (error) throw error;
      setBookingChats(data || []);
    } catch (error) {
      console.error('Error fetching booking chats:', error);
      toast({
        title: "Error",
        description: "Failed to load booking chats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (bookingId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_booking_chat_messages', {
        p_booking_id: bookingId
      });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('booking-chats-monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_owner_messages'
        },
        () => {
          fetchBookingChats();
          if (selectedBooking) {
            fetchMessages(selectedBooking.booking_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const toggleFlagMessage = async (messageId: string, currentlyFlagged: boolean) => {
    try {
      const { error } = await supabase
        .from('driver_owner_messages')
        .update({ admin_flagged: !currentlyFlagged })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: currentlyFlagged ? "Message unflagged" : "Message flagged",
      });

      if (selectedBooking) {
        fetchMessages(selectedBooking.booking_id);
      }
      fetchBookingChats();
    } catch (error) {
      console.error('Error toggling flag:', error);
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('driver_owner_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message deleted successfully",
      });

      if (selectedBooking) {
        fetchMessages(selectedBooking.booking_id);
      }
      fetchBookingChats();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChat = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('driver_owner_messages')
        .delete()
        .eq('booking_id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "All messages for this booking deleted successfully",
      });

      setSelectedBooking(null);
      setMessages([]);
      fetchBookingChats();
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'message') {
      handleDeleteMessage(deleteTarget.id);
    } else {
      handleDeleteChat(deleteTarget.id);
    }

    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const filteredChats = bookingChats.filter(chat => {
    const matchesSearch = 
      chat.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.zone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !chat.chat_expired) ||
      (filterStatus === 'flagged' && chat.flagged_messages > 0);

    return matchesSearch && matchesFilter;
  });

  const totalUnread = bookingChats.reduce((sum, chat) => 
    sum + chat.unread_from_driver + chat.unread_from_owner, 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left Panel - Chat List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Booking Chats
            </span>
            {totalUnread > 0 && (
              <Badge variant="destructive" className="animate-blink-red">
                {totalUnread}
              </Badge>
            )}
          </CardTitle>
          
          {/* Search and Filter */}
          <div className="space-y-2 mt-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search driver, owner, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'flagged' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('flagged')}
              >
                <Filter className="h-4 w-4 mr-1" />
                Flagged
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-420px)]">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No booking chats found</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.booking_id}
                    onClick={() => setSelectedBooking(chat)}
                    className={`p-4 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                      selectedBooking?.booking_id === chat.booking_id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'border border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">{chat.driver_name}</span>
                        <span className="text-muted-foreground">↔</span>
                        <User className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm">{chat.owner_name}</span>
                      </div>
                      {(chat.unread_from_driver + chat.unread_from_owner > 0) && (
                        <Badge variant="destructive" className="animate-blink-red">
                          {chat.unread_from_driver + chat.unread_from_owner}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" />
                      <span>{chat.location} • {chat.zone}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(chat.last_message_at), 'MMM d, HH:mm')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {chat.flagged_messages > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {chat.flagged_messages}
                          </Badge>
                        )}
                        {chat.chat_expired && (
                          <Badge variant="outline" className="text-xs">
                            Expired
                          </Badge>
                        )}
                        <Badge variant={
                          chat.booking_status === 'confirmed' ? 'default' :
                          chat.booking_status === 'completed' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {chat.booking_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel - Messages */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedBooking ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Conversation Details</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDeleteTarget({ type: 'chat', id: selectedBooking.booking_id });
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Chat
                    </Button>
                    <Badge variant="outline" className="text-xs">
                      Admin Monitoring
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-normal">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Driver:</span>
                      <span>{selectedBooking.driver_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Owner:</span>
                      <span>{selectedBooking.owner_name}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedBooking.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(selectedBooking.start_time), 'MMM d, HH:mm')} - 
                        {format(new Date(selectedBooking.end_time), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <span>Select a conversation to view messages</span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {selectedBooking ? (
            <ScrollArea className="h-[calc(100vh-420px)]">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.from_driver ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.from_driver
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : 'bg-green-50 border-r-4 border-green-500'
                        } ${
                          (msg.admin_flagged || msg.contains_violation)
                            ? 'ring-2 ring-red-500 ring-offset-2'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm flex items-center gap-2">
                            <User className={`h-4 w-4 ${msg.from_driver ? 'text-blue-500' : 'text-green-500'}`} />
                            {msg.sender_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.created_at), 'MMM d, HH:mm')}
                          </span>
                        </div>
                        
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            {msg.contains_violation && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Violation Detected
                              </Badge>
                            )}
                            {msg.admin_flagged && (
                              <Badge variant="outline" className="text-xs border-red-500 text-red-500">
                                Flagged by Admin
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={msg.admin_flagged ? 'outline' : 'ghost'}
                              onClick={() => toggleFlagMessage(msg.id, msg.admin_flagged)}
                              className="h-6 text-xs"
                            >
                              {msg.admin_flagged ? 'Unflag' : 'Flag'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDeleteTarget({ type: 'message', id: msg.id });
                                setDeleteDialogOpen(true);
                              }}
                              className="h-6 text-xs text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-[calc(100vh-420px)] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Select a booking chat from the left to view conversation</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === 'message' ? 'Delete Message?' : 'Delete Entire Chat?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'message' 
                ? 'This will permanently delete this message. This action cannot be undone.'
                : 'This will permanently delete ALL messages in this conversation between the driver and owner. This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
