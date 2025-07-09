import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, ArrowUp } from "lucide-react";

const LavableFAQ = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqs = [
    {
      id: "1",
      question: "How does Lavable work?",
      answer: "Lavable is an online platform that connects drivers looking for parking with owners who have a space available. Drivers pay upfront through our secure system. Owners receive payment after the rental period ends, subject to our Terms and Conditions."
    },
    {
      id: "2", 
      question: "How do I pay for a parking space?",
      answer: "Payments are made securely online at the time of booking. Drivers see a clear breakdown of the base rent, driver service charge, and any access card fee before completing payment.\n\nImportant: All payments must go through Lavable. Out-of-platform payments are strictly prohibited and put you at risk. Report any such requests immediately to support@lavable.ae."
    },
    {
      id: "3",
      question: "How does Lavable's payment fee structure work?",
      answer: "When a space is booked, the driver pays upfront through our secure system. This includes:\n\n• The base rent (which may include a discount for longer bookings)\n• A fixed driver service charge\n• An access card fee (if an access device is provided)\n\nOwners receive the base rent minus our agreed commission and any applicable access card handling fee. The access card fee is refunded to the driver once the access item is returned in good condition.\n\nExample:\n• Requested monthly rent: 1,000 AED\n• 10% discount for a 6-month booking → 900 AED per month\n• Driver service charge: +100 AED per month (fixed)\n• Access card fee: 500 AED (refundable)\n• Access card handling fee: 100 AED (deducted once)\n\n✅ What this means:\n• Driver pays: 6,000 AED upfront (900 + 100 per month x 6) plus the 500 AED access card fee\n• Lavable keeps: the fixed service charge and commission on base rent\n• Owner receives: approx. 4,220 AED for the full 6-month period (after commission and handling fee) paid monthly in arrears.\n\nThe access card fee is refunded to the driver once the item is returned in good condition."
    },
    {
      id: "4",
      question: "When do owners receive payment?",
      answer: "Payments to owners are made via UAE bank transfer, usually within 15 days after the end of the booking month, provided the rental has been completed satisfactorily and all access items have been returned. Owners must ensure their bank details are up to date in their account."
    },
    {
      id: "5",
      question: "Why is an access card fee charged?",
      answer: "When an access device (such as a remote or card) is provided for a booking, a refundable access card fee is held to protect the owner's property. The driver pays this upfront and it is refunded once the item is returned in good condition. An access card handling fee may apply for the owner."
    },
    {
      id: "6",
      question: "How should owners set their pricing?",
      answer: "We provide suggested price ranges and a minimum fee for each zone to help owners avoid mispricing and ensure fair, competitive pricing. Final pricing is always the owner's responsibility."
    },
    {
      id: "7",
      question: "Can I cancel my booking?",
      answer: "All bookings are subject to our standard Cancellation Policy. Please refer to the full Cancellation Policy on our website for details on when refunds may or may not apply."
    },
    {
      id: "8",
      question: "What details do you verify before accepting listings or reservations?",
      answer: "To maintain trust and safety on our platform, we may request identification, such as Emirates ID or similar, from owners and drivers before approving a listing or reservation."
    },
    {
      id: "9",
      question: "Is there a mobile app?",
      answer: "We do not have a dedicated mobile app yet, but our website is fully mobile-optimised. You can search for spaces, make bookings, message owners, and manage your account easily from your smartphone or tablet."
    },
    {
      id: "10",
      question: "How do I manage or update my bookings and account?",
      answer: "Log in to your Lavable account at any time to manage listings, update your bank details, check upcoming bookings, track payments, and view reviews. Keeping your account details current helps ensure smooth transactions."
    },
    {
      id: "11",
      question: "Can I leave a review?",
      answer: "Yes. We value your feedback. Drivers and owners can leave a review after each completed booking. We also encourage you to share your experience on Trustpilot and Google Reviews."
    },
    {
      id: "12",
      question: "How do I get support if I need help?",
      answer: "If you have any questions or issues, you can reach our team at support@lavable.ae. For booking-related issues, please include your booking reference to help us assist you quickly."
    },
    {
      id: "13",
      question: "What happens if there is a problem accessing the parking space?",
      answer: "If you have an issue such as blocked access or a faulty entry device, please contact the owner through the in-platform chat and also notify us immediately by email. If the issue remains unresolved, we are always here to assist and, if necessary, will cancel the booking with a refund in line with our policy."
    },
    {
      id: "14",
      question: "Where can I find more details about how Lavable works?",
      answer: "Always refer to our Terms and Conditions, Cancellation Policy, and Privacy Policy for full details on payments, fees, access card fees, cancellations, disputes, and your rights and responsibilities. These documents form the official agreement when you use our platform."
    },
    {
      id: "15",
      question: "How is the access card transferred between the owner and the driver?",
      answer: "We recommend either a hands-free exchange using a trusted courier service such as Careem Deliveries. In this case, the delivery would be booked at the owner's expense when sending the access card to the driver, and at the driver's expense when returning it to the owner.\n\nAlternatively, owners and drivers can arrange an in-person handover by meeting at a mutually agreed location, usually at or near the parking space, or by leaving the card at a safe location for collection. All details should be agreed in advance through the in-platform chat."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat py-24"
        style={{ backgroundImage: "url('/lavable-faq-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-full mb-6">
            <span className="text-4xl font-bold text-white">L</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Welcome to the Lavable FAQ page. Here you'll find clear answers to the most common questions from both drivers and owners about how our platform works.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border border-border rounded-lg">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  <span className="text-lg font-semibold text-foreground">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="text-muted-foreground whitespace-pre-line">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="p-8">
            <CardContent className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Still have a question?</h2>
              <p className="text-lg text-muted-foreground">
                If you don't see your question answered here, please reach out to us – we are always here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  support@lavable.ae
                </Button>
                <Button variant="outline" size="lg" onClick={scrollToTop} className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5" />
                  Back to Top
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LavableFAQ;