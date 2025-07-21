import React from 'react';
import { usePerformance } from '@/hooks/usePerformance';
import { useIsMobile } from '@/hooks/use-mobile';

interface PerformanceMonitorProps {
  children: React.ReactNode;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ children }) => {
  const { loadTime, isLoading, connectionType } = usePerformance();
  const isMobile = useIsMobile();
  
  const isSlowConnection = loadTime > 3000; // Consider > 3s as slow
  
  // Log performance metrics in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance Metrics:', {
      isSlowConnection,
      loadTime,
      isMobile,
      connectionType,
    });
  }

  return (
    <div className={`${isMobile ? 'mobile-optimized' : ''} ${isSlowConnection ? 'slow-connection' : ''}`}>
      {children}
      
      {/* Performance hint for slow connections */}
      {isSlowConnection && !isLoading && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg text-sm z-50">
          <p className="font-medium">Optimizing for slow connection...</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;