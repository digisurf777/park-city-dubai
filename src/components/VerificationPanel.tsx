import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, FileImage, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface Verification {
  id: string;
  full_name: string;
  document_type: string;
  document_image_url: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

const VerificationPanel = () => {
  const { user } = useAuth();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    documentType: '',
    file: null as File | null
  });

  useEffect(() => {
    if (user) {
      fetchVerification();
    }
  }, [user]);

  const fetchVerification = async () => {
    try {
      const { data, error } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching verification:', error);
      } else if (data) {
        setVerification(data as Verification);
      }
    } catch (error) {
      console.error('Error fetching verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('document') as HTMLInputElement;
    fileInput?.click();
  };

  const uploadDocument = async () => {
    if (!formData.file || !formData.fullName || !formData.documentType || !user) {
      toast.error('Please fill all fields and select a file');
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(fileName, formData.file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(fileName);

      // Save verification record
      const { error: insertError } = await supabase
        .from('user_verifications')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          document_type: formData.documentType,
          document_image_url: publicUrl
        });

      if (insertError) {
        throw insertError;
      }

      // Send email to admin
      await supabase.functions.invoke('send-verification-email', {
        body: {
          userEmail: user.email,
          fullName: formData.fullName,
          documentType: formData.documentType,
          documentUrl: publicUrl
        }
      });

      toast.success('Verification document uploaded successfully');
      fetchVerification();
      setFormData({ fullName: '', documentType: '', file: null });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload verification document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge className="bg-green-100 text-green-800">✅ Verified</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">❌ Rejected</Badge>;
      default: return null;
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading verification status...</div>;
  }

  // Show alert if not verified
  const showAlert = !verification || verification.verification_status !== 'verified';

  return (
    <div className="space-y-6">
      {showAlert && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>⚠️ Verification Required</strong> – Please upload a valid photo ID to continue using all features.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Identity Verification
          </CardTitle>
          <CardDescription>
            Upload your ID for verification to access all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verification ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Verification Status:</span>
                {getStatusBadge(verification.verification_status)}
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Document Type:</strong> {verification.document_type.replace('_', ' ').toUpperCase()}</p>
                <p><strong>Submitted:</strong> {new Date(verification.created_at).toLocaleDateString()}</p>
              </div>

              {verification.verification_status === 'rejected' && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    Your verification was rejected. Please submit a new, clear document.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors" 
                onClick={triggerFileInput}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload your ID for verification</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Make sure the document is clearly visible, readable, and both sides are included. 
                  We accept a National ID, Driver's License, or Passport.
                </p>
                {formData.file && (
                  <p className="text-sm text-primary font-medium">Selected: {formData.file.name}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name (as shown on document)</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select value={formData.documentType} onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Document Image</Label>
                  <Input
                    id="document"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload both sides of your document in a single clear image
                  </p>
                </div>

                <Button 
                  onClick={uploadDocument} 
                  disabled={uploading || !formData.file || !formData.fullName || !formData.documentType}
                  className="w-full"
                >
                  {uploading ? 'Uploading...' : 'Submit for Verification'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationPanel;