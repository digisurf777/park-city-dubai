import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import dubaiHero from "@/assets/dubai-hero-aboutus.jpg";
const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <div className="min-h-screen bg-background animate-zoom-slow">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-black/40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${dubaiHero})` }}
        ></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">About Us</h1>
            <p className="text-xl md:text-2xl opacity-90">Your trusted parking platform in Dubai</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <p className="leading-relaxed mb-6 text-base"> mission is to make parking easy, convenient and accessible to everyone. We understand the frustration of circling around a block looking for a parking spot, or the struggle of finding a safe and secure place to leave your vehicle. That's why we decided to create a platform that connects those who have parking spaces for rent with those in need of a place to park.</p>
          
          <p className="leading-relaxed mb-6 text-base">At ShazamParking, we want to bring the sharing economy into the digital age. Our platform is user-friendly and easy to navigate, helping people to find, book and pay for parking spaces. Car space owners can list their vacant parking spaces, and drivers can search for available spots in their desired location. This helps drivers find the perfect parking spot that suits their needs and budget, and car space owners who rent out their spot generate an extra income stream – it's a win-win!</p>
          
          <p className="leading-relaxed mb-8 text-base">
            We also understand the importance of security and safety when it comes to parking. That's why we conduct identity verification on our platform's users to ensure car space owners maintain high standards and drivers act respectfully.
          </p>
          
          <p className="leading-relaxed mb-12 text-base">
            Our parking platform is the solution for both parking space owners looking to monetize their extra parking spaces and for drivers looking for a convenient and secure place to park. We take the hassle out of parking and make it easy for everyone.
          </p>
        </div>

        {/* CTA Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="text-center p-8 bg-card rounded-lg border">
            <h3 className="text-2xl font-bold mb-4">Are you looking to rent out your space?</h3>
            <Link to="/rent-out-your-space">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-medium rounded-md transition-colors">
                List Your Space
              </Button>
            </Link>
          </div>
          
          <div className="text-center p-8 bg-card rounded-lg border">
            <h3 className="text-2xl font-bold mb-4">Are you looking for a parking space?</h3>
            <Link to="/find-a-parking-space">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-medium rounded-md transition-colors">
                Book a space
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>;
};
export default AboutUs;
