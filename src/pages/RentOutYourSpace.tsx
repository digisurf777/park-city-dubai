import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle, Wallet, Quote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import luxuryCar from "@/assets/luxury-car-dubai.png";
import phoneLogo from "@/assets/phone-logo.png";

const RentOutYourSpace = () => {
  const [monthlyPrice, setMonthlyPrice] = useState<number>(300);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    buildingName: "",
    district: "",
    bayType: "",
    accessDeviceDeposit: "",
    notes: ""
  });

  const serviceFee = Math.round(monthlyPrice * 0.03);
  const netPayout = monthlyPrice - serviceFee;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert("Thank you for listing your space. Our team will review the details within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[70vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${luxuryCar})`
        }}
      >
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

      {/* Three Steps Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img 
              src="/lovable-uploads/b290c213-897d-4efd-9d2c-6fc62c2f853e.png"
              alt="Rent a parking space in just 3 simple steps"
              className="w-full max-w-6xl mx-auto"
            />
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
                  Guaranteed monthly tenants
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-primary mr-3" />
                  Dedicated support
                </li>
              </ul>
              <Button 
                className="mt-8 bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
                onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Submit Your Listing
              </Button>
            </div>
            <div>
              <img 
                src={luxuryCar} 
                alt="Owner holding remote"
                className="w-full rounded-lg shadow-lg"
              />
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
                  <Input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-base font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone" className="text-base font-medium">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="buildingName" className="text-base font-medium">
                    Building / Tower Name *
                  </Label>
                  <Input
                    id="buildingName"
                    type="text"
                    required
                    value={formData.buildingName}
                    onChange={(e) => handleInputChange('buildingName', e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="district" className="text-base font-medium">
                    District *
                  </Label>
                  <Select value={formData.district} onValueChange={(value) => handleInputChange('district', value)}>
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
                  <Select value={formData.bayType} onValueChange={(value) => handleInputChange('bayType', value)}>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select bay type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="covered">Covered</SelectItem>
                      <SelectItem value="uncovered">Uncovered</SelectItem>
                      <SelectItem value="podium">Podium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="monthlyPrice" className="text-base font-medium">
                    Monthly Price (AED) *
                  </Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    min="300"
                    step="50"
                    required
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="mt-2 h-12"
                  />
                  <div className="mt-2 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>You earn:</strong> {monthlyPrice} AED - 3% = <strong className="text-primary">{netPayout} AED/month</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Service fee: {serviceFee} AED (3% of monthly price)
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="accessDeviceDeposit" className="text-base font-medium">
                    Access Device Deposit (AED)
                  </Label>
                  <Input
                    id="accessDeviceDeposit"
                    type="number"
                    value={formData.accessDeviceDeposit}
                    onChange={(e) => handleInputChange('accessDeviceDeposit', e.target.value)}
                    className="mt-2 h-12"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="photos" className="text-base font-medium">
                  Photos (max 5) *
                </Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    JPEG or PNG, max 3MB each
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-base font-medium">
                  Notes to Admin
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="mt-2"
                  rows={4}
                  placeholder="Any additional information about your parking space..."
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Service Fee Formula:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Listing fee:</strong> Free</li>
                  <li>• <strong>Service fee:</strong> 3% of owner's set monthly price</li>
                  <li>• <strong>Stripe payout frequency:</strong> 1× per month, minus 3% fee</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 text-lg font-semibold"
              >
                Submit Listing
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What customers say about SHAZAMPARKING
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "What a nice parking service! Thanks for the amazing options for car parking spots around our city. Having such a reliable backup is liberating.",
                name: "Aaliyah Armasi"
              },
              {
                quote: "Everyone I know really likes ShazamParking services. Thank you for your effective and expedient help as well as easy booking! Stay awesome!",
                name: "Ahmed Mohammed"
              },
              {
                quote: "Simple and easy-to-use, perfect service.",
                name: "Murtaza Hussain"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Floating CTA Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full shadow-lg"
          onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Submit Listing
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default RentOutYourSpace;