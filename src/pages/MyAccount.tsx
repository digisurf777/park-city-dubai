import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, User, History, LogOut, Shield, Mail, Home, MessageSquare, Send, Car, ParkingCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import VerificationPanel from '@/components/VerificationPanel';
import UserInbox from '@/components/UserInbox';
interface Profile {
  id: string;
  full_name: string;
  phone: string;
  user_type: string;
}
interface ParkingBooking {
  id: string;
  location: string;
  zone: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  cost_aed: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  created_at: string;
}
interface ParkingListing {
  id: string;
  title: string;
  address: string;
  zone: string;
  price_per_hour: number;
  price_per_day?: number;
  price_per_month?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
interface ParkingHistoryItem {
  id: string;
  type: 'booking' | 'listing';
  title: string;
  location: string;
  zone: string;
  status: string;
  created_at: string;
  details: ParkingBooking | ParkingListing;
}
const MyAccount = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<ParkingBooking[]>([]);
  const [listings, setListings] = useState<ParkingListing[]>([]);
  const [parkingHistory, setParkingHistory] = useState<ParkingHistoryItem[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [isParkingOwner, setIsParkingOwner] = useState<boolean>(false);

  // Redirect if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }
  useEffect(() => {
    fetchProfile();
    fetchBookings();
    fetchListings();
    fetchVerificationStatus();
  }, [user]);
  useEffect(() => {
    // Combine bookings and listings into unified history
    const combinedHistory: ParkingHistoryItem[] = [...bookings.map(booking => ({
      id: booking.id,
      type: 'booking' as const,
      title: `Booking - ${booking.location}`,
      location: booking.location,
      zone: booking.zone,
      status: booking.status,
      created_at: booking.created_at,
      details: booking
    })), ...listings.map(listing => ({
      id: listing.id,
      type: 'listing' as const,
      title: `Listing - ${listing.title}`,
      location: listing.address,
      zone: listing.zone,
      status: listing.status,
      created_at: listing.created_at,
      details: listing
    }))].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setParkingHistory(combinedHistory);
  }, [bookings, listings]);
  const fetchProfile = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
        setIsParkingOwner(data?.user_type === 'owner');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchBookings = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('parking_bookings').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setBookings((data || []) as ParkingBooking[]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };
  const fetchListings = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('parking_listings').select('*').eq('owner_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching listings:', error);
      } else {
        setListings((data || []) as ParkingListing[]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };
  const fetchVerificationStatus = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('user_verifications').select('verification_status').eq('user_id', user.id).single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching verification:', error);
      } else {
        setVerificationStatus(data?.verification_status || null);
      }
    } catch (error) {
      console.error('Error fetching verification:', error);
    }
  };
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setUpdating(true);
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        full_name: profile.full_name,
        phone: profile.phone,
        user_type: isParkingOwner ? 'owner' : 'renter'
      }).eq('user_id', user.id);
      if (error) {
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setUpdating(false);
    }
  };
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  const renderHistoryItemDetails = (item: ParkingHistoryItem) => {
    if (item.type === 'booking') {
      const booking = item.details as ParkingBooking;
      return <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Start Time</p>
            <p>{new Date(booking.start_time).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">End Time</p>
            <p>{new Date(booking.end_time).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p>{booking.duration_hours} hours</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cost</p>
            <p className="font-semibold">{booking.cost_aed} AED</p>
          </div>
        </div>;
    } else {
      const listing = item.details as ParkingListing;
      return <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Hourly Rate</p>
            <p className="font-semibold">{listing.price_per_hour} AED/hour</p>
          </div>
          {listing.price_per_day && <div>
              <p className="text-muted-foreground">Daily Rate</p>
              <p className="font-semibold">{listing.price_per_day} AED/day</p>
            </div>}
          {listing.price_per_month && <div>
              <p className="text-muted-foreground">Monthly Rate</p>
              <p className="font-semibold">{listing.price_per_month} AED/month</p>
            </div>}
          <div>
            <p className="text-muted-foreground">Created</p>
            <p>{new Date(listing.created_at).toLocaleDateString()}</p>
          </div>
        </div>;
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
  return <div className="min-h-screen bg-background pt-20 animate-zoom-slow">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Account</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/')} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="verification" className={verificationStatus === 'pending' || verificationStatus === null ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20' : ''}>
              <Shield className="mr-2 h-4 w-4" />
              Verification
              {(verificationStatus === 'pending' || verificationStatus === null) && <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">!</Badge>}
            </TabsTrigger>
            <TabsTrigger value="inbox">
              <Mail className="mr-2 h-4 w-4" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="contact">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email || ''} disabled className="bg-muted" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" type="text" value={profile?.full_name || ''} onChange={e => setProfile(prev => prev ? {
                    ...prev,
                    full_name: e.target.value
                  } : null)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={profile?.phone || ''} onChange={e => setProfile(prev => prev ? {
                    ...prev,
                    phone: e.target.value
                  } : null)} placeholder="+971 50 123 4567" />
                  </div>

                  
                  <Button type="submit" disabled={updating}>
                    {updating ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </> : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="verification">
            <VerificationPanel />
          </TabsContent>
          
          <TabsContent value="inbox">
            <UserInbox />
          </TabsContent>
          
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Contact & Support
                </CardTitle>
                
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6 mx-0 px-[2px]">
                      <div className="text-center space-y-4">
                        <Send className="h-8 w-8 text-primary mx-auto" />
                        <h3 className="font-semibold">Contact Admin</h3>
                        <p className="text-sm text-muted-foreground">
                          Send a direct message to our administrators for support or questions.
                        </p>
                        <Link to="/contact-admin">
                          <Button className="w-full">
                            Send Message
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Email Support</h4>
                  <p className="text-sm text-muted-foreground">
                    For urgent matters, you can also reach us directly at{' '}
                    <a href="mailto:support@shazam.ae" className="text-primary hover:underline">
                      support@shazam.ae
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Parking History</CardTitle>
                <CardDescription>
                  View your parking bookings and listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parkingHistory.length === 0 ? <p className="text-muted-foreground text-center py-8">
                    No parking activity yet. Start by booking a space or listing your parking!
                  </p> : <div className="space-y-4">
                    {parkingHistory.map(item => <div key={`${item.type}-${item.id}`} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {item.type === 'booking' ? <Car className="h-4 w-4 text-blue-600" /> : <ParkingCircle className="h-4 w-4 text-green-600" />}
                              <h3 className="font-semibold">{item.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.zone}</p>
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusText(item.status)}
                          </Badge>
                        </div>
                        
                        {renderHistoryItemDetails(item)}
                      </div>)}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default MyAccount;