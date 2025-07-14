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
  discount: 0,
  description: "Monthly rate"
}, {
  months: 3,
  label: "3 Months",
  discount: 5,
  description: "5% OFF"
}, {
  months: 6,
  label: "6 Months",
  discount: 10,
  description: "10% OFF"
}, {
  months: 12,
  label: "12 Months",
  discount: 15,
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
    const basePrice = parkingSpot.price * selectedDuration.months;
    const discountAmount = basePrice * selectedDuration.discount / 100;
    return {
      basePrice,
      discountAmount,
      finalPrice: basePrice - discountAmount,
      savings: discountAmount
    };
  };
  const {
    basePrice,
    discountAmount,
    finalPrice,
    savings
  } = calculateTotal();
  const handleReserve = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a booking request.",
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
        parkingSpotId: parkingSpot.id.toString(),
        parkingSpotName: parkingSpot.name,
        startDate: startDate.toISOString(),
        duration: selectedDuration.months,
        totalPrice: finalPrice,
        userEmail: user.email || "",
        userName: user.user_metadata?.full_name || user.email || "",
        userPhone: userPhone,
        notes: notes
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
        title: "Booking Request Submitted!",
        description: "We'll contact you within 2 working days to confirm availability."
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
            <h2 className="text-2xl font-bold mb-4 text-green-600">✅ Your booking request has been submitted!</h2>
            
            <div className="bg-muted/50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold mb-3">What happens next:</h3>
              <ul className="text-left space-y-2 max-w-md mx-auto">
                <li>• We will contact you within <strong>2 working days</strong> to confirm availability</li>
                <li>• You'll receive a payment link after confirmation</li>
                <li>• <strong>No charges have been made at this time</strong></li>
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Reserve Parking Space</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Parking Details */}
          <div className="space-y-4">
            <div className="relative">
              <img src={parkingSpot.image} alt={parkingSpot.name} className="w-full h-48 object-cover rounded-lg" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">{parkingSpot.name}</h3>
              {parkingSpot.address && <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{parkingSpot.address}</span>
                </div>}
              {parkingSpot.description && <p className="text-sm text-muted-foreground mb-4">{parkingSpot.description}</p>}
              
              {parkingSpot.specs && parkingSpot.specs.length > 0 && <div className="flex flex-wrap gap-2">
                  {parkingSpot.specs.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="space-y-6">
            {/* Start Date Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={date => {
                  setStartDate(date);
                  setIsCalendarOpen(false);
                }} disabled={date => date < new Date()} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Rental Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {DURATION_OPTIONS.map(option => <Button key={option.months} variant={selectedDuration.months === option.months ? "default" : "outline"} className="flex flex-col h-auto py-3 px-4" onClick={() => setSelectedDuration(option)}>
                    <span className="font-semibold">{option.label}</span>
                    {option.discount > 0 && <span className="text-xs text-green-600 font-medium">
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
                  
                  {selectedDuration.discount > 0 && <div className="flex justify-between text-sm text-green-600">
                      <span>{selectedDuration.discount}% discount</span>
                      <span>-AED {discountAmount.toLocaleString()}</span>
                    </div>}
                  
                  <hr className="my-2" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>AED {finalPrice.toLocaleString()}</span>
                  </div>
                  
                  {savings > 0 && <p className="text-sm text-green-600 font-medium">
                      You save AED {savings.toLocaleString()} with {selectedDuration.discount}% OFF
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
                  {isWithin7Days && <p className="text-orange-600 font-medium text-xs mt-2">
                      • Bookings within 7 days require manual approval
                    </p>}
                </div>
              </CardContent>
            </Card>

            {/* Reserve Button */}
            <Button onClick={handleReserve} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg" size="lg" disabled={!startDate || isSubmitting}>
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