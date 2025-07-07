const HowItWorks = () => {
  return (
    <section className="py-20 bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Rent a parking space in just 3 simple steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png" 
                alt="Select location and duration"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Select the location and duration</h3>
          </div>
          
          <div className="text-center">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png" 
                alt="Book your space"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Book Your Space</h3>
          </div>
          
          <div className="text-center">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png" 
                alt="Drive and park"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Drive & Park</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;