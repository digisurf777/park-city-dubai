import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Pencil, Trash2, Plus, CheckCircle, XCircle, FileText, Mail, Upload, X, 
  Eye, Edit, Lightbulb, Camera, Settings, RefreshCw, MessageCircle, Send, 
  LogOut, Home, Grid, Bell, Users, Car, Copy, ExternalLink, Image, CreditCard,
  Calendar, Clock, DollarSign, AlertTriangle, RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/quill.css';
import SecureDocumentViewer from '@/components/SecureDocumentViewer';
import SpaceManagement from '@/components/SpaceManagement';
import AdminNotifications from '@/components/AdminNotifications';
import LiveBookingControl from '@/components/LiveBookingControl';
import { PreAuthorizationPanel } from '@/components/PreAuthorizationPanel';
import { BookingChatsMonitor } from '@/components/BookingChatsMonitor';
import { PaymentHistoryAdmin } from '@/components/PaymentHistoryAdmin';

// Import all interfaces and state from original AdminPanel
interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  publication_date: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  status?: string;
}

interface AdminSetupResponse {
  message: string;
  error?: string;
  meta_title?: string;
  meta_description?: string;
}

interface Verification {
  id: string;
  user_id: string;
  full_name: string;
  document_type: string;
  document_image_url: string;
  verification_status: string;
  nationality?: string;
  created_at: string;
  profiles?: {
    user_id: string;
    full_name: string;
    email: string;
    phone?: string;
    user_type: string;
  } | null;
}

interface ParkingListing {
  id: string;
  title: string;
  description: string;
  address: string;
  zone: string;
  price_per_hour: number;
  price_per_day?: number;
  price_per_month: number;
  status: string;
  owner_id: string;
  owner_name?: string;
  images: string[];
  features?: string[];
  contact_phone: string;
  contact_email: string;
  created_at: string;
  access_device_deposit_required?: boolean;
  deposit_amount_aed?: number;
  deposit_payment_status?: string;
  deposit_payment_link?: string;
  deposit_stripe_session_id?: string;
}

interface ParkingBooking {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  cost_aed: number;
  location: string;
  zone: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    phone: string;
  };
  userEmail?: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  from_admin: boolean;
  read_status: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    user_id: string;
  };
}

interface ChatUser {
  user_id: string;
  full_name: string;
  unread_count: number;
  last_message_at?: string | null;
  last_message_preview?: string;
}

const AdminPanelOrganized = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // All state variables from original AdminPanel
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [parkingListings, setParkingListings] = useState<ParkingListing[]>([]);
  const [parkingBookings, setParkingBookings] = useState<ParkingBooking[]>([]);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [editingListing, setEditingListing] = useState<ParkingListing | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verificationsLoading, setVerificationsLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [verificationUpdating, setVerificationUpdating] = useState<string | null>(null);
  const [messageSending, setMessageSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [detailedUsers, setDetailedUsers] = useState<any[]>([]);
  const [detailedUsersLoading, setDetailedUsersLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    parkingOwners: 0,
    parkingSeekers: 0
  });
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('');
  
  // Chat management state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatReply, setChatReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [chatTotalUnread, setChatTotalUnread] = useState(0);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('published');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Message state
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // Parking listing edit form state
  const [listingTitle, setListingTitle] = useState('');
  const [listingDescription, setListingDescription] = useState('');
  const [listingAddress, setListingAddress] = useState('');
  const [listingZone, setListingZone] = useState('');
  const [listingPricePerHour, setListingPricePerHour] = useState<number>(0);
  const [listingPricePerMonth, setListingPricePerMonth] = useState<number>(0);
  const [listingContactEmail, setListingContactEmail] = useState('');
  const [listingContactPhone, setListingContactPhone] = useState('');
  const [listingImages, setListingImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newMessageAlert, setNewMessageAlert] = useState<string | null>(null);
  const listingFileInputRef = useRef<HTMLInputElement>(null);
  
  // Notifications state
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  
  // Debug state for troubleshooting
  const [debugInfo, setDebugInfo] = useState({
    userLoaded: false,
    sessionCheck: false,
    adminRoleAttempts: 0,
    lastError: null as string | null,
    authStateHistory: [] as string[]
  });

  // Document viewing state
  const [verificationSearchTerm, setVerificationSearchTerm] = useState('');
  const [verificationStatusFilter, setVerificationStatusFilter] = useState('all');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documentViewDialog, setDocumentViewDialog] = useState(false);
  const [documentImageUrl, setDocumentImageUrl] = useState<string>('');
  const [documentLoading, setDocumentLoading] = useState(false);

  // Fetch functions implementation
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('publication_date', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAdminRole = async () => {
    if (!user) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin role:', error);
      }
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error in admin check:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const setupAdminAccess = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('setup-admin');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Admin access has been set up successfully",
      });
      
      // Recheck admin role
      checkAdminRole();
    } catch (error) {
      console.error('Setup admin error:', error);
      toast({
        title: "Error", 
        description: "Failed to setup admin access",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fetch verifications function
  const fetchVerifications = async () => {
    try {
      setVerificationsLoading(true);
      
      // First get verifications
      const { data: verificationsData, error: verifyError } = await supabase
        .from('user_verifications')
        .select(`
          id,
          user_id,
          full_name,
          document_type,
          document_image_url,
          verification_status,
          nationality,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (verifyError) throw verifyError;

      // Then get profiles for each verification
      if (verificationsData && verificationsData.length > 0) {
        const userIds = verificationsData.map(v => v.user_id);
        
        const { data: profilesData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, phone, user_type')
          .in('user_id', userIds);

        if (profileError) {
          console.error('Error fetching profiles:', profileError);
        }

        // Combine the data
        const verificationsWithProfiles = verificationsData.map(verification => ({
          ...verification,
          profiles: profilesData?.find(p => p.user_id === verification.user_id) || null
        }));

        setVerifications(verificationsWithProfiles as Verification[]);
      } else {
        setVerifications([]);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch verifications",
        variant: "destructive",
      });
    } finally {
      setVerificationsLoading(false);
    }
  };

  const updateVerificationStatus = async (verificationId: string, newStatus: 'verified' | 'rejected') => {
    setVerificationUpdating(verificationId);
    try {
      const { error } = await supabase
        .from('user_verifications')
        .update({ 
          verification_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', verificationId);

      if (error) throw error;

      // Find verification to get user details
      const verification = verifications.find(v => v.id === verificationId);
      if (verification) {
        // Send notification email
        const { error: emailError } = await supabase.functions.invoke('send-verification-approval', {
          body: {
            userId: verification.user_id,
            userEmail: verification.profiles?.email,
            userName: verification.profiles?.full_name || verification.full_name,
            isApproved: newStatus === 'verified'
          }
        });

        if (emailError) {
          console.error('Email notification error:', emailError);
        }
      }

      toast({
        title: "Success",
        description: `Verification ${newStatus} successfully`,
      });

      // Refresh verifications list
      fetchVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setVerificationUpdating(null);
    }
  };

  const deleteVerification = async (verificationId: string) => {
    setVerificationUpdating(verificationId);
    try {
      const { error } = await supabase
        .from('user_verifications')
        .delete()
        .eq('id', verificationId);

      if (error) throw error;

      // Remove verification from local state
      setVerifications(prev => prev.filter(v => v.id !== verificationId));
      
      toast({
        title: "Success",
        description: "Verification deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting verification:', error);
      toast({
        title: "Error",
        description: "Failed to delete verification",
        variant: "destructive",
      });
    } finally {
      setVerificationUpdating(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const copyToClipboard = async (text: string, label: string = 'Text') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const openInSupabase = (verificationId: string) => {
    const query = `SELECT * FROM user_verifications WHERE id = '${verificationId}';`;
    const encodedQuery = encodeURIComponent(query);
    const supabaseUrl = `https://supabase.com/dashboard/project/eoknluyunximjlsnyceb/sql/new?content=${encodedQuery}`;
    window.open(supabaseUrl, '_blank');
  };

  const handleViewDocument = async (verificationId: string) => {
    setDocumentLoading(true);
    setSelectedDocumentId(verificationId);
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-get-document', {
        body: { verification_id: verificationId }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get document access');
      }

      if (data && data.signed_url) {
        setDocumentImageUrl(data.signed_url);
        setDocumentViewDialog(true);
      } else {
        throw new Error('No document URL received');
      }
    } catch (error: any) {
      console.error('Error accessing document:', error);
      toast({
        title: "Error",
        description: `Failed to access document: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleVerificationAction = async (verificationId: string, action: 'approved' | 'rejected') => {
    await updateVerificationStatus(verificationId, action === 'approved' ? 'verified' : 'rejected');
  };
  const fetchParkingListings = async () => {
    setListingsLoading(true);
    try {
      // Step 1: fetch listings only (avoid broken FK joins)
      const { data: listings, error } = await supabase
        .from('parking_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let listingsWithOwnerName: any[] = listings || [];

      // Step 2: fetch owners' names via secure RPC and merge
      if (listings && listings.length > 0) {
        const ownerIds = Array.from(new Set(listings.map((l: any) => l.owner_id).filter(Boolean)));
        if (ownerIds.length > 0) {
          const { data: owners, error: ownersError } = await supabase
            .rpc('get_user_basic_info', { user_ids: ownerIds });

          if (!ownersError && owners) {
            const nameMap = new Map(owners.map((o: any) => [o.user_id, o.full_name]));
            listingsWithOwnerName = listings.map((l: any) => ({
              ...l,
              owner_name: nameMap.get(l.owner_id) || 'Unknown Owner',
            }));
          } else if (ownersError) {
            console.warn('Failed to fetch owner names via RPC:', ownersError);
          }
        }
      }

      setParkingListings(listingsWithOwnerName);
    } catch (error) {
      console.error('Error fetching parking listings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch parking listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setListingsLoading(false);
    }
  };
  
  const updateListingStatus = async (listingId: string, status: 'approved' | 'rejected' | 'published') => {
    try {
      // Get listing details before updating
      const listing = parkingListings.find(l => l.id === listingId);
      
      console.log('Updating listing status:', { listingId, status, listing });
      
      const { error } = await supabase
        .from('parking_listings')
        .update({ status })
        .eq('id', listingId);

      if (error) throw error;

      // If approving, send notification email to owner
      if (status === 'approved' && listing) {
        try {
          console.log('Fetching owner details for listing approval email...');
          
          // Use secure RPC function to get email from either profiles or auth.users
          const { data: ownerData, error: ownerError } = await supabase
            .rpc('get_user_email_and_name', { user_uuid: listing.owner_id });

          console.log('Owner data from RPC:', { ownerData, ownerError });

          if (ownerError) {
            console.error('Error fetching owner data:', ownerError);
            throw ownerError;
          }

          const owner = ownerData?.[0];

          if (!owner?.email) {
            console.error('No email found for owner:', listing.owner_id);
            toast({
              title: "Warning",
              description: "Listing approved but owner email not found - cannot send notification",
              variant: "destructive",
            });
          } else {
            console.log('Sending approval email to:', owner.email);
            
            const emailPayload = {
              listingId: listing.id,
              userName: owner.full_name || 'Property Owner',
              userEmail: owner.email,
              buildingName: listing.title,
              district: listing.zone,
              bayType: listing.description || 'Parking Space',
              monthlyPrice: listing.price_per_month || 0,
              accessDeviceDeposit: listing.access_device_deposit_required ? (listing.deposit_amount_aed || 500) : 0
            };
            
            console.log('Email payload:', emailPayload);
            
            const { data: emailData, error: emailError } = await supabase.functions.invoke('send-listing-approved', {
              body: emailPayload
            });

            console.log('Email function response:', { emailData, emailError });

            if (emailError) {
              console.error('Email function error:', emailError);
              throw emailError;
            }

            // Also send a message to user's inbox
            try {
              const { error: inboxError } = await supabase.from('user_messages').insert({
                user_id: listing.owner_id,
                subject: '🎉 Your Parking Listing Has Been Approved!',
                message: `Great news! Your parking listing "${listing.title}" in ${listing.zone} has been approved and is now live on ShazamParking. Customers can now find and book your parking space. You'll receive booking notifications when customers request your space.`,
                from_admin: true,
                read_status: false
              });
              
              if (inboxError) {
                console.error('Failed to send inbox notification:', inboxError);
              } else {
                console.log('Inbox notification sent successfully');
              }
            } catch (inboxError) {
              console.error('Exception sending inbox notification:', inboxError);
            }
          }
        } catch (emailError) {
          console.error('Error sending approval email:', emailError);
          toast({
            title: "Warning",
            description: "Listing approved but email notification failed: " + (emailError as Error).message,
            variant: "destructive",
          });
        }
      }

      // Update local state
      setParkingListings(prev => 
        prev.map(listing => 
          listing.id === listingId ? { ...listing, status } : listing
        )
      );

      toast({
        title: "Success",
        description: `Listing ${status} successfully${status === 'approved' ? ' - Owner notified by email' : ''}`,
      });
    } catch (error) {
      console.error('Error updating listing status:', error);
      toast({
        title: "Error",
        description: "Failed to update listing status",
        variant: "destructive",
      });
    }
  };

  const rejectListing = async (listing: ParkingListing) => {
    if (!confirm('Are you sure you want to reject this listing? The owner will be notified.')) return;

    try {
      // Update listing status to rejected
      const { error } = await supabase
        .from('parking_listings')
        .update({ status: 'rejected' })
        .eq('id', listing.id);

      if (error) throw error;

      // Get owner details for notification
      const { data: owner } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('user_id', listing.owner_id)
        .single();

      // Send rejection notification email
      if (owner?.email) {
        await supabase.functions.invoke('send-listing-rejected', {
          body: {
            userEmail: owner.email,
            userName: owner.full_name,
            listingDetails: {
              title: listing.title,
              address: listing.address,
              zone: listing.zone,
              listingId: listing.id
            }
          }
        });
      }

      // Update local state
      setParkingListings(prev => 
        prev.map(l => l.id === listing.id ? { ...l, status: 'rejected' as const } : l)
      );

      toast({
        title: "Success",
        description: "Listing rejected and owner notified",
      });
    } catch (error) {
      console.error('Error rejecting listing:', error);
      toast({
        title: "Error",
        description: "Failed to reject listing",
        variant: "destructive",
      });
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;

    try {
      const { error } = await supabase.rpc('admin_delete_parking_listing_complete', {
        listing_id: listingId
      });

      if (error) throw error;

      // Remove from local state
      setParkingListings(prev => prev.filter(listing => listing.id !== listingId));
      
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };
  
  const fetchParkingBookings = async () => {};
  const fetchAllUsers = async () => {};
  const fetchDetailedUsers = async () => {};
  
  const fetchChatMessages = async () => {
    setChatLoading(true);
    try {
      // First get messages
      const { data: messages, error: msgError } = await supabase
        .from('user_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      // Then resolve sender names using RPC (auth.users) with profiles fallback
      if (messages && messages.length > 0) {
        const userIds = [...new Set(messages.map(msg => msg.user_id))];

        const { data: userInfos, error: infoErr } = await supabase
          .rpc('get_user_basic_info', { user_ids: userIds });
        if (infoErr) console.error('RPC names for messages failed:', infoErr);

        // profiles fallback only for missing
        const missing = (userInfos || []).filter((u: any) => !u?.full_name && !u?.email).map((u: any) => u.user_id);
        let profiles: any[] = [];
        if (missing.length > 0) {
          const { data: pData, error: pErr } = await supabase
            .from('profiles')
            .select('user_id, full_name, email')
            .in('user_id', missing);
          if (pErr) console.error('Profiles fallback for messages failed:', pErr);
          profiles = pData || [];
        }

        // Combine messages with resolved display name
        const messagesWithProfiles = messages.map(msg => {
          const info = userInfos?.find((u: any) => u.user_id === msg.user_id);
          const prof = profiles.find((p: any) => p.user_id === msg.user_id);
          const name = (info?.full_name && info.full_name.trim()) || prof?.full_name?.trim() || info?.email || prof?.email || `User ${String(msg.user_id).slice(0,8)}`;
          return {
            ...msg,
            profiles: { full_name: name, user_id: msg.user_id }
          };
        });

        setChatMessages(messagesWithProfiles as ChatMessage[]);
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch chat messages",
        variant: "destructive",
      });
    } finally {
      setChatLoading(false);
    }
  };

  const fetchChatUsers = async () => {
    try {
      // Try RPC that resolves names and unread counts on the server
      const { data: overview, error } = await supabase.rpc('get_chat_users_overview');
      if (error) throw error;

      let users: ChatUser[] = (overview || []).map((u: any) => ({
        user_id: u.user_id as string,
        full_name: (u.display_name && String(u.display_name).trim()) || '',
        unread_count: Number(u.unread_count || 0),
      }));

      // Fallback: if RPC returned nothing, derive from user_messages directly
      if (!users || users.length === 0) {
        const { data: msgs, error: msgsErr } = await supabase
          .from('user_messages')
          .select('user_id, read_status, from_admin, created_at, message')
          .order('created_at', { ascending: false });
        if (msgsErr) throw msgsErr;

        const allIds = Array.from(new Set((msgs || []).map((m: any) => m.user_id).filter(Boolean)));

        // Build unread counts per user (only user -> admin messages that are unread)
        const unreadMap = new Map<string, number>();
        const lastMap = new Map<string, { at: string; preview: string }>();

        (msgs || []).forEach((m: any) => {
          if (!lastMap.has(m.user_id)) {
            lastMap.set(m.user_id, { at: m.created_at, preview: m.message?.slice(0, 80) || '' });
          }
          if (!m.from_admin && !m.read_status && m.user_id) {
            unreadMap.set(m.user_id, (unreadMap.get(m.user_id) || 0) + 1);
          }
        });

        // Resolve names via secondary RPC
        let nameMap = new Map<string, { full_name?: string; email?: string }>();
        if (allIds.length > 0) {
          const { data: basic, error: basicErr } = await supabase.rpc('get_user_basic_info', { user_ids: allIds });
          if (basicErr) console.error('get_user_basic_info failed:', basicErr);
          nameMap = new Map((basic || []).map((b: any) => [b.user_id, b]));
        }

        users = allIds.map((id) => {
          const b = nameMap.get(id);
          const name = (b?.full_name && String(b.full_name).trim()) || b?.email || '';
          const last = lastMap.get(id);
          return {
            user_id: id,
            full_name: name,
            unread_count: unreadMap.get(id) || 0,
            last_message_at: last?.at || null,
            last_message_preview: last?.preview || '',
          };
        });
      } else {
        // Get last message times to sort correctly (works regardless of RPC presence)
        const { data: recent } = await supabase
          .from('user_messages')
          .select('user_id, created_at, message')
          .order('created_at', { ascending: false })
          .limit(1000);

        const lastMap = new Map<string, { at: string; preview: string }>();
        (recent || []).forEach((m: any) => {
          if (!lastMap.has(m.user_id)) {
            lastMap.set(m.user_id, { at: m.created_at, preview: m.message?.slice(0, 80) || '' });
          }
        });

        users = users.map(u => ({
          ...u,
          last_message_at: lastMap.get(u.user_id)?.at || null,
          last_message_preview: lastMap.get(u.user_id)?.preview || '',
        }));
      }

      // Fill missing names and final fallback
      const missingIds = users.filter((u) => !u.full_name).map((u) => u.user_id);
      if (missingIds.length > 0) {
        const { data: basic, error: basicErr } = await supabase.rpc('get_user_basic_info', { user_ids: missingIds });
        if (basicErr) console.error('get_user_basic_info failed:', basicErr);
        const basicMap = new Map((basic || []).map((b: any) => [b.user_id, b]));
        users = users.map((u) => {
          if (!u.full_name) {
            const b = basicMap.get(u.user_id);
            const name = (b?.full_name && String(b.full_name).trim()) || b?.email || '';
            return { ...u, full_name: name };
          }
          return u;
        });
      }

      users = users.map((u) => ({
        ...u,
        full_name: u.full_name || `User ${String(u.user_id).slice(0, 8)}`,
      }));

      // Sort: unread first (desc), then newest message (desc)
      users.sort((a, b) => {
        if ((b.unread_count > 0 ? 1 : 0) !== (a.unread_count > 0 ? 1 : 0)) {
          return (b.unread_count > 0 ? 1 : 0) - (a.unread_count > 0 ? 1 : 0);
        }
        const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return tb - ta;
      });

      setChatUsers(users);
      setChatTotalUnread(users.reduce((sum, u) => sum + (u.unread_count || 0), 0));
    } catch (error) {
      console.error('Error fetching chat users:', error);
    }
  };

  const markThreadAsRead = async (userId: string) => {
    try {
      await supabase
        .from('user_messages')
        .update({ read_status: true })
        .eq('user_id', userId)
        .eq('from_admin', false)
        .eq('read_status', false);

      // Optimistic UI update
      setChatUsers(prev => prev.map(u => u.user_id === userId ? { ...u, unread_count: 0 } : u));
      setChatTotalUnread(prev => {
        const target = chatUsers.find(u => u.user_id === userId)?.unread_count || 0;
        return Math.max(0, prev - target);
      });
      setChatMessages(prev => prev.map(m => (m.user_id === userId && !m.from_admin ? { ...m, read_status: true } : m)));
    } catch (e) {
      console.error('Failed to mark thread read:', e);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPost(null);
    // Reset form
    setTitle('');
    setContent('');
    setImageUrl('');
    setTags('');
    setStatus('published');
    setMetaTitle('');
    setMetaDescription('');
    setPublicationDate(new Date().toISOString().slice(0, 16));
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        publication_date: publicationDate || new Date().toISOString(),
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        status: status,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('news')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "News post updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('news')
          .insert([postData]);

        if (error) throw error;

        toast({
          title: "Success", 
          description: "News post created successfully",
        });
      }

      setIsCreating(false);
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${index}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('parking-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from('parking-images')
          .getPublicUrl(fileName);

        return publicUrl.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setListingImages(prev => [...prev, ...uploadedUrls]);
      
      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('parking-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('parking-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl.publicUrl);
      setImageFile(file);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Handle content image upload for ReactQuill
  const handleContentImageUpload = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `content-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('parking-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from('parking-images')
          .getPublicUrl(fileName);

        // Insert image into ReactQuill content
        const quill = document.querySelector('.ql-editor');
        if (quill) {
          const range = window.getSelection()?.getRangeAt(0);
          const img = `<img src="${publicUrl.publicUrl}" alt="Content image" style="max-width: 100%; height: auto;" />`;
          
          // Insert at cursor position or append to content
          const currentContent = content || '';
          setContent(currentContent + img);
        }
        
        toast({
          title: "Success",
          description: "Image inserted into content",
        });
      } catch (error) {
        console.error('Error uploading content image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    };
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    
    setListingImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    
    toast({
      title: "Success",
      description: "Image URL added successfully",
    });
  };

  const startEditingListing = (listing: ParkingListing) => {
    setEditingListing(listing);
    setListingTitle(listing.title);
    setListingDescription(listing.description || '');
    setListingAddress(listing.address);
    setListingZone(listing.zone);
    setListingPricePerHour(listing.price_per_hour);
    setListingPricePerMonth(listing.price_per_month || 0);
    setListingContactEmail(listing.contact_email || '');
    setListingContactPhone(listing.contact_phone || '');
    setListingImages(listing.images || []);
  };

  const handleSaveListing = async () => {
    if (!listingTitle.trim() || !listingAddress.trim() || !listingZone.trim()) {
      toast({
        title: "Error",
        description: "Title, address, and zone are required",
        variant: "destructive",
      });
      return;
    }

    if (!editingListing) return;

    try {
      const listingData = {
        title: listingTitle.trim(),
        description: listingDescription.trim() || null,
        address: listingAddress.trim(),
        zone: listingZone.trim(),
        price_per_hour: listingPricePerHour,
        price_per_month: listingPricePerMonth || null,
        contact_email: listingContactEmail.trim() || null,
        contact_phone: listingContactPhone.trim() || null,
        images: listingImages,
        // Keep existing status - don't auto-approve
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('parking_listings')
        .update(listingData)
        .eq('id', editingListing.id);

      if (error) throw error;

      // Refresh the public listings so changes go live immediately
      try {
        await supabase.rpc('refresh_parking_listings_public');
      } catch (e) {
        console.error('Failed to refresh public listings:', e);
      }

      toast({
        title: "Success",
        description: "Parking listing updated and published live",
      });

      setEditingListing(null);
      fetchParkingListings();
    } catch (error) {
      console.error('Error saving listing:', error);
      toast({
        title: "Error",
        description: "Failed to save listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const sendChatReply = async () => {
    if (!chatReply.trim() || !selectedChatUser) return;

    setSendingReply(true);
    try {
      const { error } = await supabase
        .from('user_messages')
        .insert([{
          user_id: selectedChatUser,
          subject: 'Admin Reply',
          message: chatReply.trim(),
          from_admin: true
        }]);

      if (error) throw error;

      setChatReply('');
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
      
      fetchChatMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setSendingReply(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
      fetchVerifications();
      fetchParkingListings();
      fetchChatMessages();
      fetchChatUsers();
    }
  }, [isAdmin]);

  // Set up real-time subscription for chat messages and admin notifications
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-chat-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_messages'
        },
        (payload) => {
          console.log('Chat message update:', payload);
          
          // Show notification and handle auto-mark-as-read for new user messages
          if (payload.eventType === 'INSERT' && !payload.new.from_admin) {
            if (selectedChatUser === payload.new.user_id) {
              // Admin is viewing this thread: auto-mark read
              markThreadAsRead(payload.new.user_id);
            } else {
              setNewMessageAlert(`New message from user`);
              setTimeout(() => setNewMessageAlert(null), 5000);
            }
          }
          
          // Refresh chat messages and users when there's a change
          fetchChatMessages();
          fetchChatUsers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications'
        },
        (payload) => {
          console.log('New admin notification:', payload);
          
          // Show immediate alert for payment notifications
          if (payload.new.notification_type === 'payment_received') {
            toast({
              title: "💳 Payment Received!",
              description: payload.new.message,
              duration: 8000,
            });
          }
          
          // Update unread notifications count
          setUnreadNotificationsCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, selectedChatUser]);

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <h2 className="text-xl font-semibold">Verifying Admin Access</h2>
            <p className="text-muted-foreground">Checking your admin privileges...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have admin privileges. Contact an administrator for access.
            </p>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* New Message Alert */}
        {newMessageAlert && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">🔔 {newMessageAlert}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setNewMessageAlert(null)}
            >
              ✕
            </Button>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-6 gap-2 h-auto p-2 bg-gradient-to-r from-background to-muted/20 rounded-xl border shadow-sm">
            <TabsTrigger 
              value="content" 
              className="flex flex-col items-center p-3 h-auto text-sm font-medium transition-all hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg"
            >
              <FileText className="h-5 w-5 mb-1" />
              <span className="font-semibold">Content</span>
              <span className="text-xs opacity-70 mt-1">News & Updates</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="parking" 
              className="flex flex-col items-center p-3 h-auto text-sm font-medium transition-all hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg"
            >
              <Car className="h-5 w-5 mb-1" />
              <span className="font-semibold">Parking</span>
              <span className="text-xs opacity-70 mt-1">Spaces & Bookings</span>
            </TabsTrigger>

            <TabsTrigger 
              value="pre-auth" 
              className="flex flex-col items-center p-3 h-auto text-sm font-medium transition-all hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg relative"
            >
              <CreditCard className="h-5 w-5 mb-1" />
              <span className="font-semibold">Pre-Auth</span>
              <span className="text-xs opacity-70 mt-1">Payment Holds</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="users" 
              className="flex flex-col items-center p-3 h-auto text-sm font-medium transition-all hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg"
            >
              <Users className="h-5 w-5 mb-1" />
              <span className="font-semibold">Users</span>
              <span className="text-xs opacity-70 mt-1">Manage & Message</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="chat" 
              className="flex flex-col items-center p-3 h-auto text-sm font-medium transition-all hover:scale-105 data-[state=active]:bg-red-500 data-[state=active]:text-white bg-gradient-to-br from-red-50 to-red-100 border-red-200 animate-pulse rounded-lg relative"
            >
              <MessageCircle className="h-5 w-5 mb-1" />
              <span className="font-bold">🔥 Live Chat</span>
              <span className="text-xs mt-1">Real-time Support</span>
              {chatTotalUnread > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 min-w-[20px] h-5 text-xs px-1">
                  {chatTotalUnread}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="booking-chats" 
              className="flex flex-col items-center p-3 h-auto text-sm font-medium transition-all hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg"
            >
              <MessageCircle className="h-5 w-5 mb-1" />
              <span className="font-semibold">Booking Chats</span>
              <span className="text-xs opacity-70 mt-1">Driver ↔ Owner</span>
            </TabsTrigger>

            <TabsTrigger 
              value="payment-history" 
              className="flex flex-col items-center p-3 h-auto text-sm font-medium transition-all hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg"
            >
              <DollarSign className="h-5 w-5 mb-1" />
              <span className="font-semibold">Payments</span>
              <span className="text-xs opacity-70 mt-1">Owner Payments</span>
            </TabsTrigger>
          </TabsList>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6 mt-6">
            <Tabs defaultValue="notifications" className="w-full">
              <TabsList className="grid w-full grid-cols-2 gap-2 bg-muted/30 p-1">
                <TabsTrigger value="news" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  News Management
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
                  <Bell className="h-4 w-4" />
                  Notifications
                  {unreadNotificationsCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="space-y-6">
                <AdminNotifications isAdmin={isAdmin} />
              </TabsContent>

              <TabsContent value="news" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">News Management</h2>
                  <div className="flex gap-2">
                    <Button onClick={setupAdminAccess} variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Setup Admin Access
                    </Button>
                    <Button onClick={handleCreate} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Post
                    </Button>
                  </div>
                </div>
                {/* Create/Edit News Post Dialog */}
                {(isCreating || editingPost) && (
                  <Dialog open={true} onOpenChange={() => {
                    setIsCreating(false);
                    setEditingPost(null);
                  }}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingPost ? 'Edit News Post' : 'Create New News Post'}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Title */}
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter post title"
                            className="mt-1"
                          />
                        </div>

                        {/* Content */}
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <div className="mt-1">
                            {/* Custom toolbar */}
                            <div id="toolbar" className="bg-gray-50 border rounded-t-md p-2 flex items-center gap-1">
                              <select className="ql-header" defaultValue="">
                                <option value="1">Heading 1</option>
                                <option value="2">Heading 2</option>
                                <option value="3">Heading 3</option>
                                <option value="">Normal</option>
                              </select>
                              <button className="ql-bold" title="Bold"></button>
                              <button className="ql-italic" title="Italic"></button>
                              <button className="ql-underline" title="Underline"></button>
                              <button className="ql-link" title="Link"></button>
                              <button className="ql-list" value="ordered" title="Numbered List"></button>
                              <button className="ql-list" value="bullet" title="Bullet List"></button>
                              <span className="ql-formats">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={handleContentImageUpload}
                                  className="h-8 px-2 text-xs"
                                  title="Insert Image"
                                >
                                  <Upload className="h-3 w-3" />
                                </Button>
                              </span>
                            </div>
                            <ReactQuill
                              theme="snow"
                              value={content}
                              onChange={setContent}
                              placeholder="Enter post content..."
                              style={{ height: '300px', marginBottom: '50px' }}
                              modules={{
                                toolbar: '#toolbar'
                              }}
                            />
                          </div>
                        </div>

                        {/* Tags */}
                        <div>
                          <Label htmlFor="tags">Tags (comma separated)</Label>
                          <Input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Enter tags separated by commas"
                            className="mt-1"
                          />
                        </div>

                        {/* Status */}
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Featured Image */}
                        <div>
                          <Label htmlFor="image">Featured Image</Label>
                          <div className="mt-1 space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleBlogImageUpload}
                                accept="image/*"
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={imageUploading}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Image
                              </Button>
                            </div>
                            <Input
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="Or enter image URL"
                            />
                          </div>
                        </div>

                        {/* SEO Fields */}
                        <div>
                          <Label htmlFor="metaTitle">SEO Title (optional)</Label>
                          <Input
                            id="metaTitle"
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            placeholder="SEO title for search engines"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="metaDescription">SEO Description (optional)</Label>
                          <Textarea
                            id="metaDescription"
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            placeholder="SEO description for search engines"
                            className="mt-1"
                            rows={3}
                          />
                        </div>

                        {/* Publication Date */}
                        <div>
                          <Label htmlFor="publicationDate">Publication Date</Label>
                          <Input
                            id="publicationDate"
                            type="datetime-local"
                            value={publicationDate}
                            onChange={(e) => setPublicationDate(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleSave} className="flex-1">
                            Save Post
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsPreviewMode(true)}
                            className="flex-1"
                          >
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsCreating(false);
                              setEditingPost(null);
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Edit Listing Dialog moved to global position */}

                {/* News Posts List */}
                <Card>
                  <CardHeader>
                    <CardTitle>All News Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">Loading posts...</p>
                      </div>
                    ) : posts.length > 0 ? (
                      <div className="space-y-4">
                        {posts.map((post) => (
                          <div key={post.id} className="border rounded-lg p-4 flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{post.title}</h3>
                                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                  {post.status}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-sm mb-2">
                                Published: {format(new Date(post.publication_date), 'MMM dd, yyyy h:mm a')}
                              </p>
                              {post.image_url && (
                                <img
                                  src={post.image_url}
                                  alt={post.title}
                                  className="w-20 h-20 object-cover rounded mt-2"
                                />
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPost(post);
                                  setTitle(post.title);
                                  setContent(post.content);
                                  setImageUrl(post.image_url || '');
                                  setTags(post.tags?.join(', ') || '');
                                  setStatus(post.status || 'published');
                                  setMetaTitle(post.meta_title || '');
                                  setMetaDescription(post.meta_description || '');
                                  setPublicationDate(post.publication_date.slice(0, 16));
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No news posts found</p>
                        <Button onClick={handleCreate} className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Post
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Parking Management Tab */}
          <TabsContent value="parking" className="space-y-6 mt-6">
            <Tabs defaultValue="spaces" className="w-full">
              <TabsList className="grid w-full grid-cols-3 gap-1 bg-muted/30 p-1">
                <TabsTrigger value="listings" className="flex items-center gap-1 text-xs">
                  <Grid className="h-3 w-3" />
                  Listings
                </TabsTrigger>
                <TabsTrigger value="spaces" className="flex items-center gap-1 text-xs">
                  <Settings className="h-3 w-3" />
                  Spaces
                </TabsTrigger>
                <TabsTrigger value="live-booking" className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  Live Booking
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Parking Listings Management</h2>
                  <Button onClick={fetchParkingListings} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                {parkingListings.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No parking listings found</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {parkingListings.map((listing) => (
                      <Card key={listing.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{listing.title}</CardTitle>
                            <Badge
                              variant={listing.status === 'approved' ? 'default' : 'secondary'}
                              className={listing.status === 'approved' ? 'bg-green-500' : ''}
                            >
                              {listing.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {listing.address} • {listing.zone}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="font-medium text-muted-foreground">Hourly Rate</div>
                              <div>AED {listing.price_per_hour}/hour</div>
                            </div>
                            <div>
                              <div className="font-medium text-muted-foreground">Daily Rate</div>
                              <div>AED {listing.price_per_day}/day</div>
                            </div>
                            <div>
                              <div className="font-medium text-muted-foreground">Monthly Rate</div>
                              <div>AED {listing.price_per_month}/month</div>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            {/* Approve button for pending listings */}
                            {listing.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="default"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => updateListingStatus(listing.id, 'approved')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            
                            {/* Publish Live button for approved listings */}
                            {listing.status === 'approved' && (
                              <Button 
                                size="sm" 
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => updateListingStatus(listing.id, 'published')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Publish Live
                              </Button>
                            )}
                            
                            {/* Unpublish button for published listings */}
                            {listing.status === 'published' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                onClick={() => updateListingStatus(listing.id, 'approved')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Unpublish
                              </Button>
                            )}
                            
                            {/* Reject button for pending listings */}
                            {listing.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => rejectListing(listing)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => startEditingListing(listing)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => deleteListing(listing.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="spaces" className="space-y-6">
                <SpaceManagement />
              </TabsContent>

              <TabsContent value="live-booking" className="space-y-6">
                <LiveBookingControl />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Pre-Authorization Management Tab */}
          <TabsContent value="pre-auth" className="space-y-6 mt-6">
            <PreAuthorizationPanel />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <Tabs defaultValue="verifications" className="w-full">
              <TabsList className="grid w-full grid-cols-3 gap-2 bg-muted/30 p-1">
                <TabsTrigger value="verifications" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Verifications
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send Messages
                </TabsTrigger>
                <TabsTrigger value="management" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User Management
                </TabsTrigger>
              </TabsList>

              <TabsContent value="verifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        User Verifications ({verifications.filter(v => {
                          const matchesSearch = !verificationSearchTerm || 
                            v.id.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                            v.full_name?.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                            v.user_id?.toLowerCase().includes(verificationSearchTerm.toLowerCase());
                          
                          const matchesStatus = verificationStatusFilter === 'all' || 
                            v.verification_status === verificationStatusFilter;
                          
                          return matchesSearch && matchesStatus;
                        }).length})
                      </CardTitle>
                      <Button
                        onClick={fetchVerifications}
                        variant="outline"
                        size="sm"
                        disabled={verificationsLoading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${verificationsLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter Controls */}
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1">
                        <Input
                          placeholder="Search by Verification ID, Full Name, or User ID..."
                          value={verificationSearchTerm}
                          onChange={(e) => setVerificationSearchTerm(e.target.value)}
                          className="max-w-md"
                        />
                      </div>
                      <Select value={verificationStatusFilter} onValueChange={setVerificationStatusFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {verificationsLoading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading verifications...</p>
                      </div>
                    ) : verifications.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No verifications found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {verifications
                          .filter(verification => {
                            const matchesSearch = !verificationSearchTerm || 
                              verification.id.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                              verification.full_name?.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                              verification.user_id?.toLowerCase().includes(verificationSearchTerm.toLowerCase());
                            
                            const matchesStatus = verificationStatusFilter === 'all' || 
                              verification.verification_status === verificationStatusFilter;
                            
                            return matchesSearch && matchesStatus;
                          })
                          .map((verification) => (
                          <Card key={verification.id} className="border">
                            <CardContent className="p-6">
                              <div className="flex flex-col lg:flex-row gap-6">
                                {/* User Info */}
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="font-semibold text-lg">
                                        {verification.full_name}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        {verification.profiles?.email || 'Email not available'}
                                      </p>
                                      {verification.profiles?.phone && (
                                        <p className="text-sm text-muted-foreground">
                                          {verification.profiles.phone}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(verification.verification_status)}
                                      <Badge variant={getStatusBadgeVariant(verification.verification_status)}>
                                        {verification.verification_status.toUpperCase()}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Verification ID with Actions */}
                                  <div className="mb-3 p-2 bg-muted/50 rounded border">
                                    <p className="font-medium text-xs mb-1">Verification ID</p>
                                    <div className="flex items-center gap-2">
                                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                                        {verification.id}
                                      </code>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(verification.id, 'Verification ID')}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openInSupabase(verification.id)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="font-medium">Document Type</p>
                                      <p className="text-muted-foreground">
                                        {verification.document_type.replace('_', ' ').toUpperCase()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Nationality</p>
                                      <p className="text-muted-foreground">
                                        {verification.nationality || 'Not specified'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Submitted</p>
                                      <p className="text-muted-foreground">
                                        {format(new Date(verification.created_at), 'MMM dd, yyyy HH:mm')}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium">User Type</p>
                                      <p className="text-muted-foreground">
                                        {verification.profiles?.user_type || 'Unknown'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2 mt-4">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleViewDocument(verification.id)}
                                      disabled={documentLoading && selectedDocumentId === verification.id}
                                      className="flex-1"
                                    >
                                      <Image className="w-4 h-4 mr-2" />
                                      {documentLoading && selectedDocumentId === verification.id ? 'Loading...' : 'Quick View'}
                                    </Button>

                                    {verification.verification_status === 'pending' && (
                                      <>
                                        <Button
                                          onClick={() => handleVerificationAction(verification.id, 'approved')}
                                          disabled={verificationUpdating === verification.id}
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700 flex-1"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve
                                        </Button>
                                        <Button
                                          onClick={() => handleVerificationAction(verification.id, 'rejected')}
                                          disabled={verificationUpdating === verification.id}
                                          variant="destructive"
                                          size="sm"
                                          className="flex-1"
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                    
                                    <Button
                                      onClick={() => deleteVerification(verification.id)}
                                      disabled={verificationUpdating === verification.id}
                                      variant="outline"
                                      size="sm"
                                      className="border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </Button>
                                    
                                    {verificationUpdating === verification.id && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Processing...
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Document Viewer */}
                                <div className="lg:w-80">
                                  <SecureDocumentViewer
                                    verificationId={verification.id}
                                    documentType={verification.document_type}
                                    fullName={verification.full_name}
                                    verificationStatus={verification.verification_status}
                                    isAdmin={true}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Document View Dialog */}
                <Dialog open={documentViewDialog} onOpenChange={setDocumentViewDialog}>
                  <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>Verification Document</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center items-center p-4">
                      {documentImageUrl && (
                        <img 
                          src={documentImageUrl} 
                          alt="Verification Document" 
                          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                          onError={() => {
                            toast({
                              title: "Error",
                              description: "Failed to load document image",
                              variant: "destructive",
                            });
                          }}
                        />
                      )}
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(documentImageUrl, 'Document URL')}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(documentImageUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="messages" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Send Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">Message sending interface will be here</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="management" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">User management interface will be here</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Live Chat Tab */}
          <TabsContent value="chat" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-red-500" />
                  Live Chat Management
                  {chatTotalUnread > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {chatTotalUnread}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* User List */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Active Conversations</h3>
                    {chatUsers.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No conversations yet</p>
                    ) : (
                       chatUsers.map((user) => (
                         <div
                           key={user.user_id}
                           className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                             selectedChatUser === user.user_id 
                               ? 'bg-primary/10 border-primary' 
                               : 'hover:bg-muted/50'
                           }`}
                           onClick={() => {
                             setSelectedChatUser(user.user_id);
                             markThreadAsRead(user.user_id);
                           }}
                         >
                           <div className="flex items-center justify-between">
                             <div className="flex flex-col min-w-0 flex-1">
                               <span className="font-medium truncate">{user.full_name}</span>
                               {user.last_message_at && (
                                 <span className="text-xs text-muted-foreground">
                                   {new Date(user.last_message_at).toLocaleString()}
                                 </span>
                               )}
                               {user.last_message_preview && (
                                 <span className="text-xs text-muted-foreground mt-1 truncate">
                                   {user.last_message_preview}
                                 </span>
                               )}
                             </div>
                             {user.unread_count > 0 && (
                               <Badge variant="destructive" className="ml-2">
                                 {user.unread_count}
                               </Badge>
                             )}
                           </div>
                         </div>
                       ))
                    )}
                  </div>

                  {/* Chat Messages */}
                  <div className="lg:col-span-2 space-y-4">
                    {selectedChatUser ? (
                      <>
                        <div className="border rounded-lg p-4 h-96 overflow-y-auto space-y-3">
                          {chatMessages
                            .filter(msg => msg.user_id === selectedChatUser)
                            .map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.from_admin ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[80%] p-3 rounded-lg ${
                                    msg.from_admin
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">
                                      {msg.from_admin ? 'Admin' : msg.profiles?.full_name || 'User'}
                                    </span>
                                  </div>
                                  <p className="text-sm">{msg.message}</p>
                                  <p className="text-xs opacity-70 mt-1">
                                    {new Date(msg.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          <div ref={chatMessagesEndRef} />
                        </div>

                        {/* Reply Input */}
                        <div className="flex items-center space-x-2">
                          <Input
                            value={chatReply}
                            onChange={(e) => setChatReply(e.target.value)}
                            placeholder="Type your reply..."
                            onKeyPress={(e) => e.key === 'Enter' && sendChatReply()}
                            className="flex-1"
                          />
                          <Button 
                            onClick={sendChatReply} 
                            disabled={!chatReply.trim() || sendingReply}
                            size="icon"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-96 text-muted-foreground">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Select a conversation to start chatting</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Chats Monitoring Tab */}
          <TabsContent value="booking-chats" className="space-y-6 mt-6">
            <BookingChatsMonitor />
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="payment-history" className="space-y-6 mt-6">
            <PaymentHistoryAdmin />
          </TabsContent>

          {/* Global Edit Parking Listing Dialog - available across all tabs */}
          {editingListing && (
            <Dialog open={true} onOpenChange={() => setEditingListing(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Parking Listing</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Owner Information */}
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <Label className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      Listing Owner
                    </Label>
                    <Input
                      value={editingListing?.owner_name || 'Unknown Owner'}
                      disabled
                      className="bg-background"
                    />
                  </div>

                  {/* Title and Zone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="listingTitle">Title *</Label>
                      <Input
                        id="listingTitle"
                        value={listingTitle}
                        onChange={(e) => setListingTitle(e.target.value)}
                        placeholder="Enter listing title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="listingZone">Zone *</Label>
                      <Select value={listingZone} onValueChange={setListingZone}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select zone" />
                        </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Downtown">Downtown</SelectItem>
                            <SelectItem value="Deira">Deira</SelectItem>
                            <SelectItem value="Business Bay">Business Bay</SelectItem>
                            <SelectItem value="Dubai Marina">Dubai Marina</SelectItem>
                            <SelectItem value="DIFC">DIFC</SelectItem>
                            <SelectItem value="Palm Jumeirah">Palm Jumeirah</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="listingAddress">Address *</Label>
                    <Input
                      id="listingAddress"
                      value={listingAddress}
                      onChange={(e) => setListingAddress(e.target.value)}
                      placeholder="Enter address"
                      className="mt-1"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="listingDescription">Description</Label>
                    <Textarea
                      id="listingDescription"
                      value={listingDescription}
                      onChange={(e) => setListingDescription(e.target.value)}
                      placeholder="Enter listing description"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricePerHour">Price per Hour (AED)</Label>
                      <Input
                        id="pricePerHour"
                        type="number"
                        step="0.01"
                        min="0"
                        value={listingPricePerHour}
                        onChange={(e) => setListingPricePerHour(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pricePerMonth">Price per Month (AED)</Label>
                      <Input
                        id="pricePerMonth"
                        type="number"
                        step="0.01"
                        min="0"
                        value={listingPricePerMonth}
                        onChange={(e) => setListingPricePerMonth(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={listingContactEmail}
                        onChange={(e) => setListingContactEmail(e.target.value)}
                        placeholder="contact@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={listingContactPhone}
                        onChange={(e) => setListingContactPhone(e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Images Management */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Images Management</h3>
                    </div>

                    {/* Current Images */}
                    {listingImages && listingImages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Current Images ({listingImages.length})</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {listingImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Listing image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  const newImages = listingImages.filter((_, i) => i !== index);
                                  setListingImages(newImages);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add New Images */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 space-y-4">
                      <h4 className="font-medium">Add New Images</h4>
                      
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => listingFileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="bg-teal-500 hover:bg-teal-600 text-white border-teal-500"
                        >
                          {uploadingImage ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload (1/5)
                            </>
                          )}
                        </Button>
                        <input
                          type="file"
                          ref={listingFileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="Or paste image URL here"
                          className="flex-1"
                        />
                        <Button
                          onClick={addImageUrl}
                          variant="outline"
                          disabled={!newImageUrl.trim()}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add URL
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveListing} className="flex-1">
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingListing(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanelOrganized;