import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { DriverOwnerChat } from "./DriverOwnerChat";

interface ActiveBooking {
  id: string;
  location: string;
  zone: string;
  start_time: string;
  end_time: string;
  status: string;
  cost_aed: number;
  user_id: string;
  payment_status: string;
  payment_link_url: string | null;
  confirmation_deadline: string | null;
  unread_messages: number;
  has_chat: boolean;
  is_active: boolean;
}

export const ActiveBookingChats = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ActiveBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchActiveBookings();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchActiveBookings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get bookings for the current user (both confirmed and pending)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('parking_bookings')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['confirmed', 'pending'])
        .order('start_time', { ascending: true });

      if (bookingsError) throw bookingsError;

      // For each booking, check if it has messages and count unread
      const bookingsWithChatInfo = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const now = new Date();
          const isActive = now >= new Date(booking.start_time) && now <= new Date(booking.end_time);

          // Get message count and unread count
          const { data: messages, error: messagesError } = await supabase
            .from('driver_owner_messages')
            .select('read_status, from_driver')
            .eq('booking_id', booking.id);

          if (messagesError) {
            console.error('Error fetching messages for booking:', booking.id, messagesError);
          }

          const unreadCount = (messages || []).filter(msg => 
            !msg.read_status && !msg.from_driver // Count unread messages from owner
          ).length;

          return {
            ...booking,
            unread_messages: unreadCount,
            has_chat: (messages || []).length > 0,
            is_active: isActive
          };
        })
      );

      setBookings(bookingsWithChatInfo);
    } catch (error) {
      console.error('Error fetching active bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('active-booking-chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_owner_messages'
        },
        () => {
          fetchActiveBookings(); // Refresh on any message change
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_bookings'
        },
        () => {
          fetchActiveBookings(); // Refresh on booking changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const openChat = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setChatOpen(true);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please login to view your booking chats</p>
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
            Active Booking Chats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Make a booking request to start chatting with parking owners
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <Card 
                  key={booking.id} 
                  className={`hover:shadow-md transition-shadow ${
                    booking.status === 'confirmed' && booking.is_active 
                      ? 'border-green-200 bg-green-50/50' 
                      : booking.status === 'pending' 
                      ? 'border-yellow-200 bg-yellow-50/50' 
                      : 'border-orange-200 bg-orange-50/50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{booking.location}</h4>
                          {booking.unread_messages > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {booking.unread_messages} new
                            </Badge>
                          )}
                          <Badge 
                            variant={
                              booking.status === 'pending' 
                                ? "outline" 
                                : booking.is_active 
                                ? "default" 
                                : "secondary"
                            } 
                            className="text-xs"
                          >
                            {booking.status === 'pending' 
                              ? "Pending Payment" 
                              : booking.is_active 
                              ? "Active Now" 
                              : "Upcoming"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{booking.zone}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{booking.cost_aed} AED</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(booking.start_time), 'MMM d, HH:mm')} - 
                            {format(new Date(booking.end_time), 'MMM d, HH:mm')}
                          </span>
                        </div>

                        {booking.status === 'pending' && (
                          <div className="bg-yellow-100 border border-yellow-200 rounded p-2 mb-3">
                            <p className="text-xs text-yellow-800 font-medium">
                              💳 Payment Required - Complete payment to confirm your booking
                            </p>
                            {booking.confirmation_deadline && (
                              <p className="text-xs text-yellow-700 mt-1">
                                Expires: {format(new Date(booking.confirmation_deadline), 'MMM d, HH:mm')}
                              </p>
                            )}
                            {booking.payment_link_url && (
                              <Button 
                                size="sm" 
                                className="mt-2" 
                                onClick={() => window.open(booking.payment_link_url!, '_blank')}
                              >
                                Complete Payment
                              </Button>
                            )}
                          </div>
                        )}

                        {booking.status === 'confirmed' && booking.is_active && (
                          <div className="bg-green-100 border border-green-200 rounded p-2 mb-3">
                            <p className="text-xs text-green-800 font-medium">
                              🟢 Chat is active - You can communicate with the owner
                            </p>
                          </div>
                        )}

                        {booking.status === 'confirmed' && !booking.is_active && new Date() < new Date(booking.start_time) && (
                          <div className="bg-orange-100 border border-orange-200 rounded p-2 mb-3">
                            <p className="text-xs text-orange-800">
                              ⏳ Chat will be available when booking starts
                            </p>
                          </div>
                        )}

                        {booking.has_chat && booking.status === 'confirmed' && (
                          <p className="text-xs text-muted-foreground">
                            {booking.unread_messages > 0 ? "New messages available" : "Chat history available"}
                          </p>
                        )}

                        {booking.status === 'pending' && (
                          <p className="text-xs text-muted-foreground">
                            Chat will be available after payment confirmation
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        variant={booking.status === 'confirmed' && booking.is_active ? "default" : "secondary"}
                        size="sm"
                        onClick={() => openChat(booking.id)}
                        disabled={booking.status === 'pending' || (!booking.is_active && new Date() < new Date(booking.start_time))}
                      >
                        {booking.status === 'pending' 
                          ? "Payment Required" 
                          : booking.is_active 
                          ? "Chat Now" 
                          : booking.has_chat 
                          ? "View Chat" 
                          : "Chat Unavailable"}
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
      {selectedBookingId && (
        <DriverOwnerChat
          bookingId={selectedBookingId}
          isOpen={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setSelectedBookingId(null);
            fetchActiveBookings(); // Refresh to update unread counts
          }}
        />
      )}
    </>
  );
};