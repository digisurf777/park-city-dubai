
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Image as ImageIcon } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface NewsImage {
  id: string;
  image_url: string;
  image_type: 'featured' | 'inline';
  alt_text: string | null;
  caption: string | null;
  display_order: number;
}

interface NewsImageManagerProps {
  newsId: string | null;
  onFeaturedImageChange: (url: string) => void;
  onInsertInlineImage: (url: string) => void;
  featuredImageUrl: string;
}

const NewsImageManager = ({ 
  newsId, 
  onFeaturedImageChange, 
  onInsertInlineImage,
  featuredImageUrl 
}: NewsImageManagerProps) => {
  const [images, setImages] = useState<NewsImage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (newsId) {
      fetchImages();
    }
  }, [newsId]);

  const fetchImages = async () => {
    if (!newsId) return;
    
    try {
      const { data, error } = await supabase
        .from('news_images')
        .select('*')
        .eq('news_id', newsId)
        .order('display_order');

      if (error) throw error;
      
      // Type assertion to ensure image_type is properly typed
      const typedImages = (data || []).map(img => ({
        ...img,
        image_type: img.image_type as 'featured' | 'inline'
      }));
      
      setImages(typedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const saveImageToDatabase = async (imageUrl: string, imageType: 'featured' | 'inline') => {
    if (!newsId) return;

    try {
      const { error } = await supabase
        .from('news_images')
        .insert({
          news_id: newsId,
          image_url: imageUrl,
          image_type: imageType,
          display_order: imageType === 'featured' ? 0 : images.length
        });

      if (error) throw error;
      fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: "Error",
        description: "Failed to save image to database",
        variant: "destructive",
      });
    }
  };

  const handleFeaturedImageUpload = (url: string) => {
    onFeaturedImageChange(url);
    if (newsId) {
      saveImageToDatabase(url, 'featured');
    }
  };

  const handleInlineImageUpload = (url: string) => {
    onInsertInlineImage(url);
    if (newsId) {
      saveImageToDatabase(url, 'inline');
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('news_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Image deleted successfully",
      });
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Featured Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Featured Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload 
            onImageUploaded={handleFeaturedImageUpload}
            buttonText="Upload Featured Image"
          />
          {featuredImageUrl && (
            <div className="mt-4">
              <img 
                src={featuredImageUrl} 
                alt="Featured" 
                className="max-w-xs rounded-lg border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inline Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Inline Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload 
            onImageUploaded={handleInlineImageUpload}
            buttonText="Add Inline Image"
          />
          <p className="text-sm text-muted-foreground">
            Inline images will be inserted into your content at the cursor position.
          </p>
        </CardContent>
      </Card>

      {/* Uploaded Images List */}
      {newsId && images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-4">
                  <img 
                    src={image.image_url} 
                    alt={image.alt_text || 'News image'} 
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {image.image_type === 'featured' ? 'Featured' : 'Inline'}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewsImageManager;
