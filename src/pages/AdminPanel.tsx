import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, MessageSquare, RefreshCw, Users, Building2, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface ParkingBooking {
  id: string;
  user_id: string;
  location: string;
  zone: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  cost_aed: number;
  status: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface ParkingListing {
  id: string;
  title: string;
  description: string;
  address: string;
  zone: string;
  price_per_hour: number;
  price_per_day: number;
  price_per_month: number;
  status: string;
  created_at: string;
  owner_id: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  user_type: string;
  created_at: string;
}

interface MessageData {
  recipientId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [parkingBookings, setParkingBookings] = useState<ParkingBooking[]>([]);
  const [parkingListings, setParkingListings] = useState<ParkingListing[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [messageDialog, setMessageDialog] = useState(false);
  const [currentMessageData, setCurrentMessageData] = useState<MessageData>({
    recipientId: '',
    recipientEmail: '',
    recipientName: '',
    subject: '',
    message: ''
  });

  const fetchParkingBookings = async () => {
    try {
      console.log('Fetching parking bookings...');
      
      // Fetch bookings with user profile information via join
      // First get bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('parking_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      console.log('Bookings data:', bookingsData);

      // Then get user profiles separately
      const userIds = [...new Set(bookingsData?.map(booking => booking.user_id) || [])];
      console.log('User IDs to fetch profiles for:', userIds);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      console.log('Profiles data:', profilesData);

      // Create a map of user_id to profile for quick lookup
      const profilesMap = new Map(profilesData?.map(profile => [profile.user_id, profile]) || []);

      // Combine bookings with user info
      const bookingsWithUserInfo = (bookingsData || []).map(booking => ({
        ...booking,
        user_email: 'N/A', // Will be fetched separately if needed
        user_name: profilesMap.get(booking.user_id)?.full_name || 'Unknown User'
      }));

      setParkingBookings(bookingsWithUserInfo);
      console.log('Final bookings with user info:', bookingsWithUserInfo);
    } catch (error) {
      console.error('Error in fetchParkingBookings:', error);
      toast.error('Failed to fetch parking bookings: ' + (error as Error).message);
      
      // Fallback: try to fetch bookings without user emails
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('parking_bookings')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        
        const fallbackBookings = (fallbackData || []).map(booking => ({
          ...booking,
          user_email: 'N/A',
          user_name: 'Unknown User'
        }));
        
        setParkingBookings(fallbackBookings);
        toast.success('Loaded bookings (user details unavailable)');
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
        toast.error('Unable to load any booking data');
      }
    }
  };

  const fetchParkingListings = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParkingListings(data || []);
    } catch (error) {
      console.error('Error fetching parking listings:', error);
      toast.error('Failed to fetch parking listings');
    }
  };

  const fetchUserProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserProfiles(data || []);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      toast.error('Failed to fetch user profiles');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchParkingBookings(),
        fetchParkingListings(),
        fetchUserProfiles()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('parking_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(`Booking ${newStatus} successfully`);
      fetchParkingBookings(); // Refresh the data
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleSendMessage = async () => {
    try {
      const { error } = await supabase
        .from('user_messages')
        .insert([
          {
            user_id: currentMessageData.recipientId,
            subject: currentMessageData.subject,
            message: currentMessageData.message,
            from_admin: true
          }
        ]);

      if (error) throw error;

      toast.success('Message sent successfully');
      setMessageDialog(false);
      setCurrentMessageData({
        recipientId: '',
        recipientEmail: '',
        recipientName: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const openMessageDialog = (booking: ParkingBooking) => {
    setCurrentMessageData({
      recipientId: booking.user_id,
      recipientEmail: booking.user_email || 'N/A',
      recipientName: booking.user_name || 'Unknown User',
      subject: `Regarding your parking booking at ${booking.location}`,
      message: `Dear ${booking.user_name || 'Customer'},\n\nWe are contacting you regarding your parking booking:\n\nLocation: ${booking.location}\nZone: ${booking.zone}\nStart Time: ${new Date(booking.start_time).toLocaleString()}\nEnd Time: ${new Date(booking.end_time).toLocaleString()}\nCost: ${booking.cost_aed} AED\n\nPlease let us know if you have any questions.\n\nBest regards,\nShazam Parking Team`
    });
    setMessageDialog(true);
  };

  const handleRefresh = () => {
    fetchParkingBookings();
    toast.success('Data refreshed');
  };

  const filteredBookings = statusFilter === 'all' 
    ? parkingBookings 
    : parkingBookings.filter(booking => booking.status === statusFilter);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage parking bookings, listings, and users</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">
              <Calendar className="h-4 w-4 mr-2" />
              Parking Bookings ({parkingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="listings">
              <Building2 className="h-4 w-4 mr-2" />
              Parking Listings ({parkingListings.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users ({userProfiles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex gap-4 items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="grid gap-6">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {booking.location}
                          <Badge variant={getStatusBadgeVariant(booking.status)} className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Zone: {booking.zone} • Customer: {booking.user_name} ({booking.user_email})
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Deny
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openMessageDialog(booking)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Start Time</p>
                        <p className="text-muted-foreground">{new Date(booking.start_time).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">End Time</p>
                        <p className="text-muted-foreground">{new Date(booking.end_time).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-muted-foreground">{booking.duration_hours} hours</p>
                      </div>
                      <div>
                        <p className="font-medium">Cost</p>
                        <p className="text-muted-foreground flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {booking.cost_aed} AED
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <div className="grid gap-6">
              {parkingListings.map((listing) => (
                <Card key={listing.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{listing.title}</CardTitle>
                        <CardDescription>{listing.address} • {listing.zone}</CardDescription>
                      </div>
                      <Badge variant={listing.status === 'approved' ? 'default' : 'secondary'}>
                        {listing.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{listing.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Per Hour</p>
                        <p className="text-muted-foreground">{listing.price_per_hour} AED</p>
                      </div>
                      <div>
                        <p className="font-medium">Per Day</p>
                        <p className="text-muted-foreground">{listing.price_per_day} AED</p>
                      </div>
                      <div>
                        <p className="font-medium">Per Month</p>
                        <p className="text-muted-foreground">{listing.price_per_month} AED</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid gap-6">
              {userProfiles.map((profile) => (
                <Card key={profile.id}>
                  <CardHeader>
                    <CardTitle>{profile.full_name || 'No name provided'}</CardTitle>
                    <CardDescription>
                      Type: {profile.user_type} • Joined: {new Date(profile.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p><strong>Phone:</strong> {profile.phone || 'Not provided'}</p>
                      <p><strong>User ID:</strong> {profile.user_id}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={messageDialog} onOpenChange={setMessageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Message to Customer</DialogTitle>
              <DialogDescription>
                Sending message to: {currentMessageData.recipientName} ({currentMessageData.recipientEmail})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={currentMessageData.subject}
                  onChange={(e) => setCurrentMessageData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Message subject"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={currentMessageData.message}
                  onChange={(e) => setCurrentMessageData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message here..."
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMessageDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPanel;
