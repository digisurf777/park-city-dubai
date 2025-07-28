import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const OptimizedTawkTo = () => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Only load TawkTo after user interaction or after significant delay
    const loadConditions = [
      // User interaction
      () => {
        const handleInteraction = () => {
          setShouldLoad(true);
          document.removeEventListener('mousedown', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
          document.removeEventListener('scroll', handleInteraction);
        };
        
        document.addEventListener('mousedown', handleInteraction, { passive: true });
        document.addEventListener('touchstart', handleInteraction, { passive: true });
        document.addEventListener('scroll', handleInteraction, { passive: true });
      },
      
      // Delay fallback
      () => {
        setTimeout(() => setShouldLoad(true), 5000);
      },

      // Idle callback
      () => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => setShouldLoad(true), { timeout: 3000 });
        }
      }
    ];

    loadConditions.forEach(condition => condition());
  }, []);

  useEffect(() => {
    if (shouldLoad && !window.Tawk_API) {
      // Create script with optimizations
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src = 'https://embed.tawk.to/669e2eabeaf3bd8d4d15776a/1i37fgn8s';
      script.charset = 'UTF-8';
      script.crossOrigin = 'anonymous';
      
      // Add to document head
      document.head.appendChild(script);
      
      // Set load start time
      window.Tawk_LoadStart = new Date();

      // Optional: Hide initially and show after full load
      script.onload = () => {
        if (window.Tawk_API) {
          window.Tawk_API.onLoad = () => {
            // Chat is fully loaded
            console.log('TawkTo chat loaded');
          };
        }
      };
    }
  }, [shouldLoad]);

  return null;
};

export default OptimizedTawkTo;