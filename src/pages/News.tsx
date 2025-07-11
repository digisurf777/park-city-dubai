import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  publication_date: string;
  created_at: string;
  updated_at: string;
}

const News = () => {
  const [newsArticles, setNewsArticles] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
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

  return (
    <div className="min-h-screen bg-background animate-zoom-slow">
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
        {loading ? (
          <div className="text-center">Loading articles...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative aspect-video">
                  <img
                    src={article.image_url || '/news/hero.jpg'}
                    alt={article.title}
                    className="w-full h-full object-cover"
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
                  {article.content.substring(0, 150)}...
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(article.publication_date), 'PPP')}
                  </span>
                  <Link 
                    to={`/news/${article.id}`}
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
        )}
      </div>

      <Footer />
    </div>
  );
};

export default News;