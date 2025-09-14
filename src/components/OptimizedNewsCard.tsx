import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import LazyImage from './LazyImage';

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

const OptimizedNewsCard: React.FC<OptimizedNewsCardProps> = ({ article, priority = false }) => {
  const truncatedContent = article.content
    .replace(/<[^>]*>/g, '')
    .substring(0, 150);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <Link to={`/news/${article.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <LazyImage
            src={article.image_url || '/news/hero.jpg'}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <time 
              className="text-xs text-muted-foreground"
              dateTime={article.publication_date}
            >
              {format(new Date(article.publication_date), 'MMMM d, yyyy')}
            </time>
          </div>
        
          <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {truncatedContent}...
          </p>
        
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {format(new Date(article.publication_date), 'PPP')}
            </span>
            <span className="text-sm font-medium text-primary group-hover:underline">
              Read more
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default OptimizedNewsCard;