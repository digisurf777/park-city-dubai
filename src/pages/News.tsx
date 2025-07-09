import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const News = () => {
  // Simple function to get predictable image paths
  const getNewsImage = (articleId: number) => `/news/news-${articleId}.jpg`;
  
  const newsArticles = [
    {
      id: 1,
      title: "Top 5 Ways to Commute Around Dubai in 2025",
      excerpt: "Dubai is a city built for growth. Gleaming towers, expanding communities and a never-ending flow of new residents mean commuting wisely has become an art. Should you drive yourself, hop on...",
      date: "July 5, 2025",
      author: "admin",
      category: "ShazamParking",
      slug: "top-5-smart-ways-to-commute-around-dubai-in-2025"
    },
    {
      id: 2,
      title: "Top 10 Ways to Meet New People in Dubai",
      excerpt: "Whether you're a brand-new expat, long-term resident, digital nomad, or just someone looking to meet people in Dubai, you're in the right city. With its vibrant international mix and endless...",
      date: "July 5, 2025",
      author: "admin",
      category: "ShazamParking",
      slug: "top-10-ways-to-meet-new-people-in-dubai"
    },
    {
      id: 3,
      title: "How to Turn Your Empty Parking Bay into Monthly Passive Income with ShazamParking",
      excerpt: "Have an unused parking space sitting empty? Transform it into a steady income stream with ShazamParking. Learn how property owners across Dubai are earning hundreds of dirhams monthly...",
      date: "July 5, 2025",
      author: "admin",
      category: "ShazamParking",
      slug: "turn-parking-bay-into-passive-income"
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
            backgroundImage: 'url("/news/hero.jpg")'
          }}
        ></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">News</h1>
            <p className="text-xl md:text-2xl opacity-90">Latest updates and insights from ShazamParking</p>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="relative aspect-video">
                <img
                  src={getNewsImage(article.id)}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {article.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{article.date}</span>
                </div>
                
                <h3 className="text-lg font-bold mb-3 line-clamp-2">
                  <Link 
                    to={`/news/${article.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {article.title}
                  </Link>
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    By {article.author}
                  </span>
                  <Link 
                    to={`/news/${article.slug}`}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#00B67A' }}
                  >
                    Read more
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default News;