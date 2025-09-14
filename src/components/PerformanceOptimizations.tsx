import React, { useEffect } from 'react';

const PerformanceOptimizations: React.FC = () => {
  useEffect(() => {
    // Browser compatibility fixes
    const addPolyfills = () => {
      // IntersectionObserver polyfill for older browsers
      if (!window.IntersectionObserver) {
        const script = document.createElement('script');
        script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
        document.head.appendChild(script);
      }

      // ResizeObserver polyfill
      if (!window.ResizeObserver) {
        const script = document.createElement('script');
        script.src = 'https://polyfill.io/v3/polyfill.min.js?features=ResizeObserver';
        document.head.appendChild(script);
      }
    };

    // Optimize critical resource hints
    const addResourceHints = () => {
      const hints = [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://eoknluyunximjlsnyceb.supabase.co' },
        { rel: 'dns-prefetch', href: 'https://embed.tawk.to' }
      ];

      hints.forEach(hint => {
        if (!document.querySelector(`link[href="${hint.href}"]`)) {
          const link = document.createElement('link');
          Object.assign(link, hint);
          document.head.appendChild(link);
        }
      });
    };

    // Service Worker registration with better error handling
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, reload the page
                  window.location.reload();
                }
              });
            }
          });

          console.log('Service Worker registered successfully');
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      }
    };

    // Optimize viewport for mobile devices
    const optimizeViewport = () => {
      if (!document.querySelector('meta[name="viewport"]')) {
        const viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
        document.head.appendChild(viewport);
      }

      // Add theme-color for mobile browsers
      if (!document.querySelector('meta[name="theme-color"]')) {
        const themeColor = document.createElement('meta');
        themeColor.name = 'theme-color';
        themeColor.content = '#16a34a';
        document.head.appendChild(themeColor);
      }
    };

    // Lazy load non-critical CSS
    const loadNonCriticalCSS = () => {
      const nonCriticalCSS = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
      ];

      nonCriticalCSS.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.media = 'print';
          link.onload = () => {
            link.media = 'all';
          };
          document.head.appendChild(link);
        }
      });
    };

    // Performance monitoring
    const setupPerformanceMonitoring = () => {
      // Monitor Core Web Vitals
      if ('web-vital' in window) return;

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`${entry.name}: ${entry.duration || 0}ms`);
        }
      });

      try {
        observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      } catch (e) {
        console.log('Performance observer not supported');
      }

      // Monitor LCP
      try {
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            console.log('LCP:', entry.startTime);
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.log('LCP observer not supported');
      }

      // Monitor FID  
      try {
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const fidEntry = entry as any;
            if (fidEntry.processingStart) {
              console.log('FID:', fidEntry.processingStart - entry.startTime);
            }
          }
        }).observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.log('FID observer not supported');
      }
    };

    // Execute optimizations
    addPolyfills();
    addResourceHints();
    optimizeViewport();
    loadNonCriticalCSS();
    
    // Delay service worker and performance monitoring
    setTimeout(() => {
      registerServiceWorker();
      setupPerformanceMonitoring();
    }, 1000);

    // Cleanup function
    return () => {
      // Remove any performance observers if needed
      if (window.performance && window.performance.clearMeasures) {
        window.performance.clearMeasures();
      }
    };
  }, []);

  return null;
};

export default PerformanceOptimizations;