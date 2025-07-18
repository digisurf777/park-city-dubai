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
import { Pencil, Trash2, Plus, CheckCircle, XCircle, FileText, Mail, Upload, X, Users } from 'lucide-react';
import { format } from 'date-fns';
import UserManagementTab from '@/components/UserManagementTab';
import NewsImageManager from '@/components/NewsImageManager';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  publication_date: string;
  created_at: string;
  updated_at: string;
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

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const quillRef = useRef<ReactQuill>(null);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [parkingListings, setParkingListings] = useState<ParkingListing[]>([]);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [editingListing, setEditingListing] = useState<ParkingListing | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verificationsLoading, setVerificationsLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [verificationUpdating, setVerificationUpdating] = useState<string | null>(null);
  const [messageSending, setMessageSending] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [publicationDate, setPublicationDate] = useState('');

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    
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
      
      if (data) {
        fetchPosts();
        fetchVerifications();
        fetchParkingListings();
        fetchAllUsers();
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('publication_date', { ascending: false });

      if (error) throw error;
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
    
    if (listingImages.length >= 5) {
      toast({
        title: "Error",
        description: "Maximum 5 images allowed per listing",
        variant: "destructive",
      });
      return;
    }
    
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
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `parking-listings/${fileName}`;

      const { data, error } = await supabase.storage
        .from('parking-images')
        .upload(filePath, file);

      if (error) throw error;

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

    if (listingImages.length >= 5) {
      toast({
        title: "Error",
        description: "Maximum 5 images allowed per listing",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      let filePath = '';
      if (imageUrl.includes('supabase.co')) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        filePath = `parking-listings/${fileName}`;
      } else if (imageUrl.includes('parking-listings/')) {
        filePath = imageUrl.split('parking-listings/')[1];
        filePath = `parking-listings/${filePath}`;
      } else {
        const fileName = imageUrl.split('/').pop() || '';
        filePath = `parking-listings/${fileName}`;
      }

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
    }
  };

  const removeImageFromListing = async (imageUrl: string) => {
    if (confirm('Are you sure you want to delete this image? This will permanently remove it from storage.')) {
      setListingImages(listingImages.filter(img => img !== imageUrl));
      
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

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this parking listing? This action cannot be undone.')) {
      return;
    }

    try {
      const { data: listing, error: fetchError } = await supabase
        .from('parking_listings')
        .select('images')
        .eq('id', listingId)
        .single();

      if (fetchError) throw fetchError;

      if (listing?.images && listing.images.length > 0) {
        for (const imageUrl of listing.images) {
          if (imageUrl.includes('supabase')) {
            await deleteImageFromStorage(imageUrl);
          }
        }
      }

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

  const fetchAllUsers = async () => {
    try {
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

  const updateVerificationStatus = async (verificationId: string, status: 'verified' | 'rejected') => {
    try {
      setVerificationUpdating(verificationId);
      console.log(`Updating verification ${verificationId} to status: ${status}`);

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

      const { error: updateError } = await supabase
        .from('user_verifications')
        .update({ verification_status: status })
        .eq('id', verificationId);

      if (updateError) {
        console.error('Error updating verification status:', updateError);
        throw updateError;
      }

      console.log('Verification status updated successfully');

      let userEmail = '';
      let userName = verification.full_name;

      try {
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

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['blockquote', 'code-block'],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align', 'color', 'background',
    'link', 'blockquote', 'code-block', 'indent', 'size'
  ];

  const insertImageIntoContent = (imageUrl: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      quill.insertEmbed(index, 'image', imageUrl);
      quill.insertText(index + 1, '\n');
      quill.setSelection(index + 2, 0);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setPublicationDate('');
    setEditingPost(null);
    setIsCreating(false);
  };

  const handleEdit = (post: NewsPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.image_url || '');
    setPublicationDate(format(new Date(post.publication_date), "yyyy-MM-dd'T'HH:mm"));
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPost(null);
    setTitle('');
    setContent('');
    setImageUrl('');
    setPublicationDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
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
      toast({
        title: "Error",
        description: "Failed to save news post",
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
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to access the admin panel.</p>
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="news">News Management</TabsTrigger>
            <TabsTrigger value="listings">Parking Listings</TabsTrigger>
            <TabsTrigger value="verifications">User Verifications</TabsTrigger>
            <TabsTrigger value="messages">Send Messages</TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">News Management</h2>
              <Button onClick={handleCreate} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Post
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {(isCreating || editingPost) && (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>
                      {editingPost ? 'Edit News Post' : 'Create New News Post'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Label htmlFor="publicationDate">Publication Date</Label>
                        <Input
                          id="publicationDate"
                          type="datetime-local"
                          value={publicationDate}
                          onChange={(e) => setPublicationDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">Featured Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Enter image URL"
                      />
                      {imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={imageUrl} 
                            alt="Preview" 
                            className="w-32 h-20 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>

                    <NewsImageManager 
                      onImageInsert={insertImageIntoContent}
                      disabled={false}
                    />

                    <div>
                      <Label htmlFor="content">Content</Label>
                      <div className="mt-2">
                        <ReactQuill
                          ref={quillRef}
                          value={content}
                          onChange={setContent}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Write your news content here... Use the toolbar above for rich formatting including headers, lists, links, and more."
                          className="bg-white"
                          style={{ height: '400px', marginBottom: '50px' }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSave}>
                        {editingPost ? 'Update Post' : 'Create Post'}
                      </Button>
                      <Button variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
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
                            <div 
                              className="text-sm line-clamp-3 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: post.content }}
                            />
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
                    <Label className="text-base font-semibold">📸 Images Management</Label>
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
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingImage || listingImages.length >= 5}
                              className="flex items-center gap-2"
                              size="sm"
                            >
                              <Upload className="h-4 w-4" />
                              {uploadingImage ? 'Uploading...' : `Upload (${listingImages.length}/5)`}
                            </Button>
                            <input
                              ref={fileInputRef}
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
                        <p className="font-medium mb-1 text-blue-900">💡 Image Management Features:</p>
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
            <UserManagementTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
