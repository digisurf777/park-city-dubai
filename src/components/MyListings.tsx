import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Calendar, MapPin, Eye, Edit, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { DriverOwnerChat } from "./DriverOwnerChat";

interface ParkingListing {
  id: string;
  title: string;
  address: string;
  zone: string;
  price_per_month: number;
  status: string;
  created_at: string;
  images: string[];
  features: string[];
}

interface ActiveBooking {
  id: string;
  location: string;
  zone: string;
  start_time: string;
  end_time: string;
  status: string;
  driver_name: string;
  unread_messages: number;
  chat_available: boolean;
}

export const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<ParkingListing[]>([]);
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatBooking, setSelectedChatBooking] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserListings();
      fetchActiveBookings();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchActiveBookings = async () => {
    if (!user) return;

    try {
      // First get owner's listings
      const { data: userListings, error: listingsError } = await supabase
        .from('parking_listings')
        .select('address, zone')
        .eq('owner_id', user.id);

      if (listingsError || !userListings) return;

      // Fetch bookings for this owner's listings
      const { data: bookings, error: bookingsError } = await supabase
        .from('parking_bookings')
        .select(`
          id,
          location,
          zone,
          start_time,
          end_time,
          status,
          user_id
        `)
        .in('status', ['confirmed', 'approved'])
        .gte('end_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (bookingsError || !bookings) return;

      // Filter to only bookings for this owner's listings and get additional data
      const ownerBookings = [];
      for (const booking of bookings) {
        // Check if this booking matches any of the owner's listings
        const matchesListing = userListings.some(listing => 
          listing.address === booking.location && listing.zone === booking.zone
        );

        if (!matchesListing) continue;

        // Get driver name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', booking.user_id)
          .single();

        // Get unread message count
        const { count: unreadCount } = await supabase
          .from('driver_owner_messages')
          .select('*', { count: 'exact', head: true })
          .eq('booking_id', booking.id)
          .eq('from_driver', true)
          .eq('read_status', false);

        // Check if chat is available (48 hours before start)
        const now = new Date();
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        const chatStartTime = new Date(startTime.getTime() - (48 * 60 * 60 * 1000));
        const chatAvailable = now >= chatStartTime && now <= endTime;

        ownerBookings.push({
          id: booking.id,
          location: booking.location,
          zone: booking.zone,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status,
          driver_name: profile?.full_name || 'Driver',
          unread_messages: unreadCount || 0,
          chat_available: chatAvailable
        });
      }

      setActiveBookings(ownerBookings);
    } catch (error) {
      console.error('Error fetching active bookings:', error);
    }
  };

  const fetchUserListings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parking_listings')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching user listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('user-listings-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_listings',
          filter: `owner_id=eq.${user.id}`
        },
        () => {
          fetchUserListings();
          fetchActiveBookings();
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
          fetchActiveBookings();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_owner_messages'
        },
        () => {
          fetchActiveBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Live';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please login to view your listings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Active Bookings & Chat Section */}
      {activeBookings.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Active Bookings & Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <Card key={booking.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{booking.location}</h4>
                          <Badge variant="default">
                            {booking.status === 'confirmed' ? 'Active' : 'Approved'}
                          </Badge>
                          {booking.unread_messages > 0 && (
                            <Badge variant="destructive">
                              {booking.unread_messages} unread
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{booking.zone}</span>
                          </div>
                          <span>•</span>
                          <span>Driver: {booking.driver_name}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(booking.start_time), 'MMM d, HH:mm')} - {format(new Date(booking.end_time), 'MMM d, HH:mm')}
                          </span>
                        </div>

                        {booking.chat_available ? (
                          <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                            <p className="text-xs text-green-800">
                              💬 Chat is now active for this booking
                            </p>
                          </div>
                        ) : (
                          <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2">
                            <p className="text-xs text-orange-800">
                              ⏳ Chat will be available 48 hours before booking start
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant={booking.chat_available ? "default" : "secondary"}
                          size="sm"
                          onClick={() => setSelectedChatBooking(booking.id)}
                          disabled={!booking.chat_available}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {booking.unread_messages > 0 ? `Chat (${booking.unread_messages})` : 'Chat'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Listings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            My Parking Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading your listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-8">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No parking listings yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start earning by renting out your parking space
              </p>
              <Button 
                onClick={() => window.location.href = '/rent-out-your-space'}
                className="mt-2"
              >
                List Your Space
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <Card key={listing.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{listing.title}</h4>
                          <Badge variant={getStatusVariant(listing.status)}>
                            {getStatusText(listing.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{listing.zone}</span>
                          </div>
                          <span>•</span>
                          <span className="font-medium">{listing.price_per_month} AED/month</span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">{listing.address}</p>

                        {listing.features && listing.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {listing.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Submitted {format(new Date(listing.created_at), 'MMM d, yyyy')}</span>
                        </div>

                        {listing.status === 'pending' && (
                          <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2">
                            <p className="text-xs text-orange-800">
                              ⏳ Your listing is being reviewed by our team. You'll be notified once it's approved.
                            </p>
                          </div>
                        )}

                        {listing.status === 'approved' && (
                          <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                            <p className="text-xs text-green-800">
                              ✅ Your listing is live and visible to potential renters!
                            </p>
                          </div>
                        )}

                        {listing.status === 'rejected' && (
                          <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                            <p className="text-xs text-red-800">
                              ❌ Your listing was rejected. Please contact support for more details.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        {listing.images && listing.images.length > 0 && (
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {listing.status === 'pending' && (
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Modal */}
      {selectedChatBooking && (
        <DriverOwnerChat
          bookingId={selectedChatBooking}
          isOpen={true}
          onClose={() => setSelectedChatBooking(null)}
        />
      )}
    </>
  );
};