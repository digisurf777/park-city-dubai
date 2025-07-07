import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqData = [
    {
      category: "General",
      questions: [
        {
          question: "How does ShazamParking work?",
          answer: "ShazamParking is an online platform that connects drivers looking for parking with owners who have a space available. Drivers pay upfront through our secure system. Owners receive payment after the rental period ends, subject to our Terms and Conditions."
        },
        {
          question: "How do I pay for a parking space?",
          answer: "Payments are made securely online at the time of booking. Drivers see a clear breakdown of the base rent, driver service charge, and any access card fee before completing payment. Important: All payments must go through ShazamParking. Out-of-platform payments are strictly prohibited and put you at risk."
        },
        {
          question: "How does ShazamParking's payment fee structure work?",
          answer: "When a space is booked, the driver pays upfront through our secure system. This includes: the base rent (which may include a discount for longer bookings), a fixed driver service charge, and an access card fee (if an access device is provided). Owners receive the base rent minus our agreed commission and any applicable access card handling fee."
        }
      ]
    },
    {
      category: "Booking",
      questions: [
        {
          question: "How do I book a parking space?",
          answer: "Simply browse available spaces in your desired location, select your preferred dates and duration, then complete the secure online payment process. You'll receive confirmation and access details immediately."
        },
        {
          question: "Can I cancel my booking?",
          answer: "Cancellation policies vary depending on the space owner's terms. Please review the cancellation policy before booking. Generally, cancellations made 24+ hours in advance may be eligible for partial refunds."
        },
        {
          question: "What if I need to extend my parking duration?",
          answer: "You can request an extension through your account dashboard. Extensions are subject to availability and the owner's approval. Additional charges will apply for the extended period."
        }
      ]
    },
    {
      category: "Payments",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit and debit cards including Visa, Mastercard, and American Express. All payments are processed securely through our encrypted payment system."
        },
        {
          question: "When will I be charged?",
          answer: "Payment is processed immediately upon booking confirmation. For monthly rentals, the full amount is charged upfront. Access card fees (if applicable) are also charged at booking and refunded upon return of the access device."
        },
        {
          question: "How do refunds work?",
          answer: "Refunds are processed according to the cancellation policy of each space. Access card fees are refunded once the access device is returned in good condition. Please allow 5-7 business days for refunds to appear in your account."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-black/40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png")'
          }}
        ></div>
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

        {faqData.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#202020' }}>
              {category.category}
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((item, questionIndex) => (
                <AccordionItem 
                  key={questionIndex} 
                  value={`${categoryIndex}-${questionIndex}`}
                  className="border-b border-border"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-semibold">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;