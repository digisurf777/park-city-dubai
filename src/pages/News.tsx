import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import useSEO from "@/hooks/useSEO";
import NewsLoadingSkeleton from "@/components/NewsLoadingSkeleton";
import NewsPagination from "@/components/NewsPagination";
import OptimizedNewsCard from "@/components/OptimizedNewsCard";

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
  const seoData = useSEO({
    title: "Latest News & Updates - Shazam Parking Dubai",
    description: "Stay updated with the latest news, updates, and insights about parking in Dubai. Read about new parking zones, city developments, and Shazam Parking platform updates.",
    keywords: "Dubai parking news, parking updates Dubai, city developments, urban planning Dubai, parking regulations, Dubai Marina news, Downtown Dubai updates",
    url: "/news"
  });

  const [newsArticles, setNewsArticles] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const articlesPerPage = 9;

  useEffect(() => {
    const fetchNewsArticles = async () => {
      try {
        setLoading(true);
        
        // Get total count first
        const { count } = await supabase
          .from('news')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');

        const totalCount = count || 0;
        setTotalPages(Math.ceil(totalCount / articlesPerPage));

        // Get articles for current page
        const from = (currentPage - 1) * articlesPerPage;
        const to = from + articlesPerPage - 1;

        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('status', 'published')
          .order('publication_date', { ascending: false })
          .range(from, to);

        if (error) throw error;
        setNewsArticles(data || []);
      } catch (error) {
        console.error('Error fetching news articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsArticles();
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-background animate-zoom-slow">
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
          <NewsLoadingSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsArticles.map((article, index) => (
                <OptimizedNewsCard 
                  key={article.id} 
                  article={article} 
                  priority={index < 3} // First 3 articles get priority loading
                />
              ))}
            </div>
            
            <NewsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default News;