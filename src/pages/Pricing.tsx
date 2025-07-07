import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Pricing = () => {
  const pricingPlans = [
    {
      duration: "1 Month",
      discount: "0%",
      description: "Perfect for short-term needs",
      features: [
        "Guaranteed parking space",
        "24/7 access",
        "Fixed monthly rate",
        "No hidden fees"
      ]
    },
    {
      duration: "3 Months",
      discount: "5%",
      description: "Save on quarterly parking",
      features: [
        "All 1-month benefits",
        "5% discount applied",
        "Flexible start date",
        "Priority customer support"
      ],
      popular: true
    },
    {
      duration: "6 Months",
      discount: "10%",
      description: "Best value for extended stays",
      features: [
        "All previous benefits",
        "10% discount applied",
        "Reserved premium spots",
        "Free space transfers (once)"
      ]
    },
    {
      duration: "12 Months",
      discount: "15%",
      description: "Maximum savings for annual parking",
      features: [
        "All previous benefits",
        "15% discount applied",
        "6 months upfront payment",
        "Auto-reminder system",
        "VIP customer status"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the duration that works for you and save more with longer commitments
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`p-8 text-center relative ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.duration}</h3>
                <div className="text-3xl font-bold text-primary mb-2">
                  {plan.discount !== "0%" && (
                    <span className="text-lg text-muted-foreground line-through mr-2">
                      Full Price
                    </span>
                  )}
                  {plan.discount !== "0%" ? `Save ${plan.discount}` : "Standard Rate"}
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Choose {plan.duration}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Pricing Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="text-xl font-semibold mb-4">How Discounts Work</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 3 Months: Base price × 3 × 0.95</li>
                <li>• 6 Months: Base price × 6 × 0.90</li>
                <li>• 12 Months: Base price × 12 × 0.85</li>
                <li>• All discounts applied automatically</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Payment Terms</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Minimum rental: 1 month</li>
                <li>• Security deposit: Refundable</li>
                <li>• 12-month plan: 6 months upfront</li>
                <li>• Auto-charge remaining 6 months in month 5</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;