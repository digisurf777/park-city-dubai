import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions | ShazamParking</title>
        <meta name="description" content="ShazamParking Terms and Conditions - Read our complete terms of service, user agreements, and legal policies for parking booking and listing services in Dubai, UAE." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
            <p className="text-xl opacity-90">General Terms and Conditions</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-foreground">
              {/* Content will be added here */}
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default TermsAndConditions;