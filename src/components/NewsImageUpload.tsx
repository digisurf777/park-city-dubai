
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Link, X } from 'lucide-react';

interface NewsImageUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onImageInsert: (imageUrl: string) => void;
}

const NewsImageUpload = ({ isOpen, onClose, onImageInsert }: NewsImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setUploadProgress(10);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return null;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 10MB",
          variant: "destructive",
        });
        return null;
      }

      setUploadProgress(30);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `news/${fileName}`;

      setUploadProgress(50);

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (error) throw error;

      setUploadProgress(80);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);

      setUploadProgress(100);

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
      setUploadProgress(0);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImageToStorage(file);
    if (imageUrl) {
      onImageInsert(imageUrl);
      handleClose();
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
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }

    onImageInsert(imageUrl.trim());
    handleClose();
    toast({
      title: "Success",
      description: "Image URL inserted successfully",
    });
  };

  const handleClose = () => {
    setImageUrl('');
    setUploadProgress(0);
    setUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Insert Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Upload from Computer</Label>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Choose Image File'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* URL Input Section */}
          <div className="space-y-3">
            <Label htmlFor="imageUrl" className="text-sm font-medium">
              Or Insert Image URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button
                onClick={handleUrlInsert}
                disabled={!imageUrl.trim() || uploading}
                className="flex items-center gap-2"
              >
                <Link className="h-4 w-4" />
                Insert
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          {imageUrl && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="border rounded-md p-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full h-32 object-contain mx-auto"
                  onError={() => {
                    toast({
                      title: "Error",
                      description: "Invalid image URL",
                      variant: "destructive",
                    });
                  }}
                />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Tips:</p>
            <ul className="space-y-1">
              <li>• Supported formats: JPG, PNG, GIF, WebP</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Images will be stored securely in Supabase</li>
              <li>• You can also paste URLs from external sources</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsImageUpload;
