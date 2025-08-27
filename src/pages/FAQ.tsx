import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import dubaiParkingHero from "@/assets/dubai-parking-hero.jpg";

const FAQ = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const faqData = [{
    category: "Platform & General",
    questions: [{
      question: "🔑 How does ShazamParking work?",
      answer: "ShazamParking is an online platform that connects drivers looking for parking with owners who have a space available. Drivers pay upfront through our secure system. Owners receive payment after the rental period ends, subject to our Terms and Conditions."
    }, {
      question: "🆔 What details do you verify before accepting listings or reservations?",
      answer: "To maintain trust and safety on our platform, we may request identification, such as Emirates ID or similar, from owners and drivers before approving a listing or reservation."
    }, {
      question: "🏙️ Is there a mobile app?",
      answer: "We do not have a dedicated mobile app yet, but our website is fully mobile-optimised. You can search for spaces, make bookings, message owners, and manage your account easily from your smartphone or tablet."
    }, {
      question: "📄 Where can I find more details about how ShazamParking works?",
      answer: "Always refer to our Terms and Conditions, Cancellation Policy, and Privacy Policy for full details on payments, fees, access card fees, cancellations, disputes, and your rights and responsibilities. These documents form the official agreement when you use our platform."
    }]
  }, {
    category: "Payments & Fees",
    questions: [{
      question: "💳 How do I pay for a parking space?",
      answer: "Payments are made securely online at the time of booking. Drivers see a clear breakdown of the base rent, driver service charge, and any access card fee before completing payment. Important: All payments must go through ShazamParking. Out-of-platform payments are strictly prohibited and put you at risk. Report any such requests immediately to support@shazamparking.ae."
    }, {
      question: "💰 How does ShazamParking's payment fee structure work?",
      answer: "When a space is booked, the driver pays upfront through our secure system. This includes: • The base rent (which may include a discount for longer bookings) • A fixed driver service charge • An access card fee (if an access device is provided). Owners receive the base rent minus our agreed commission and any applicable access card handling fee. Example: For a 6-month booking with 1,000 AED requested monthly rent and 10% discount: Driver pays 6,000 AED upfront (900 + 100 per month x 6) plus 500 AED access card fee. Owner receives approx. 4,220 AED for the full period (after commission and handling fee) paid monthly in arrears."
    }, {
      question: "🏦 When do owners receive payment?",
      answer: "Payments to owners are made via UAE bank transfer, usually within 15 days after the end of the booking month, provided the rental has been completed satisfactorily and all access items have been returned. Owners must ensure their bank details are up to date in their account."
    }, {
      question: "🔄 Why is an access card fee charged?",
      answer: "When an access device (such as a remote or card) is provided for a booking, a refundable access card fee is held to protect the owner's property. The driver pays this upfront and it is refunded once the item is returned in good condition. An access card handling fee may apply for the owner."
    }, {
      question: "📈 How should owners set their pricing?",
      answer: "We provide suggested price ranges and a minimum fee for each zone to help owners avoid mispricing and ensure fair, competitive pricing. Final pricing is always the owner's responsibility."
    }]
  }, {
    category: "Bookings & Management",
    questions: [{
      question: "❌ Can I cancel my booking?",
      answer: "All bookings are subject to our standard Cancellation Policy. Please refer to the full Cancellation Policy on our website for details on when refunds may or may not apply."
    }, {
      question: "📅 How do I manage or update my bookings and account?",
      answer: "Log in to your ShazamParking account at any time to manage listings, update your bank details, check upcoming bookings, track payments, and view reviews. Keeping your account details current helps ensure smooth transactions."
    }, {
      question: "🗝️ How is the access card transferred between the owner and the driver?",
      answer: "We recommend either a hands-free exchange using a trusted courier service such as Careem Deliveries. In this case, the delivery would be booked at the owner's expense when sending the access card to the driver, and at the driver's expense when returning it to the owner. Alternatively, owners and drivers can arrange an in-person handover by meeting at a mutually agreed location, usually at or near the parking space, or by leaving the card at a safe location for collection. All details should be agreed in advance through the in-platform chat."
    }]
  }, {
    category: "Support & Issues",
    questions: [{
      question: "⭐️ Can I leave a review?",
      answer: "Yes. We value your feedback. Drivers and owners can leave a review after each completed booking. We also encourage you to share your experience on Trustpilot and Google Reviews."
    }, {
      question: "📞 How do I get support if I need help?",
      answer: "If you have any questions or issues, you can reach our team at support@shazamparking.ae. For booking-related issues, please include your booking reference to help us assist you quickly."
    }, {
      question: "⚙️ What happens if there is a problem accessing the parking space?",
      answer: "If you have an issue such as blocked access or a faulty entry device, please contact the owner through the in-platform chat and also notify us immediately by email. If the issue remains unresolved, we are always here to assist and, if necessary, will cancel the booking with a refund in line with our policy."
    }]
  }];
  return (
    <div className="min-h-screen bg-background animate-zoom-slow">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: `url(${dubaiParkingHero})`
      }}></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl md:text-2xl opacity-90">Find answers to common questions about ShazamParking</p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-4">Welcome to the ShazamParking FAQ page</h2>
          <p className="text-lg text-center text-muted-foreground">
            Here you'll find clear answers to the most common questions from both drivers and owners about how our platform works.
          </p>
        </div>

        {faqData.map((category, categoryIndex) => <div key={categoryIndex} className="mb-12">
            <h3 className="text-2xl font-bold mb-6" style={{
          color: '#202020'
        }}>
              {category.category}
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((item, questionIndex) => <AccordionItem key={questionIndex} value={`${categoryIndex}-${questionIndex}`} className="border-b border-border">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-semibold">{item.question}</span>
                  </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      {item.question === "⭐️ Can I leave a review?" ? <p className="text-muted-foreground leading-relaxed">
                          Yes. We value your feedback. Drivers and owners can leave a review after each completed booking. We also encourage you to share your experience on{" "}
                          <a href="https://www.trustpilot.com/review/shazamparking.ae" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                            Trustpilot
                          </a>
                          {" "}and{" "}
                          <a href="https://www.google.com/search?q=shazamparking+reviews" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                            Google Reviews
                          </a>.
                        </p> : <p className="text-muted-foreground leading-relaxed">
                           {item.answer.includes('Terms and Conditions') || item.answer.includes('Privacy Policy') || item.answer.includes('Cancellation Policy') || item.answer.includes('cookies notice') ? (
                             <>
                               {item.answer
                                 .split(/(Terms and Conditions|Privacy Policy|Cancellation Policy|cookies notice)/g)
                                 .map((part, index) => {
                                   if (part === 'Terms and Conditions') {
                                     return <Link key={index} to="/terms-and-conditions" className="text-primary hover:underline font-medium">Terms and Conditions</Link>
                                   } else if (part === 'Privacy Policy') {
                                     return <Link key={index} to="/privacy-policy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                                   } else if (part === 'Cancellation Policy') {
                                     return <Link key={index} to="/terms-and-conditions" className="text-primary hover:underline font-medium">Cancellation Policy</Link>
                                   } else if (part === 'cookies notice') {
                                     return <Link key={index} to="/cookies-notice" className="text-primary hover:underline font-medium">cookies notice</Link>
                                   }
                                   return part
                                 })}
                             </>
                           ) : item.answer}
                         </p>}
                    </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>)}
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-muted/30 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Don't just take our word for it - see what drivers and parking space owners have to say about ShazamParking
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="https://www.trustpilot.com/review/shazamparking.ae" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg">
                ⭐ Review us on Trustpilot
              </a>
              <a href="https://www.google.com/search?q=shazamparking+reviews" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg">
                📝 Review us on Google
              </a>
            </div>
          </div>
          
          {/* Sample Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="ml-2 text-sm text-muted-foreground font-medium">5/5</span>
              </div>
              <p className="text-card-foreground mb-4 text-sm leading-relaxed">
                "Excellent service! Found a parking spot right in downtown Dubai when I needed it most. The booking process was smooth and the owner was very responsive."
              </p>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Ahmed K.</span> - Driver
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="ml-2 text-sm text-muted-foreground font-medium">5/5</span>
              </div>
              <p className="text-card-foreground mb-4 text-sm leading-relaxed">
                "As a parking space owner, ShazamParking has been fantastic. Easy to list my space and the payment system is reliable. Great passive income!"
              </p>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Sarah M.</span> - Space Owner
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="ml-2 text-sm text-muted-foreground font-medium">5/5</span>
              </div>
              <p className="text-card-foreground mb-4 text-sm leading-relaxed">
                "Much cheaper than street parking and way more convenient. The app works perfectly and customer support is very helpful when needed."
              </p>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Mohamed A.</span> - Driver
              </div>
            </div>
          </div>
          
          {/* Additional CTA */}
          
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;