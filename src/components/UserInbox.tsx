import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, MailOpen } from 'lucide-react';
import { format } from 'date-fns';

interface UserMessage {
  id: string;
  subject: string;
  message: string;
  read_status: boolean;
  created_at: string;
  from_admin: boolean;
}

const UserInbox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<UserMessage | null>(null);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('user_messages')
        .update({ read_status: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, read_status: true } : msg
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive",
      });
    }
  };

  const handleMessageClick = (message: UserMessage) => {
    setSelectedMessage(message);
    if (!message.read_status) {
      markAsRead(message.id);
    }
  };

  const unreadCount = messages.filter(msg => !msg.read_status).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Inbox
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </h3>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No messages found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Messages List */}
          <div className="space-y-2">
            {messages.map((message) => (
              <Card 
                key={message.id} 
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''
                } ${!message.read_status ? 'border-l-4 border-l-primary' : ''}`}
                onClick={() => handleMessageClick(message)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {message.read_status ? (
                          <MailOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                        <span className={`text-sm font-medium ${!message.read_status ? 'font-bold' : ''}`}>
                          {message.subject}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        From: Admin • {format(new Date(message.created_at), 'PPP')}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Message Detail */}
          <div>
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedMessage.subject}</span>
                    <Badge variant={selectedMessage.read_status ? "secondary" : "default"}>
                      {selectedMessage.read_status ? "Read" : "Unread"}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    From: Admin • {format(new Date(selectedMessage.created_at), 'PPP p')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Select a message to view its content
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInbox;