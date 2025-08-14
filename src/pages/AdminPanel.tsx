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
import { Pencil, Trash2, Plus, CheckCircle, XCircle, FileText, Mail, Upload, X, Eye, Edit, Lightbulb, Camera, Settings, RefreshCw, MessageCircle, Send, LogOut, Home } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/quill.css';

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
  created_at: string;
}

interface ParkingListing {
  id: string;
  title: string;
  description: string;
  address: string;
  zone: string;
  price_per_hour: number;
  price_per_month: number;
  status: string;
  owner_id: string;
  images: string[];
  contact_phone: string;
  contact_email: string;
  created_at: string;
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

const AdminPanel = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const [chatUsers, setChatUsers] = useState<any[]>([]);
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

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  // Set up real-time subscription for bookings
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_bookings'
        },
        (payload) => {
          console.log('=== REAL-TIME BOOKING CHANGE ===', payload);
          console.log('Event type:', payload.eventType);
          console.log('New booking data:', payload.new);
          // Refresh bookings when any change occurs
          fetchParkingBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // Set up real-time subscription for chat messages
  useEffect(() => {
    if (!isAdmin) return;

    console.log('🔄 Setting up real-time chat subscription...');
    
    const chatChannel = supabase
      .channel('admin-chat-changes', {
        config: {
          broadcast: { self: true },
          presence: { key: 'admin' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_messages'
        },
        (payload) => {
          console.log('🔥 REAL-TIME CHAT MESSAGE RECEIVED:', payload);
          console.log('Event type:', payload.eventType);
          console.log('Message data:', payload.new);
          
          // Play notification sound for new client messages
          if (payload.eventType === 'INSERT' && !payload.new.from_admin) {
            playNotificationSound();
            // Show browser notification
            showBrowserNotification(payload.new);
            
            // Show visual alert
            setNewMessageAlert(`New message from user: ${payload.new.message.substring(0, 30)}...`);
            setTimeout(() => setNewMessageAlert(null), 5000);
            
            // Auto-select the user if no user is currently selected
            if (!selectedChatUser) {
              setSelectedChatUser(payload.new.user_id);
            }
          }
          
          // Immediately refresh chat data when new message arrives
          setTimeout(() => {
            console.log('📱 Refreshing chat data...');
            fetchChatMessages();
            fetchChatUsers();
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('💡 Chat channel subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up chat subscription...');
      supabase.removeChannel(chatChannel);
    };
  }, [isAdmin]);

  // Sound notification function
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp3Z5REAtuqOXuul8eBS2Q2O/JdCgELITO8tiJOAgoaLvt559NEAxPqOPwtmMcBjiS2fLOeS0GJ');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Sound notification failed:', error);
    }
  };

  // Browser notification function
  const showBrowserNotification = (messageData: any) => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification('New Chat Message', {
        body: `${messageData.message.substring(0, 50)}...`,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('New Chat Message', {
            body: `${messageData.message.substring(0, 50)}...`,
            icon: '/favicon.ico'
          });
        }
      });
    }
  };

  const scrollChatToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollChatToBottom();
    }
  }, [chatMessages]);

  const checkAdminRole = async () => {
    if (!user) {
      console.log('No user found for admin check');
      return;
    }
    
    try {
      console.log('Checking admin role for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin role:', error);
      }
      
      console.log('Admin role check result:', data);
      const isAdminUser = !!data;
      
      // If no admin role found, try to set up as admin (for first-time setup)
      if (!isAdminUser) {
        console.log('No admin role found, attempting to set up admin...');
        try {
          const { error: setupError } = await supabase.functions.invoke('setup-admin');
          if (!setupError) {
            console.log('Admin setup successful, rechecking role...');
            // Recheck admin role after setup
            const { data: recheckData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .single();
            
            if (recheckData) {
              setIsAdmin(true);
              console.log('User is now admin, fetching admin data...');
              fetchPosts();
              fetchVerifications();
              fetchParkingListings();
              fetchParkingBookings();
              fetchAllUsers();
              fetchDetailedUsers();
            }
          }
        } catch (setupErr) {
          console.error('Admin setup failed:', setupErr);
        }
      } else {
        setIsAdmin(isAdminUser);
        
        if (isAdminUser) {
          console.log('User is admin, fetching admin data...');
          fetchPosts();
          fetchVerifications();
          fetchParkingListings();
          fetchParkingBookings();
          fetchAllUsers();
          fetchDetailedUsers();
          fetchChatMessages();
          fetchChatUsers();
          fetchChatMessages();
          fetchChatUsers();
        }
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Admin logging out...');
      await signOut();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      // Force page refresh to clear all auth state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Error logging out",
        variant: "destructive",
      });
      // Force clear auth state even if signOut fails
      localStorage.clear();
      window.location.href = '/auth';
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('publication_date', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched news posts:', data);
      console.log('Number of posts:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('First post content preview:', data[0].content.substring(0, 100));
      }
      setPosts(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch news posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('user_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch verifications",
        variant: "destructive",
      });
    } finally {
      setVerificationsLoading(false);
    }
  };

  const fetchParkingListings = async () => {
    try {
      // Fetch ALL listings without status filter to see everything
      const { data, error } = await supabase
        .from('parking_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched all parking listings:', data);
      setParkingListings(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch parking listings",
        variant: "destructive",
      });
    } finally {
      setListingsLoading(false);
    }
  };

  const updateListingStatus = async (listingId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('parking_listings')
        .update({ status })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Listing ${status} successfully`,
      });

      fetchParkingListings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update listing status",
        variant: "destructive",
      });
    }
  };

  const handleEditListing = (listing: ParkingListing) => {
    setEditingListing(listing);
    setListingTitle(listing.title);
    setListingDescription(listing.description || '');
    setListingAddress(listing.address);
    setListingZone(listing.zone);
    setListingPricePerHour(listing.price_per_hour);
    setListingPricePerMonth(listing.price_per_month);
    setListingContactEmail(listing.contact_email || '');
    setListingContactPhone(listing.contact_phone || '');
    setListingImages(listing.images || []);
    setNewImageUrl('');
  };

  const resetListingForm = () => {
    setEditingListing(null);
    setListingTitle('');
    setListingDescription('');
    setListingAddress('');
    setListingZone('');
    setListingPricePerHour(0);
    setListingPricePerMonth(0);
    setListingContactEmail('');
    setListingContactPhone('');
    setListingImages([]);
    setNewImageUrl('');
  };

  const addImageToListing = () => {
    if (!newImageUrl.trim()) return;
    
    // Check if already at max images (5)
    if (listingImages.length >= 5) {
      toast({
        title: "Error",
        description: "Maximum 5 images allowed per listing",
        variant: "destructive",
      });
      return;
    }
    
    // Check if image URL is already added
    if (listingImages.includes(newImageUrl.trim())) {
      toast({
        title: "Error",
        description: "This image URL is already added",
        variant: "destructive",
      });
      return;
    }
    
    setListingImages([...listingImages, newImageUrl.trim()]);
    setNewImageUrl('');
    toast({
      title: "Success",
      description: "Image URL added successfully",
    });
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `parking-listings/${fileName}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('parking-images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('parking-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if already at max images (5)
    if (listingImages.length >= 5) {
      toast({
        title: "Error",
        description: "Maximum 5 images allowed per listing",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = await uploadImageToStorage(file);
    if (imageUrl) {
      setListingImages([...listingImages, imageUrl]);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    }

    // Reset file input
    if (listingFileInputRef.current) {
      listingFileInputRef.current.value = '';
    }
  };

  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      // Extract file path from URL - handle both full URLs and relative paths
      let filePath = '';
      if (imageUrl.includes('supabase.co')) {
        // Full Supabase URL
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        filePath = `parking-listings/${fileName}`;
      } else if (imageUrl.includes('parking-listings/')) {
        // Already contains parking-listings path
        filePath = imageUrl.split('parking-listings/')[1];
        filePath = `parking-listings/${filePath}`;
      } else {
        // Just filename
        const fileName = imageUrl.split('/').pop() || '';
        filePath = `parking-listings/${fileName}`;
      }

      // Delete from storage
      const { error } = await supabase.storage
        .from('parking-images')
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Success", 
        description: "Image deleted from storage",
      });
    } catch (error) {
      console.error('Error deleting image from storage:', error);
      // Still remove from UI even if storage deletion fails
    }
  };

  const removeImageFromListing = async (imageUrl: string) => {
    // Confirm deletion
    if (confirm('Are you sure you want to delete this image? This will permanently remove it from storage.')) {
      // Remove from UI first
      setListingImages(listingImages.filter(img => img !== imageUrl));
      
      // Delete from storage if it's a Supabase storage URL
      if (imageUrl.includes('supabase')) {
        await deleteImageFromStorage(imageUrl);
      }
    }
  };

  const handleSaveListing = async () => {
    if (!editingListing) return;

    if (!listingTitle.trim() || !listingAddress.trim() || !listingZone.trim()) {
      toast({
        title: "Error",
        description: "Title, address, and zone are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const listingData = {
        title: listingTitle.trim(),
        description: listingDescription.trim() || null,
        address: listingAddress.trim(),
        zone: listingZone.trim(),
        price_per_hour: listingPricePerHour,
        price_per_month: listingPricePerMonth,
        contact_email: listingContactEmail.trim() || null,
        contact_phone: listingContactPhone.trim() || null,
        images: listingImages.length > 0 ? listingImages : null,
      };

      const { error } = await supabase
        .from('parking_listings')
        .update(listingData)
        .eq('id', editingListing.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Parking listing updated successfully",
      });

      resetListingForm();
      fetchParkingListings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update parking listing",
        variant: "destructive",
      });
    }
  };

  const fetchParkingBookings = async () => {
    setBookingsLoading(true);
    
    try {
      console.log('Fetching parking bookings...');
      
      // Fetch bookings first
      const { data: bookings, error: bookingsError } = await supabase
        .from('parking_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Get user profiles separately
      const userIds = [...new Set(bookings?.map(b => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .in('user_id', userIds);

      // Combine bookings with profile data
      const processedBookings = bookings?.map(booking => ({
        ...booking,
        userEmail: 'Email not available', // Fallback since we can't access auth.admin from client
        profiles: profiles?.find(p => p.user_id === booking.user_id) || { full_name: 'Unknown User', phone: null }
      }));
      
      setParkingBookings(processedBookings as any);
      console.log('Processed bookings count:', processedBookings?.length || 0);
      
    } catch (error) {
      console.error('Error in fetchParkingBookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch parking bookings",
        variant: "destructive",
      });
    } finally {
      setBookingsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      // Find the booking to get user details
      const booking = parkingBookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const { error } = await supabase
        .from('parking_bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      // Send email notification to customer based on status
      if (booking.userEmail) {
        try {
          if (status === 'confirmed') {
            await supabase.functions.invoke('send-booking-confirmed', {
              body: {
                userEmail: booking.userEmail,
                userName: booking.profiles?.full_name || 'Customer',
                bookingDetails: {
                  id: booking.id,
                  location: booking.location,
                  zone: booking.zone,
                  startTime: booking.start_time,
                  endTime: booking.end_time,
                  cost: booking.cost_aed
                }
              },
            });
          } else if (status === 'cancelled') {
            await supabase.functions.invoke('send-booking-rejected', {
              body: {
                userEmail: booking.userEmail,
                userName: booking.profiles?.full_name || 'Customer',
                bookingDetails: {
                  id: booking.id,
                  location: booking.location,
                  zone: booking.zone,
                  startTime: booking.start_time,
                  endTime: booking.end_time,
                  cost: booking.cost_aed
                }
              },
            });
          } else {
            // For completed status, use message notification
            await supabase.functions.invoke('send-message-notification', {
              body: {
                userEmail: booking.userEmail,
                userName: booking.profiles?.full_name || 'Customer',
                subject: `Booking Completed`,
                message: `Your parking booking has been marked as completed.\n\nBooking Details:\nLocation: ${booking.location}\nZone: ${booking.zone}\nStart: ${format(new Date(booking.start_time), 'MMM d, yyyy h:mm a')}\nEnd: ${format(new Date(booking.end_time), 'MMM d, yyyy h:mm a')}\nCost: AED ${booking.cost_aed}`,
              },
            });
          }
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }

      toast({
        title: "Success",
        description: `Booking ${status} successfully and customer notified`,
      });

      fetchParkingBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this parking listing? This action cannot be undone.')) {
      return;
    }

    try {
      // First, get the listing to access its images
      const { data: listing, error: fetchError } = await supabase
        .from('parking_listings')
        .select('images')
        .eq('id', listingId)
        .single();

      if (fetchError) throw fetchError;

      // Delete images from storage if they exist
      if (listing?.images && listing.images.length > 0) {
        for (const imageUrl of listing.images) {
          if (imageUrl.includes('supabase')) {
            await deleteImageFromStorage(imageUrl);
          }
        }
      }

      // Delete the listing from database
      const { error } = await supabase
        .from('parking_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Parking listing deleted successfully",
      });

      fetchParkingListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete parking listing",
        variant: "destructive",
      });
    }
  };

  const fetchChatMessages = async () => {
    try {
      console.log('🔄 Fetching chat messages...');
      setChatLoading(true);
      const { data: messages, error } = await supabase
        .from('user_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      console.log('💬 Fetched messages count:', messages?.length || 0);
      if (messages && messages.length > 0) {
        console.log('📝 Latest message:', messages[messages.length - 1]);
      }

      // Get user profiles separately
      const userIds = [...new Set(messages?.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      // Combine messages with profiles
      const messagesWithProfiles = messages?.map(msg => ({
        ...msg,
        profiles: profiles?.find(p => p.user_id === msg.user_id) || { full_name: 'Unknown User', user_id: msg.user_id }
      })) || [];

      console.log('👥 Messages with profiles:', messagesWithProfiles.length);
      setChatMessages(messagesWithProfiles);
    } catch (error) {
      console.error('❌ Error fetching chat messages:', error);
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
      const { data: messages, error } = await supabase
        .from('user_messages')
        .select('user_id, from_admin, read_status')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles
      const userIds = [...new Set(messages?.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);
      
      // Get unique users with unread counts
      const uniqueUsers = userIds.map(userId => {
        const profile = profiles?.find(p => p.user_id === userId);
        const unreadCount = messages?.filter(msg => 
          msg.user_id === userId && 
          !msg.from_admin && 
          !msg.read_status
        ).length || 0;

        return {
          user_id: userId,
          full_name: profile?.full_name || 'Unknown User',
          unread_count: unreadCount
        };
      });

      setChatUsers(uniqueUsers);
    } catch (error) {
      console.error('Error fetching chat users:', error);
    }
  };

  const sendChatReply = async () => {
    if (!chatReply.trim() || !selectedChatUser) return;

    try {
      setSendingReply(true);
      const { error } = await supabase
        .from('user_messages')
        .insert({
          user_id: selectedChatUser,
          subject: 'Admin Reply',
          message: chatReply,
          from_admin: true
        });

      if (error) throw error;

      setChatReply('');
      fetchChatMessages();
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
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

  const markChatAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('user_messages')
        .update({ read_status: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      // Get all profiles to show in user selection
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchDetailedUsers = async () => {
    try {
      setDetailedUsersLoading(true);
      
      // Get detailed user information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get booking counts for each user
      const { data: bookings, error: bookingsError } = await supabase
        .from('parking_bookings')
        .select('user_id');

      if (bookingsError) throw bookingsError;

      // Get listing counts for each user
      const { data: listings, error: listingsError } = await supabase
        .from('parking_listings')
        .select('owner_id');

      if (listingsError) throw listingsError;

      // Get message counts for each user
      const { data: messages, error: messagesError } = await supabase
        .from('user_messages')
        .select('user_id');

      if (messagesError) throw messagesError;

      // Count bookings, listings, and messages per user
      const bookingCounts: Record<string, number> = {};
      const listingCounts: Record<string, number> = {};
      const messageCounts: Record<string, number> = {};

      bookings?.forEach(booking => {
        bookingCounts[booking.user_id] = (bookingCounts[booking.user_id] || 0) + 1;
      });

      listings?.forEach(listing => {
        listingCounts[listing.owner_id] = (listingCounts[listing.owner_id] || 0) + 1;
      });

      messages?.forEach(message => {
        messageCounts[message.user_id] = (messageCounts[message.user_id] || 0) + 1;
      });

      // Combine all data
      const enrichedUsers = profiles?.map(profile => ({
        ...profile,
        bookings: bookingCounts[profile.user_id] || 0,
        listings: listingCounts[profile.user_id] || 0,
        messages: messageCounts[profile.user_id] || 0,
        status: 'offline' // Since we can't track real-time status easily
      })) || [];

      setDetailedUsers(enrichedUsers);

      // Calculate stats
      const totalUsers = enrichedUsers.length;
      const parkingOwners = enrichedUsers.filter(user => user.user_type === 'owner').length;
      const parkingSeekers = enrichedUsers.filter(user => user.user_type === 'seeker').length;

      setUserStats({
        totalUsers,
        onlineUsers: 0, // Would need real-time tracking
        parkingOwners,
        parkingSeekers
      });

    } catch (error) {
      console.error('Error fetching detailed users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
    } finally {
      setDetailedUsersLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Note: In a production app, you might want to handle this differently
      // For now, we'll just delete the profile (the auth user would remain)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchDetailedUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = detailedUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = userFilter === 'all' || 
      (userFilter === 'owners' && user.user_type === 'owner') ||
      (userFilter === 'seekers' && user.user_type === 'seeker');
    
    return matchesSearch && matchesFilter;
  });

  const filteredBookings = parkingBookings.filter(booking => {
    if (!bookingStatusFilter) return true;
    return booking.status === bookingStatusFilter;
  });

  const updateVerificationStatus = async (verificationId: string, status: 'verified' | 'rejected') => {
    try {
      setVerificationUpdating(verificationId);
      console.log(`Updating verification ${verificationId} to status: ${status}`);

      // Get verification details before updating
      const { data: verification, error: fetchError } = await supabase
        .from('user_verifications')
        .select('user_id, full_name')
        .eq('id', verificationId)
        .single();

      if (fetchError) {
        console.error('Error fetching verification:', fetchError);
        throw fetchError;
      }

      console.log('Verification data:', verification);

      // Update verification status first
      const { error: updateError } = await supabase
        .from('user_verifications')
        .update({ verification_status: status })
        .eq('id', verificationId);

      if (updateError) {
        console.error('Error updating verification status:', updateError);
        throw updateError;
      }

      console.log('Verification status updated successfully');

      // Get user email from profiles table first, then fallback to auth
      let userEmail = '';
      let userName = verification.full_name;

      try {
        // Try to get email from auth
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(verification.user_id);
        if (authError) {
          console.error('Error getting user from auth:', authError);
        } else {
          userEmail = authData.user.email || '';
        }
      } catch (authErr) {
        console.error('Auth API error:', authErr);
      }

      if (userEmail) {
        // Send notification to user
        try {
          const { data: functionResponse, error: functionError } = await supabase.functions.invoke('send-verification-approval', {
            body: {
              userId: verification.user_id,
              userEmail: userEmail,
              userName: userName,
              isApproved: status === 'verified'
            }
          });

          if (functionError) {
            console.error('Function invocation error:', functionError);
          } else {
            console.log('Notification function called successfully:', functionResponse);
          }
        } catch (funcErr) {
          console.error('Error calling notification function:', funcErr);
        }
      }

      toast({
        title: "Success",
        description: `Verification ${status} successfully. ${userEmail ? 'User has been notified.' : 'Note: Could not send notification email.'}`,
      });

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

  const sendMessage = async () => {
    if (!selectedUserId || !messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setMessageSending(true);
      console.log(`Sending message to user: ${selectedUserId}`);

      // Insert message into database
      const { error: dbError } = await supabase
        .from('user_messages')
        .insert([{
          user_id: selectedUserId,
          from_admin: true,
          subject: messageSubject,
          message: messageContent,
        }]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      console.log('Message inserted into database successfully');

      // Get user details for email notification
      let userName = 'User';
      let userEmail = '';

      try {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', selectedUserId)
          .maybeSingle();

        if (userData && userData.full_name) {
          userName = userData.full_name;
        }

        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(selectedUserId);
        if (authError) {
          console.error('Auth error:', authError);
        } else {
          userEmail = authData.user.email || '';
        }
      } catch (err) {
        console.error('Error getting user details:', err);
      }

      // Send email notification if we have an email
      if (userEmail) {
        try {
          const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-message-notification', {
            body: {
              userEmail: userEmail,
              userName: userName,
              subject: messageSubject,
              message: messageContent,
            },
          });

          if (emailError) {
            console.error('Email notification failed:', emailError);
          } else {
            console.log('Email notification sent successfully:', emailResponse);
          }
        } catch (emailErr) {
          console.error('Error sending email notification:', emailErr);
        }
      }

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setMessageSubject('');
      setMessageContent('');
      setSelectedUserId('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setMessageSending(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setPublicationDate('');
    setTags('');
    setStatus('published');
    setMetaTitle('');
    setMetaDescription('');
    setEditingPost(null);
    setIsCreating(false);
    setIsPreviewMode(false);
    setImageFile(null);
  };

  const handleEdit = (post: NewsPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.image_url || '');
    setPublicationDate(format(new Date(post.publication_date), "yyyy-MM-dd'T'HH:mm"));
    setTags(post.tags?.join(', ') || '');
    setStatus(post.status || 'published');
    setMetaTitle(post.meta_title || '');
    setMetaDescription(post.meta_description || '');
    setIsCreating(false);
    setIsPreviewMode(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPost(null);
    setTitle('');
    setContent('');
    setImageUrl('');
    setPublicationDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setTags('');
    setStatus('published');
    setMetaTitle('');
    setMetaDescription('');
    setIsPreviewMode(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "Image size must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPG, PNG, and WebP images are allowed",
        variant: "destructive",
      });
      return;
    }

    try {
      setImageUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
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

  const setupAdminAccess = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('setup-admin');
      
      if (error) {
        console.error('Setup admin error:', error);
        toast({
          title: "Error",
          description: "Failed to set up admin access",
          variant: "destructive",
        });
        return;
      }

      console.log('Setup admin response:', data);
      toast({
        title: "Success", 
        description: "Admin access set up successfully. Please refresh the page.",
      });
    } catch (error) {
      console.error('Setup admin error:', error);
      toast({
        title: "Error",
        description: "Failed to set up admin access",
        variant: "destructive",
      });
    }
  };

  // Helper function to strip HTML and create excerpt
  const createExcerpt = (htmlContent: string, maxLength: number = 150) => {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return 'No content available';
    }
    
    // Remove HTML tags including img tags and their base64 content
    let textContent = htmlContent.replace(/<img[^>]*>/gi, '');
    textContent = textContent.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    textContent = textContent.replace(/&nbsp;/g, ' ');
    textContent = textContent.replace(/&amp;/g, '&');
    textContent = textContent.replace(/&lt;/g, '<');
    textContent = textContent.replace(/&gt;/g, '>');
    textContent = textContent.replace(/&quot;/g, '"');
    
    // Remove extra whitespace and line breaks
    const cleanText = textContent.replace(/\s+/g, ' ').trim();
    
    // Return empty message if no content
    if (!cleanText) {
      return 'No text content available';
    }
    
    // Truncate if needed
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength).trim() + '...';
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'image', 'align'
  ];

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
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const postData = {
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        publication_date: publicationDate || new Date().toISOString(),
        tags: tagsArray.length > 0 ? tagsArray : null,
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

      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Save post error:', error);
      toast({
        title: "Error", 
        description: `Failed to save news post: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news post?')) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "News post deleted successfully",
      });
      
      fetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete news post",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-xl font-semibold">Admin Access Required</h2>
            <p className="text-muted-foreground">Please log in to access the admin panel.</p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-xl font-semibold">Verifying Admin Access</h2>
            <p className="text-muted-foreground">Checking your admin privileges...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkingAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('=== ADMIN PANEL RENDER DEBUG ===');
  console.log('isAdmin:', isAdmin);
  console.log('checkingAdmin:', checkingAdmin);
  console.log('user:', user?.email);
  console.log('Current URL:', window.location.href);

  // Add a simple alert to test if this component is loading
  if (typeof window !== 'undefined') {
    console.log('AdminPanel component is rendering');
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* New Message Alert */}
        {newMessageAlert && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">🔔 {newMessageAlert}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setNewMessageAlert(null)}
              className="text-green-700 hover:text-green-900"
            >
              ✕
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
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
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="flex flex-wrap w-full gap-1 h-auto p-2">
            <TabsTrigger value="news" className="text-xs lg:text-sm">News Management</TabsTrigger>
            <TabsTrigger value="listings" className="text-xs lg:text-sm">Parking Listings</TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs lg:text-sm">Booking Management</TabsTrigger>
            <TabsTrigger value="verifications" className="text-xs lg:text-sm">User Verifications</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs lg:text-sm">Send Messages</TabsTrigger>
            <TabsTrigger value="users" className="text-xs lg:text-sm">User Management</TabsTrigger>
            <TabsTrigger value="chat" className="text-sm font-bold bg-red-500 text-white px-4 py-2 rounded border-2 border-red-700 animate-pulse">
              <MessageCircle className="h-4 w-4 mr-2" />
              🔥 LIVE CHAT 🔥
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">News Management</h2>
              <div className="flex gap-2">
                <Button onClick={setupAdminAccess} variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Setup Admin Access
                </Button>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Post
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              {(isCreating || editingPost) && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingPost ? 'Edit News Post' : 'Create New News Post'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter post title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Content</Label>
                      <div className="min-h-[300px]">
                        <ReactQuill
                          theme="snow"
                          value={content}
                          onChange={setContent}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Enter post content..."
                          style={{ height: '250px', marginBottom: '50px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Enter tags separated by commas"
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">Featured Image</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={imageUploading}
                            className="flex items-center gap-2"
                            size="sm"
                            variant="outline"
                          >
                            <Upload className="h-4 w-4" />
                            {imageUploading ? 'Uploading...' : 'Upload Image'}
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImageFile(file);
                                handleImageUpload(file);
                              }
                            }}
                            className="hidden"
                          />
                        </div>
                        <Input
                          id="imageUrl"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="Or enter image URL"
                        />
                        {imageUrl && (
                          <div className="relative w-32 h-20">
                            <img
                              src={imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover rounded border"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute -top-1 -right-1 h-6 w-6 p-0"
                              onClick={() => setImageUrl('')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="metaTitle">SEO Title (optional)</Label>
                      <Input
                        id="metaTitle"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="SEO title for search engines"
                      />
                    </div>

                    <div>
                      <Label htmlFor="metaDescription">SEO Description (optional)</Label>
                      <Textarea
                        id="metaDescription"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="SEO description for search engines"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="publicationDate">Publication Date</Label>
                      <Input
                        id="publicationDate"
                        type="datetime-local"
                        value={publicationDate}
                        onChange={(e) => setPublicationDate(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave}>
                        Save Post
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                      >
                        {isPreviewMode ? 'Edit' : 'Preview'}
                      </Button>
                      <Button variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>

                    {/* Preview Mode */}
                    {isPreviewMode && (
                      <div className="mt-6 p-6 border rounded-lg bg-muted/50">
                        <h3 className="text-lg font-semibold mb-4">Preview</h3>
                        <div className="bg-white p-6 rounded border">
                          <h1 className="text-3xl font-bold mb-4">{title}</h1>
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={title}
                              className="w-full max-w-2xl h-64 object-cover rounded mb-6"
                            />
                          )}
                          <div 
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: content }}
                          />
                          {tags && (
                            <div className="mt-6 flex flex-wrap gap-2">
                              {tags.split(',').map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Posts List Section */}
              <div className={`space-y-4 ${(isCreating || editingPost) ? '' : 'lg:col-span-2'}`}>
                <h3 className="text-xl font-semibold mb-4">All News Posts</h3>
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">No news posts found.</p>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold mb-2">{post.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Published: {format(new Date(post.publication_date), 'PPP p')}
                            </p>
                            {post.image_url && (
                              <img 
                                src={post.image_url} 
                                alt={post.title}
                                className="w-32 h-20 object-cover rounded mb-2"
                              />
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {createExcerpt(post.content)}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(post)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(post.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Parking Listings</h2>
              {editingListing && (
                <Button variant="outline" onClick={resetListingForm}>
                  Cancel Edit
                </Button>
              )}
            </div>

            {editingListing && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Edit Parking Listing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="listingTitle">Title *</Label>
                      <Input
                        id="listingTitle"
                        value={listingTitle}
                        onChange={(e) => setListingTitle(e.target.value)}
                        placeholder="Enter listing title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="listingZone">Zone *</Label>
                      <Select value={listingZone} onValueChange={setListingZone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dubai Marina">Dubai Marina</SelectItem>
                          <SelectItem value="Business Bay">Business Bay</SelectItem>
                          <SelectItem value="DIFC">DIFC</SelectItem>
                          <SelectItem value="Downtown">Downtown</SelectItem>
                          <SelectItem value="Deira">Deira</SelectItem>
                          <SelectItem value="Palm Jumeirah">Palm Jumeirah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="listingAddress">Address *</Label>
                    <Input
                      id="listingAddress"
                      value={listingAddress}
                      onChange={(e) => setListingAddress(e.target.value)}
                      placeholder="Enter full address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="listingDescription">Description</Label>
                    <Textarea
                      id="listingDescription"
                      value={listingDescription}
                      onChange={(e) => setListingDescription(e.target.value)}
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="listingPricePerHour">Price per Hour (AED)</Label>
                      <Input
                        id="listingPricePerHour"
                        type="number"
                        value={listingPricePerHour}
                        onChange={(e) => setListingPricePerHour(Number(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="listingPricePerMonth">Price per Month (AED)</Label>
                      <Input
                        id="listingPricePerMonth"
                        type="number"
                        value={listingPricePerMonth}
                        onChange={(e) => setListingPricePerMonth(Number(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="listingContactEmail">Contact Email</Label>
                      <Input
                        id="listingContactEmail"
                        type="email"
                        value={listingContactEmail}
                        onChange={(e) => setListingContactEmail(e.target.value)}
                        placeholder="Enter contact email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="listingContactPhone">Contact Phone</Label>
                      <Input
                        id="listingContactPhone"
                        value={listingContactPhone}
                        onChange={(e) => setListingContactPhone(e.target.value)}
                        placeholder="Enter contact phone"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Images Management
                    </Label>
                    <div className="space-y-4 mt-3">
                      {listingImages.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Current Images ({listingImages.length})</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {listingImages.map((imageUrl, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={imageUrl} 
                                  alt={`Image ${index + 1}`}
                                  className="w-full h-24 object-cover rounded border cursor-pointer"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded flex items-center justify-center">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                    onClick={() => removeImageFromListing(imageUrl)}
                                    title="Delete image"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Add New Images</h4>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => listingFileInputRef.current?.click()}
                              disabled={uploadingImage || listingImages.length >= 5}
                              className="flex items-center gap-2"
                              size="sm"
                            >
                              <Upload className="h-4 w-4" />
                              {uploadingImage ? 'Uploading...' : `Upload (${listingImages.length}/5)`}
                            </Button>
                            <input
                              ref={listingFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Input
                              value={newImageUrl}
                              onChange={(e) => setNewImageUrl(e.target.value)}
                              placeholder="Or paste image URL here"
                              className="flex-1"
                            />
                            <Button onClick={addImageToListing} variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Add URL
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <p className="font-medium mb-1 text-blue-900 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Image Management Features:
                        </p>
                        <ul className="space-y-1 text-xs text-blue-700">
                          <li>• <strong>Upload:</strong> Click "Upload from Computer" to add images directly</li>
                          <li>• <strong>Delete:</strong> Hover over any image and click the X button to remove it</li>
                          <li>• <strong>View:</strong> Click on any image to open it in a new tab</li>
                          <li>• <strong>URL:</strong> You can also add images by pasting URLs</li>
                          <li>• <strong>Storage:</strong> All images are stored in Supabase database</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveListing}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={resetListingForm}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {listingsLoading ? (
              <div className="text-center py-8">
                <p>Loading all parking listings from database...</p>
              </div>
            ) : parkingListings.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No parking listings found in database.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📊 Database Statistics</h3>
                  <p className="text-blue-700 text-sm">
                    Total listings in database: <strong>{parkingListings.length}</strong>
                  </p>
                  <div className="mt-2 flex gap-4 text-xs text-blue-600">
                    <span>Approved: {parkingListings.filter(l => l.status === 'approved').length}</span>
                    <span>Pending: {parkingListings.filter(l => l.status === 'pending').length}</span>
                    <span>Rejected: {parkingListings.filter(l => l.status === 'rejected').length}</span>
                  </div>
                </div>
                
                {parkingListings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{listing.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {listing.address}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Zone: {listing.zone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Hourly: {listing.price_per_hour} AED | Monthly: {listing.price_per_month} AED
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Contact: {listing.contact_email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {listing.contact_phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {format(new Date(listing.created_at), 'PPP p')}
                          </p>
                          <Badge variant={
                            listing.status === 'approved' ? 'default' :
                            listing.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {listing.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium">Images:</h5>
                          {listing.images && listing.images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {listing.images.slice(0, 4).map((imageUrl, index) => (
                                <div key={index} className="relative">
                                  <img 
                                    src={imageUrl} 
                                    alt={`Listing ${index + 1}`}
                                    className="w-full h-20 object-cover rounded border cursor-pointer"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                  />
                                </div>
                              ))}
                              {listing.images.length > 4 && (
                                <div className="flex items-center justify-center text-xs text-muted-foreground bg-gray-100 rounded border h-20">
                                  +{listing.images.length - 4} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No images</p>
                          )}
                          <div className="mt-2">
                            <a 
                              href={`https://supabase.com/dashboard/project/eoknluyunximjlsnyceb/storage/buckets/parking-images`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View in Database Storage →
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleEditListing(listing)}
                            className="flex items-center gap-2"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit Listing
                          </Button>
                          
                          {listing.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => updateListingStatus(listing.id, 'approved')}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => updateListingStatus(listing.id, 'rejected')}
                                className="flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Decline
                              </Button>
                            </>
                          )}
                          
                          <Button
                            variant="outline"
                            onClick={() => setSelectedUserId(listing.owner_id)}
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Contact Owner
                          </Button>
                          
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteListing(listing.id)}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Listing
                          </Button>
                        </div>
                      </div>
                      
                      {listing.description && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium mb-2">Description:</h5>
                          <p className="text-sm">{listing.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Admin Panel</h2>
              <Button 
                variant="outline" 
                onClick={fetchParkingBookings}
                disabled={bookingsLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            <p className="text-muted-foreground">Manage parking bookings, listings, and users</p>

            <div className="flex items-center gap-4 mb-6">
              <Select 
                value={bookingStatusFilter || 'all'} 
                onValueChange={(value) => setBookingStatusFilter(value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {filteredBookings.length} bookings
              </span>
            </div>

            {bookingsLoading ? (
              <div className="text-center py-8">
                <p>Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bookings found{bookingStatusFilter ? ` with status "${bookingStatusFilter}"` : ''}.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking: any) => (
                  <Card key={booking.id} className="border border-border">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-xl">{booking.location}</h3>
                            <Badge 
                              variant="secondary"
                              className={`${
                                booking.status === 'pending' 
                                  ? 'bg-orange-100 text-orange-800' 
                                  : booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-4 py-2"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Confirm
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="flex items-center gap-1 px-4 py-2"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4" />
                              Deny
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedUserId(booking.user_id);
                                setMessageSubject(`Booking Update - ${booking.location}`);
                                setMessageContent(`Hello ${booking.profiles?.full_name || 'Customer'},\n\nRegarding your parking booking:\n\nLocation: ${booking.location}\nZone: ${booking.zone}\nStart: ${format(new Date(booking.start_time), 'MMM d, yyyy h:mm a')}\nEnd: ${format(new Date(booking.end_time), 'MMM d, yyyy h:mm a')}\nCost: AED ${booking.cost_aed}\n\nBest regards,\nShazam Parking Team`);
                                const messagesTab = document.querySelector('[value="messages"]') as HTMLElement;
                                messagesTab?.click();
                              }}
                              className="flex items-center gap-1 px-4 py-2"
                              size="sm"
                            >
                              <Mail className="h-4 w-4" />
                              Message
                            </Button>
                          </div>
                        </div>
                        
                        {/* Zone and Customer Info */}
                        <p className="text-sm text-muted-foreground">
                          Zone: {booking.zone} • Customer: {booking.profiles?.full_name || 'mg'} (N/A)
                        </p>
                        
                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-4 gap-8 pt-2">
                          <div>
                            <p className="font-medium text-sm mb-1">Start Time</p>
                            <p className="text-sm text-muted-foreground">{format(new Date(booking.start_time), 'dd.MM.yyyy, HH:mm:ss')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm mb-1">End Time</p>
                            <p className="text-sm text-muted-foreground">{format(new Date(booking.end_time), 'dd.MM.yyyy, HH:mm:ss')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm mb-1">Duration</p>
                            <p className="text-sm text-muted-foreground">{booking.duration_hours} hours</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm mb-1">Cost</p>
                            <p className="text-sm text-muted-foreground">₹ {booking.cost_aed} AED</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="verifications" className="space-y-6">
            <h2 className="text-2xl font-semibold">User Verifications</h2>
            {verificationsLoading ? (
              <div className="text-center py-8">
                <p>Loading verifications...</p>
              </div>
            ) : verifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No verification requests found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {verifications.map((verification) => (
                  <Card key={verification.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{verification.full_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            User ID: {verification.user_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Document: {verification.document_type.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {format(new Date(verification.created_at), 'PPP p')}
                          </p>
                          <Badge variant={
                            verification.verification_status === 'verified' ? 'default' :
                            verification.verification_status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {verification.verification_status}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-center">
                          <div className="text-center">
                            <img 
                              src={verification.document_image_url} 
                              alt="Document"
                              className="max-w-full h-32 object-contain rounded border cursor-pointer mb-2"
                              onClick={() => window.open(verification.document_image_url, '_blank')}
                            />
                            <a 
                              href={`https://supabase.com/dashboard/project/eoknluyunximjlsnyceb/storage/buckets/verification-docs`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View in Database Storage →
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {verification.verification_status === 'pending' && (
                            <>
                              <Button
                                onClick={() => updateVerificationStatus(verification.id, 'verified')}
                                disabled={verificationUpdating === verification.id}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                {verificationUpdating === verification.id ? 'Processing...' : 'Approve'}
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => updateVerificationStatus(verification.id, 'rejected')}
                                disabled={verificationUpdating === verification.id}
                                className="flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                {verificationUpdating === verification.id ? 'Processing...' : 'Decline'}
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => setSelectedUserId(verification.user_id)}
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <h2 className="text-2xl font-semibold">Send Message to User</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="userSelect">Select User</Label>
                  <select
                    id="userSelect"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    disabled={usersLoading}
                  >
                    <option value="">{usersLoading ? 'Loading users...' : 'Select a user...'}</option>
                    {allUsers.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.full_name || 'Unknown User'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="messageSubject">Subject</Label>
                  <Input
                    id="messageSubject"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Enter message subject"
                  />
                </div>

                <div>
                  <Label htmlFor="messageContent">Message</Label>
                  <Textarea
                    id="messageContent"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Enter your message"
                    rows={6}
                  />
                </div>

                <Button 
                  onClick={sendMessage} 
                  disabled={messageSending}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {messageSending ? 'Sending...' : 'Send Message'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">User Management</h2>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">{userStats.totalUsers}</h3>
                    <p className="text-muted-foreground">Total Users</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-green-600">{userStats.onlineUsers}</h3>
                    <p className="text-muted-foreground">Online Now</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">{userStats.parkingOwners}</h3>
                    <p className="text-muted-foreground">Parking Owners</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">{userStats.parkingSeekers}</h3>
                    <p className="text-muted-foreground">Parking Seekers</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="owners">Parking Owners</SelectItem>
                  <SelectItem value="seekers">Parking Seekers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Management Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Management ({filteredUsers.length} users)</CardTitle>
              </CardHeader>
              <CardContent>
                {detailedUsersLoading ? (
                  <div className="text-center py-8">
                    <p>Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">User</th>
                          <th className="text-left p-4">Type</th>
                          <th className="text-left p-4">Status</th>
                          <th className="text-left p-4">Activity</th>
                          <th className="text-left p-4">Joined</th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.user_id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium">
                                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{user.full_name || 'Unknown'}</p>
                                  <p className="text-sm text-muted-foreground">{user.phone || 'No phone'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant={user.user_type === 'owner' ? 'default' : 'secondary'}>
                                {user.user_type === 'owner' ? 'Parking Owner' : 'Parking Seeker'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge variant={user.status === 'online' ? 'default' : 'secondary'}>
                                {user.status === 'online' ? 'Online' : 'Offline'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="text-sm space-y-1">
                                <div>Bookings: {user.bookings}</div>
                                <div>Listings: {user.listings}</div>
                                <div>Messages: {user.messages}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">
                                {format(new Date(user.created_at), 'MMM d, yyyy')}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // View user details - could open a modal
                                    toast({
                                      title: "User Details",
                                      description: `User: ${user.full_name || 'Unknown'}, Type: ${user.user_type}`,
                                    });
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUserId(user.user_id);
                                    // Switch to messages tab
                                    const messagesTab = document.querySelector('[value="messages"]') as HTMLElement;
                                    messagesTab?.click();
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteUser(user.user_id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Management Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat Management
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
                          onClick={() => setSelectedChatUser(user.user_id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{user.full_name}</span>
                            {user.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;