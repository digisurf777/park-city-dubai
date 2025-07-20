
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  isLoading: boolean;
  connectionType: string;
  deviceMemory: number;
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    isLoading: true,
    connectionType: 'unknown',
    deviceMemory: 0
  });

  useEffect(() => {
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      // Get connection info if available
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const connectionType = connection ? connection.effectiveType || 'unknown' : 'unknown';
      
      // Get device memory if available
      const deviceMemory = (navigator as any).deviceMemory || 0;
      
      setMetrics({
        loadTime,
        isLoading: false,
        connectionType,
        deviceMemory
      });
    };

    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  return metrics;
};

// Hook to optimize images based on connection
export const useImageOptimization = () => {
  const [shouldOptimize, setShouldOptimize] = useState(false);
  
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      // Optimize for slow connections
      const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                              connection.effectiveType === '2g' ||
                              connection.saveData === true;
      
      setShouldOptimize(isSlowConnection);
    }
  }, []);

  return shouldOptimize;
};

// Hook for lazy loading intersection observer
export const useLazyLoading = (threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '50px'
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, threshold]);

  return { isIntersecting, setElement };
};
