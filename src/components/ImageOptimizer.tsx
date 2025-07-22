import { useState, useCallback, useRef, useEffect } from 'react';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: string;
}

const ImageOptimizer = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  priority = false,
  sizes = '100vw',
  quality = 85,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo='
}: ImageOptimizerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Generate optimized src with quality parameter
  const optimizedSrc = src.includes('?') 
    ? `${src}&q=${quality}&w=${width || 800}` 
    : `${src}?q=${quality}&w=${width || 800}`;

  if (hasError) {
    return (
      <div 
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">Failed to load</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={imgRef}>
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 ${className}`}
          style={{ width, height }}
          aria-hidden="true"
        />
      )}
      
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'low'}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          sizes={sizes}
          style={{ 
            contentVisibility: 'auto',
            containIntrinsicSize: width && height ? `${width}px ${height}px` : undefined
          }}
        />
      )}
    </div>
  );
};

export default ImageOptimizer;