import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';
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

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [publicationDate, setPublicationDate] = useState('');

  // Check if user is admin
  const isAdmin = user?.email === 'digisurf777@gmail.com';

  useEffect(() => {
    if (!isAdmin) return;
    fetchPosts();
  }, [isAdmin]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">News Admin Panel</h1>
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
            <h2 className="text-2xl font-semibold mb-4">All News Posts</h2>
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
                        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
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
      </div>
    </div>
  );
};

export default AdminPanel;