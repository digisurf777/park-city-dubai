
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '100vw',
  width,
  height,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const isMobile = useIsMobile();

  // Create WebP version of the image URL
  const getWebPSrc = (originalSrc: string) => {
    if (originalSrc.includes('.webp')) return originalSrc;
    return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  // Create responsive image URLs for different screen sizes
  const getResponsiveSrc = (originalSrc: string, size: 'sm' | 'md' | 'lg' | 'xl') => {
    const sizeMap = {
      sm: '480w',
      md: '768w', 
      lg: '1024w',
      xl: '1920w'
    };
    
    // For mobile, use smaller images
    if (isMobile && (size === 'lg' || size === 'xl')) {
      return getWebPSrc(originalSrc);
    }
    
    return getWebPSrc(originalSrc);
  };

  // Intersection Observer for lazy loading
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

    const imgElement = document.querySelector(`[data-src="${src}"]`);
    if (imgElement) {
      observer.observe(imgElement);
    }

    return () => observer.disconnect();
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Blur placeholder while loading
  const blurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==";

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            filter: 'blur(5px)'
          }}
        />
      )}
      
      {/* Actual image */}
      {isInView && (
        <picture>
          <source
            srcSet={getWebPSrc(src)}
            type="image/webp"
            sizes={sizes}
          />
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            data-src={src}
            className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} w-full h-full object-cover`}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              contentVisibility: 'auto',
              containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
            }}
          />
        </picture>
      )}
      
      {/* Loading skeleton */}
      {!isInView && !priority && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
