import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Car, CreditCard, Ruler, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageZoomModal from "@/components/ImageZoomModal";

const ProductPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [selectedDuration, setSelectedDuration] = useState<number>(12);
  const [userPhone, setUserPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);

  // Mock data - in real app, fetch by ID
  const parkingSpots = [
    {
      id: 1,
      name: "Marina Gate Parking Bay",
      district: "Dubai Marina",
      price: 450,
      image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
      specs: ["Compact Size", "Access Card", "2.1m Height"],
      available: true,
      description: "Secure underground parking bay in the heart of Dubai Marina. Easy access to metro, shopping, and dining. 24/7 security and CCTV monitoring."
    },
    {
      id: 2,
      name: "DIFC Gate Village Bay",
      district: "DIFC",
      price: 650,
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
      specs: ["Large Size", "Remote Access", "3.0m Height"],
      available: true,
      description: "Premium parking space in DIFC Gate Village. Perfect for business professionals with covered parking and elevator access."
    }
  ];

  const spot = parkingSpots.find(s => s.id === parseInt(id || "1")) || parkingSpots[0];

  const durationOptions = [
    { months: 1, discount: 0, label: "1 Month" },
    { months: 3, discount: 0.05, label: "3 Months" },
    { months: 6, discount: 0.10, label: "6 Months" },
    { months: 12, discount: 0.15, label: "12 Months" }
  ];

  const calculatePrice = () => {
    const baseRent = spot.price;
    const selectedOption = durationOptions.find(opt => opt.months === selectedDuration);
    const discount = selectedOption?.discount || 0;
    
    // Apply discount to base rent
    const rentAfterDiscount = baseRent * (1 - discount);
    
    // Customer pays the discounted rent + 100 AED service fee
    const customerPrice = rentAfterDiscount + 100;
    
    // Calculate total for the duration
    const totalPrice = customerPrice * selectedDuration;
    const discountAmount = baseRent * discount * selectedDuration;
    
    return {
      basePrice: baseRent * selectedDuration,
      discountAmount,
      totalPrice,
      discount: discount * 100,
      monthlyCustomerPrice: customerPrice,
      monthlyRentAfterDiscount: rentAfterDiscount
    };
  };

  const pricing = calculatePrice();

  const handleSubmitBookingRequest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a booking request.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate) {
      toast({
        title: "Start Date Required",
        description: "Please select a start date for your booking.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        parkingSpotId: spot.id.toString(),
        parkingSpotName: spot.name,
        startDate: startDate.toISOString(),
        duration: selectedDuration,
        totalPrice: pricing.totalPrice,
        userEmail: user.email || "",
        userName: user.user_metadata?.full_name || user.email || "",
        userPhone: userPhone,
        notes: notes,
      };

      const { data, error } = await supabase.functions.invoke('submit-booking-request', {
        body: bookingData,
      });

      if (error) throw error;

      console.log('Booking request submitted:', data);
      
      setBookingReference(data.bookingId?.slice(0, 8).toUpperCase() || "");
      setShowConfirmation(true);
      
      toast({
        title: "Booking Request Submitted!",
        description: "We'll contact you within 2 working days to confirm availability.",
      });

    } catch (error: any) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if start date is within 7 days
  const isWithin7Days = startDate ? 
    (startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7 : false;

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-green-600">✅ Your booking request has been submitted!</h1>
            
            <div className="bg-muted/50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold mb-3">What happens next:</h3>
              <ul className="text-left space-y-2 max-w-md mx-auto">
                <li>• We will contact you within <strong>2 working days</strong> to confirm availability</li>
                <li>• You'll receive a payment link after confirmation</li>
                <li>• <strong>No charges have been made at this time</strong></li>
              </ul>
            </div>

            {bookingReference && (
              <p className="text-muted-foreground mb-6">
                Booking Reference: <strong>{bookingReference}</strong>
              </p>
            )}

            <div className="space-y-4">
              <Button 
                onClick={() => setShowConfirmation(false)}
                variant="outline"
              >
                Submit Another Request
              </Button>
              <div>
                <Link to="/find-a-parking-space">
                  <Button>Browse More Spaces</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-zoom-slow">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Back Button */}
        <Link 
          to="/find-a-parking-space" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Info */}
          <div>
            <div 
              className="relative aspect-video mb-6 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={spot.image}
                alt={spot.name}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                From AED {spot.price + 100} / month
              </Badge>
            </div>

            <h1 className="text-3xl font-bold mb-2">{spot.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">{spot.district}</p>

            {/* Specs */}
            <div className="flex items-center gap-6 mb-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <span>{spot.specs[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>{spot.specs[1]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                <span>{spot.specs[2]}</span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {spot.description}
            </p>

            {/* Benefits */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Benefits:</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Pre-booked parking space</li>
                <li>• Fixed price - no increases during the fixed rental period</li>
                <li>• Customer support</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Reserve Your Space</h2>
              
              {/* Start Date */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 touch-manipulation",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd.MM.yyyy") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => {
                        const today = new Date();
                        const minDate = new Date();
                        minDate.setDate(today.getDate() + 2);
                        return date < minDate;
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Rental Duration */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-4 block">Rental Duration</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {durationOptions.map((option) => (
                    <Card
                      key={option.months}
                      className={cn(
                        "cursor-pointer transition-all border-2 touch-manipulation min-h-[80px]",
                        selectedDuration === option.months
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedDuration(option.months)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="font-semibold mb-1">{option.label}</div>
                        {option.months === 1 ? (
                          <div className="text-sm opacity-75">AED {(spot.price + 100).toFixed(0)}/month</div>
                        ) : (
                          <div className="text-sm font-medium">{(option.discount * 100)}% OFF</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Additional Fields */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Phone Number (Optional)</label>
                <Input
                  type="tel"
                  placeholder="Your phone number"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                <Textarea
                  placeholder="Any special requirements or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Price Summary */}
              <Card className="bg-muted/50 p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Rate (after discount):</span>
                    <span className="font-medium">AED {pricing.monthlyRentAfterDiscount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Service Fee:</span>
                    <span className="font-medium">+AED 100/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Cost to You:</span>
                    <span className="font-medium">AED {pricing.monthlyCustomerPrice.toFixed(0)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total for {selectedDuration} month{selectedDuration > 1 ? 's' : ''}:</span>
                    <span className="text-2xl font-bold text-primary">
                      AED {pricing.totalPrice.toFixed(0)}
                    </span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="text-sm text-green-600">
                      You save AED {pricing.discountAmount.toFixed(0)} with {pricing.discount}% OFF
                    </div>
                  )}
                </div>
              </Card>

              {/* Important Notice */}
              <Card className="bg-blue-50 border-blue-200 p-4 mb-6">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">📋 Booking Process:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Your booking request will be reviewed</li>
                    <li>• We'll contact you within 2 working days</li>
                    <li>• Payment will be requested only after confirmation</li>
                    {isWithin7Days && (
                      <li className="text-orange-600 font-medium">
                        • Bookings within 7 days require manual approval
                      </li>
                    )}
                  </ul>
                </div>
              </Card>

              <Button 
                onClick={handleSubmitBookingRequest}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium touch-manipulation"
                disabled={!startDate || isSubmitting}
                size="lg"
              >
                {isSubmitting ? "Submitting..." : "👉 Submit Booking Request"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                No charges will be made at this time. Payment link will be provided after confirmation.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={[spot.image]}
        initialIndex={0}
        spotName={spot.name}
      />
    </div>
  );
};

export default ProductPage;