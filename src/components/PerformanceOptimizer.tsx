import React, { useEffect } from 'react';

const PerformanceOptimizer = () => {
  useEffect(() => {
    // Prefetch critical routes
    const prefetchRoutes = ['/auth', '/find-parking', '/rent-out-your-space'];
    
    prefetchRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });

    // Optimize third-party scripts
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Load non-critical scripts when user scrolls
          const scripts = document.querySelectorAll('script[data-lazy]');
          scripts.forEach(script => {
            if (script.getAttribute('data-lazy')) {
              script.removeAttribute('data-lazy');
              const src = script.getAttribute('data-src');
              if (src) {
                script.setAttribute('src', src);
                script.removeAttribute('data-src');
              }
            }
          });
          observer.disconnect();
        }
      });
    });

    // Start observing when user scrolls 50% down
    const target = document.querySelector('[data-scroll-trigger]') || document.body;
    if (target) {
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
};

export default PerformanceOptimizer;