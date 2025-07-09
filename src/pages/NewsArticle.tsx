import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  author: string;
  published_date: string;
  category: string;
  meta_title?: string;
  meta_description?: string;
}

const NewsArticle = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

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
  }, [slug]);

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
        <title>{article.meta_title || article.title}</title>
        <meta name="description" content={article.meta_description || article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.meta_description || article.excerpt} />
        <meta property="og:image" content={article.featured_image_url || '/news/hero.jpg'} />
        <meta property="og:type" content="article" />
        <meta name="author" content={article.author} />
        <meta name="article:published_time" content={article.published_date} />
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
            <span>{format(new Date(article.published_date), 'MMMM d, yyyy')}</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
          <img
            src={article.featured_image_url || '/news/hero.jpg'}
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