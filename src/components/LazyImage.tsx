import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  onClick?: () => void;
  /** Optional explicit aspect ratio for the placeholder, e.g. "16/9" */
  aspectRatio?: string;
}

/**
 * Performance-aware <img> wrapper:
 *  - shimmer placeholder until decoded
 *  - graceful error fallback
 *  - native lazy loading + async decoding
 *  - if the image is already in the browser/SW cache it skips the fade entirely
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  fetchPriority = 'auto',
  onClick,
  aspectRatio,
}: LazyImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => setHasError(true), []);

  // If the image is already cached (SW / browser), `complete` is true on mount —
  // skip the fade so cached pages feel instant.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  if (hasError) {
    return (
      <div
        className={cn('bg-muted flex items-center justify-center text-muted-foreground text-xs', className)}
        style={{ width, height, aspectRatio }}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ aspectRatio }}
    >
      {!isLoaded && (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-muted animate-pulse"
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        width={width}
        height={height}
        loading={loading}
        {...(fetchPriority !== 'auto' && { fetchpriority: fetchPriority as any })}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        decoding="async"
      />
    </div>
  );
};

export default LazyImage;
