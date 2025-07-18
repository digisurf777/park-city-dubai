
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Plus, Image } from 'lucide-react';

interface NewsImageManagerProps {
  featuredImageUrl: string;
  onFeaturedImageChange: (url: string) => void;
  onInsertInlineImage: (imageUrl: string) => void;
}

const NewsImageManager: React.FC<NewsImageManagerProps> = ({
  featuredImageUrl,
  onFeaturedImageChange,
  onInsertInlineImage
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [inlineImageUrl, setInlineImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `news/${fileName}`;

      // Upload file to Supabase storage
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

  const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      onFeaturedImageChange(imageUrl);
      toast({
        title: "Success",
        description: "Featured image uploaded successfully",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInlineImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      onInsertInlineImage(imageUrl);
      toast({
        title: "Success",
        description: "Inline image uploaded and inserted",
      });
    }

    // Reset file input
    if (inlineFileInputRef.current) {
      inlineFileInputRef.current.value = '';
    }
  };

  const handleInlineImageUrlInsert = () => {
    if (!inlineImageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    onInsertInlineImage(inlineImageUrl.trim());
    setInlineImageUrl('');
    toast({
      title: "Success",
      description: "Image URL inserted into content",
    });
  };

  return (
    <div className="space-y-6">
      {/* Featured Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Featured Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="featuredImageUrl">Featured Image URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="featuredImageUrl"
                value={featuredImageUrl}
                onChange={(e) => onFeaturedImageChange(e.target.value)}
                placeholder="Enter image URL or upload below"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFeaturedImageUpload}
              className="hidden"
            />
          </div>
          
          {featuredImageUrl && (
            <div className="relative">
              <img 
                src={featuredImageUrl} 
                alt="Featured preview" 
                className="w-full max-w-md h-32 object-cover rounded border"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={() => onFeaturedImageChange('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inline Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Inline Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Upload Image for Content</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => inlineFileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload & Insert'}
              </Button>
              <input
                ref={inlineFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInlineImageUpload}
                className="hidden"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="inlineImageUrl">Or Insert Image URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="inlineImageUrl"
                value={inlineImageUrl}
                onChange={(e) => setInlineImageUrl(e.target.value)}
                placeholder="Enter image URL to insert"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleInlineImageUrlInsert}
                disabled={!inlineImageUrl.trim()}
              >
                Insert
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="font-medium mb-1 text-blue-900">💡 How to use inline images:</p>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>• Upload images directly or paste URLs</li>
              <li>• Images will be inserted at your cursor position in the editor</li>
              <li>• You can resize and position images using the rich text editor</li>
              <li>• All uploaded images are stored securely in the database</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsImageManager;
