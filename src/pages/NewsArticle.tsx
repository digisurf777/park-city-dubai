import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NewsArticle = () => {
  const { slug } = useParams();

  // Article data - in a real app this would come from a CMS or API
  const articles = {
    "top-5-smart-ways-to-commute-around-dubai-in-2025": {
      title: "Top 5 Ways to Commute Around Dubai in 2025",
      excerpt: "Dubai is a city built for growth. Gleaming towers, expanding communities and a never-ending flow of new residents mean commuting wisely has become an art. Should you drive yourself, hop on the Metro, or hire a private driver?",
      date: "July 5, 2025",
      author: "admin",
      category: "ShazamParking",
      image: "/lovable-uploads/commute-dubai-article.png",
      content: `
        <p>Dubai is a city built for growth. Gleaming towers, expanding communities and a never-ending flow of new residents mean commuting wisely has become an art. Should you drive yourself, hop on the Metro, or hire a private driver?</p>
        
        <p>This guide breaks down five of the best ways to commute in Dubai today.</p>
        
        <h2>1️⃣ Dubai Metro: Reliable and Growing</h2>
        
        <p>No surprise here. The Dubai Metro remains one of the cleanest, most reliable public transport systems in the world. It covers over 90 kilometres and connects popular areas like Downtown, Marina, Business Bay and Expo City – and is ever expanding.</p>
        
        <h3>Why people love it:</h3>
        <ul>
          <li>Affordable compared to taxis or daily driving.</li>
          <li>Fully air-conditioned and on time.</li>
          <li>Stations are expanding each year.</li>
        </ul>
        
        <p><strong>When it is tricky:</strong> Coverage gaps in villa communities mean you may still need to combine it with a bus, taxi or e-scooter. And during peak hours, you will be shoulder to shoulder with hundreds of other commuters.</p>
        
        <h2>2️⃣ Taxis and E-Hailing Apps: Door-to-Door Flexibility</h2>
        
        <p>Dubai's taxi network and e-hailing apps like Uber and Careem are a lifeline for residents and tourists alike. For quick door-to-door service, this option is still king.</p>
        
        <p><strong>Average costs:</strong> Short rides start around AED 12 to 15. Longer trips to or from the suburbs can easily be AED 50 to 100.</p>
        
        <h3>Pros:</h3>
        <ul>
          <li>No parking stress or navigation worries.</li>
          <li>Ideal for visitors and nights out.</li>
          <li>Safe and well-regulated.</li>
        </ul>
        
        <h3>Cons:</h3>
        <ul>
          <li>Daily reliance can get expensive.</li>
          <li>Fares can spike during major events or peak hours.</li>
        </ul>
        
        <p><strong>Smart tip:</strong> Combine taxis with the Metro for longer routes to save money.</p>
        
        <h2>3️⃣ Driving Yourself: Ultimate Control but Watch the Costs</h2>
        
        <p>Driving your own car is a Dubai classic. You decide when you leave, what route you take and where to stop for a karak break. But there is a trade-off since costs pile up fast with fuel, Salik toll gates and of course parking.</p>
        
        <p>Finding a guaranteed space near Marina, DIFC or Downtown can be a daily battle.</p>
        
        <p><strong>Pro Tip:</strong> use ShazamParking.ae to secure a private bay monthly. You simply rent a spot near your home or office so you never have to circle again looking for a space or risk a fine.</p>
        
        <p><strong>Who this suits best:</strong> People with kids, busy schedules or who regularly travel across multiple areas.</p>
        
        <h2>4️⃣ Private Chauffeur Services: Sit Back and Relax</h2>
        
        <p>Some Dubai residents are adding private chauffeur services to their routine, especially for big meetings, long errands or VIP guests. It is a step up from regular taxis or ride-hailing because your driver stays with you, waits between stops and follows your custom plan for the day.</p>
        
        <h3>How it works:</h3>
        <p>Most companies offer hourly or daily rates with flat fees instead of unpredictable surge pricing. For example, Zouffer is a Dubai-based chauffeur company known for professional drivers and flexible packages for individuals, families and corporate clients.</p>
        
        <h3>Pros:</h3>
        <ul>
          <li>Stress-free door-to-door service.</li>
          <li>No parking worries at multiple stops.</li>
          <li>Good value for all-day plans.</li>
        </ul>
        
        <h3>Cons:</h3>
        <ul>
          <li>More expensive than a regular taxi.</li>
          <li>Not practical if you only need short daily trips.</li>
        </ul>
        
        <p><strong>Best for:</strong> Business clients, visitors, events or families needing VIP convenience.</p>
        
        <h2>5️⃣ Buses, Cycling and Micro-Mobility: Good for Short Trips</h2>
        
        <p>Dubai's RTA bus network covers the parts of the city the Metro does not reach, and buses are clean and affordable if you are watching your budget.</p>
        
        <p>For shorter hops in pedestrian-friendly neighbourhoods like Jumeirah, Marina or Business Bay, e-scooters and bikes are on the rise. Cycle paths are expanding and rentals are cheap. These options are great for students and last-mile commuters.</p>
        
        <h3>Pros:</h3>
        <ul>
          <li>The most affordable choice.</li>
          <li>Nol cards make switching between Metro and bus easy.</li>
          <li>Good for daily steps and sustainability.</li>
        </ul>
        
        <h3>Cons:</h3>
        <ul>
          <li>Not ideal during the hottest months.</li>
          <li>May not suit everyone's schedule.</li>
        </ul>
        
        <p><strong>Parking tip:</strong> If you still own a car but want to combine it with a bus or cycle route, you can reserve your bay near your local Metro or bus stop with ShazamParking. That way you do not risk fines or lost time.</p>
        
        <h2>Mix and Match</h2>
        
        <p>No single option works for every day. Some days you want to drive yourself and other times you may prefer the Metro and a short Careem ride to get home comfortably or, with a big day ahead with multiple meetings, a chauffeur service like Zouffer and leave the logistics to someone else.</p>
        
        <p>Smart residents mix and match to balance costs, comfort and time.</p>
        
        <h2>Make Parking Work For You</h2>
        
        <p>If you own a car, finding a convenient parking spot is half the battle. With ShazamParking.ae you can rent a secure private bay month to month and skip the daily hunt for parking. Or, if you have an empty parking bay you do not need every day, you can even list it for rent and earn extra income passively, a win-win for Dubai's busy roads.</p>
        
        <h2>✅ Conclusion</h2>
        
        <p>Dubai is all about options. From the Metro and taxis to your own car, bikes and chauffeur services, there is a commuting style for every budget and schedule. The key is to plan ahead, pick what works for you and be flexible.</p>
        
        <p>Ready to make your daily routine easier? Book your next parking spot on ShazamParking and discover how smooth your commute can be. For an extra level of comfort, look into reputable chauffeur companies like Zouffer when you need that stress-free door-to-door service.</p>
        
        <p>The roads are ready. Now you are too.</p>
        
        <p>Visit <strong><a href="https://shazamparking.ae/" target="_blank" rel="noopener">ShazamParking.ae</a></strong> and discover how easy life is when your parking is already sorted.</p>
      `
    },
    "top-10-ways-to-meet-new-people-in-dubai": {
      title: "Top 10 Ways to Meet New People in Dubai",
      excerpt: "Whether you're a brand-new expat, long-term resident, digital nomad, or just someone looking to meet people in Dubai, you're in the right city. With its vibrant international mix and endless...",
      date: "July 5, 2025",
      author: "admin",
      category: "ShazamParking",
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
      content: "<p>Full article content would go here...</p>"
    },
    "turn-parking-bay-into-passive-income": {
      title: "How to Turn Your Empty Parking Bay into Monthly Passive Income with ShazamParking",
      excerpt: "Have an unused parking space sitting empty? Transform it into a steady income stream with ShazamParking. Learn how property owners across Dubai are earning hundreds of dirhams monthly...",
      date: "July 5, 2025",
      author: "admin",
      category: "ShazamParking",
      image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
      content: "<p>Full article content would go here...</p>"
    }
  };

  const article = articles[slug as keyof typeof articles];

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Link to="/news" className="text-primary hover:underline">
            Back to News
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link 
          to="/news" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </Link>
      </div>

      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Badge variant="outline" className="mb-4">
            {article.category}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>By {article.author}</span>
            <span>•</span>
            <span>{article.date}</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* CTA Section */}
        <div className="mt-12 p-8 bg-primary/5 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Need Parking in Dubai?</h3>
          <p className="text-muted-foreground mb-6">
            Find and book secure parking spaces across Dubai with ShazamParking
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/find-parking" className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium inline-block">
              Find Parking
            </Link>
            <Link to="/rent-out-your-space" className="border border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg font-medium inline-block transition-colors">
              List Your Space
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NewsArticle;