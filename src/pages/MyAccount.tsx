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
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, User, History, LogOut, Shield, Mail, Home, MessageSquare, Send, Car, ParkingCircle, MessageCircle, CheckCircle, FileText, Camera, Phone, Globe, Bell, Sparkles, ImageIcon, Trash2, KeyRound, Eye, EyeOff, LifeBuoy, MessagesSquare, HelpCircle } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import VerificationPanel from '@/components/VerificationPanel';
import UserInbox from '@/components/UserInbox';
import { ActiveBookingChats } from '@/components/ActiveBookingChats';
import { MyListings } from '@/components/MyListings';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { EmailVerificationStatus } from '@/components/EmailVerificationStatus';
import { PaymentHistoryOwner } from '@/components/PaymentHistoryOwner';
import PaymentHistoryCustomer from '@/components/PaymentHistoryCustomer';
import { MFASetup } from '@/components/MFASetup';
import { BankingDetailsPanel } from '@/components/BankingDetailsPanel';
interface Profile {
  id: string;
  full_name: string;
  phone: string;
  user_type: string;
  avatar_url?: string | null;
  bio?: string | null;
  preferred_language?: string | null;
  notification_email?: boolean | null;
  notification_sms?: boolean | null;
  email?: string | null;
}
interface ParkingBooking {
  id: string;
  location: string;
  zone: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  cost_aed: number;
  status: string;
  created_at: string;
  updated_at: string;
  confirmation_deadline: string | null;
  payment_type: string | null;
  payment_status: string | null;
  // SECURITY: Sensitive payment fields (stripe_customer_id, stripe_payment_intent_id, 
  // payment_amount_cents, payment_link_url, stripe_subscription_id) 
  // are intentionally excluded to prevent data exposure
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
  const { user, signOut, mfaRequired } = useAuth();
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
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };
  if (!user) {
    navigate('/auth');
    return null;
  }
  useEffect(() => {
    fetchProfile();
    fetchBookings();
    fetchListings();
    fetchUnreadChatCount();
    setupChatRealtimeSubscription();
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
      } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        setIsParkingOwner(false);
      } else if (!data) {
        // No profile yet
        setProfile(null);
        setIsParkingOwner(false);
      } else {
        setProfile(data);
        setIsParkingOwner(data.user_type === 'owner');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchBookings = async () => {
    try {
      // SECURITY FIX: Use secure function instead of direct table access to prevent payment data exposure
      const { data, error } = await supabase.rpc('get_my_bookings');
      
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
        // Consider user an owner if they have any listings approved/published or any listing at all
        const hasAnyListing = (data || []).length > 0;
        if (hasAnyListing) {
          setIsParkingOwner((prev) => prev || true);
        }
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const fetchUnreadChatCount = async () => {
    if (!user) return;
    
    try {
      console.log('📊 Fetching unread chat count for user:', user.id);
      
      const { data, error } = await supabase.rpc('get_unread_chat_count');
      
      if (error) throw error;
      
      const count = data || 0;
      console.log('📊 Unread chat count:', count);
      setUnreadChatCount(count);
    } catch (error) {
      console.error('Error fetching unread chat count:', error);
      setUnreadChatCount(0);
    }
  };

  const setupChatRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('my-account-chat-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_owner_messages'
        },
        () => {
          fetchUnreadChatCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    // Validate mandatory phone number
    if (!profile.phone || profile.phone.trim().length < 5) {
      toast.error('Phone number is required. Please enter a valid phone number.');
      return;
    }
    
    setUpdating(true);
    try {
      const updatePayload = {
        full_name: profile.full_name,
        phone: profile.phone,
        email: user.email,
        user_type: isParkingOwner ? 'owner' : 'seeker',
        avatar_url: profile.avatar_url ?? null,
        bio: profile.bio ?? null,
        preferred_language: profile.preferred_language ?? 'en',
        notification_email: profile.notification_email ?? true,
        notification_sms: profile.notification_sms ?? false,
      };

      let query = supabase.from('profiles').update(updatePayload);
      query = profile?.id ? query.eq('id', profile.id) : query.eq('user_id', user.id);

      const { data, error } = await query.select().maybeSingle();

      if (error || !data) {
        const { error: insertError, data: insertData } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, ...updatePayload })
          .select()
          .maybeSingle();

        if (insertError) {
          toast.error(`Failed to save profile: ${(error || insertError).message}`);
        } else {
          toast.success('Profile saved successfully');
          if (insertData) setProfile(prev => ({ ...(prev || {} as any), ...insertData }));
        }
      } else {
        toast.success('Profile updated successfully');
        setProfile(prev => ({ ...(prev || {} as any), ...data }));
      }
    } catch (error: any) {
      console.error('Profile update exception:', error);
      toast.error(`An error occurred while updating profile: ${error.message || 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);
      if (dbErr) throw dbErr;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : prev);
      toast.success('Profile picture updated');
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      toast.error(err.message || 'Failed to upload picture');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const removeAvatar = async () => {
    if (!user || !profile?.avatar_url) return;
    setUploadingAvatar(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, avatar_url: null } : prev);
      toast.success('Profile picture removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove picture');
    } finally {
      setUploadingAvatar(false);
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
  return <div className="min-h-screen bg-gradient-to-b from-surface via-background to-background pt-20 animate-fade-in">
      <div className="max-w-5xl mx-auto p-4 lg:p-6">
        {/* Hero header card — premium glass */}
        <div className="relative overflow-hidden rounded-3xl mb-6 p-6 lg:p-10 shadow-elegant border border-white/20"
             style={{ background: 'linear-gradient(135deg, hsl(var(--primary-deep)) 0%, hsl(var(--primary)) 55%, hsl(var(--primary-glow)) 100%)' }}>
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/15 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-primary-glow/40 blur-3xl"></div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
            <div className="flex items-center gap-5">
              {/* Avatar — uploadable */}
              <div className="relative group">
                <Avatar className="h-20 w-20 lg:h-24 lg:w-24 rounded-2xl ring-4 ring-white/30 shadow-glow bg-white/15 backdrop-blur">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'Profile'} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="rounded-2xl bg-white/15 text-white text-3xl lg:text-4xl font-black">
                    {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload-hero"
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                  title="Change profile picture"
                >
                  {uploadingAvatar
                    ? <Loader2 className="h-6 w-6 text-white animate-spin" />
                    : <Camera className="h-6 w-6 text-white" />}
                </label>
                <input
                  id="avatar-upload-hero"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-white shadow" title="Online" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/80 mb-1 font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Welcome back
                </p>
                <h1 className="text-2xl lg:text-4xl font-black text-white drop-shadow-md leading-tight truncate">
                  {profile?.full_name || user?.email?.split('@')[0] || 'My Account'}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-white/85 text-sm">
                  <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user?.email}</span>
                  {profile?.phone && (
                    <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {profile.phone}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur capitalize">
                    {isParkingOwner ? '🅿️ Parking owner' : '🚗 Driver'}
                  </Badge>
                  {(verificationStatus === 'approved' || verificationStatus === 'verified') ? (
                    <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white border-0">✓ Verified</Badge>
                  ) : verificationStatus === 'pending' ? (
                    <Badge className="bg-amber-500/90 hover:bg-amber-500 text-white border-0">⏳ Pending</Badge>
                  ) : (
                    <Badge className="bg-orange-500/90 hover:bg-orange-500 text-white border-0">! Verification needed</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats + actions */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 lg:gap-3">
                <div className="text-center px-3 py-2 rounded-xl bg-white/15 border border-white/25 backdrop-blur">
                  <div className="text-xl lg:text-2xl font-black text-white leading-none">{listings.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/75 mt-1">Listings</div>
                </div>
                <div className="text-center px-3 py-2 rounded-xl bg-white/15 border border-white/25 backdrop-blur">
                  <div className="text-xl lg:text-2xl font-black text-white leading-none">{bookings.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/75 mt-1">Bookings</div>
                </div>
                <div className="text-center px-3 py-2 rounded-xl bg-white/15 border border-white/25 backdrop-blur">
                  <div className="text-xl lg:text-2xl font-black text-white leading-none">{unreadChatCount}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/75 mt-1">Unread</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/')} size="sm" className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur shadow-md">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
                <Button onClick={handleLogout} size="sm" className="flex-1 bg-white text-primary hover:bg-white/90 shadow-md font-semibold">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status Alert - Only show if not approved/verified */}
        {!verificationLoading && verificationStatus && verificationStatus !== 'approved' && verificationStatus !== 'verified' && (
          <Card className="mb-6 border-orange-200 bg-orange-50/70 backdrop-blur-md shadow-soft">
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
          <Card className="mb-6 border-orange-200 bg-orange-50/70 backdrop-blur-md shadow-soft">
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
        {!verificationLoading && (verificationStatus === 'approved' || verificationStatus === 'verified') && (
          <Card className="mb-6 border-green-200 bg-green-50/70 backdrop-blur-md shadow-elegant">
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
              {verificationStatus !== 'approved' && verificationStatus !== 'verified' && (
                <Button variant={activeTab === 'verification' ? 'default' : 'outline'} onClick={() => setActiveTab('verification')} className={`flex items-center gap-2 h-12 relative ${(verificationStatus === 'pending' || verificationStatus === null) ? 'border-orange-500/20' : ''}`}>
                  <Shield className="h-4 w-4" />
                  Verify
              {(verificationStatus === 'pending' || verificationStatus === null) && <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></div>}
                </Button>
              )}
              <Button variant={activeTab === 'security' ? 'default' : 'outline'} onClick={() => setActiveTab('security')} className="flex items-center gap-2 h-12">
                <KeyRound className="h-4 w-4" />
                Security
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2 mb-4">
              <Button variant={activeTab === 'listings' ? 'default' : 'outline'} onClick={() => setActiveTab('listings')} className="flex items-center gap-2 h-12">
                <Home className="h-4 w-4" />
                Listings
              </Button>
              <Button variant={activeTab === 'payments' ? 'default' : 'outline'} onClick={() => setActiveTab('payments')} className="flex items-center gap-2 h-12">
                <FileText className="h-4 w-4" />
                Payments
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={activeTab === 'chats' ? 'default' : 'outline'} 
                onClick={() => setActiveTab('chats')} 
                className={`flex items-center gap-2 h-12 relative ${unreadChatCount > 0 ? '!border-2 !border-red-500 !bg-red-50 !text-red-700 hover:!bg-red-100 dark:!bg-red-950/50 dark:!text-red-400 dark:hover:!bg-red-950/70' : ''}`}
              >
                <MessageCircle className="h-4 w-4" />
                Chats
                {unreadChatCount > 0 && (
                  <>
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">!</Badge>
                    <Badge variant="destructive" className="ml-1">
                      {unreadChatCount}
                    </Badge>
                  </>
                )}
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
          <TabsList className="hidden lg:grid w-full grid-cols-8 gap-1 h-auto p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2 py-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            {verificationStatus !== 'approved' && verificationStatus !== 'verified' && (
              <TabsTrigger value="verification" className={`flex items-center gap-2 py-2 ${verificationStatus === 'pending' || verificationStatus === null ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20' : ''}`}>
                <Shield className="h-4 w-4" />
                Verification
                {(verificationStatus === 'pending' || verificationStatus === null) && <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">!</Badge>}
              </TabsTrigger>
            )}
            <TabsTrigger value="security" className="flex items-center gap-2 py-2">
              <KeyRound className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2 py-2">
              <Home className="h-4 w-4" />
              My Listings
            </TabsTrigger>
            <TabsTrigger 
              value="chats" 
              className={`flex items-center gap-2 py-2 relative ${unreadChatCount > 0 ? '!border-2 !border-red-500 !bg-red-50 !text-red-700 hover:!bg-red-100 dark:!bg-red-950/50 dark:!text-red-400 dark:hover:!bg-red-950/70 data-[state=active]:!bg-red-100 data-[state=active]:!text-red-700 dark:data-[state=active]:!bg-red-950/70 dark:data-[state=active]:!text-red-400' : ''}`}
            >
              <MessageCircle className="h-4 w-4" />
              Chats
              {unreadChatCount > 0 && (
                <>
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">!</Badge>
                  <Badge variant="destructive" className="ml-1">
                    {unreadChatCount}
                  </Badge>
                </>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 py-2">
              <FileText className="h-4 w-4" />
              Payments
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Profile picture card */}
              <Card className="glass-card border-0 shadow-elegant lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Profile picture
                  </CardTitle>
                  <CardDescription>JPG or PNG, up to 5 MB</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32 rounded-3xl ring-4 ring-primary/20 shadow-glow bg-muted">
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'Profile'} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="rounded-3xl bg-gradient-primary text-primary-foreground text-4xl font-black">
                        {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 rounded-3xl bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <label htmlFor="avatar-upload" className="flex-1 cursor-pointer">
                      <div className="inline-flex w-full items-center justify-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium shadow-md">
                        <Camera className="h-4 w-4" />
                        {profile?.avatar_url ? 'Change' : 'Upload'}
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </label>
                    {profile?.avatar_url && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={removeAvatar}
                        disabled={uploadingAvatar}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your photo appears on chats and bookings.
                  </p>
                </CardContent>
              </Card>

              {/* Right: Information form */}
              <Card className="glass-card border-0 shadow-elegant lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Profile information
                  </CardTitle>
                  <CardDescription>Update your personal details and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={updateProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
                        <Input id="email" type="email" value={user.email || ''} disabled className="bg-muted" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name</Label>
                        <Input id="full_name" type="text" value={profile?.full_name || ''} onChange={e => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)} placeholder="Your full name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" /> Phone Number <span className="text-destructive">*</span>
                        </Label>
                        <Input id="phone" type="tel" value={profile?.phone || ''} onChange={e => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)} placeholder="+971 50 123 4567" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language" className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Preferred language</Label>
                        <Select
                          value={profile?.preferred_language || 'en'}
                          onValueChange={val => setProfile(prev => prev ? { ...prev, preferred_language: val } : null)}
                        >
                          <SelectTrigger id="language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ar">العربية (Arabic)</SelectItem>
                            <SelectItem value="ru">Русский (Russian)</SelectItem>
                            <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                            <SelectItem value="ur">اردو (Urdu)</SelectItem>
                            <SelectItem value="fr">Français (French)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">About me</Label>
                      <Textarea
                        id="bio"
                        rows={3}
                        maxLength={300}
                        placeholder="Tell other users a bit about yourself (e.g. 'Owner of 3 spaces in Marina, fast responder')"
                        value={profile?.bio || ''}
                        onChange={e => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                      />
                      <p className="text-xs text-muted-foreground text-right">{(profile?.bio || '').length}/300</p>
                    </div>

                    {/* Account type toggle */}
                    <div className="rounded-xl border border-border/60 bg-background/50 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ParkingCircle className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold text-sm">I list parking spaces</p>
                          <p className="text-xs text-muted-foreground">Enable owner features (listings, payouts, banking)</p>
                        </div>
                      </div>
                      <Switch checked={isParkingOwner} onCheckedChange={setIsParkingOwner} />
                    </div>

                    {/* Notification preferences */}
                    <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-sm">Notification preferences</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Email notifications</p>
                          <p className="text-xs text-muted-foreground">Booking, listing and chat updates</p>
                        </div>
                        <Switch
                          checked={profile?.notification_email ?? true}
                          onCheckedChange={val => setProfile(prev => prev ? { ...prev, notification_email: val } : null)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">SMS notifications</p>
                          <p className="text-xs text-muted-foreground">Critical updates only (additional charges may apply)</p>
                        </div>
                        <Switch
                          checked={profile?.notification_sms ?? false}
                          onCheckedChange={val => setProfile(prev => prev ? { ...prev, notification_sms: val } : null)}
                        />
                      </div>
                    </div>

                    {/* Verification Status Display */}
                    {!verificationLoading && (
                      <div className="space-y-2">
                        <Label>Account Status</Label>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                          {verificationStatus === 'approved' || verificationStatus === 'verified' ? (
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

                    <Button type="submit" disabled={updating} size="lg" className="w-full font-semibold shadow-md">
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save changes'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {verificationStatus !== 'approved' && verificationStatus !== 'verified' && (
            <TabsContent value="verification">
              <VerificationPanel />
            </TabsContent>
          )}
          
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Change password card */}
              <Card className="glass-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    Change password
                  </CardTitle>
                  <CardDescription>Use at least 8 characters. Mix letters, numbers and symbols.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={changePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={8}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(s => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm new password</Label>
                      <Input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={8}
                        required
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-destructive">Passwords do not match</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={changingPassword || !newPassword || newPassword !== confirmPassword}
                      className="w-full font-semibold"
                    >
                      {changingPassword ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                      ) : (
                        <><KeyRound className="mr-2 h-4 w-4" /> Update password</>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Forgot your current password?{' '}
                      <Link to="/auth?reset=1" className="text-primary hover:underline font-medium">
                        Send reset email
                      </Link>
                    </p>
                  </form>
                </CardContent>
              </Card>

              {/* Two-factor authentication card */}
              <Card className="glass-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Two-factor authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account using an authenticator app.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MFASetup />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="listings">
            <MyListings />
          </TabsContent>
          
          
          <TabsContent value="chats">
            <div className="space-y-6">
              <ActiveBookingChats />
              <MyListings chatOnly />
            </div>
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
                      <a href="mailto:support@shazamparking.ae" className="text-primary hover:underline">
                        support@shazamparking.ae
                     </a>
                   </p>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
           
            <TabsContent value="history">
              <div className="space-y-6">
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
              </div>
            </TabsContent>

            {/* Payments Tab - For All Users */}
            <TabsContent value="payments" className="mt-6">
              <div className="space-y-6">
                {/* Banking Details Section - Owner Only */}
                {isParkingOwner && (verificationStatus === 'approved' || verificationStatus === 'verified') && (
                  <BankingDetailsPanel />
                )}
                
                {/* Owner Payments Section */}
                {isParkingOwner && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Owner Payment History</CardTitle>
                      <CardDescription>
                        View and download your owner payment documents
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PaymentHistoryOwner />
                    </CardContent>
                  </Card>
                )}
                
                {/* Customer Booking Payments Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{isParkingOwner ? 'My Booking Payments' : 'Payment History'}</CardTitle>
                    <CardDescription>
                      View your booking payments and download invoices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PaymentHistoryCustomer />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default MyAccount;