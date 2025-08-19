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
import { Loader2, User, History, LogOut, Shield, Mail, Home, MessageSquare, Send, Car, ParkingCircle, MessageCircle, CheckCircle } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import VerificationPanel from '@/components/VerificationPanel';
import UserInbox from '@/components/UserInbox';
import { ActiveBookingChats } from '@/components/ActiveBookingChats';
import { MyListings } from '@/components/MyListings';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { status: verificationStatus, loading: verificationLoading } = useVerificationStatus();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<ParkingBooking[]>([]);
  const [listings, setListings] = useState<ParkingListing[]>([]);
  const [parkingHistory, setParkingHistory] = useState<ParkingHistoryItem[]>([]);
  const [isParkingOwner, setIsParkingOwner] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  // Redirect if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }
  useEffect(() => {
    fetchProfile();
    fetchBookings();
    fetchListings();
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
      console.log('Starting logout process...');
      await signOut();
      console.log('Sign out completed');
      toast.success('Logged out successfully');
      // Force page refresh to clear all auth state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
      // Force clear auth state even if signOut fails
      localStorage.clear();
      window.location.href = '/auth';
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
      return <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 text-xs lg:text-sm">
           <div>
             <p className="text-muted-foreground">Start Time</p>
             <p className="break-words">{new Date(booking.start_time).toLocaleString()}</p>
           </div>
           <div>
             <p className="text-muted-foreground">End Time</p>
             <p className="break-words">{new Date(booking.end_time).toLocaleString()}</p>
           </div>
           <div>
             <p className="text-muted-foreground">Cost</p>
             <p className="font-semibold">{booking.cost_aed} AED</p>
           </div>
         </div>;
    } else {
      const listing = item.details as ParkingListing;
      return <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 text-xs lg:text-sm">
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
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col space-y-4 mb-6 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
          <h1 className="text-2xl lg:text-3xl font-bold">My Account</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/')} variant="outline" size="sm" className="flex-1 lg:flex-initial">
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="flex-1 lg:flex-initial">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Verification Status Alert - Only show if not approved */}
        {!verificationLoading && verificationStatus && verificationStatus !== 'approved' && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-orange-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800">Account Verification Required</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Your account must be verified before you can list or book parking spaces.
                    Current status: {verificationStatus}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('verification')}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  {verificationStatus === 'rejected' ? 'Resubmit' : 'Check Status'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show verification required for users without any verification record */}
        {!verificationLoading && !verificationStatus && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-orange-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800">Account Verification Required</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Your account must be verified before you can list or book parking spaces.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('verification')}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Start Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message for Verified Users */}
        {!verificationLoading && verificationStatus === 'approved' && (
          <Card className="mb-6 border-green-200 bg-green-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                    ✅ Account Verified
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Congratulations! Your account is verified. You can now list parking spaces and make bookings without restrictions.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/rent-out-your-space')}
                    className="border-green-300 text-green-700 hover:bg-green-100 font-semibold"
                  >
                    List Space
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/find-parking')}
                    className="border-green-300 text-green-700 hover:bg-green-100 font-semibold"
                  >
                    Find Parking
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden mb-6">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button variant={activeTab === 'profile' ? 'default' : 'outline'} onClick={() => setActiveTab('profile')} className="flex items-center gap-2 h-12">
                <User className="h-4 w-4" />
                Profile
              </Button>
              {verificationStatus !== 'approved' && (
                <Button variant={activeTab === 'verification' ? 'default' : 'outline'} onClick={() => setActiveTab('verification')} className={`flex items-center gap-2 h-12 relative ${(verificationStatus === 'pending' || verificationStatus === null) ? 'border-orange-500/20' : ''}`}>
                  <Shield className="h-4 w-4" />
                  Verify
                  {(verificationStatus === 'pending' || verificationStatus === null) && <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></div>}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2 mb-4">
              <Button variant={activeTab === 'listings' ? 'default' : 'outline'} onClick={() => setActiveTab('listings')} className="flex items-center gap-2 h-12">
                <Home className="h-4 w-4" />
                Listings
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant={activeTab === 'chats' ? 'default' : 'outline'} onClick={() => setActiveTab('chats')} className="flex items-center gap-2 h-12">
                <MessageCircle className="h-4 w-4" />
                Chats
              </Button>
              <Button variant={activeTab === 'contact' ? 'default' : 'outline'} onClick={() => setActiveTab('contact')} className="flex items-center gap-2 h-12">
                <MessageSquare className="h-4 w-4" />
                Contact
              </Button>
              <Button variant={activeTab === 'history' ? 'default' : 'outline'} onClick={() => setActiveTab('history')} className="flex items-center gap-2 h-12">
                <History className="h-4 w-4" />
                History
              </Button>
            </div>
          </div>

          {/* Desktop Tab Navigation */}
          <TabsList className="hidden lg:grid w-full grid-cols-5 gap-1 h-auto p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2 py-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            {verificationStatus !== 'approved' && (
              <TabsTrigger value="verification" className={`flex items-center gap-2 py-2 ${verificationStatus === 'pending' || verificationStatus === null ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20' : ''}`}>
                <Shield className="h-4 w-4" />
                Verification
                {(verificationStatus === 'pending' || verificationStatus === null) && <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">!</Badge>}
              </TabsTrigger>
            )}
            <TabsTrigger value="listings" className="flex items-center gap-2 py-2">
              <Home className="h-4 w-4" />
              My Listings
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2 py-2">
              <MessageCircle className="h-4 w-4" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2 py-2">
              <MessageSquare className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 py-2">
              <History className="h-4 w-4" />
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

                   {/* Verification Status Display */}
                   {!verificationLoading && (
                     <div className="space-y-2">
                       <Label>Account Status</Label>
                       <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                       {verificationStatus === 'approved' ? (
                           <>
                             <CheckCircle className="h-5 w-5 text-green-500" />
                             <div className="flex flex-col">
                               <span className="text-green-700 font-bold text-lg">✅ Verified Account</span>
                               <span className="text-green-600 text-sm">Full access to all features</span>
                             </div>
                           </>
                         ) : verificationStatus === 'pending' ? (
                           <>
                             <Shield className="h-5 w-5 text-orange-500" />
                             <span className="text-orange-700 font-medium">⏳ Verification Pending</span>
                           </>
                         ) : verificationStatus === 'rejected' ? (
                           <>
                             <Shield className="h-5 w-5 text-red-500" />
                             <span className="text-red-700 font-medium">❌ Verification Required</span>
                           </>
                         ) : (
                           <>
                             <Shield className="h-5 w-5 text-gray-500" />
                             <span className="text-gray-700 font-medium">⚠️ Verification Not Started</span>
                           </>
                         )}
                       </div>
                     </div>
                   )}

                   <div className="flex gap-2">
                     <Button type="submit" disabled={updating} className="flex-1">
                       {updating ? <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Updating...
                         </> : 'Update Profile'}
                     </Button>
                     <div className="flex items-center space-x-2">
                       
                       
                     </div>
                   </div>
                 </form>
               </CardContent>
             </Card>
           </TabsContent>
          
          {verificationStatus !== 'approved' && (
            <TabsContent value="verification">
              <VerificationPanel />
            </TabsContent>
          )}
          
          <TabsContent value="listings">
            <MyListings />
          </TabsContent>
          
          
          <TabsContent value="chats">
            <ActiveBookingChats />
          </TabsContent>
          
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Contact & Support
                </CardTitle>
                
              </CardHeader>
               <CardContent className="space-y-4">
                 <Card>
                   <CardContent className="pt-4">
                     <div className="text-center space-y-3">
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
                     {parkingHistory.map(item => <div key={`${item.type}-${item.id}`} className="border rounded-lg p-3 lg:p-4">
                         <div className="flex flex-col space-y-2 lg:flex-row lg:justify-between lg:items-start lg:space-y-0 mb-2">
                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                               {item.type === 'booking' ? <Car className="h-4 w-4 text-blue-600" /> : <ParkingCircle className="h-4 w-4 text-green-600" />}
                               <h3 className="font-semibold text-sm lg:text-base">{item.title}</h3>
                             </div>
                             <p className="text-xs lg:text-sm text-muted-foreground">{item.zone}</p>
                           </div>
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusText(item.status)}
                            </Badge>
                         </div>
                         
                         <div className="lg:hidden">
                           {renderHistoryItemDetails(item)}
                         </div>
                         <div className="hidden lg:block">
                           {renderHistoryItemDetails(item)}
                         </div>
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