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
import { Upload, FileImage, CheckCircle, Clock, XCircle, AlertTriangle, ShieldCheck, Sparkles, FileText, IdCard, BookOpen } from 'lucide-react';
interface Verification {
  id: string;
  full_name: string;
  document_type: string;
  document_image_url: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  nationality?: string;
  created_at: string;
}
const VerificationPanel = () => {
  const {
    user
  } = useAuth();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    nationality: '',
    documentType: '',
    file: null as File | null
  });

  // Return early if user is already approved
  if (verification?.verification_status === 'approved') {
    return (
      <Card className="overflow-hidden border-emerald-200/60 shadow-elegant">
        <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-6 py-10 text-center text-white">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
          <div className="relative">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 backdrop-blur">
              <ShieldCheck className="h-11 w-11" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Account Verified</h3>
            <p className="mt-2 text-sm text-white/90 max-w-sm mx-auto">
              Your identity is confirmed. You now have full access to bookings, listings and payouts.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3 w-3" /> Trusted member
            </div>
          </div>
        </div>
      </Card>
    );
  }
  useEffect(() => {
    if (user) {
      fetchVerification();
    }
  }, [user]);
  const fetchVerification = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('user_verifications').select('*').eq('user_id', user?.id).single();
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
      setFormData(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };
  const triggerFileInput = () => {
    const fileInput = document.getElementById('document') as HTMLInputElement;
    fileInput?.click();
  };
  const uploadDocument = async () => {
    console.log('🚀 UPDATED CODE - Starting document upload...');
    console.log('Form data:', formData);
    console.log('User:', user);
    console.log('User ID:', user?.id);
    
    if (!formData.file || !formData.fullName || !formData.nationality || !formData.documentType || !user) {
      const missingFields = [];
      if (!formData.file) missingFields.push('Document file');
      if (!formData.fullName) missingFields.push('Full name');
      if (!formData.nationality) missingFields.push('Nationality');
      if (!formData.documentType) missingFields.push('Document type');
      if (!user) missingFields.push('User authentication');
      
      console.error('Missing fields:', missingFields);
      toast.error(`Please fill the following fields: ${missingFields.join(', ')}`);
      return;
    }

    setUploading(true);
    try {
      console.log('Preparing file upload...');
      
      // Upload file to storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading file:', fileName);
      console.log('File size:', formData.file.size);
      console.log('File type:', formData.file.type);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(fileName, formData.file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log('File uploaded successfully:', uploadData);

      // For private bucket, use signed URL instead of public URL
      const { data: urlData, error: urlError } = await supabase.storage
        .from('verification-docs')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry for admin access
      
      if (urlError) {
        console.error('URL generation error:', urlError);
        throw new Error(`URL generation failed: ${urlError.message}`);
      }
      
      console.log('Signed URL created:', urlData.signedUrl);

      // Save verification record - use upsert for re-submissions
      console.log('Saving verification record...');
      const verificationData = {
        user_id: user.id,
        full_name: formData.fullName,
        nationality: formData.nationality,
        document_type: formData.documentType,
        document_image_url: urlData.signedUrl,
        verification_status: 'pending' as const,
        access_restricted: true // Security requirement: new documents must be access-restricted
      };
      
      console.log('Verification data:', verificationData);
      
      const { error: insertError } = await supabase
        .from('user_verifications')
        .upsert(verificationData);
      
      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Database save failed: ${insertError.message}`);
      }
      
      console.log('Verification record saved successfully');

      // Send admin notification
      console.log('Sending admin notification...');
      try {
        await supabase.functions.invoke('send-admin-notification', {
          body: {
            type: 'id_verification',
            userEmail: user.email || '',
            userName: formData.fullName,
            details: {
              documentType: formData.documentType,
              nationality: formData.nationality
            }
          }
        });
        console.log('Admin notification sent');
      } catch (notificationError) {
        console.warn('Failed to send admin notification:', notificationError);
        // Don't fail the whole process if notification fails
      }
      
      toast.success('Verification document uploaded successfully');
      fetchVerification();
      setFormData({
        fullName: '',
        nationality: '',
        documentType: '',
        file: null
      });
      
      // Clear file input
      const fileInput = document.getElementById('document') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error: any) {
      console.error('Error uploading document:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Failed to upload verification document: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100"><Clock className="h-3 w-3 mr-1" />In review</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-100"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };
  if (loading) {
    return (
      <Card><CardContent className="py-12 flex items-center justify-center text-muted-foreground"><Clock className="h-4 w-4 mr-2 animate-spin" />Loading verification status…</CardContent></Card>
    );
  }

  // Show alert if not approved
  const showAlert = !verification || verification.verification_status === 'rejected';
  return <div className="space-y-6">
      {showAlert && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5">
          <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_90%_50%,hsl(var(--primary)/0.15),transparent_60%)]" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15 ring-2 ring-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Verification required</p>
              <p className="text-sm text-amber-800/90 mt-0.5">
                Upload a valid photo ID to unlock bookings, listings and payouts. Reviews usually take less than 24 hours.
              </p>
            </div>
          </div>
        </div>
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
          {verification ? <div className="space-y-4">
              {verification.verification_status === 'pending' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Verification in Progress</strong> – Your verification documents have been submitted successfully and are currently under review. You will receive an email notification once the review is complete.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Verification Status:</span>
                {getStatusBadge(verification.verification_status)}
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Document Type:</strong> {verification.document_type.replace('_', ' ').toUpperCase()}</p>
                {verification.nationality && <p><strong>Nationality:</strong> {verification.nationality}</p>}
                <p><strong>Submitted:</strong> {new Date(verification.created_at).toLocaleDateString()}</p>
              </div>

              {verification.verification_status === 'rejected' && (
                <div className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700">
                      Your verification was rejected. Please submit a new, clear document.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={() => setVerification(null)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Upload New Document
                  </Button>
                </div>
              )}
            </div> : <div className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors" onClick={triggerFileInput}>
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload your ID for verification</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Make sure the document is clearly visible, readable, and both sides are included. 
                  We accept a National ID, Driver's License, or Passport.
                </p>
                {formData.file && <p className="text-sm text-primary font-medium">Selected: {formData.file.name}</p>}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name (as shown on document)</Label>
                  <Input id="fullName" value={formData.fullName} onChange={e => setFormData(prev => ({
                ...prev,
                fullName: e.target.value
              }))} placeholder="Enter your full name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select value={formData.nationality} onValueChange={value => setFormData(prev => ({
                ...prev,
                nationality: value
              }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your nationality" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300 shadow-lg max-h-60 overflow-y-auto z-[9999]" position="popper">
                      <SelectItem value="Afghan">Afghan</SelectItem>
                      <SelectItem value="Albanian">Albanian</SelectItem>
                      <SelectItem value="Algerian">Algerian</SelectItem>
                      <SelectItem value="American">American</SelectItem>
                      <SelectItem value="Andorran">Andorran</SelectItem>
                      <SelectItem value="Angolan">Angolan</SelectItem>
                      <SelectItem value="Argentine">Argentine</SelectItem>
                      <SelectItem value="Armenian">Armenian</SelectItem>
                      <SelectItem value="Australian">Australian</SelectItem>
                      <SelectItem value="Austrian">Austrian</SelectItem>
                      <SelectItem value="Azerbaijani">Azerbaijani</SelectItem>
                      <SelectItem value="Bahraini">Bahraini</SelectItem>
                      <SelectItem value="Bangladeshi">Bangladeshi</SelectItem>
                      <SelectItem value="Barbadian">Barbadian</SelectItem>
                      <SelectItem value="Belarusian">Belarusian</SelectItem>
                      <SelectItem value="Belgian">Belgian</SelectItem>
                      <SelectItem value="Belizean">Belizean</SelectItem>
                      <SelectItem value="Beninese">Beninese</SelectItem>
                      <SelectItem value="Bhutanese">Bhutanese</SelectItem>
                      <SelectItem value="Bolivian">Bolivian</SelectItem>
                      <SelectItem value="Bosnian">Bosnian</SelectItem>
                      <SelectItem value="Brazilian">Brazilian</SelectItem>
                      <SelectItem value="British">British</SelectItem>
                      <SelectItem value="Bruneian">Bruneian</SelectItem>
                      <SelectItem value="Bulgarian">Bulgarian</SelectItem>
                      <SelectItem value="Burkinabe">Burkinabe</SelectItem>
                      <SelectItem value="Burmese">Burmese</SelectItem>
                      <SelectItem value="Burundian">Burundian</SelectItem>
                      <SelectItem value="Cambodian">Cambodian</SelectItem>
                      <SelectItem value="Cameroonian">Cameroonian</SelectItem>
                      <SelectItem value="Canadian">Canadian</SelectItem>
                      <SelectItem value="Cape Verdean">Cape Verdean</SelectItem>
                      <SelectItem value="Central African">Central African</SelectItem>
                      <SelectItem value="Chadian">Chadian</SelectItem>
                      <SelectItem value="Chilean">Chilean</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Colombian">Colombian</SelectItem>
                      <SelectItem value="Comoran">Comoran</SelectItem>
                      <SelectItem value="Congolese">Congolese</SelectItem>
                      <SelectItem value="Costa Rican">Costa Rican</SelectItem>
                      <SelectItem value="Croatian">Croatian</SelectItem>
                      <SelectItem value="Cuban">Cuban</SelectItem>
                      <SelectItem value="Cypriot">Cypriot</SelectItem>
                      <SelectItem value="Czech">Czech</SelectItem>
                      <SelectItem value="Danish">Danish</SelectItem>
                      <SelectItem value="Djiboutian">Djiboutian</SelectItem>
                      <SelectItem value="Dominican">Dominican</SelectItem>
                      <SelectItem value="Dutch">Dutch</SelectItem>
                      <SelectItem value="East Timorese">East Timorese</SelectItem>
                      <SelectItem value="Ecuadorean">Ecuadorean</SelectItem>
                      <SelectItem value="Egyptian">Egyptian</SelectItem>
                      <SelectItem value="Emirian">Emirian</SelectItem>
                      <SelectItem value="Equatorial Guinean">Equatorial Guinean</SelectItem>
                      <SelectItem value="Eritrean">Eritrean</SelectItem>
                      <SelectItem value="Estonian">Estonian</SelectItem>
                      <SelectItem value="Ethiopian">Ethiopian</SelectItem>
                      <SelectItem value="Fijian">Fijian</SelectItem>
                      <SelectItem value="Filipino">Filipino</SelectItem>
                      <SelectItem value="Finnish">Finnish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Gabonese">Gabonese</SelectItem>
                      <SelectItem value="Gambian">Gambian</SelectItem>
                      <SelectItem value="Georgian">Georgian</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Ghanaian">Ghanaian</SelectItem>
                      <SelectItem value="Greek">Greek</SelectItem>
                      <SelectItem value="Grenadian">Grenadian</SelectItem>
                      <SelectItem value="Guatemalan">Guatemalan</SelectItem>
                      <SelectItem value="Guinean">Guinean</SelectItem>
                      <SelectItem value="Guinea-Bissauan">Guinea-Bissauan</SelectItem>
                      <SelectItem value="Guyanese">Guyanese</SelectItem>
                      <SelectItem value="Haitian">Haitian</SelectItem>
                      <SelectItem value="Herzegovinian">Herzegovinian</SelectItem>
                      <SelectItem value="Honduran">Honduran</SelectItem>
                      <SelectItem value="Hungarian">Hungarian</SelectItem>
                      <SelectItem value="Icelander">Icelander</SelectItem>
                      <SelectItem value="Indian">Indian</SelectItem>
                      <SelectItem value="Indonesian">Indonesian</SelectItem>
                      <SelectItem value="Iranian">Iranian</SelectItem>
                      <SelectItem value="Iraqi">Iraqi</SelectItem>
                      <SelectItem value="Irish">Irish</SelectItem>
                      <SelectItem value="Israeli">Israeli</SelectItem>
                      <SelectItem value="Italian">Italian</SelectItem>
                      <SelectItem value="Ivorian">Ivorian</SelectItem>
                      <SelectItem value="Jamaican">Jamaican</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Jordanian">Jordanian</SelectItem>
                      <SelectItem value="Kazakhstani">Kazakhstani</SelectItem>
                      <SelectItem value="Kenyan">Kenyan</SelectItem>
                      <SelectItem value="Kittian and Nevisian">Kittian and Nevisian</SelectItem>
                      <SelectItem value="Kuwaiti">Kuwaiti</SelectItem>
                      <SelectItem value="Kyrgyz">Kyrgyz</SelectItem>
                      <SelectItem value="Laotian">Laotian</SelectItem>
                      <SelectItem value="Latvian">Latvian</SelectItem>
                      <SelectItem value="Lebanese">Lebanese</SelectItem>
                      <SelectItem value="Liberian">Liberian</SelectItem>
                      <SelectItem value="Libyan">Libyan</SelectItem>
                      <SelectItem value="Liechtensteiner">Liechtensteiner</SelectItem>
                      <SelectItem value="Lithuanian">Lithuanian</SelectItem>
                      <SelectItem value="Luxembourgish">Luxembourgish</SelectItem>
                      <SelectItem value="Macedonian">Macedonian</SelectItem>
                      <SelectItem value="Malagasy">Malagasy</SelectItem>
                      <SelectItem value="Malawian">Malawian</SelectItem>
                      <SelectItem value="Malaysian">Malaysian</SelectItem>
                      <SelectItem value="Maldivan">Maldivan</SelectItem>
                      <SelectItem value="Malian">Malian</SelectItem>
                      <SelectItem value="Maltese">Maltese</SelectItem>
                      <SelectItem value="Marshallese">Marshallese</SelectItem>
                      <SelectItem value="Mauritanian">Mauritanian</SelectItem>
                      <SelectItem value="Mauritian">Mauritian</SelectItem>
                      <SelectItem value="Mexican">Mexican</SelectItem>
                      <SelectItem value="Micronesian">Micronesian</SelectItem>
                      <SelectItem value="Moldovan">Moldovan</SelectItem>
                      <SelectItem value="Monacan">Monacan</SelectItem>
                      <SelectItem value="Mongolian">Mongolian</SelectItem>
                      <SelectItem value="Moroccan">Moroccan</SelectItem>
                      <SelectItem value="Mosotho">Mosotho</SelectItem>
                      <SelectItem value="Motswana">Motswana</SelectItem>
                      <SelectItem value="Mozambican">Mozambican</SelectItem>
                      <SelectItem value="Namibian">Namibian</SelectItem>
                      <SelectItem value="Nauruan">Nauruan</SelectItem>
                      <SelectItem value="Nepalese">Nepalese</SelectItem>
                      <SelectItem value="New Zealander">New Zealander</SelectItem>
                      <SelectItem value="Ni-Vanuatu">Ni-Vanuatu</SelectItem>
                      <SelectItem value="Nicaraguan">Nicaraguan</SelectItem>
                      <SelectItem value="Nigerian">Nigerian</SelectItem>
                      <SelectItem value="Nigerien">Nigerien</SelectItem>
                      <SelectItem value="North Korean">North Korean</SelectItem>
                      <SelectItem value="Northern Irish">Northern Irish</SelectItem>
                      <SelectItem value="Norwegian">Norwegian</SelectItem>
                      <SelectItem value="Omani">Omani</SelectItem>
                      <SelectItem value="Pakistani">Pakistani</SelectItem>
                      <SelectItem value="Palauan">Palauan</SelectItem>
                      <SelectItem value="Panamanian">Panamanian</SelectItem>
                      <SelectItem value="Papua New Guinean">Papua New Guinean</SelectItem>
                      <SelectItem value="Paraguayan">Paraguayan</SelectItem>
                      <SelectItem value="Peruvian">Peruvian</SelectItem>
                      <SelectItem value="Polish">Polish</SelectItem>
                      <SelectItem value="Portuguese">Portuguese</SelectItem>
                      <SelectItem value="Qatari">Qatari</SelectItem>
                      <SelectItem value="Romanian">Romanian</SelectItem>
                      <SelectItem value="Russian">Russian</SelectItem>
                      <SelectItem value="Rwandan">Rwandan</SelectItem>
                      <SelectItem value="Saint Lucian">Saint Lucian</SelectItem>
                      <SelectItem value="Salvadoran">Salvadoran</SelectItem>
                      <SelectItem value="Samoan">Samoan</SelectItem>
                      <SelectItem value="San Marinese">San Marinese</SelectItem>
                      <SelectItem value="Sao Tomean">Sao Tomean</SelectItem>
                      <SelectItem value="Saudi">Saudi</SelectItem>
                      <SelectItem value="Scottish">Scottish</SelectItem>
                      <SelectItem value="Senegalese">Senegalese</SelectItem>
                      <SelectItem value="Serbian">Serbian</SelectItem>
                      <SelectItem value="Seychellois">Seychellois</SelectItem>
                      <SelectItem value="Sierra Leonean">Sierra Leonean</SelectItem>
                      <SelectItem value="Singaporean">Singaporean</SelectItem>
                      <SelectItem value="Slovakian">Slovakian</SelectItem>
                      <SelectItem value="Slovenian">Slovenian</SelectItem>
                      <SelectItem value="Solomon Islander">Solomon Islander</SelectItem>
                      <SelectItem value="Somali">Somali</SelectItem>
                      <SelectItem value="South African">South African</SelectItem>
                      <SelectItem value="South Korean">South Korean</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="Sri Lankan">Sri Lankan</SelectItem>
                      <SelectItem value="Sudanese">Sudanese</SelectItem>
                      <SelectItem value="Surinamer">Surinamer</SelectItem>
                      <SelectItem value="Swazi">Swazi</SelectItem>
                      <SelectItem value="Swedish">Swedish</SelectItem>
                      <SelectItem value="Swiss">Swiss</SelectItem>
                      <SelectItem value="Syrian">Syrian</SelectItem>
                      <SelectItem value="Taiwanese">Taiwanese</SelectItem>
                      <SelectItem value="Tajik">Tajik</SelectItem>
                      <SelectItem value="Tanzanian">Tanzanian</SelectItem>
                      <SelectItem value="Thai">Thai</SelectItem>
                      <SelectItem value="Togolese">Togolese</SelectItem>
                      <SelectItem value="Tongan">Tongan</SelectItem>
                      <SelectItem value="Trinidadian">Trinidadian</SelectItem>
                      <SelectItem value="Tunisian">Tunisian</SelectItem>
                      <SelectItem value="Turkish">Turkish</SelectItem>
                      <SelectItem value="Tuvaluan">Tuvaluan</SelectItem>
                      <SelectItem value="Ugandan">Ugandan</SelectItem>
                      <SelectItem value="Ukrainian">Ukrainian</SelectItem>
                      <SelectItem value="Uruguayan">Uruguayan</SelectItem>
                      <SelectItem value="Uzbekistani">Uzbekistani</SelectItem>
                      <SelectItem value="Venezuelan">Venezuelan</SelectItem>
                      <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                      <SelectItem value="Welsh">Welsh</SelectItem>
                      <SelectItem value="Yemenite">Yemenite</SelectItem>
                      <SelectItem value="Zambian">Zambian</SelectItem>
                      <SelectItem value="Zimbabwean">Zimbabwean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select value={formData.documentType} onValueChange={value => setFormData(prev => ({
                ...prev,
                documentType: value
              }))}>
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
                  <Input id="document" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                  <p className="text-xs text-muted-foreground">
                    Upload both sides of your document in a single clear image
                  </p>
                </div>

                <Button onClick={uploadDocument} disabled={uploading || !formData.file || !formData.fullName || !formData.nationality || !formData.documentType} className="w-full">
                  {uploading ? 'Uploading...' : 'Submit for Verification'}
                </Button>
              </div>
            </div>}
        </CardContent>
      </Card>
    </div>;
};
export default VerificationPanel;