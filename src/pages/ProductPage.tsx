import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Star, Zap, Shield, Wifi, Car, ChevronLeft, ChevronRight, ZoomIn, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [parkingListing, setParkingListing] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isCurrentlyBooked, setIsCurrentlyBooked] = useState<boolean>(false); // Check actual booking status
  
  const DURATION_OPTIONS = [
    { months: 1, label: "1 Month", multiplier: 1.0, description: "Monthly rate" },
    { months: 3, label: "3 Months", multiplier: 0.95, description: "5% OFF" },
    { months: 6, label: "6 Months", multiplier: 0.90, description: "10% OFF" },
    { months: 12, label: "12 Months", multiplier: 0.85, description: "15% OFF" }
  ];

  // Check if parking space is currently booked (excluding cancelled bookings)
  const checkBookingStatus = async (listingData: any) => {
    try {
      console.log('DEBUG: Checking booking status for listing:', JSON.stringify(listingData, null, 2));
      
      // Query by listing ID first (most accurate)
      let { data: activeBookings, error } = await supabase
        .from('parking_bookings')
        .select('id, status, start_time, end_time, location')
        .eq('location', listingData.id)
        .neq('status', 'cancelled')
        .in('status', ['pending', 'confirmed', 'active']);

      console.log('DEBUG: Query by ID result:', JSON.stringify({ activeBookings, error }, null, 2));

      // If no results by ID, try by title
      if (!activeBookings?.length && listingData.title) {
        const titleQuery = await supabase
          .from('parking_bookings')
          .select('id, status, start_time, end_time, location')
          .eq('location', listingData.title)
          .neq('status', 'cancelled')
          .in('status', ['pending', 'confirmed', 'active']);
          
        activeBookings = titleQuery.data;
        error = titleQuery.error;
        console.log('DEBUG: Query by title result:', JSON.stringify({ activeBookings, error }, null, 2));
      }

      if (error) {
        console.error('Error checking booking status:', error);
        return false; // Default to available if error
      }

      // Check if any active booking overlaps with current time
      const now = new Date();
      const hasActiveBooking = activeBookings?.some(booking => {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        const isOverlapping = now >= startTime && now <= endTime;
        console.log('DEBUG: Booking time check:', { 
          bookingId: booking.id, 
          startTime: startTime.toISOString(), 
          endTime: endTime.toISOString(), 
          now: now.toISOString(), 
          isOverlapping 
        });
        return isOverlapping;
      });

      console.log('DEBUG: Final booking status check:', { 
        listingId: listingData.id, 
        listingTitle: listingData.title,
        activeBookingsCount: activeBookings?.length || 0, 
        hasActiveBooking,
        currentTime: now.toISOString()
      });
      return hasActiveBooking || false;
    } catch (error) {
      console.error('Error in checkBookingStatus:', error);
      return false;
    }
  };

  // Fetch parking listing data securely
  useEffect(() => {
    const fetchParkingListing = async () => {
      if (!id) {
        setError('No parking listing ID provided');
        setLoading(false);
        return;
      }

      try {
        // First try to get full data (for owners, confirmed booking users, and admins)
        const { data: fullData, error: fullError } = await supabase
          .from('parking_listings')
          .select('*')
          .eq('id', id)
          .single();

        if (fullData && !fullError) {
          console.log('Fetched full parking listing data:', fullData);
          setParkingListing(fullData);
          
          // Check if space is currently booked
          const isBooked = await checkBookingStatus(fullData);
          setIsCurrentlyBooked(isBooked);
          return;
        }

        // If full access failed, try public data (basic info without contact details)
        const { data: publicData, error: publicError } = await supabase
          .from('parking_listings_public')
          .select('*')
          .eq('id', id)
          .single();

        if (publicError) {
          console.error('Error fetching parking listing:', publicError);
          setError('Failed to load parking listing');
          return;
        }

        if (!publicData) {
          setError('Parking listing not found');
          return;
        }

        console.log('Fetched public parking listing data:', publicData);
        // Set parking listing data without owner_id (not available in public table)
        setParkingListing({
          ...publicData,
          // Contact info will be null for public access - only available after booking confirmation
          contact_email: null,
          contact_phone: null
        });

        // Check if space is currently booked
        const isBooked = await checkBookingStatus(publicData);
        setIsCurrentlyBooked(isBooked);
      } catch (error) {
        console.error('Error:', error);
        setError('An unexpected error occurred');
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
                      {isCurrentlyBooked ? (
                        <Badge variant="destructive" className="bg-red-500 text-white border-red-500">
                          Currently Booked
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500 text-white border-green-500">
                          Available
                        </Badge>
                      )}
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
              <Card className={isCurrentlyBooked ? "opacity-50" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isCurrentlyBooked ? (
                      <>
                        <span className="text-red-500">This Space is Currently Booked</span>
                        <Badge variant="destructive" className="bg-red-500 text-white">Unavailable</Badge>
                      </>
                    ) : (
                      "Reserve This Space"
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isCurrentlyBooked 
                      ? "This parking space is currently occupied and not available for booking."
                      : "Choose your rental duration and start date"
                    }
                  </CardDescription>
                </CardHeader>
                
                {/* Always show unavailable for all spaces */}
                <CardContent className="space-y-6">
                  {isCurrentlyBooked ? (
                    <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Car className="h-8 w-8 text-red-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-red-700 mb-2">Space Currently Occupied</h3>
                      <p className="text-red-600 mb-4">
                        This parking space is currently booked and not available for new reservations.
                      </p>
                      
                      <div className="w-full bg-red-500 text-white py-4 rounded-lg text-center font-semibold text-lg mb-4">
                        Currently Booked
                      </div>
                    
                      <Button 
                        onClick={() => navigate('/')} 
                        variant="outline" 
                        className="border-red-500 text-red-700 hover:bg-red-50"
                      >
                        Find Available Spaces
                      </Button>
                    </div>
                  ) : (
                    <div>Booking form would go here when available</div>
                  )}
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
