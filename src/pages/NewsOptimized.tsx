import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import useSEO from "@/hooks/useSEO";

// Lazy load images component
const LazyImage = ({ src, alt, className }: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
      )}
    </div>
  );
};

interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  publication_date: string;
  created_at: string;
  updated_at: string;
}

const NewsOptimized = () => {
  const seoData = useSEO({
    title: "Latest News & Updates - Shazam Parking Dubai",
    description: "Stay updated with the latest news, updates, and insights about parking in Dubai. Read about new parking zones, city developments, and Shazam Parking platform updates.",
    keywords: "Dubai parking news, parking updates Dubai, city developments, urban planning Dubai, parking regulations, Dubai Marina news, Downtown Dubai updates",
    url: "/news"
  });

  const [newsArticles, setNewsArticles] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  useEffect(() => {
    const fetchNewsArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('status', 'published')
          .order('publication_date', { ascending: false });

        if (error) throw error;
        setNewsArticles(data || []);
      } catch (error) {
        console.error('Error fetching news articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsArticles();
  }, []);

  // Pagination
  const totalPages = Math.ceil(newsArticles.length / articlesPerPage);
  const currentArticles = newsArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  return (
    <div className="min-h-screen bg-background">
      {seoData}
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-black/40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/lovable-uploads/ba4a4def-2cd7-4e97-89d5-074c13f0bbe8.png")'
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
        {loading ? (
          <div className="text-center">Loading articles...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="relative aspect-video">
                    <LazyImage
                      src={article.image_url || '/news/hero.jpg'}
                      alt={article.title}
                      className="w-full h-full"
                    />
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(article.publication_date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  
                    <h3 className="text-lg font-bold mb-3 line-clamp-2">
                      <Link 
                        to={`/news/${article.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>
                  
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(article.publication_date), 'PPP')}
                      </span>
                      <Link 
                        to={`/news/${article.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Read more
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NewsOptimized;