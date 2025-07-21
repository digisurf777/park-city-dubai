import React from 'react';

interface ImageLoadingSkeletonProps {
  className?: string;
  aspectRatio?: string;
  showSpinner?: boolean;
}

const ImageLoadingSkeleton: React.FC<ImageLoadingSkeletonProps> = ({
  className = '',
  aspectRatio = '16/9',
  showSpinner = true,
}) => {
  return (
    <div 
      className={`relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse ${className}`}
      style={{ aspectRatio }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite] translate-x-[-100%]" />
      
      {/* Loading spinner */}
      {showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      
      {/* Placeholder content */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
};

export default ImageLoadingSkeleton;