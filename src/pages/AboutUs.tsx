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
          <p className="leading-relaxed mb-6 text-base">
            ShazamParking is Dubai's leading peer-to-peer platform for long-term parking. We connect parking space owners with drivers who need secure, reliable, and affordable monthly parking in the city's busiest districts. Our mission is simple: to take the daily stress out of finding a parking spot and turn unused bays into value for owners.
          </p>
          
          <h2 className="text-2xl font-bold mb-4 mt-8">Our Story & Vision</h2>
          <p className="leading-relaxed mb-6 text-base">
            The idea for ShazamParking was born out of a common frustration: the constant search for parking in high-demand areas like DIFC, Downtown, Business Bay, Marina, Palm Jumeirah, and Deira. We set out to create a smarter solution that benefits both sides:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>Owners earn income from unused spaces.</li>
            <li>Drivers get pre-booked long-term parking without the uncertainty of daily fees or fines.</li>
          </ul>
          <p className="leading-relaxed mb-8 text-base">
            Our vision is to become the most trusted long-term parking platform in the UAE, supporting smarter, more efficient city living.
          </p>

          <h2 className="text-2xl font-bold mb-4 mt-8">How It Works for Owners</h2>
          <p className="leading-relaxed mb-4 text-base">Listing your parking space takes just minutes:</p>
          <ol className="list-decimal ml-6 mb-8 space-y-2">
            <li>Sign up and verify your account.</li>
            <li>Add your space details such as district, bay type, and monthly price.</li>
            <li>Upload photos to show your space clearly.</li>
            <li>Set access details and, if applicable, specify if an entry card or fob is required.</li>
            <li>Submit for approval and publish your listing.</li>
            <li>Approve booking when you will be notified of a proposed booking which you must approve or disapprove within 48h.</li>
          </ol>

          <h2 className="text-2xl font-bold mb-4 mt-8">How It Works for Drivers</h2>
          <p className="leading-relaxed mb-4 text-base">Finding parking with ShazamParking is simple:</p>
          <ol className="list-decimal ml-6 mb-6 space-y-2">
            <li>Sign up and verify your account.</li>
            <li>Search by district to see available spaces.</li>
            <li>View listings with clear, upfront pricing.</li>
            <li>Book long-term for 1, 3, 6, or 12 months (with discounts for longer pre-paid stays).</li>
            <li>Chat securely with the owner through our in-platform messaging, during the booking period (chat function available from up to 48h before to up to 48h after the approved booking period).</li>
          </ol>
          <p className="leading-relaxed mb-8 text-base">
            Please note that, when a driver makes a booking, the payment is first pre-authorised only. The owner then has up to 48 hours to approve the booking. Once approved, the payment is processed and charged to the driver's account. If the owner declines or does not respond within 48 hours, the pre-authorisation is automatically released back to the driver. This step is designed to ensure that none of the listings are out of date / parking spaces unavailable, prior to the driver committing to the booking.
          </p>

          <h2 className="text-2xl font-bold mb-4 mt-8">Communication and Handover</h2>
          <p className="leading-relaxed mb-6 text-base">
            To keep all arrangements safe, secure, and transparent, all communication takes place inside the platform chat. External apps such as WhatsApp are not permitted. This protects personal information and ensures there's always a record of what was agreed.
          </p>
          <p className="leading-relaxed mb-4 text-base">
            When it comes to handing over access, owners and drivers have flexible options including:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>Meet at the building for a quick exchange.</li>
            <li>Leave the access card with building security for collection.</li>
            <li>Hands-free delivery: use a courier service such as Careem Delivery to send the card securely between parties.</li>
          </ul>
          <p className="leading-relaxed mb-8 text-base">
            By coordinating through the in-platform chat, both sides can choose the method that works best, while keeping everything traceable.
          </p>

          <h2 className="text-2xl font-bold mb-4 mt-8">Transparent Fees</h2>
          <p className="leading-relaxed mb-4 text-base">The platform's fee model is clear and simple:</p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>Listing is FREE.</li>
            <li>Our fees are deducted from the rental amount paid by the driver and only apply once the parking space is actually rented out, as follows:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>20% commission: deducted from the owner's requested monthly rent only once rented.</li>
                <li>AED 100 flat service fee: added to every booking on top of the owner's requested rent. For full transparency, the drivers always already see this in their listed price.</li>
                <li>AED 100 deposit handling fee: applies only if an access card is required. The driver pays a refundable AED 500 deposit, and the owner pays a one-off AED 100 handling fee when that deposit is returned.</li>
              </ul>
            </li>
          </ul>
          <p className="leading-relaxed mb-8 text-base">
            Owners are paid monthly in arrears, with all fees already deducted. This protects drivers in case of any issues or disputes, while ensuring smooth and transparent payouts for owners. For exact figures, owners should use the built-in calculator, which clearly shows what the driver will pay and what the owner will receive.
          </p>

          <h2 className="text-2xl font-bold mb-4 mt-8">Why Long-Term Parking</h2>
          <p className="leading-relaxed mb-6 text-base">
            ShazamParking is built for long-term rentals only. The minimum rental is one month, but the platform encourages stability by automatically applying discounts for longer commitments:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>3 months – 5%</li>
            <li>6 months – 10%</li>
            <li>12 months – 15%</li>
          </ul>
          <p className="leading-relaxed mb-6 text-base">
            Both owners and drivers can see the effect of these discounts in the calculator provided on the listing page before a booking is made.
          </p>
          <p className="leading-relaxed mb-4 text-base">Long-term rentals bring stability for everyone:</p>
          <ul className="list-disc ml-6 mb-8 space-y-2">
            <li>Owners save time with fewer handovers.</li>
            <li>Drivers avoid the hassle of daily payments or fines.</li>
            <li>More cost-effective than paying hourly, especially for commuters who need a regular spot every day.</li>
            <li>Less congestion from drivers constantly searching for short-term spaces.</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4 mt-8">ID Verification for Safety and Trust</h2>
          <p className="leading-relaxed mb-8 text-base">
            To maintain a secure and trustworthy community, all users are required to complete ID verification before listing a space or booking one. This involves uploading a valid government-issued ID, which is reviewed as a measure for fraud-prevention. This step adds an important layer of security and accountability, helping to build confidence between owners and drivers.
          </p>

          <h2 className="text-2xl font-bold mb-4 mt-8">Why List Now</h2>
          <p className="leading-relaxed mb-12 text-base">
            Demand for secure monthly parking in Dubai is growing rapidly. As roadworks, new projects, and increased commuting put pressure on popular districts, long-term spaces are more valuable than ever. Owners who list today gain visibility and attract reliable long-term tenants.
          </p>
        </div>

        {/* CTA Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="text-center p-8 bg-card rounded-lg border">
            <h3 className="text-2xl font-bold mb-4">Are you looking to rent out your space?</h3>
            <Link to="/rent-out-your-space">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-medium rounded-md transition-colors">
                List Your space
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
