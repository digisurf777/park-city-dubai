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

  // Placeholder functions (import from original AdminPanel)
  const checkAdminRole = async () => {
    // Copy implementation from original
    setIsAdmin(true);
    setCheckingAdmin(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Placeholder for all other functions
  const fetchPosts = async () => {};
  const fetchVerifications = async () => {};
  const fetchParkingListings = async () => {};
  const fetchParkingBookings = async () => {};
  const fetchAllUsers = async () => {};
  const fetchDetailedUsers = async () => {};
  const fetchChatMessages = async () => {};
  const fetchChatUsers = async () => {};
  const setupAdminAccess = async () => {};
  const handleCreate = () => {};
  const handleSave = async () => {};
  const handleDelete = async (id: string) => {};
  const sendChatReply = async () => {};

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

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
                {/* News content would go here - copy from original */}
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">News management interface will be here</p>
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
                    <CardTitle>User Verifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">User verification interface will be here</p>
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