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
  LogOut, Home, Grid, Bell, Users, Car
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
  const fetchParkingListings = async () => {};
  const fetchParkingBookings = async () => {};
  const fetchAllUsers = async () => {};
  const fetchDetailedUsers = async () => {};
  const fetchChatMessages = async () => {};
  const fetchChatUsers = async () => {};
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
    }
  }, [isAdmin]);

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
          <TabsList className="grid w-full grid-cols-4 gap-3 h-auto p-2 bg-gradient-to-r from-background to-muted/20 rounded-xl border shadow-sm">
            <TabsTrigger 
              value="content" 
              className="flex flex-col items-center p-4 h-auto text-sm font-medium transition-all hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg"
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="font-semibold">Content</span>
              <span className="text-xs opacity-70 mt-1">News & Updates</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="parking" 
              className="flex flex-col items-center p-4 h-auto text-sm font-medium transition-all hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg"
            >
              <Car className="h-6 w-6 mb-2" />
              <span className="font-semibold">Parking</span>
              <span className="text-xs opacity-70 mt-1">Spaces & Bookings</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="users" 
              className="flex flex-col items-center p-4 h-auto text-sm font-medium transition-all hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg"
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="font-semibold">Users</span>
              <span className="text-xs opacity-70 mt-1">Manage & Message</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="chat" 
              className="flex flex-col items-center p-4 h-auto text-sm font-medium transition-all hover:scale-105 data-[state=active]:bg-red-500 data-[state=active]:text-white bg-gradient-to-br from-red-50 to-red-100 border-red-200 animate-pulse rounded-lg"
            >
              <MessageCircle className="h-6 w-6 mb-2" />
              <span className="font-bold">🔥 Live Chat</span>
              <span className="text-xs mt-1">Real-time Support</span>
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
                            <ReactQuill
                              theme="snow"
                              value={content}
                              onChange={setContent}
                              placeholder="Enter post content..."
                              style={{ height: '300px', marginBottom: '50px' }}
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
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setImageFile(file);
                                }}
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
              <TabsList className="grid w-full grid-cols-4 gap-1 bg-muted/30 p-1">
                <TabsTrigger value="listings" className="flex items-center gap-1 text-xs">
                  <Grid className="h-3 w-3" />
                  Listings
                </TabsTrigger>
                <TabsTrigger value="spaces" className="flex items-center gap-1 text-xs">
                  <Settings className="h-3 w-3" />
                  Spaces
                </TabsTrigger>
                <TabsTrigger value="live-booking" className="flex items-center gap-1 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Live Control
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex items-center gap-1 text-xs">
                  <FileText className="h-3 w-3" />
                  Bookings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Parking Listings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">Listings management interface will be here</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="spaces" className="space-y-6">
                <SpaceManagement />
              </TabsContent>

              <TabsContent value="live-booking" className="space-y-6">
                <LiveBookingControl />
              </TabsContent>

              <TabsContent value="bookings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">Booking management interface will be here</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
                        User Verifications ({verifications.length})
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
                        {verifications.map((verification) => (
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
                                    {verification.verification_status === 'pending' && (
                                      <>
                                        <Button
                                          onClick={() => updateVerificationStatus(verification.id, 'verified')}
                                          disabled={verificationUpdating === verification.id}
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve
                                        </Button>
                                        <Button
                                          onClick={() => updateVerificationStatus(verification.id, 'rejected')}
                                          disabled={verificationUpdating === verification.id}
                                          variant="destructive"
                                          size="sm"
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

export default AdminPanelOrganized;