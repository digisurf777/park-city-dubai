
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Image as ImageIcon, ZoomIn, ZoomOut } from "lucide-react";
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
  const [imageScales, setImageScales] = useState<{ [key: string]: number }>({});
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
      
      // Initialize scales for all images
      const scales: { [key: string]: number } = {};
      typedImages.forEach(img => {
        scales[img.id] = 100; // Default 100% scale
      });
      setImageScales(scales);
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

  const handleThumbnailImageUpload = (url: string) => {
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

  const handleScaleChange = (imageId: string, scale: number) => {
    setImageScales(prev => ({
      ...prev,
      [imageId]: scale
    }));
  };

  const insertScaledImage = (imageUrl: string, scale: number) => {
    const scaledImageHtml = `<img src="${imageUrl}" style="width: ${scale}%; height: auto;" alt="Scaled image" />`;
    onInsertInlineImage(scaledImageHtml);
  };

  return (
    <div className="space-y-4">
      {/* Main Featured Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Main Featured Image (For Article Header)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload 
            onImageUploaded={handleFeaturedImageUpload}
            buttonText="Upload Main Featured Image"
          />
          {featuredImageUrl && (
            <div className="mt-4">
              <img 
                src={featuredImageUrl} 
                alt="Main Featured" 
                className="max-w-xs rounded-lg border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thumbnail Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Thumbnail Image (For Post Preview)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload 
            onImageUploaded={handleThumbnailImageUpload}
            buttonText="Upload Thumbnail Image"
          />
          <p className="text-sm text-muted-foreground">
            This image will appear in the news list and previews.
          </p>
        </CardContent>
      </Card>

      {/* Inline Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Inline Images (For Content)
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

      {/* Uploaded Images List with Scaling */}
      {newsId && images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Uploaded Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start gap-4">
                    <img 
                      src={image.image_url} 
                      alt={image.alt_text || 'News image'} 
                      className="w-32 h-32 object-cover rounded"
                      style={{ 
                        transform: `scale(${(imageScales[image.id] || 100) / 100})`,
                        transformOrigin: 'top left'
                      }}
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {image.image_type === 'featured' ? 'Featured/Thumbnail' : 'Inline'}
                        </span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Image Scale Control */}
                      <div className="space-y-2">
                        <Label className="text-sm">Image Scale: {imageScales[image.id] || 100}%</Label>
                        <div className="flex items-center gap-2">
                          <ZoomOut className="h-4 w-4" />
                          <Slider
                            value={[imageScales[image.id] || 100]}
                            onValueChange={(value) => handleScaleChange(image.id, value[0])}
                            max={200}
                            min={25}
                            step={5}
                            className="flex-1"
                          />
                          <ZoomIn className="h-4 w-4" />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => insertScaledImage(image.image_url, imageScales[image.id] || 100)}
                          >
                            Insert at {imageScales[image.id] || 100}%
                          </Button>
                        </div>
                      </div>
                    </div>
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
