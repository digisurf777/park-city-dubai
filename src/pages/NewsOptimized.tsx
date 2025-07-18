import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import useSEO from "@/hooks/useSEO";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  publication_date: string;
  created_at: string;
  updated_at: string;
}

// Optimized image component with lazy loading
const OptimizedImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setIsLoaded(true);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={error ? '/news/hero.jpg' : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
    </div>
  );
};

const NewsOptimized = () => {
  const seoData = useSEO({
    title: "Latest News & Updates - Shazam Parking Dubai",
    description: "Stay updated with the latest news, updates, and insights about parking in Dubai. Read about new parking zones, city developments, and Shazam Parking platform updates.",
    keywords: "Dubai parking news, parking updates Dubai, city developments, urban planning Dubai, parking regulations, Dubai Marina news, Downtown Dubai updates",
    url: "/news"
  });

  const [newsArticles, setNewsArticles] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedArticles, setDisplayedArticles] = useState<NewsPost[]>([]);
  const [page, setPage] = useState(1);
  const articlesPerPage = 6;

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
        setDisplayedArticles((data || []).slice(0, articlesPerPage));
      } catch (error) {
        console.error('Error fetching news articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsArticles();
  }, []);

  const loadMoreArticles = useCallback(() => {
    const nextArticles = newsArticles.slice(0, page * articlesPerPage + articlesPerPage);
    setDisplayedArticles(nextArticles);
    setPage(prev => prev + 1);
  }, [newsArticles, page]);

  const hasMore = displayedArticles.length < newsArticles.length;

  return (
    <div className="min-h-screen bg-background">
      {seoData}
      <Navbar />
      
      {/* Optimized Hero Section */}
      <div className="relative h-[300px] md:h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10" />
        <OptimizedImage 
          src="/lovable-uploads/ba4a4def-2cd7-4e97-89d5-074c13f0bbe8.png"
          alt="News Hero"
          className="absolute inset-0"
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">News</h1>
            <p className="text-lg md:text-2xl opacity-90">Latest updates from ShazamParking</p>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded animate-pulse mb-3" />
                  <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <OptimizedImage
                    src={article.image_url || '/news/hero.jpg'}
                    alt={article.title}
                    className="aspect-video"
                  />
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(article.publication_date), 'MMM d, yyyy')}
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
                      {article.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                    </p>
                  
                    <Link 
                      to={`/news/${article.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Read more →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMoreArticles}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Load More Articles
                </button>
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