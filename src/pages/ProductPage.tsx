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

import ImageZoomModal from '@/components/ImageZoomModal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { logPhotoRepairReport } from '@/utils/photoRepair';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [selectedDuration, setSelectedDuration] = useState<any>({ months: 1, label: "1 Month", multiplier: 1.0, description: "Monthly rate" });
  const [userPhone, setUserPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [parkingListing, setParkingListing] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const DURATION_OPTIONS = [
    { months: 1, label: "1 Month", multiplier: 1.0, description: "Monthly rate" },
    { months: 3, label: "3 Months", multiplier: 0.95, description: "5% OFF" },
    { months: 6, label: "6 Months", multiplier: 0.90, description: "10% OFF" },
    { months: 12, label: "12 Months", multiplier: 0.85, description: "15% OFF" }
  ];

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

  const calculateTotal = () => {
    if (!parkingListing?.price_per_month) return { basePrice: 0, finalPrice: 0, savings: 0, monthlyRate: 0 };
    
    const baseMonthlyPrice = parkingListing.price_per_month;
    let finalPrice: number;
    let savings: number = 0;
    
    if (selectedDuration.months === 1) {
      finalPrice = baseMonthlyPrice;
    } else {
      // Apply the discount formula: ((Listing Price – 100) × multiplier) × Number of Months + (100 × Number of Months)
      const discountedAmount = (baseMonthlyPrice - 100) * selectedDuration.multiplier;
      finalPrice = discountedAmount * selectedDuration.months + (100 * selectedDuration.months);
      
      // Calculate savings compared to regular monthly rate
      const regularTotal = baseMonthlyPrice * selectedDuration.months;
      savings = regularTotal - finalPrice;
    }
    
    const monthlyRate = finalPrice / selectedDuration.months;
    
    return {
      basePrice: baseMonthlyPrice * selectedDuration.months,
      finalPrice: Math.round(finalPrice),
      savings: Math.round(savings),
      monthlyRate: Math.round(monthlyRate)
    };
  };

  const handleSubmitBookingRequest = async () => {
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
      const { finalPrice } = calculateTotal();
      
      const { data, error } = await supabase.functions.invoke('submit-booking-request', {
        body: {
          startDate: startDate.toISOString(),
          duration: selectedDuration.months,
          userPhone,
          notes,
          zone: parkingListing.zone,
          location: parkingListing.title,
          costAed: finalPrice,
          parkingSpotName: parkingListing.title
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
    if (parkingListing.images && parkingListing.images.length > 0) {
      return parkingListing.images;
    }
    // Fallback to a default placeholder if no images
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
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Available
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{parkingListing.description || 'Secure parking space with convenient access.'}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Location</h3>
                    <p className="text-muted-foreground text-sm">{parkingListing.address}</p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        From AED {parkingListing.price_per_month}/month
                      </span>
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
                  <CardTitle>Reserve This Space</CardTitle>
                  <CardDescription>Choose your rental duration and start date</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Start Date Selection - Moved to Top */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date *</label>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => {
                        const today = new Date();
                        const minDate = new Date();
                        minDate.setDate(today.getDate() + 3); // 3 days from today
                        return date < minDate;
                      }}
                      className="rounded-md border pointer-events-auto w-full"
                    />
                  </div>

                  {/* Rental Duration Selection */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Rental Duration</label>
                    <div className="grid grid-cols-2 gap-3">
                      {DURATION_OPTIONS.map(option => (
                        <Button
                          key={option.months}
                          variant={selectedDuration.months === option.months ? "default" : "outline"}
                          className={`flex flex-col h-auto py-4 px-4 text-center relative ${
                            selectedDuration.months === option.months && option.months === 3
                              ? "bg-cyan-400 text-white border-2 border-cyan-400" 
                              : selectedDuration.months === option.months 
                                ? "bg-primary text-primary-foreground border-2 border-primary" 
                                : option.months === 3 
                                  ? "border-2 border-cyan-400 bg-cyan-50 hover:bg-cyan-100" 
                                  : "hover:border-primary"
                          }`}
                          onClick={() => setSelectedDuration(option)}
                        >
                          <span className="font-semibold text-base">{option.label}</span>
                          {option.months > 1 && (
                            <span className={`text-xs font-medium mt-1 ${
                              selectedDuration.months === option.months && option.months === 3 
                                ? "text-white" 
                                : "text-green-600"
                            }`}>
                              {option.description}
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Or choose Monthly Rolling (subject to availability)
                    </p>
                  </div>

                  {/* Monthly Billing Plan */}
                  {selectedDuration.months > 1 && (
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 border-2 border-gray-400 rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-600 rounded-sm"></div>
                          </div>
                          <h4 className="font-semibold text-gray-800">Monthly Billing Plan</h4>
                        </div>
                        
                        {(() => {
                          const { basePrice, finalPrice, savings, monthlyRate } = calculateTotal();
                          const regularMonthlyRate = parkingListing?.price_per_month || 0;
                          const commitmentDiscount = (regularMonthlyRate - monthlyRate);
                          
                          return (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Regular monthly rate</span>
                                <span>AED {regularMonthlyRate}</span>
                              </div>
                              {commitmentDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Commitment discount ({selectedDuration.months} months)</span>
                                  <span>-AED {Math.round(commitmentDiscount)}/month</span>
                                </div>
                              )}
                              <div className="flex justify-between font-medium">
                                <span>Your monthly rate</span>
                                <span>AED {monthlyRate}/month</span>
                              </div>
                              <hr className="my-2" />
                              <div className="flex justify-between text-blue-600 font-semibold text-lg">
                                <span>First month payment</span>
                                <span>AED {monthlyRate}</span>
                              </div>
                              <div className="text-xs text-blue-600 mt-2">
                                — Monthly Billing: You'll be charged AED {monthlyRate} each month for {selectedDuration.months} months
                              </div>
                              <div className="text-xs text-blue-600">
                                Total commitment: AED {finalPrice.toLocaleString()} over {selectedDuration.months} months
                              </div>
                              {savings > 0 && (
                                <div className="text-green-600 font-medium text-sm mt-2">
                                  You save AED {savings.toLocaleString()} with this {selectedDuration.months}-month commitment
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Total Cost Display */}
                  {(() => {
                    const { finalPrice } = calculateTotal();
                    return (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {selectedDuration.months === 1 ? "Monthly Cost:" : `Total Cost (${selectedDuration.months} months):`}
                          </span>
                          <span className="text-xl font-bold text-primary">
                            AED {finalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={handleSubmitBookingRequest}
                          disabled={!startDate || isSubmitting}
                          className="w-full"
                          size="lg"
                        >
                          {isSubmitting ? 'Submitting...' : `Reserve Space - AED ${calculateTotal().finalPrice.toLocaleString()}`}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Submit your booking request</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <p className="text-xs text-muted-foreground text-center">
                    No charges will be made at this time. Payment link will be provided after confirmation.
                  </p>
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