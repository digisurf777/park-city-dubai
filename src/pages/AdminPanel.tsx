
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserManagementTab from "@/components/UserManagementTab";
import UserInbox from "@/components/UserInbox";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  publication_date: string;
}

const AdminPanel = () => {
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [newNews, setNewNews] = useState<NewsPost>({
    id: '',
    title: '',
    content: '',
    image_url: null,
    publication_date: new Date().toISOString().slice(0, 16),
  });
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setNewsPosts(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch news posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNews = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('news')
        .insert({ ...newNews, publication_date: newNews.publication_date });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "News post created successfully",
      });
      setNewNews({
        id: '',
        title: '',
        content: '',
        image_url: null,
        publication_date: new Date().toISOString().slice(0, 16),
      });
      fetchNews();
    } catch (error) {
      console.error('Error creating news:', error);
      toast({
        title: "Error",
        description: "Failed to create news post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNews = async () => {
    if (!editingNews) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('news')
        .update({ ...newNews, publication_date: newNews.publication_date })
        .eq('id', editingNews.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "News post updated successfully",
      });
      setNewNews({
        id: '',
        title: '',
        content: '',
        image_url: null,
        publication_date: new Date().toISOString().slice(0, 16),
      });
      setEditingNews(null);
      fetchNews();
    } catch (error) {
      console.error('Error updating news:', error);
      toast({
        title: "Error",
        description: "Failed to update news post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "News post deleted successfully",
      });
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Error",
        description: "Failed to delete news post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (post: NewsPost) => {
    setEditingNews(post);
    setNewNews({
      id: post.id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      publication_date: post.publication_date,
    });
  };

  const cancelEdit = () => {
    setEditingNews(null);
    setNewNews({
      id: '',
      title: '',
      content: '',
      image_url: null,
      publication_date: new Date().toISOString().slice(0, 16),
    });
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link', 'align'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        
        <Tabs defaultValue="news" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="news">News Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="inbox">User Inbox</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-8">
            {/* News Creation Form */}
            <Card>
              <CardHeader>
                <CardTitle>{editingNews ? 'Edit News Post' : 'Create New News Post'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newNews.title}
                    onChange={(e) => setNewNews({...newNews, title: e.target.value})}
                    placeholder="Enter news title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Content</Label>
                  <div className="mt-2">
                    <ReactQuill
                      theme="snow"
                      value={newNews.content}
                      onChange={(content) => setNewNews({...newNews, content})}
                      modules={modules}
                      formats={formats}
                      placeholder="Write your news content here..."
                      style={{ minHeight: '200px' }}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={newNews.image_url || ''}
                    onChange={(e) => setNewNews({...newNews, image_url: e.target.value})}
                    placeholder="Enter image URL"
                  />
                </div>
                
                <div>
                  <Label htmlFor="publication_date">Publication Date</Label>
                  <Input
                    id="publication_date"
                    type="datetime-local"
                    value={newNews.publication_date}
                    onChange={(e) => setNewNews({...newNews, publication_date: e.target.value})}
                  />
                </div>
                
                <Button 
                  onClick={editingNews ? updateNews : createNews}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Processing..." : (editingNews ? "Update News Post" : "Create News Post")}
                </Button>
                
                {editingNews && (
                  <Button 
                    onClick={cancelEdit}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel Edit
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* News List */}
            <Card>
              <CardHeader>
                <CardTitle>Existing News Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{post.title}</h3>
                        <div 
                          className="text-sm text-muted-foreground mt-1 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: post.content.substring(0, 150) + '...' }}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Published: {new Date(post.publication_date).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteNews(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="inbox">
            <UserInbox />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
