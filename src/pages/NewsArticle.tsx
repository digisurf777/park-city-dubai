import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NewsArticle = () => {
  const { slug } = useParams();

  // Simple function to get predictable image paths
  const getNewsImage = (articleSlug: string) => {
    const slugToId: Record<string, number> = {
      "top-5-smart-ways-to-commute-around-dubai-in-2025": 1,
      "top-10-ways-to-meet-new-people-in-dubai": 2,
      "turn-parking-bay-into-passive-income": 3
    };
    return `/news/news-${slugToId[articleSlug] || 1}.jpg`;
  };

  // Article data - in a real app this would come from a CMS or API
  const articles = {
    "top-5-smart-ways-to-commute-around-dubai-in-2025": {
      title: "Top 5 Smart Ways to Commute Around Dubai in 2025 | Dubai Transportation Guide",
      metaDescription: "Discover the best 5 ways to commute in Dubai 2025: Metro, taxis, driving, chauffeur services & micro-mobility. Complete guide to Dubai transportation with parking solutions.",
      excerpt: "Dubai is a city built for growth. Gleaming towers, expanding communities and a never-ending flow of new residents mean commuting wisely has become an art. Should you drive yourself, hop on the Metro, or hire a private driver?",
      date: "July 5, 2025",
      author: "admin",
      category: "Dubai Transportation",
      keywords: ["Dubai commute", "Dubai transportation", "Dubai Metro", "Dubai parking", "Dubai travel guide", "commuting in Dubai", "Dubai taxis", "public transport Dubai"],
      content: `
        <div class="space-y-8">
          <p class="text-lg leading-relaxed"><strong>Planning your daily commute in Dubai?</strong> Dubai is a city built for growth. Gleaming towers, expanding communities and a never-ending flow of new residents mean commuting wisely has become an art. Should you drive yourself, hop on the Dubai Metro, or hire a private driver?</p>
          
          <p class="text-lg leading-relaxed">This comprehensive guide breaks down the <strong>five best ways to commute in Dubai in 2025</strong>, helping you navigate the city's transportation options efficiently and cost-effectively.</p>
        </div>
        
        <div class="mt-12 mb-8">
          <h2 class="text-3xl font-bold mb-6">1. Dubai Metro: The Most Reliable Public Transport System</h2>
        
          <p class="mb-6 leading-relaxed">No surprise here. The <strong>Dubai Metro remains one of the cleanest, most reliable public transport systems in the world</strong>. It covers over 90 kilometres and connects popular Dubai areas like <a href="/downtown">Downtown Dubai</a>, <a href="/dubai-marina">Dubai Marina</a>, <a href="/business-bay">Business Bay</a> and Expo City – and is ever expanding.</p>
        
          <h3 class="text-xl font-semibold mb-4 mt-8">Why Dubai Metro is Popular:</h3>
          <ul class="space-y-3 mb-8">
            <li class="leading-relaxed"><strong>Affordable transportation:</strong> Much cheaper compared to daily taxi rides or car ownership costs</li>
            <li class="leading-relaxed"><strong>Climate-controlled comfort:</strong> Fully air-conditioned carriages with punctual service</li>
            <li class="leading-relaxed"><strong>Expanding network:</strong> New Metro stations are added regularly, improving connectivity</li>
          </ul>
        
          <p class="mb-8 leading-relaxed"><strong>Metro Limitations:</strong> Coverage gaps in villa communities mean you may still need to combine it with RTA buses, taxis or e-scooters for last-mile connectivity. During peak hours (7-9 AM and 5-7 PM), expect crowded carriages.</p>
        </div>
        
        <div class="mt-12 mb-8">
          <h2 class="text-3xl font-bold mb-6">2. Dubai Taxis and Ride-Hailing Apps: Ultimate Door-to-Door Convenience</h2>
        
          <p class="mb-6 leading-relaxed"><strong>Dubai's comprehensive taxi network</strong> and popular ride-hailing apps like Uber and Careem provide essential transport services for both residents and tourists. For convenient door-to-door service across Dubai, this remains the top choice.</p>
        
          <p class="mb-6 leading-relaxed"><strong>Dubai Taxi Costs (2025):</strong> Short rides typically start around AED 12-15. Longer journeys to suburban areas like Arabian Ranches or Dubai Hills can cost AED 50-100.</p>
        
          <h3 class="text-xl font-semibold mb-4 mt-8">Advantages of Dubai Taxis:</h3>
          <ul class="space-y-3 mb-6">
            <li class="leading-relaxed"><strong>Zero parking hassles:</strong> No need to worry about finding parking spaces or navigation</li>
            <li class="leading-relaxed"><strong>Perfect for tourists and night entertainment:</strong> Ideal for Dubai Mall visits, beach trips, and evening activities</li>
            <li class="leading-relaxed"><strong>Safe and regulated service:</strong> All Dubai taxis are licensed and monitored by RTA</li>
          </ul>
        
          <h3 class="text-xl font-semibold mb-4 mt-8">Disadvantages:</h3>
          <ul class="space-y-3 mb-6">
            <li class="leading-relaxed"><strong>High daily costs:</strong> Regular commuting via taxi can become expensive quickly</li>
            <li class="leading-relaxed"><strong>Surge pricing:</strong> Fares increase during major Dubai events, bad weather, or rush hours</li>
          </ul>
        
          <p class="mb-8 leading-relaxed"><strong>Money-Saving Tip:</strong> Combine Dubai Metro with short taxi rides for longer routes to significantly reduce transportation costs.</p>
        </div>
        
        <div class="mt-12 mb-8">
          <h2 class="text-3xl font-bold mb-6">3. Driving Your Own Car in Dubai: Maximum Flexibility with Hidden Costs</h2>
        
          <p class="mb-6 leading-relaxed"><strong>Driving your own car in Dubai</strong> offers the ultimate freedom. You control departure times, routes, and can stop for that perfect karak break anywhere. However, the true costs add up quickly: fuel expenses, Salik toll gate fees, car maintenance, and most importantly - <strong>Dubai parking costs</strong>.</p>
        
          <p class="mb-6 leading-relaxed"><strong>Dubai Parking Challenge:</strong> Finding guaranteed parking near <a href="/dubai-marina">Dubai Marina</a>, <a href="/difc">DIFC</a>, or <a href="/downtown">Downtown Dubai</a> can be a daily struggle, especially during business hours.</p>
        
          <p class="mb-6 leading-relaxed"><strong>Pro Parking Solution:</strong> Use <a href="/find-parking">ShazamParking.ae</a> to secure a private parking bay monthly. Simply <a href="/rent-out-your-space">rent a designated spot</a> near your home or office location, eliminating the daily hunt for parking and avoiding parking fines.</p>
        
          <p class="mb-8 leading-relaxed"><strong>Best suited for:</strong> Families with children, professionals with packed schedules, or residents who frequently travel between multiple Dubai locations daily.</p>
        </div>
        
        <div class="mt-12 mb-8">
          <h2 class="text-3xl font-bold mb-6">4. Private Chauffeur Services in Dubai: Premium Comfort and Convenience</h2>
        
          <p class="mb-6 leading-relaxed"><strong>Private chauffeur services</strong> are becoming increasingly popular among Dubai residents, particularly for important business meetings, lengthy errands, or hosting VIP guests. This premium option surpasses regular taxis because your dedicated driver remains available, waits between destinations, and follows your personalized daily itinerary.</p>
        
          <h3 class="text-xl font-semibold mb-4 mt-8">How Dubai Chauffeur Services Work:</h3>
          <p class="mb-6 leading-relaxed">Most Dubai chauffeur companies offer transparent hourly or full-day rates with fixed pricing instead of unpredictable surge pricing. For example, <strong>Zouffer</strong> is a reputable Dubai-based chauffeur company known for professional drivers and flexible packages serving individuals, families and corporate clients throughout the emirate.</p>
        
          <h3 class="text-xl font-semibold mb-4 mt-8">Chauffeur Service Benefits:</h3>
          <ul class="space-y-3 mb-6">
            <li class="leading-relaxed"><strong>Completely stress-free transportation:</strong> Professional door-to-door service with premium vehicles</li>
            <li class="leading-relaxed"><strong>Zero parking concerns:</strong> No worries about finding parking at multiple Dubai destinations</li>
            <li class="leading-relaxed"><strong>Excellent value for full-day itineraries:</strong> Cost-effective when visiting multiple locations</li>
          </ul>
        
          <h3 class="text-xl font-semibold mb-4 mt-8">Considerations:</h3>
          <ul class="space-y-3 mb-6">
            <li class="leading-relaxed"><strong>Premium pricing:</strong> Higher cost compared to standard Dubai taxis</li>
            <li class="leading-relaxed"><strong>Not suitable for brief trips:</strong> Most cost-effective for longer journeys or full-day requirements</li>
          </ul>
        
          <p class="mb-8 leading-relaxed"><strong>Ideal for:</strong> Business executives, visiting clients, special events, or families requiring VIP-level convenience and comfort.</p>
        </div>
        
        <div class="mt-12 mb-8">
          <h2 class="text-3xl font-bold mb-6">5. Dubai Public Buses, Cycling and Micro-Mobility: Eco-Friendly Budget Options</h2>
        
          <p class="mb-6 leading-relaxed"><strong>Dubai's extensive RTA bus network</strong> covers areas not served by the Metro system, offering clean and budget-friendly transportation for cost-conscious commuters.</p>
        
          <p class="mb-6 leading-relaxed">For shorter distances in pedestrian-friendly Dubai neighborhoods like <a href="/palm-jumeirah">Jumeirah</a>, <a href="/dubai-marina">Marina Walk</a>, or <a href="/business-bay">Business Bay</a>, e-scooters and rental bikes are gaining popularity. Dubai's cycling infrastructure continues expanding with dedicated bike lanes, and rental costs remain very affordable. These sustainable options work perfectly for students and last-mile commuting needs.</p>
        
          <h3 class="text-xl font-semibold mb-4 mt-8">Benefits of Public Transport and Micro-Mobility:</h3>
          <ul class="space-y-3 mb-6">
            <li class="leading-relaxed"><strong>Most economical transportation option:</strong> Lowest cost for daily Dubai commuting</li>
            <li class="leading-relaxed"><strong>Integrated payment system:</strong> Nol cards enable seamless transfers between Dubai Metro and bus services</li>
            <li class="leading-relaxed"><strong>Health and environmental benefits:</strong> Promotes physical activity and reduces carbon footprint</li>
          </ul>
        
          <h3 class="text-xl font-semibold mb-4 mt-8">Seasonal Limitations:</h3>
          <ul class="space-y-3 mb-6">
            <li class="leading-relaxed"><strong>Summer weather challenges:</strong> Outdoor cycling and walking become difficult during Dubai's hottest months (June-September)</li>
            <li class="leading-relaxed"><strong>Schedule dependencies:</strong> Bus timetables may not align with everyone's work schedule</li>
          </ul>
        
          <p class="mb-8 leading-relaxed"><strong>Smart Parking Integration:</strong> If you own a car but want to combine it with public transport or cycling, <a href="/find-parking">reserve your parking bay</a> near your local Metro station or bus stop with ShazamParking. This hybrid approach eliminates parking fines and saves time.</p>
        </div>
        
        <div class="mt-12 mb-8">
          <h2 class="text-3xl font-bold mb-6">Creating Your Perfect Dubai Commute Strategy: Mix and Match</h2>
        
          <p class="mb-6 leading-relaxed"><strong>No single transportation method works perfectly for every situation.</strong> Some days you'll prefer driving yourself, while other times the Dubai Metro plus a short Careem ride provides the most comfortable journey home. For busy days with multiple business meetings, professional chauffeur services like Zouffer handle all logistics seamlessly.</p>
        
          <p class="mb-8 leading-relaxed"><strong>Smart Dubai residents mix and match transportation options</strong> to optimize costs, comfort levels, and travel time based on daily requirements.</p>
        </div>
        
        <div class="mt-12 mb-8">
          <h2 class="text-3xl font-bold mb-6">Solve Dubai's Parking Challenge: Make Parking Work For You</h2>
        
          <p class="mb-8 leading-relaxed"><strong>Car ownership and parking availability</strong> represent Dubai's biggest commuting challenge. With <a href="/">ShazamParking.ae</a>, you can rent secure private parking bays on a monthly basis, completely eliminating the daily parking hunt. Alternatively, if you own an unused parking space, <a href="/rent-out-your-space">list it for rental income</a> and generate passive earnings while helping fellow Dubai residents - creating a win-win solution for the city's busy transportation network.</p>
        </div>
        
        <div class="mt-12 mb-8">
          <h2 class="text-3xl font-bold mb-6">✅ Conclusion: Your Complete Dubai Transportation Guide</h2>
        
          <p class="mb-6 leading-relaxed"><strong>Dubai offers unmatched transportation diversity.</strong> From the efficient Metro system and reliable taxis to personal vehicles, rental bikes and luxury chauffeur services - there's a commuting solution for every budget, schedule and lifestyle preference. Success lies in advance planning, choosing appropriate options for each situation, and maintaining flexibility in your approach.</p>
        
          <p class="mb-6 leading-relaxed"><strong>Ready to optimize your daily Dubai commute?</strong> <a href="/find-parking">Book your next guaranteed parking spot</a> with ShazamParking and experience truly smooth commuting. For premium comfort levels, research reputable chauffeur companies like Zouffer for stress-free door-to-door transportation service.</p>
        
          <p class="mb-6 leading-relaxed"><strong>Dubai's transportation infrastructure is ready for you. Now you're ready too.</strong></p>
        
          <p class="mb-6 leading-relaxed">Visit <strong><a href="/" target="_blank" rel="noopener">ShazamParking.ae</a></strong> and discover how effortless life becomes when your Dubai parking is pre-arranged and guaranteed.</p>
        </div>
      `
    },
    "top-10-ways-to-meet-new-people-in-dubai": {
      title: "Top 10 Ways to Meet New People in Dubai",
      metaDescription: "Discover the best ways to meet people in Dubai. Complete guide for expats, residents and digital nomads to build social connections in Dubai.",
      excerpt: "Whether you're a brand-new expat, long-term resident, digital nomad, or just someone looking to meet people in Dubai, you're in the right city. With its vibrant international mix and endless...",
      date: "July 5, 2025",
      author: "admin",
      category: "Passive Income",
      keywords: ["parking rental Dubai", "passive income Dubai", "rent parking space", "Dubai property income"],
      content: "<p>Full article content would go here...</p>"
    },
    "turn-parking-bay-into-passive-income": {
      title: "How to Turn Your Empty Parking Bay into Monthly Passive Income with ShazamParking",
      metaDescription: "Transform your unused parking space into steady income with ShazamParking. Learn how Dubai property owners earn monthly passive income from parking rentals.",
      excerpt: "Have an unused parking space sitting empty? Transform it into a steady income stream with ShazamParking. Learn how property owners across Dubai are earning hundreds of dirhams monthly...",
      date: "July 5, 2025",
      author: "admin",
      category: "Dubai Lifestyle",
      keywords: ["meet people Dubai", "Dubai social life", "expat Dubai", "Dubai networking"],
      content: "<p>Full article content would go here...</p>"
    }
  };

  const article = articles[slug as keyof typeof articles];

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Article Not Found
          </h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Link to="/news" className="text-primary hover:underline">
            Back to News
          </Link>
        </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{article.title}</title>
        <meta name="description" content={article.metaDescription} />
        <meta name="keywords" content={article.keywords?.join(', ')} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:image" content={getNewsImage(slug || "")} />
        <meta property="og:type" content="article" />
        <meta name="author" content={article.author} />
        <meta name="article:published_time" content={article.date} />
        <meta name="article:section" content={article.category} />
        <link rel="canonical" href={`https://shazamparking.ae/news/${slug}`} />
      </Helmet>
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
            src={getNewsImage(slug || "")}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Content with better typography and spacing */}
        <div 
          className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-ul:text-muted-foreground prose-h2:mt-12 prose-h2:mb-6 prose-h3:mt-8 prose-h3:mb-4 prose-p:mb-6 prose-ul:mb-6 prose-li:mb-2"
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