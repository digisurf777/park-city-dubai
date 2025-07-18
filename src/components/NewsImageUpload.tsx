
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Link, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsImageUploadProps {
  onImageInserted: (imageUrl: string) => void;
}

const NewsImageUpload = ({ onImageInserted }: NewsImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return null;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return null;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `news-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `news/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('news-images')
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
      setUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      onImageInserted(uploadedUrl);
      toast({
        title: "Success",
        description: "Image uploaded and inserted successfully",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlInsert = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    onImageInserted(imageUrl.trim());
    setImageUrl('');
    toast({
      title: "Success",
      description: "Image URL inserted successfully",
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Image className="h-4 w-4" />
            <Label className="text-sm font-medium">Add Image to News Post</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Upload from Computer</Label>
              <div className="flex gap-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Insert from URL</Label>
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL here..."
                  className="text-sm"
                />
                <Button 
                  onClick={handleUrlInsert}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Link className="h-4 w-4" />
                  Insert
                </Button>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 p-2 rounded">
            💡 <strong>Tips:</strong> Upload images for better performance or paste URLs from external sources. 
            Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsImageUpload;
