import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Car, Clock, CreditCard, MapPin, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from "@stripe/stripe-js";
import { Link } from "react-router-dom";
import { formatDescription } from "@/utils/formatDescription";

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
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      // Use the publishable key for your Stripe account
      const stripeInstance = await loadStripe("pk_test_51QFo5DCoXE17KEFVv2QwEHC2NSFcp8mZ6XZcuTZF8AsZlZZRhfPDJDExFCN9C5k7IhOYrSM5eQcDAPF4kse2kJQS00EqVuIUZZ");
      setStripe(stripeInstance);
    };
    initializeStripe();
  }, []);
  
  const [startDate, setStartDate] = useState<Date>();
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [paymentStep, setPaymentStep] = useState<'booking' | 'payment' | 'processing'>('booking');
  const [paymentIntentData, setPaymentIntentData] = useState<any>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [bookedDateRanges, setBookedDateRanges] = useState<Array<{ start: Date; end: Date }>>([]);
  // Fetch booked dates for this parking spot
  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!parkingSpot || !isOpen) return;
      
      try {
        console.log('📅 Fetching booked dates for spot:', {
          name: parkingSpot.name,
          address: parkingSpot.address
        });

        // Use secure RPC function to get booked date ranges
        const { data: dateRanges, error } = await supabase.rpc('get_booked_date_ranges', {
          p_title: parkingSpot.name,
          p_address: parkingSpot.address || null,
          p_zone: parkingSpot.address ? 'Find Parking Page' : null
        });

        if (error) {
          console.error('❌ RPC error:', error);
          throw error;
        }

        console.log('📅 Received date ranges from DB:', dateRanges);

        if (dateRanges && dateRanges.length > 0) {
          const ranges = dateRanges.map((range: { start_date: string; end_date: string }) => {
            const start = new Date(range.start_date + 'T00:00:00');
            const end = new Date(range.end_date + 'T23:59:59');
            console.log(`📅 Booked: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`);
            return { start, end };
          });
          setBookedDateRanges(ranges);
        } else {
          console.log('📅 No booked dates for this spot');
          setBookedDateRanges([]);
        }
      } catch (error) {
        console.error('❌ Error fetching booked dates:', error);
        setBookedDateRanges([]);
      }
    };

    fetchBookedDates();
  }, [parkingSpot, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStartDate(undefined);
      setSelectedDuration(DURATION_OPTIONS[0]);
      setIsCalendarOpen(false);
      setIsSubmitting(false);
      setShowConfirmation(false);
      setBookingReference("");
      setPaymentStep('booking');
      setPaymentIntentData(null);
      setAgreeToTerms(false);
      setBookedDateRanges([]);
    }
  }, [isOpen]);
  if (!parkingSpot) return null;

  // Helper function to check if a date is booked
  const isDateBooked = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return bookedDateRanges.some(range => {
      const rangeStart = new Date(range.start);
      const rangeEnd = new Date(range.end);
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd.setHours(0, 0, 0, 0);
      
      return checkDate >= rangeStart && checkDate <= rangeEnd;
    });
  };

  // Get all booked dates for modifiers
  const getAllBookedDates = () => {
    const dates: Date[] = [];
    bookedDateRanges.forEach(range => {
      const current = new Date(range.start);
      const end = new Date(range.end);
      
      while (current <= end) {
        const newDate = new Date(current);
        newDate.setHours(0, 0, 0, 0);
        dates.push(newDate);
        current.setDate(current.getDate() + 1);
      }
    });
    return dates;
  };

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

    if (!agreeToTerms) {
      toast({
        title: "Terms & Conditions Required",
        description: "Please agree to the Terms & Conditions before booking.",
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
    setPaymentStep('booking');
    
    try {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + selectedDuration.months);
      
      const bookingData = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: selectedDuration.months,
        email: user.email,
        fullName: user.user_metadata?.full_name || "",
        phone: user.user_metadata?.phone || "",
        location: parkingSpot.name,
        zone: "Find Parking Page",
        costAed: finalPrice,
        parkingSpotName: parkingSpot.name
      };

      // Submit booking request (this creates the pre-authorization PaymentIntent)
      const { data, error } = await supabase.functions.invoke('submit-booking-request', {
        body: bookingData
      });

      if (error) throw error;

      setBookingReference(data.bookingId);
      
      // If we got a payment URL, open it in a new tab
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
        toast({
          title: "Pre-Authorization Required",
          description: "We opened Stripe to authorize your payment. A confirmation email was sent.",
        });
        setShowConfirmation(true);
      } else {
        // Fallback to email flow
        setShowConfirmation(true);
        toast({
          title: "Booking Submitted Successfully",
          description: "Please check your email for the payment link to complete your booking."
        });
      }

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed", 
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!stripe || !paymentIntentData?.clientSecret) {
      toast({
        title: "Payment Error",
        description: "Payment system not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setPaymentStep('processing');

    try {
      // For demo purposes, we'll use a test payment method
      // In a real implementation, you'd collect the payment method from the user
      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentIntentData.clientSecret, {
        payment_method: {
          card: {
            token: 'tok_visa' // Test token - in production, collect real card details
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'requires_capture') {
        // Pre-authorization successful
        setShowConfirmation(true);
        toast({
          title: "Payment Pre-Authorized",
          description: "Your payment has been pre-authorized. Booking is pending approval.",
        });
      } else {
        throw new Error("Unexpected payment status: " + paymentIntent?.status);
      }

    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Payment authorization failed",
        variant: "destructive",
      });
      setPaymentStep('payment');
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
              {parkingSpot.description && (
                <div className="mb-4">
                  {formatDescription(parkingSpot.description)}
                </div>
              )}
              

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
                  <Calendar 
                    mode="single" 
                    selected={startDate} 
                    onSelect={date => {
                      setStartDate(date);
                      setIsCalendarOpen(false);
                    }} 
                    disabled={date => {
                      const today = new Date();
                      const minDate = new Date();
                      minDate.setDate(today.getDate() + 2);
                      minDate.setHours(0, 0, 0, 0);
                      
                      const checkDate = new Date(date);
                      checkDate.setHours(0, 0, 0, 0);
                      
                      // Disable dates before minimum
                      if (checkDate < minDate) return true;
                      
                      // Disable booked dates
                      return isDateBooked(date);
                    }} 
                    modifiers={{
                      booked: getAllBookedDates()
                    }}
                    modifiersClassNames={{
                      booked: 'bg-red-200 text-red-900 line-through opacity-80 hover:bg-red-200 cursor-not-allowed'
                    }}
                    initialFocus 
                    className="p-3 pointer-events-auto" 
                  />
                  {/* Calendar Legend */}
                  <div className="border-t p-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
                      <span className="text-muted-foreground">Already booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted"></div>
                      <span className="text-muted-foreground">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted opacity-50"></div>
                      <span className="text-muted-foreground">Too soon (2-day minimum)</span>
                    </div>
                  </div>
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

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="booking-terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
                required
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="booking-terms"
                  className="text-sm font-normal leading-5 cursor-pointer"
                >
                  I agree to the{" "}
                  <Link 
                    to="/terms-and-conditions" 
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    Terms & Conditions
                  </Link>
                  .
                </Label>
              </div>
            </div>

            {/* Reserve Button */}
            <Button 
              onClick={handleReserve} 
              disabled={isSubmitting} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 text-lg" 
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Pre-Authorization...
                </>
              ) : (
                `Pre-Authorize Space - AED ${finalPrice.toLocaleString()}`
              )}
            </Button>

            <div className="space-y-2 text-xs text-muted-foreground text-center">
              <p className="flex items-center justify-center gap-1">
                <CreditCard className="w-3 h-3" />
                Pre-authorization holds funds for 7 days without charging
              </p>
              <p>Payment will only be captured after admin approval</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};