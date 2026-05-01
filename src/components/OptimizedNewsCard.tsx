import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight, Calendar } from 'lucide-react';
import LazyImage from './LazyImage';
import { supabase } from '@/integrations/supabase/client';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  publication_date: string;
}

interface OptimizedNewsCardProps {
  article: NewsPost;
  priority?: boolean;
}

// Module-level prefetch cache so NewsArticle can read instantly
const articlePrefetchCache = new Set<string>();
export const __newsArticlePrefetch = articlePrefetchCache;

const OptimizedNewsCard: React.FC<OptimizedNewsCardProps> = ({ article, priority = false }) => {
  const truncatedContent = article.content
    .replace(/<[^>]*>/g, '')
    .substring(0, 150);

  const prefetchArticle = useCallback(() => {
    if (articlePrefetchCache.has(article.id)) return;
    articlePrefetchCache.add(article.id);
    supabase
      .from('news')
      .select('*')
      .eq('id', article.id)
      .eq('status', 'published')
      .single()
      .then(({ error }) => {
        if (error) articlePrefetchCache.delete(article.id);
      });
  }, [article.id]);

  return (
    <Card
      className="
        relative overflow-hidden rounded-2xl bg-card
        ring-1 ring-primary/15
        shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.25)]
        transition-all duration-300
        hover:-translate-y-1.5 hover:ring-primary/40
        hover:shadow-[0_25px_50px_-12px_hsl(var(--primary)/0.45)]
        group
      "
    >
      {/* Top brand accent bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-primary z-10" />

      <Link
        to={`/news/${article.id}`}
        className="block"
        onMouseEnter={prefetchArticle}
        onTouchStart={prefetchArticle}
        onFocus={prefetchArticle}
      >
        <div className="relative aspect-video overflow-hidden">
          <LazyImage
            src={article.image_url || '/news/hero.webp'}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
          />
          {/* Date chip */}
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-md text-[11px] font-semibold text-primary ring-1 ring-primary/20 shadow-md">
            <Calendar className="h-3 w-3" />
            {format(new Date(article.publication_date), 'MMM d, yyyy')}
          </div>
        </div>

        <CardContent className="p-5 sm:p-6">
          <h3 className="text-lg font-bold mb-2.5 line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug">
            {article.title}
          </h3>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
            {truncatedContent}...
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-primary/10">
            <span className="text-xs text-muted-foreground font-medium">
              {format(new Date(article.publication_date), 'PPP')}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
              Read more
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default OptimizedNewsCard;
