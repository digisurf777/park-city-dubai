// Service Worker for cache busting and preventing authentication issues
const CACHE_VERSION = 'v' + Date.now(); // Dynamic cache version
const CACHE_NAME = 'shazam-parking-' + CACHE_VERSION;

// Clear old caches on install
self.addEventListener('install', (event) => {
  console.log('Service Worker installing, cache version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Force immediate activation
      return self.skipWaiting();
    })
  );
});

// Clear old caches on activate
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Cleaning up old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Network-first strategy for auth-related requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for unsupported request types
  if (url.protocol === 'chrome-extension:' || 
      event.request.method === 'POST' || 
      event.request.method === 'PUT' || 
      event.request.method === 'DELETE') {
    return;
  }
  
  // Always go network-first for authentication and API requests
  if (url.pathname.includes('/auth') || 
      url.pathname.includes('/api/') ||
      url.origin.includes('supabase')) {
    event.respondWith(
      fetch(event.request.clone()).catch(() => {
        // If network fails, try cache as fallback
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request.clone()).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Only cache GET requests for basic responses
        if (event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch((error) => {
              console.log('Cache put failed:', error);
            });
          });
        }
        
        return response;
      }).catch(() => {
        // Return a fallback response if fetch fails
        return new Response('Network error', { status: 503 });
      });
    })
  );
});

// Handle cache cleanup messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_AUTH_CACHE') {
    console.log('Clearing auth-related caches');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});