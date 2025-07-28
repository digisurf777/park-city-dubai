import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Car, Clock, CreditCard, MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface ParkingSpot {
  id: string | number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  specs?: string[];
  address?: string;
  description?: string;
}
interface ParkingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  parkingSpot: ParkingSpot | null;
}
const DURATION_OPTIONS = [{
  months: 1,
  label: "1 Month",
  multiplier: 1.0,
  description: "Monthly rate"
}, {
  months: 3,
  label: "3 Months",
  multiplier: 0.95,
  description: "5% OFF"
}, {
  months: 6,
  label: "6 Months",
  multiplier: 0.90,
  description: "10% OFF"
}, {
  months: 12,
  label: "12 Months",
  multiplier: 0.85,
  description: "15% OFF"
}];
export const ParkingBookingModal = ({
  isOpen,
  onClose,
  parkingSpot
}: ParkingBookingModalProps) => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  useEffect(() => {
    if (!isOpen) {
      setStartDate(undefined);
      setSelectedDuration(DURATION_OPTIONS[0]);
      setIsCalendarOpen(false);
      setUserPhone("");
      setNotes("");
      setIsSubmitting(false);
      setShowConfirmation(false);
      setBookingReference("");
    }
  }, [isOpen]);
  if (!parkingSpot) return null;
  const calculateTotal = () => {
    // Use the correct formula: ((Listing Price – 100) × multiplier) × Number of Months + (100 × Number of Months)
    let finalPrice: number;
    let savings: number = 0;
    if (selectedDuration.months === 1) {
      // For 1 month, use the original price
      finalPrice = parkingSpot.price;
    } else {
      // For 3, 6, 12 months, use the formula
      const discountedAmount = (parkingSpot.price - 100) * selectedDuration.multiplier;
      finalPrice = discountedAmount * selectedDuration.months + 100 * selectedDuration.months;

      // Calculate savings compared to regular monthly rate
      const regularTotal = parkingSpot.price * selectedDuration.months;
      savings = regularTotal - finalPrice;
    }
    return {
      basePrice: parkingSpot.price * selectedDuration.months,
      finalPrice: Math.round(finalPrice),
      savings: Math.round(savings)
    };
  };
  const {
    basePrice,
    finalPrice,
    savings
  } = calculateTotal();
  const handleReserve = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: <div className="space-y-3">
            <p className="text-sm">Please log in to submit a booking request.</p>
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
    if (!startDate) {
      toast({
        title: "Start Date Required",
        description: "Please select a start date for your booking.",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const bookingData = {
        startDate: startDate.toISOString(),
        duration: selectedDuration.months,
        userPhone,
        notes,
        zone: "Find Parking Page",
        location: parkingSpot.name,
        costAed: finalPrice,
        parkingSpotName: parkingSpot.name
      };
      const {
        data,
        error
      } = await supabase.functions.invoke('submit-booking-request', {
        body: bookingData
      });
      if (error) throw error;
      console.log('Booking request submitted:', data);
      setBookingReference(data.bookingId?.slice(0, 8).toUpperCase() || "");
      setShowConfirmation(true);
      toast({
        title: "Booking Submitted Successfully",
        description: "Please check your email for the payment link to complete your booking."
      });
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit booking request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if start date is within 7 days
  const isWithin7Days = startDate ? (startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7 : false;

  // Show confirmation screen
  if (showConfirmation) {
    return <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">✅ Booking Submitted Successfully!</h2>
            
            <div className="bg-green-50 p-6 rounded-lg mb-4">
              <h3 className="font-semibold mb-3 text-green-800">✅ Payment Link Sent to Email!</h3>
              <ul className="text-left space-y-2 max-w-md mx-auto text-green-700">
                <li>• A secure payment link has been sent to your email</li>
                <li>• Check your inbox for payment instructions</li>
                <li>• Complete payment setup to secure your space</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold mb-3 text-blue-800">Next Steps:</h3>
              <ul className="text-left space-y-2 max-w-md mx-auto text-blue-700">
                <li>• Complete your payment setup using the link</li>
                <li>• We'll review and confirm within 2 business days</li>
                <li>• Automatic refund if booking is not approved</li>
                <li>• Check your email for detailed instructions</li>
              </ul>
            </div>

            {bookingReference && <p className="text-muted-foreground mb-6">
                Booking Reference: <strong>{bookingReference}</strong>
              </p>}

            <div className="space-y-4">
              <Button onClick={() => setShowConfirmation(false)} variant="outline">
                Submit Another Request
              </Button>
              <div>
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>;
  }
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Reserve Parking Space</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Parking Details */}
          <div className="space-y-4">
            <div className="relative">
              {parkingSpot.images && parkingSpot.images.length > 0 ? <div className="space-y-2">
                  <img src={parkingSpot.images[0]} alt={parkingSpot.name} className="w-full h-48 object-cover rounded-lg" />
                  {parkingSpot.images.length > 1 && <div className="grid grid-cols-2 gap-2">
                      {parkingSpot.images.slice(1).map((image, index) => <img key={index + 1} src={image} alt={`${parkingSpot.name} - Image ${index + 2}`} className="w-full h-24 object-cover rounded-lg" />)}
                    </div>}
                </div> : <img src={parkingSpot.image} alt={parkingSpot.name} className="w-full h-48 object-cover rounded-lg" />}
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">{parkingSpot.name}</h3>
              {parkingSpot.address && <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{parkingSpot.address}</span>
                </div>}
              {parkingSpot.description && <p className="text-sm text-muted-foreground mb-4">{parkingSpot.description}</p>}
              
              {parkingSpot.specs && parkingSpot.specs.length > 0 && <div className="flex flex-wrap gap-2">
                  {parkingSpot.specs.map((spec, index) => {})}
                </div>}

              {/* Benefits Section */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 text-green-800">Benefits:</h4>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      Pre-booked parking space
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      Fixed price - no increases during the fixed rental period
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      Customer support
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="space-y-6">
            {/* Start Date Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={date => {
                  setStartDate(date);
                  setIsCalendarOpen(false);
                }} disabled={date => {
                  const today = new Date();
                  const minDate = new Date();
                  minDate.setDate(today.getDate() + 2);
                  return date < minDate;
                }} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Rental Duration</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DURATION_OPTIONS.map(option => <Button key={option.months} variant={selectedDuration.months === option.months ? "default" : "outline"} className="flex flex-col h-auto py-4 px-4 text-center" onClick={() => setSelectedDuration(option)}>
                    <span className="font-semibold">{option.label}</span>
                    {option.months > 1 && <span className="text-xs text-green-600 font-medium">
                        {option.description}
                      </span>}
                  </Button>)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Or choose Monthly Rolling (subject to availability)
              </p>
            </div>

            {/* Price Breakdown */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Price Breakdown
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base price ({selectedDuration.months} month{selectedDuration.months > 1 ? 's' : ''})</span>
                    <span>AED {basePrice.toLocaleString()}</span>
                  </div>
                  
                  {savings > 0 && <div className="flex justify-between text-sm text-green-600">
                      <span>Bulk rental discount</span>
                      <span>-AED {savings.toLocaleString()}</span>
                    </div>}
                  
                  <hr className="my-2" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>AED {finalPrice.toLocaleString()}</span>
                  </div>
                  
                  {savings > 0 && <p className="text-sm text-green-600 font-medium">
                      You save AED {savings.toLocaleString()} with long term rental pricing
                    </p>}
                </div>
              </CardContent>
            </Card>

            {/* Additional Fields */}
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
              <Input type="tel" placeholder="Your phone number" value={userPhone} onChange={e => setUserPhone(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <Textarea placeholder="Any special requirements or notes..." value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[80px]" />
            </div>

            {/* Important Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">📋 Booking Process:</p>
                  <p className="text-xs">All bookings subject to final confirmation of availability.</p>
                  {isWithin7Days}
                </div>
              </CardContent>
            </Card>

            {/* Reserve Button */}
            <Button onClick={handleReserve} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 text-lg" size="lg" disabled={!startDate || isSubmitting}>
              {isSubmitting ? "Submitting..." : "👉 Submit Booking Request"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              No charges will be made at this time. Payment link will be provided after confirmation.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};