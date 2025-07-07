import { Card } from "@/components/ui/card";
import { DollarSign, Timer, Shield } from "lucide-react";

const Benefits = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Why Choose ShazamParking?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="backdrop-blur-md bg-card/80 border-border p-8 text-center hover:shadow-xl transition-all duration-300">
            <DollarSign className="h-16 w-16 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">Save Money</h3>
            <p className="text-muted-foreground">
              Get the best parking rates in Dubai with up to 60% savings compared to street parking
            </p>
          </Card>
          
          <Card className="backdrop-blur-md bg-card/80 border-border p-8 text-center hover:shadow-xl transition-all duration-300">
            <Timer className="h-16 w-16 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">Save Time</h3>
            <p className="text-muted-foreground">
              No more circling around looking for parking. Your spot is guaranteed and waiting
            </p>
          </Card>
          
          <Card className="backdrop-blur-md bg-card/80 border-border p-8 text-center hover:shadow-xl transition-all duration-300">
            <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">Absolute Convenience</h3>
            <p className="text-muted-foreground">
              Book from anywhere, anytime. Manage your parking with our easy-to-use mobile app
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Benefits;