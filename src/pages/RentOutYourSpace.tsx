import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, CheckCircle, Wallet, Quote, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParkingCalculator from "@/components/ParkingCalculator";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import luxuryCar from "@/assets/luxury-car-dubai.png";
import phoneLogo from "@/assets/phone-logo.png";
import ReCAPTCHA from 'react-google-recaptcha';

const RentOutYourSpace = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [monthlyPrice, setMonthlyPrice] = useState<number>(300);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    buildingName: "",
    district: "",
    bayType: "",
    accessDeviceDeposit: false,
    notes: ""
  });
  const serviceFee = Math.round(monthlyPrice * 0.03);
  const netPayout = monthlyPrice - serviceFee;
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (uploadedImages.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "Maximum 5 images allowed",
        variant: "destructive"
      });
      return;
    }
    const validFiles = files.filter(file => {
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 3MB`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });
    setUploadedImages(prev => [...prev, ...validFiles]);
  };
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "ID document must be smaller than 3MB",
          variant: "destructive"
        });
        return;
      }
      setIdDocument(file);
    }
  };
  const uploadImagesToStorage = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${index}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        console.log('Uploading file:', fileName, 'Size:', file.size);
        const {
          data,
          error
        } = await supabase.storage.from('parking-images').upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        if (error) {
          console.error('Upload error:', error);
          throw error;
        }
        const {
          data: publicUrl
        } = supabase.storage.from('parking-images').getPublicUrl(fileName);
        console.log('Upload successful:', publicUrl.publicUrl);
        return publicUrl.publicUrl;
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        throw error;
      }
    });
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: <div className="space-y-3">
            <p className="text-sm">Please sign in to submit a listing</p>
            <div className="flex space-x-3">
              <Button variant="secondary" size="sm" onClick={() => window.location.href = '/auth'} className="bg-white text-destructive hover:bg-gray-100 font-semibold px-4 py-2">
                Login
              </Button>
              <Button variant="secondary" size="sm" onClick={() => window.location.href = '/auth'} className="bg-white text-destructive hover:bg-gray-100 font-semibold px-4 py-2">
                Sign Up
              </Button>
            </div>
          </div>,
        variant: "destructive"
      });
      return;
    }
    if (!recaptchaToken) {
      toast({
        title: "Verification required",
        description: "Please complete the reCAPTCHA verification",
        variant: "destructive"
      });
      return;
    }
    if (uploadedImages.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image",
        variant: "destructive"
      });
      return;
    }
    if (!idDocument) {
      toast({
        title: "ID document required",
        description: "Please upload your ID document",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Verify reCAPTCHA first
      const { data: recaptchaResult, error: recaptchaError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: recaptchaToken }
      });

      if (recaptchaError || !recaptchaResult?.success) {
        toast({
          title: "Verification failed",
          description: "reCAPTCHA verification failed. Please try again.",
          variant: "destructive"
        });
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        setIsSubmitting(false);
        return;
      }

      // Upload images to storage
      const imageUrls = await uploadImagesToStorage(uploadedImages);

      // Upload ID document
      const idFileName = `${user.id}/${Date.now()}-${idDocument.name}`;
      const {
        data: idData,
        error: idError
      } = await supabase.storage.from('verification-docs').upload(idFileName, idDocument);
      if (idError) {
        console.error('ID upload error:', idError);
        throw new Error(`Failed to upload ID document: ${idError.message}`);
      }

      // Create listing in database
      const listingData = {
        owner_id: user.id,
        title: `${formData.bayType} parking in ${formData.buildingName}`,
        description: formData.notes || `${formData.bayType} parking space in ${formData.buildingName}, ${formData.district}`,
        address: `${formData.buildingName}, ${formData.district}`,
        zone: formData.district,
        price_per_hour: Number((monthlyPrice / 720).toFixed(2)),
        price_per_month: monthlyPrice,
        features: [formData.bayType],
        images: imageUrls,
        contact_phone: formData.phone,
        contact_email: user.email,
        status: 'pending'
      };
      console.log('Inserting listing data:', listingData);
      const {
        data: insertedListing,
        error: insertError
      } = await supabase.from('parking_listings').insert(listingData).select().single();
      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to create listing: ${insertError.message}`);
      }
      console.log('Listing created successfully:', insertedListing);

      // Send admin notification
      try {
        await supabase.functions.invoke('send-admin-notification', {
          body: {
            type: 'parking_listing',
            userEmail: user.email,
            userName: user.user_metadata?.full_name || 'User',
            details: {
              buildingName: formData.buildingName,
              district: formData.district,
              bayType: formData.bayType,
              monthlyPrice: monthlyPrice,
              accessDeviceDeposit: formData.accessDeviceDeposit,
              phone: formData.phone,
              notes: formData.notes
            }
          }
        });
      } catch (notificationError) {
        console.error('Failed to send admin notification:', notificationError);
        // Don't fail the whole process if notification fails
      }

      // Send customer confirmation email
      try {
        await supabase.functions.invoke('send-customer-confirmation', {
          body: {
            userEmail: user.email,
            userName: user.user_metadata?.full_name || 'User',
            listingDetails: {
              buildingName: formData.buildingName,
              district: formData.district,
              bayType: formData.bayType,
              monthlyPrice: monthlyPrice
            }
          }
        });
      } catch (confirmationError) {
        console.error('Failed to send customer confirmation:', confirmationError);
        // Don't fail the whole process if confirmation email fails
      }
      toast({
        title: "✅ Listing Submitted Successfully!",
        description: "Your parking space has been submitted for review. Our team will review it within 24 hours and you'll be redirected to your account."
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        buildingName: "",
        district: "",
        bayType: "",
        accessDeviceDeposit: false,
        notes: ""
      });
      setUploadedImages([]);
      setIdDocument(null);
      setMonthlyPrice(300);

      // Reset reCAPTCHA
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);

      // Redirect to account page to view the submitted listing
      setTimeout(() => {
        navigate('/my-account?tab=listings');
      }, 2000);
    } catch (error) {
      console.error('Error submitting listing:', error);
      toast({
        title: "Submission failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-white animate-zoom-slow">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(/lovable-uploads/d672c78d-465f-41e0-9e3d-cd28db512923.png)`
    }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Earn Passive Income<br />
            <span className="text-primary">From Your Empty Bay</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            List your parking space in minutes and start earning every month.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to start earning from your parking space
            </p>
          </div>

          <div className="flex justify-center">
            <img src="/lovable-uploads/90ac71db-2b33-4d06-8b4e-7fdb761027f4.png" alt="Three step process: List for Free, Confirm Booking, Facilitate Access" className="max-w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Why List With Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              It's completely FREE to post and advertise your parking space!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              With ShazamParking you can make extra income by renting out your driveway or car park. Listing your space is quick and easy!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Why List With Us</h3>
              <ul className="space-y-4 text-lg text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-primary mr-3" />
                  Zero listing fees
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-primary mr-3" />
                  Monthly, quarterly and annual rentals
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-primary mr-3" />
                  Transparent fees and ongoing support
                </li>
              </ul>
              <Button className="mt-8 bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg" onClick={() => document.getElementById('form')?.scrollIntoView({
              behavior: 'smooth'
            })}>
                Submit Your Listing
              </Button>
            </div>
            <div>
              <img src={luxuryCar} alt="Owner holding remote" className="w-full rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Submit Listing Form */}
      <section id="form" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Submit Your Listing
            </h2>
          </div>

          <Card className="bg-white shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-base font-medium">
                    Full Name *
                  </Label>
                  <Input id="fullName" type="text" required value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="mt-2 h-12" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-base font-medium">
                    Email *
                  </Label>
                  <Input id="email" type="email" required value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="mt-2 h-12" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone" className="text-base font-medium">
                    Phone *
                  </Label>
                  <Input id="phone" type="tel" required value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="mt-2 h-12" />
                </div>
                <div>
                  <Label htmlFor="buildingName" className="text-base font-medium">
                    Building / Tower Name *
                  </Label>
                  <Input id="buildingName" type="text" required value={formData.buildingName} onChange={e => handleInputChange('buildingName', e.target.value)} className="mt-2 h-12" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="district" className="text-base font-medium">
                    District *
                  </Label>
                  <Select value={formData.district} onValueChange={value => handleInputChange('district', value)}>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dubai-marina">Dubai Marina</SelectItem>
                      <SelectItem value="downtown">Downtown</SelectItem>
                      <SelectItem value="difc">DIFC</SelectItem>
                      <SelectItem value="business-bay">Business Bay</SelectItem>
                      <SelectItem value="palm-jumeirah">Palm Jumeirah</SelectItem>
                      <SelectItem value="deira">Deira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bayType" className="text-base font-medium">
                    Bay Type *
                  </Label>
                  <Select value={formData.bayType} onValueChange={value => handleInputChange('bayType', value)}>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select bay type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="covered">Covered</SelectItem>
                      <SelectItem value="uncovered">Uncovered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="monthlyPrice" className="text-base font-medium">
                    Monthly Price (AED) *
                  </Label>
                  <Select value={monthlyPrice.toString()} onValueChange={value => setMonthlyPrice(Number(value))}>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select monthly price" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({
                      length: 15
                    }, (_, i) => {
                      const price = 300 + i * 50;
                      return price <= 1000 ? <SelectItem key={price} value={price.toString()}>
                            {price} AED
                          </SelectItem> : null;
                    })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accessDeviceDeposit" className="text-base font-medium">Access Device Deposit (AED 500)</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Switch id="accessDeviceDeposit" checked={formData.accessDeviceDeposit as boolean} onCheckedChange={checked => handleInputChange('accessDeviceDeposit', checked)} />
                    <Label htmlFor="accessDeviceDeposit" className="text-sm">
                      {formData.accessDeviceDeposit ? 'Yes' : 'No'}
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="photos" className="text-base font-medium">
                  Photos (max 5) *
                </Label>
                <div className="mt-2">
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      JPEG or PNG, max 3MB each
                    </p>
                    <input type="file" multiple accept="image/jpeg,image/png,image/jpg" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                  
                  {uploadedImages.length > 0 && <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedImages.map((file, index) => <div key={index} className="relative">
                          <img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <Button type="button" variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0" onClick={() => removeImage(index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>)}
                    </div>}
                </div>
              </div>

              

              <div>
                <Label htmlFor="notes" className="text-base font-medium">
                  Notes to Admin
                </Label>
                <Textarea id="notes" value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} className="mt-2" rows={4} placeholder="Any additional information about your parking space..." />
              </div>

              
               <div className="flex justify-center">
                 <ReCAPTCHA
                   ref={recaptchaRef}
                   sitekey="6LduLpIrAAAAADwcAv1FqqGD3U8mAIXeOaR9g_bc"
                   onChange={(token) => setRecaptchaToken(token)}
                 />
              </div>

              <Button type="submit" disabled={isSubmitting || !recaptchaToken} className="w-full bg-primary hover:bg-primary/90 text-white py-4 text-lg font-semibold disabled:opacity-50">
                {isSubmitting ? "Submitting..." : "Submit Listing"}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Parking Calculator */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Calculate Your Earnings
            </h2>
            <p className="text-xl text-gray-600">
              See exactly how much you'll earn monthly with our transparent calculator
            </p>
          </div>
          <ParkingCalculator />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">What customers say about ShazamParking</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            quote: "What a nice parking service! Thanks for the amazing options for car parking spots around our city. Having such a reliable backup is liberating.",
            name: "Aaliyah Armasi"
          }, {
            quote: "Everyone I know really likes ShazamParking services. Thank you for your effective and expedient help as well as easy booking! Stay awesome!",
            name: "Ahmed Mohammed"
          }, {
            quote: "Simple and easy-to-use, perfect service.",
            name: "Murtaza Hussain"
          }].map((testimonial, index) => <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Floating CTA Button */}
      <div className="fixed bottom-6 right-6 z-50 md:bottom-6 bottom-32">
        <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full shadow-lg" onClick={() => document.getElementById('form')?.scrollIntoView({
        behavior: 'smooth'
      })}>
          Submit Listing
        </Button>
      </div>

      <Footer />
    </div>
};

export default RentOutYourSpace;