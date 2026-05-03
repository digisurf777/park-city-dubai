import { useEffect } from 'react';

const EnhancedServiceWorker = () => {
  useEffect(() => {
    // Enhanced service worker registration with better caching strategies
    const registerEnhancedSW = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        // Clear old service workers first
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }

        // Register new service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        // Handle updates more aggressively
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available
                  console.log('New content available, refreshing...');
                  window.location.reload();
                } else {
                  // Content is cached for first time
                  console.log('Content is cached for offline use.');
                }
              }
            });
          }
        });

        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data && event.data.type === 'CACHE_UPDATED') {
            console.log('Cache updated:', event.data.updatedURL);
          }
        });

        // Send message to service worker to clear auth cache when needed
        const clearAuthCache = () => {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'CLEAR_AUTH_CACHE'
            });
          }
        };

        // Clear auth cache on auth state changes
        window.addEventListener('beforeunload', clearAuthCache);

        console.log('Enhanced Service Worker registered');
      } catch (error) {
        console.log('Enhanced Service Worker registration failed:', error);
      }
    };

    // Register with a delay to not block initial page load
    setTimeout(registerEnhancedSW, 1000);

    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalResources = [
        '/assets/dubai-skyline-hero.jpg',
        '/lovable-uploads/atlantis-hotel-hero.jpg',
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
      ];

      criticalResources.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    };

    preloadCriticalResources();

  }, []);

  return null;
};

export default EnhancedServiceWorker;