import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, CheckCircle, XCircle, FileText, Mail } from 'lucide-react';
import { format } from 'date-fns';

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

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verificationsLoading, setVerificationsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [publicationDate, setPublicationDate] = useState('');

  // Message state
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

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

  const updateVerificationStatus = async (verificationId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('user_verifications')
        .update({ verification_status: status })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Verification ${status} successfully`,
      });

      fetchVerifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
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
      // Insert message into database
      const { error: dbError } = await supabase
        .from('user_messages')
        .insert([{
          user_id: selectedUserId,
          from_admin: true,
          subject: messageSubject,
          message: messageContent,
        }]);

      if (dbError) throw dbError;

      // Get user details for email notification
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', selectedUserId)
        .single();

      if (userError) throw userError;

      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(selectedUserId);
      if (authError) throw authError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-message-notification', {
        body: {
          userEmail: authData.user.email,
          userName: userData.full_name || 'User',
          subject: messageSubject,
          message: messageContent,
        },
      });

      if (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't throw here - message was saved successfully
      }

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setMessageSubject('');
      setMessageContent('');
      setSelectedUserId('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="news">News Management</TabsTrigger>
            <TabsTrigger value="verifications">User Verifications</TabsTrigger>
            <TabsTrigger value="messages">Send Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">News Management</h2>
              <Button onClick={handleCreate} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Post
              </Button>
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
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter post content"
                        rows={8}
                      />
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Enter image URL"
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
                        Save
                      </Button>
                      <Button variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
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
                            <p className="text-sm line-clamp-3">{post.content}</p>
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
                          <img 
                            src={verification.document_image_url} 
                            alt="Document"
                            className="max-w-full h-32 object-contain rounded border cursor-pointer"
                            onClick={() => window.open(verification.document_image_url, '_blank')}
                          />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {verification.verification_status === 'pending' && (
                            <>
                              <Button
                                onClick={() => updateVerificationStatus(verification.id, 'verified')}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => updateVerificationStatus(verification.id, 'rejected')}
                                className="flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Decline
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
                  >
                    <option value="">Select a user...</option>
                    {verifications.map((verification) => (
                      <option key={verification.user_id} value={verification.user_id}>
                        {verification.full_name} ({verification.verification_status})
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

                <Button onClick={sendMessage} className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;