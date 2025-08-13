import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Star, Zap, Shield, Wifi, Car, Phone, MessageSquare, X, ChevronLeft, ChevronRight, ZoomIn, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import ImageZoomModal from '@/components/ImageZoomModal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { logPhotoRepairReport } from '@/utils/photoRepair';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { previewMode, previewModePhotos } = useFeatureFlags();
  
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [parkingListing, setParkingListing] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch parking listing from database
  useEffect(() => {
    const fetchParkingListing = async () => {
      if (!id) {
        setError('No parking listing ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('parking_listings')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('Error fetching parking listing:', fetchError);
          setError('Failed to load parking listing');
        } else if (data) {
          setParkingListing(data);
        } else {
          setError('Parking listing not found');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load parking listing');
      } finally {
        setLoading(false);
      }
    };

    fetchParkingListing();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading parking space...</p>
        </div>
      </div>
    );
  }

  if (error || !parkingListing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Parking Space Not Found</h3>
              <p className="text-muted-foreground mb-4">
                {error || "The parking space you're looking for doesn't exist or has been removed."}
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculatePrice = (duration: string): number => {
    const hours = parseInt(duration);
    const basePrice = parkingListing.price_per_hour || 15;
    
    if (hours >= 24) {
      // Use daily rate if available, otherwise calculate from hourly
      const days = Math.ceil(hours / 24);
      return parkingListing.price_per_day 
        ? days * parkingListing.price_per_day 
        : days * basePrice * 20; // 20 AED per day fallback
    } else if (hours >= 168) {
      // Use monthly rate if available, otherwise calculate from hourly
      const weeks = Math.ceil(hours / 168);
      return parkingListing.price_per_month 
        ? weeks * (parkingListing.price_per_month / 4) 
        : weeks * basePrice * 140; // 140 AED per week fallback
    } else {
      // Hourly rate
      return hours * basePrice;
    }
  };

  const handleSubmitBookingRequest = async () => {
    if (previewMode) {
      toast({
        title: "Preview Mode",
        description: "Bookings are temporarily disabled in preview mode.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate) {
      toast({
        title: "Date Required",
        description: "Please select a start date.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + parseInt(selectedDuration));

      const { data, error } = await supabase.functions.invoke('submit-booking-request', {
        body: {
          booking_id: id,
          start_time: startDate.toISOString(),
          duration_hours: parseInt(selectedDuration),
          cost_aed: calculatePrice(selectedDuration),
          location: parkingListing.title,
          zone: parkingListing.zone,
          user_phone: userPhone,
          notes: notes,
        },
      });

      if (error) throw error;

      setShowConfirmation(true);
      toast({
        title: "Success!",
        description: "Your booking request has been submitted.",
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImages = () => {
    if (previewModePhotos && parkingListing.images && parkingListing.images.length > 0) {
      return parkingListing.images;
    }
    // Fallback to a default placeholder if no images or not in preview mode
    return ['/placeholder.svg'];
  };

  const images = getImages();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageError = (imageUrl: string) => {
    logPhotoRepairReport(imageUrl, 'broken_url', id);
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Booking Request Submitted!</h3>
                <p className="text-muted-foreground mb-4">
                  We'll review your request and get back to you within 24 hours.
                </p>
                <Button onClick={() => navigate('/')} className="w-full">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <img
                    src={images[currentImageIndex]}
                    alt={`${parkingListing.title} - View ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={() => handleImageError(images[currentImageIndex])}
                  />
                  
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={() => setShowImageModal(true)}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>

                  {images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{parkingListing.title}</CardTitle>
                      <CardDescription className="text-lg mt-1">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {parkingListing.zone}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant={previewMode ? "destructive" : "secondary"} 
                             className={previewMode ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                        {previewMode ? "Currently Booked" : "Available"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{parkingListing.description || 'Secure parking space with convenient access.'}</p>
                  </div>

                  {parkingListing.features && parkingListing.features.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {parkingListing.features.map((feature: string, index: number) => (
                          <Badge key={index} variant="outline">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">Location</h3>
                    <p className="text-muted-foreground text-sm">{parkingListing.address}</p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{parkingListing.price_per_hour} AED/hour</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Zone: {parkingListing.zone}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Book This Space</CardTitle>
                  <CardDescription>Select your preferred date and duration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration (hours)</label>
                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                        <SelectItem value="24">1 day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone Number (Optional)</label>
                    <Input
                      type="tel"
                      placeholder="Your phone number"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Additional Notes (Optional)</label>
                    <Textarea
                      placeholder="Any special requirements..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {selectedDuration && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Cost:</span>
                        <span className="text-xl font-bold text-primary">
                          {calculatePrice(selectedDuration)} AED
                        </span>
                      </div>
                    </div>
                  )}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={handleSubmitBookingRequest}
                          disabled={!startDate || !selectedDuration || isSubmitting || previewMode}
                          className="w-full"
                          size="lg"
                        >
                          {isSubmitting ? 'Submitting...' : previewMode ? 'Currently Booked' : 'Reserve This Space'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{previewMode ? 'This space is currently booked - bookings are temporarily disabled' : 'Submit your booking request'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <ImageZoomModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={images}
        initialIndex={currentImageIndex}
        spotName={parkingListing.title}
      />
    </TooltipProvider>
  );
};

export default ProductPage;