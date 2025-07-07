import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ValueProps = () => {
  return (
    <div className="bg-background">
      {/* Rent Out Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Are you looking to rent out your space?
            </h2>
            <p className="text-xl text-primary font-semibold mb-8">
              SHAZAM PARKING IS HERE TO HELP YOU
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg">
              RENT OUT A SPACE
            </Button>
          </div>
          <div className="mt-8">
            <img 
              src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80" 
              alt="Luxury car in Dubai"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Find Parking Section */}
      <section className="py-16 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Are you looking for a parking space?
            </h2>
            <p className="text-xl text-primary font-semibold mb-8">
              FIND YOUR SPACE WITH SHAZAM PARKING
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg">
              BOOK A SPACE
            </Button>
          </div>
          <div className="mt-8">
            <img 
              src="https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&w=1200&q=80" 
              alt="Dubai cityscape"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why choose SHAZAM PARKING?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We are the quickest, easiest, and the most secure way to rent a parking space in Dubai!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Card className="bg-card p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-foreground mb-2">Save Money</h3>
              <p className="text-muted-foreground">Get the best parking rates in Dubai</p>
            </Card>
            <Card className="bg-card p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-foreground mb-2">Save Time</h3>
              <p className="text-muted-foreground">No more circling around looking for parking</p>
            </Card>
            <Card className="bg-card p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-foreground mb-2">Absolute Convenience</h3>
              <p className="text-muted-foreground">Book from anywhere, anytime</p>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <img 
              src="https://images.unsplash.com/photo-1460574283810-2aab119d8511?auto=format&fit=crop&w=1200&q=80" 
              alt="Successful businessman"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ValueProps;