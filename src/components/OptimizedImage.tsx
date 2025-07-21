
import React, { useState, useEffect, useRef } from 'react';
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
  fallbackSrc?: string;
  aspectRatio?: string;
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
  fallbackSrc,
  aspectRatio = '16/9',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Enhanced error handling with fallback
  const handleError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      return;
    }
    
    // Generate a placeholder image as final fallback
    const placeholder = `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="system-ui" font-size="16" fill="#6b7280">
          ${alt || 'Image'}
        </text>
      </svg>
    `)}`;
    
    setCurrentSrc(placeholder);
    setHasError(true);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Enhanced intersection observer for lazy loading
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
        rootMargin: isMobile ? '100px' : '200px' // Preload earlier on mobile
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isMobile]);

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
      img.onerror = handleError;
    }
  }, [priority, src]);

  // Update src when prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  // Mobile-optimized loading strategy
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc || originalSrc.startsWith('data:')) return originalSrc;
    
    // If it's a Supabase URL, we can add resize parameters
    if (originalSrc.includes('supabase.co/storage')) {
      const url = new URL(originalSrc);
      if (isMobile) {
        url.searchParams.set('width', '800');
        url.searchParams.set('quality', '80');
      }
      return url.toString();
    }
    
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(currentSrc);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{
        aspectRatio: !width && !height ? aspectRatio : undefined,
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      {/* Enhanced loading skeleton */}
      {(!isLoaded || !isInView) && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite] translate-x-[-100%]" />
          {!isInView && !priority && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
          }}
        />
      )}

      {/* Error state */}
      {hasError && isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Add shimmer animation to global styles if not present
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;
if (!document.head.querySelector('style[data-shimmer]')) {
  style.setAttribute('data-shimmer', 'true');
  document.head.appendChild(style);
}

export default OptimizedImage;
