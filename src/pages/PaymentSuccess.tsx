import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Processing your payment...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Payment Setup Complete!</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {bookingId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Booking Reference:</p>
                  <p className="font-mono text-lg font-semibold">{bookingId}</p>
                </div>
              )}

              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-start space-x-3">
                  <Clock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                    <ul className="text-blue-800 space-y-2 text-sm">
                      <li>• Your payment has been pre-authorized (not charged yet)</li>
                      <li>• Our team will review your booking within 2 business days</li>
                      <li>• You'll receive an email confirmation once approved</li>
                      <li>• If approved, your payment will be processed automatically</li>
                      <li>• If not approved, you'll receive a full refund</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">📧 Check Your Email</h4>
                <p className="text-green-800 text-sm">
                  We've sent you a detailed confirmation email with all the information about your booking and what to expect next.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="flex-1">
                  <Link to="/find-a-parking-space">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Book Another Space
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/">
                    Go to Homepage
                  </Link>
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Questions? Contact us at{" "}
                  <a href="mailto:support@shazamparking.ae" className="text-blue-600 hover:underline">
                    support@shazamparking.ae
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}