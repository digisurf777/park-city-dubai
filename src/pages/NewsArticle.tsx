import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsComments from "@/components/NewsComments";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import "../styles/quill.css";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  publication_date: string;
  created_at: string;
  updated_at: string;
  tags?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  status?: string;
}

const NewsArticle = () => {
  const { slug: id } = useParams();
  const [article, setArticle] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .maybeSingle();

        if (error) {
          console.error('Article not found:', error);
          setArticle(null);
        } else {
          setArticle(data);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-zoom-slow">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-center mb-6">
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
        <title>{article.meta_title || article.title} - Shazam Parking</title>
        <meta name="description" content={article.meta_description || article.content.replace(/<[^>]*>/g, '').substring(0, 150)} />
        <meta property="og:title" content={article.meta_title || article.title} />
        <meta property="og:description" content={article.meta_description || article.content.replace(/<[^>]*>/g, '').substring(0, 150)} />
        <meta property="og:image" content={article.image_url || '/news/hero.jpg'} />
        <meta property="og:type" content="article" />
        <meta name="article:published_time" content={article.publication_date} />
        <meta name="keywords" content={article.tags?.join(', ') || 'Dubai parking, news, ShazamParking'} />
        <link rel="canonical" href={`https://shazamparking.ae/news/${id}`} />
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
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-6 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(article.publication_date), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{Math.ceil(article.content.replace(/<[^>]*>/g, '').length / 200)} min read</span>
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {article.image_url && (
          <div className="relative aspect-video mb-8 rounded-xl overflow-hidden shadow-lg">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Content with enhanced typography */}
        <article className="news-content max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        {/* Comments Section */}
        <NewsComments newsId={article.id} />

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