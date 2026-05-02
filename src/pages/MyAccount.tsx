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
import { Loader2, User, History, LogOut, Shield, ShieldAlert, ShieldCheck, Mail, Home, MessageSquare, Send, Car, ParkingCircle, MessageCircle, CheckCircle, FileText, Camera, Phone, Globe, Bell, Sparkles, ImageIcon, Trash2, KeyRound, Eye, EyeOff, LifeBuoy, MessagesSquare, HelpCircle, Wand2, RefreshCw } from 'lucide-react';
import accountHeroDubaiNight from '@/assets/account-hero-dubai-night.jpg';
import defaultAvatar1 from '@/assets/avatars/avatar-1.png';
import defaultAvatar2 from '@/assets/avatars/avatar-2.png';
import defaultAvatar3 from '@/assets/avatars/avatar-3.png';
import defaultAvatar4 from '@/assets/avatars/avatar-4.png';
import defaultAvatar5 from '@/assets/avatars/avatar-5.png';
import defaultAvatar6 from '@/assets/avatars/avatar-6.png';
import defaultAvatar7 from '@/assets/avatars/avatar-7.png';
import defaultAvatar8 from '@/assets/avatars/avatar-8.png';
import defaultAvatar9 from '@/assets/avatars/avatar-9.png';
import defaultAvatar10 from '@/assets/avatars/avatar-10.png';
import defaultAvatar11 from '@/assets/avatars/avatar-11.png';
import defaultAvatar12 from '@/assets/avatars/avatar-12.png';

const DEFAULT_AVATARS = [defaultAvatar1, defaultAvatar2, defaultAvatar3, defaultAvatar4, defaultAvatar5, defaultAvatar6, defaultAvatar7, defaultAvatar8, defaultAvatar9, defaultAvatar10, defaultAvatar11, defaultAvatar12];

// Pick a deterministic default avatar based on user id (stable per user)
const pickDefaultAvatar = (seed?: string | null) => {
  if (!seed) return DEFAULT_AVATARS[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return DEFAULT_AVATARS[h % DEFAULT_AVATARS.length];
};
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import VerificationPanel from '@/components/VerificationPanel';
import Navbar from '@/components/Navbar';
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
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
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

  const generateAiAvatar = async () => {
    if (!user) return;
    setGeneratingAvatar(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-avatar', { body: {} });
      if (error) throw error;
      const url = (data as any)?.avatar_url as string | undefined;
      if (!url) throw new Error('No avatar returned');
      setProfile(prev => prev ? { ...prev, avatar_url: url } : prev);
      toast.success('AI avatar generated ✨');
    } catch (err: any) {
      console.error('Generate AI avatar failed:', err);
      const msg = err?.context?.error || err?.message || 'Failed to generate avatar';
      toast.error(msg);
    } finally {
      setGeneratingAvatar(false);
    }
  };

  const setDefaultAvatar = async (url: string) => {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('user_id', user.id);
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, avatar_url: url } : prev);
      toast.success('Avatar updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update avatar');
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
    return <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-surface via-background to-background pt-24">
          <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6 animate-pulse">
            {/* Hero skeleton */}
            <div className="rounded-[2rem] h-44 lg:h-52 bg-gradient-to-br from-primary/20 via-primary/10 to-primary-deep/20" />
            {/* Tabs skeleton */}
            <div className="grid grid-cols-3 gap-2">
              <div className="h-11 rounded-xl bg-muted" />
              <div className="h-11 rounded-xl bg-muted" />
              <div className="h-11 rounded-xl bg-muted" />
            </div>
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-72 rounded-2xl bg-muted lg:col-span-1" />
              <div className="h-72 rounded-2xl bg-muted lg:col-span-2" />
            </div>
          </div>
        </div>
      </>;
  }
  return <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-b from-surface via-background to-background pt-24 animate-fade-in">
      <div className="max-w-5xl mx-auto p-4 lg:p-6">
        {/* Hero header card - premium luxury banner with Dubai night photo */}
        <div className="relative overflow-hidden rounded-[2rem] mb-6 p-8 lg:p-14 min-h-[280px] lg:min-h-[360px] border border-white/20
                        shadow-[0_50px_100px_-30px_hsl(var(--primary-deep)/0.75),0_20px_40px_-15px_hsl(var(--primary)/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25),inset_0_-1px_0_0_hsl(0_0%_0%/0.2)]">
          {/* Background photo - sharper, more dominant */}
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center scale-110"
            style={{ backgroundImage: `url(${accountHeroDubaiNight})` }}
            aria-hidden="true"
          />
          {/* Subtle teal tint - much lower opacity to let photo shine */}
          <div className="pointer-events-none absolute inset-0"
               style={{ background: 'linear-gradient(135deg, hsl(var(--primary-deep) / 0.45) 0%, hsl(var(--primary) / 0.25) 50%, transparent 100%)' }} />
          {/* Strong bottom darken for premium contrast */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
          {/* Left side darken for text legibility */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
          {/* Luxury gold accent line top */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />
          {/* Decorative orbs - subtler */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-300/10 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary-glow/15 blur-3xl"></div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center h-full">
            <div className="flex items-center gap-5 lg:gap-7">
              {/* Avatar - uploadable, larger and more premium */}
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-amber-300/60 via-white/30 to-primary-glow/40 blur-md opacity-80" aria-hidden="true" />
                <Avatar className="relative h-24 w-24 lg:h-32 lg:w-32 rounded-2xl ring-2 ring-white/60 shadow-[0_20px_50px_-12px_hsl(0_0%_0%/0.6),inset_0_1px_0_0_hsl(0_0%_100%/0.4)] bg-white/15 backdrop-blur overflow-hidden">
                  <AvatarImage
                    src={profile?.avatar_url || pickDefaultAvatar(user?.id)}
                    alt={profile?.full_name || 'Profile'}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-2xl bg-gradient-to-br from-white/25 to-white/10 text-white text-3xl lg:text-5xl font-black">
                    {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload-hero"
                  className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                  title="Change profile picture"
                >
                  {uploadingAvatar
                    ? <Loader2 className="h-7 w-7 text-white animate-spin" />
                    : <Camera className="h-7 w-7 text-white" />}
                </label>
                <input
                  id="avatar-upload-hero"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-white shadow-[0_2px_8px_hsl(160_85%_45%/0.7)]" title="Online" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/95 mb-2 font-bold flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgb(0_0_0/0.5)]">
                  <Sparkles className="h-3 w-3" /> Welcome back
                </p>
                <h1 className="text-3xl lg:text-5xl font-black text-white drop-shadow-[0_4px_16px_rgb(0_0_0/0.7)] leading-[1.05] truncate tracking-tight">
                  {profile?.full_name || user?.email?.split('@')[0] || 'My Account'}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-white text-sm drop-shadow-[0_2px_6px_rgb(0_0_0/0.6)]">
                  <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user?.email}</span>
                  {profile?.phone && (
                    <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {profile.phone}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className="bg-black/40 hover:bg-black/50 text-white border border-white/30 backdrop-blur-md capitalize shadow-lg">
                    {isParkingOwner ? '🅿️ Parking owner' : '🚗 Driver'}
                  </Badge>
                  {(verificationStatus === 'approved' || verificationStatus === 'verified') ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-0 shadow-[0_6px_16px_-2px_hsl(160_85%_45%/0.7)]">✓ Verified</Badge>
                  ) : verificationStatus === 'pending' ? (
                    <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0 shadow-[0_6px_16px_-2px_hsl(38_92%_50%/0.7)]">⏳ Pending</Badge>
                  ) : (
                    <Badge className="bg-orange-500 hover:bg-orange-500 text-white border-0 shadow-[0_6px_16px_-2px_hsl(24_95%_53%/0.7)]">! Verification needed</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats + actions */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 lg:gap-3">
                <div className="text-center px-3 py-3 lg:py-4 rounded-2xl bg-black/35 border border-white/25 backdrop-blur-xl
                                shadow-[0_12px_30px_-10px_hsl(0_0%_0%/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25)]
                                hover:bg-black/45 hover:border-amber-200/40 transition-all">
                  <div className="text-2xl lg:text-3xl font-black text-white leading-none drop-shadow">{listings.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/90 mt-1.5 font-semibold">Listings</div>
                </div>
                <div className="text-center px-3 py-3 lg:py-4 rounded-2xl bg-black/35 border border-white/25 backdrop-blur-xl
                                shadow-[0_12px_30px_-10px_hsl(0_0%_0%/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25)]
                                hover:bg-black/45 hover:border-amber-200/40 transition-all">
                  <div className="text-2xl lg:text-3xl font-black text-white leading-none drop-shadow">{bookings.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/90 mt-1.5 font-semibold">Bookings</div>
                </div>
                <div className={`text-center px-3 py-3 lg:py-4 rounded-2xl border backdrop-blur-xl shadow-[0_12px_30px_-10px_hsl(0_0%_0%/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25)] hover:bg-black/45 transition-all ${unreadChatCount > 0 ? 'bg-red-500/40 border-red-300/60 animate-pulse' : 'bg-black/35 border-white/25'}`}>
                  <div className="text-2xl lg:text-3xl font-black text-white leading-none drop-shadow">{unreadChatCount}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/90 mt-1.5 font-semibold">Unread</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/')} size="sm" className="flex-1 bg-black/40 hover:bg-black/55 text-white border border-white/30 backdrop-blur-md shadow-[0_8px_20px_-6px_hsl(0_0%_0%/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.2)] active:translate-y-0.5 transition-all">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
                <Button onClick={handleLogout} size="sm" className="flex-1 bg-gradient-to-br from-amber-300 to-amber-500 text-primary-deep hover:from-amber-200 hover:to-amber-400 shadow-[0_8px_20px_-4px_hsl(38_92%_50%/0.6),inset_0_1px_0_0_hsl(0_0%_100%/0.4)] font-bold border border-amber-200/60 active:translate-y-0.5 transition-all">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status Alert - Only show if not approved/verified */}
        {!verificationLoading && verificationStatus && verificationStatus !== 'approved' && verificationStatus !== 'verified' && (
          <div className="relative mb-5 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50/70 to-white shadow-[0_8px_24px_-12px_hsl(24_95%_53%/0.4)]">
            <div className="flex items-center gap-3 p-3 sm:p-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-orange-900 text-sm leading-tight">Verify your account</p>
                <p className="text-xs text-orange-700/90 mt-0.5">
                  Required to book or list. Status: <span className="font-semibold capitalize">{verificationStatus}</span>
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setActiveTab('verification')}
                className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-0 shadow-sm font-semibold h-8 px-3 text-xs"
              >
                {verificationStatus === 'rejected' ? 'Resubmit' : 'Verify'}
              </Button>
            </div>
          </div>
        )}

        {/* Show verification required for users without any verification record */}
        {!verificationLoading && !verificationStatus && (
          <div className="relative mb-5 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50/70 to-white shadow-[0_8px_24px_-12px_hsl(24_95%_53%/0.4)]">
            <div className="flex items-center gap-3 p-3 sm:p-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-orange-900 text-sm leading-tight">Verify your account</p>
                <p className="text-xs text-orange-700/90 mt-0.5">
                  Required before you can list or book parking spaces.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setActiveTab('verification')}
                className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-0 shadow-sm font-semibold h-8 px-3 text-xs"
              >
                Verify
              </Button>
            </div>
          </div>
        )}


        {/* Success Message for Verified Users */}
        {!verificationLoading && (verificationStatus === 'approved' || verificationStatus === 'verified') && (
          <div className="relative mb-6 rounded-2xl p-[1.5px] bg-gradient-to-r from-emerald-400 via-primary to-emerald-500 shadow-[0_18px_40px_-18px_hsl(160_85%_45%/0.45)]">
            <div className="rounded-[14px] bg-gradient-to-br from-emerald-50 via-green-50/80 to-white p-5 lg:p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_10px_24px_-6px_hsl(160_85%_45%/0.55),inset_0_1px_0_0_hsl(0_0%_100%/0.4)] flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7 text-white drop-shadow" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base lg:text-lg font-bold text-emerald-900 leading-tight">Account Verified</h3>
                  <p className="text-sm text-emerald-700/90 mt-1">
                    Congratulations! You can now list parking spaces and make bookings without restrictions.
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
            </div>
          </div>
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
                <Button
                  variant={activeTab === 'verification' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('verification')}
                  className={`flex items-center gap-2 h-12 relative ${
                    activeTab === 'verification'
                      ? '!bg-gradient-to-br !from-orange-500 !to-orange-600 !text-white !border-0 !shadow-[0_8px_20px_-6px_hsl(24_95%_53%/0.55)]'
                      : (verificationStatus === 'pending' || verificationStatus === null)
                        ? 'border-orange-300/70 text-orange-700 bg-orange-50/40 hover:bg-orange-50'
                        : ''
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Verify
                  {(verificationStatus === 'pending' || verificationStatus === null) && activeTab !== 'verification' && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-70 animate-ping" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                    </span>
                  )}
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
          <TabsList className="hidden lg:grid w-full grid-cols-8 gap-1.5 h-auto p-1.5 rounded-2xl bg-gradient-to-b from-white to-surface border border-primary/10 shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.25),inset_0_1px_0_0_hsl(0_0%_100%/0.6)]">
            <TabsTrigger value="profile" className="flex items-center gap-2 py-2.5 rounded-xl font-semibold transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary-deep data-[state=active]:text-white data-[state=active]:shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25)] hover:bg-primary/5">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            {verificationStatus !== 'approved' && verificationStatus !== 'verified' && (
              <TabsTrigger
                value="verification"
                className={`group relative flex items-center gap-2 py-2.5 rounded-xl font-semibold transition-all hover:bg-orange-500/5 ${
                  verificationStatus === 'pending' || verificationStatus === null
                    ? 'bg-gradient-to-br from-orange-50 to-amber-50/60 text-orange-800 ring-1 ring-orange-200/70 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.6)]'
                    : ''
                } data-[state=active]:!bg-gradient-to-br data-[state=active]:!from-orange-500 data-[state=active]:!to-orange-600 data-[state=active]:!text-white data-[state=active]:!shadow-[0_8px_20px_-6px_hsl(24_95%_53%/0.55),inset_0_1px_0_0_hsl(0_0%_100%/0.3)] data-[state=active]:!ring-0`}
              >
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <ShieldAlert className="h-4 w-4" />
                  {(verificationStatus === 'pending' || verificationStatus === null) && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-70 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
                    </span>
                  )}
                </span>
                Verification
              </TabsTrigger>
            )}
            <TabsTrigger value="security" className="flex items-center gap-2 py-2.5 rounded-xl font-semibold transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary-deep data-[state=active]:text-white data-[state=active]:shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25)] hover:bg-primary/5">
              <KeyRound className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2 py-2.5 rounded-xl font-semibold transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary-deep data-[state=active]:text-white data-[state=active]:shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25)] hover:bg-primary/5">
              <Home className="h-4 w-4" />
              My Listings
            </TabsTrigger>
            <TabsTrigger 
              value="chats" 
              className={`flex items-center gap-2 py-2.5 rounded-xl font-semibold transition-all relative ${unreadChatCount > 0 ? '!bg-gradient-to-br !from-red-50 !to-red-100 !text-red-700 !border !border-red-200 hover:!from-red-100 hover:!to-red-200 data-[state=active]:!from-red-500 data-[state=active]:!to-red-600 data-[state=active]:!text-white data-[state=active]:!shadow-[0_6px_16px_-4px_hsl(0_85%_55%/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25)]' : 'data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary-deep data-[state=active]:text-white data-[state=active]:shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25)] hover:bg-primary/5'}`}
            >
              <MessageCircle className="h-4 w-4" />
              Chats
              {unreadChatCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">{unreadChatCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 py-2.5 rounded-xl font-semibold transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary-deep data-[state=active]:text-white data-[state=active]:shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25)] hover:bg-primary/5">
              <FileText className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2 py-2.5 rounded-xl font-semibold transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary-deep data-[state=active]:text-white data-[state=active]:shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25)] hover:bg-primary/5">
              <MessageSquare className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 py-2.5 rounded-xl font-semibold transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary-deep data-[state=active]:text-white data-[state=active]:shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.25)] hover:bg-primary/5">
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
                    <Avatar className="h-32 w-32 rounded-3xl ring-4 ring-primary/20 shadow-glow bg-muted overflow-hidden">
                      <AvatarImage
                        src={profile?.avatar_url || pickDefaultAvatar(user?.id)}
                        alt={profile?.full_name || 'Profile'}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-3xl bg-gradient-primary text-primary-foreground text-4xl font-black">
                        {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {(uploadingAvatar || generatingAvatar) && (
                      <div className="absolute inset-0 rounded-3xl bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Default avatar gallery */}
                  <div className="w-full">
                    <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-muted-foreground mb-2">Pick a default</p>
                    <div className="grid grid-cols-6 gap-1.5">
                      {DEFAULT_AVATARS.map((src, i) => {
                        const selected = profile?.avatar_url === src;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setDefaultAvatar(src)}
                            disabled={uploadingAvatar || generatingAvatar}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-95 ${selected ? 'border-primary shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.55)]' : 'border-transparent hover:border-primary/40'}`}
                            aria-label={`Use default avatar ${i + 1}`}
                          >
                            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    <Button
                      type="button"
                      onClick={generateAiAvatar}
                      disabled={uploadingAvatar || generatingAvatar}
                      className="w-full bg-gradient-to-br from-primary via-primary to-primary-deep hover:opacity-95 text-white border-0 shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.55),inset_0_1px_0_0_hsl(0_0%_100%/0.25)] active:translate-y-0.5 transition-all"
                    >
                      {generatingAvatar ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
                      ) : (
                        <><Wand2 className="h-4 w-4 mr-2" /> Generate AI avatar</>
                      )}
                    </Button>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="inline-flex w-full items-center justify-center gap-2 h-10 px-4 rounded-md bg-white border border-primary/30 text-foreground hover:bg-primary/5 transition-colors text-sm font-semibold shadow-sm">
                        <Camera className="h-4 w-4" />
                        Upload photo
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar || generatingAvatar}
                      />
                    </label>
                  </div>

                  {profile?.avatar_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeAvatar}
                      disabled={uploadingAvatar || generatingAvatar}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove current
                    </Button>
                  )}

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
            <div className="space-y-6">
              {/* Hero header */}
              <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 border border-primary/15 shadow-elegant"
                   style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.10), hsl(var(--primary-glow)/0.06))' }}>
                <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/15 blur-3xl" />
                <div className="relative flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow shrink-0">
                    <LifeBuoy className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-black text-foreground">Need help? We're here for you</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Average response time under 30 minutes during business hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick action grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/contact-admin" className="group">
                  <Card className="glass-card border-0 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 h-full ring-1 ring-primary/10 hover:ring-primary/30">
                    <CardContent className="pt-6 text-center space-y-3">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessagesSquare className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold">Message Admin</h3>
                      <p className="text-xs text-muted-foreground">Direct line to our admin team</p>
                      <Button size="sm" className="w-full font-semibold">
                        <Send className="h-4 w-4 mr-2" /> Open chat
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                <a href="mailto:support@shazamparking.ae" className="group">
                  <Card className="glass-card border-0 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 h-full ring-1 ring-primary/10 hover:ring-primary/30">
                    <CardContent className="pt-6 text-center space-y-3">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold">Email Support</h3>
                      <p className="text-xs text-muted-foreground break-all">support@shazamparking.ae</p>
                      <Button size="sm" variant="outline" className="w-full font-semibold">
                        <Mail className="h-4 w-4 mr-2" /> Send email
                      </Button>
                    </CardContent>
                  </Card>
                </a>

                <Link to="/faq" className="group">
                  <Card className="glass-card border-0 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 h-full ring-1 ring-primary/10 hover:ring-primary/30">
                    <CardContent className="pt-6 text-center space-y-3">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HelpCircle className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold">Help Center</h3>
                      <p className="text-xs text-muted-foreground">Browse common questions</p>
                      <Button size="sm" variant="outline" className="w-full font-semibold">
                        Visit FAQ
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Inbox section */}
              <Card className="glass-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Your messages
                  </CardTitle>
                  <CardDescription>Replies from our support team appear here</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserInbox />
                </CardContent>
              </Card>
            </div>
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
                {/* Section header - premium */}
                <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-primary-deep via-primary to-primary-glow shadow-[0_18px_40px_-18px_hsl(var(--primary-deep)/0.55)]">
                  <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/15 blur-3xl" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />
                  <div className="relative flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur ring-1 ring-white/30 flex items-center justify-center shadow-inner">
                      <span className="text-white text-2xl">💳</span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight [text-shadow:0_2px_8px_rgb(0_0_0/0.25)]">Payments &amp; Banking</h2>
                      <p className="text-xs sm:text-sm text-white/85 mt-0.5">Manage payouts, view invoices and download receipts.</p>
                    </div>
                  </div>
                </div>

                {/* Banking Details Section - Owner Only */}
                {isParkingOwner && (verificationStatus === 'approved' || verificationStatus === 'verified') && (
                  <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-primary via-primary-glow to-primary-deep shadow-[0_14px_30px_-14px_hsl(var(--primary)/0.5)]">
                    <div className="rounded-[14px] bg-white">
                      <BankingDetailsPanel />
                    </div>
                  </div>
                )}

                {/* Owner Payments Section */}
                {isParkingOwner && (
                  <Card className="border-0 rounded-2xl shadow-[0_14px_30px_-14px_hsl(var(--primary)/0.25)] ring-1 ring-primary/15 overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-surface via-white to-surface-2 border-b border-primary/10">
                      <CardTitle className="flex items-center gap-2 text-lg font-black text-primary-deep tracking-tight">
                        <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary-deep text-white text-sm flex items-center justify-center shadow-sm">💰</span>
                        Owner Payment History
                      </CardTitle>
                      <CardDescription>
                        View and download your owner payment documents
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <PaymentHistoryOwner />
                    </CardContent>
                  </Card>
                )}

                {/* Customer Booking Payments Section */}
                <Card className="border-0 rounded-2xl shadow-[0_14px_30px_-14px_hsl(var(--primary)/0.25)] ring-1 ring-primary/15 overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-surface via-white to-surface-2 border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2 text-lg font-black text-primary-deep tracking-tight">
                      <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary-deep text-white text-sm flex items-center justify-center shadow-sm">🧾</span>
                      {isParkingOwner ? 'My Booking Payments' : 'Payment History'}
                    </CardTitle>
                    <CardDescription>
                      View your booking payments and download invoices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <PaymentHistoryCustomer />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
    </>;
};
export default MyAccount;