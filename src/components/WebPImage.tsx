import { useState, useCallback } from 'react';

interface WebPImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
}

const WebPImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  loading = 'lazy',
  priority = false,
  sizes,
  blurDataURL
}: WebPImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Generate WebP and AVIF sources
  const getOptimizedSrc = (format: 'webp' | 'avif' | 'original') => {
    if (format === 'original') return src;
    
    // If it's already an optimized format or external URL, return as is
    if (src.includes('.webp') || src.includes('.avif') || src.startsWith('http')) {
      return src;
    }
    
    // Generate optimized versions for local images
    const basePath = src.replace(/\.[^/.]+$/, "");
    return `${basePath}.${format}`;
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && blurDataURL && (
        <img
          src={blurDataURL}
          alt=""
          className={`absolute inset-0 ${className}`}
          style={{ 
            width, 
            height, 
            filter: 'blur(10px)',
            transform: 'scale(1.05)',
          }}
        />
      )}
      {!isLoaded && !blurDataURL && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={{ width, height }}
        />
      )}
      <picture>
        <source 
          srcSet={getOptimizedSrc('avif')} 
          type="image/avif"
          {...(sizes && { sizes })}
        />
        <source 
          srcSet={getOptimizedSrc('webp')} 
          type="image/webp"
          {...(sizes && { sizes })}
        />
        <img
          src={getOptimizedSrc('original')}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          width={width}
          height={height}
          loading={loading}
          {...(priority && { fetchpriority: 'high' })}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          {...(sizes && { sizes })}
          style={{ 
            contentVisibility: 'auto',
            containIntrinsicSize: width && height ? `${width}px ${height}px` : 'none'
          }}
        />
      </picture>
    </div>
  );
};

export default WebPImage;