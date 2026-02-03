// Enhanced Service Worker for optimal performance and cross-browser compatibility
const CACHE_VERSION = 'v' + Date.now();
const CACHE_NAME = 'shazam-parking-' + CACHE_VERSION;

// Cache strategies for different resource types
const STATIC_CACHE = 'static-' + CACHE_VERSION;
const IMAGE_CACHE = 'images-' + CACHE_VERSION;
const API_CACHE = 'api-' + CACHE_VERSION;
const NEWS_CACHE = 'news-' + CACHE_VERSION;

// Resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/assets/dubai-skyline-hero.jpg',
  '/lovable-uploads/atlantis-hotel-hero.jpg'
];

// Install event - cache critical resources immediately
self.addEventListener('install', (event) => {
  console.log('Enhanced SW installing, version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Clear all old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Cache critical resources
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_RESOURCES);
      })
    ]).then(() => {
      // Force immediate activation
      return self.skipWaiting();
    })
  );
});

// Activate event - claim all clients immediately
self.addEventListener('activate', (event) => {
  console.log('Enhanced SW activated');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_VERSION)) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ])
  );
});

// Enhanced fetch strategy with intelligent caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const request = event.request;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Authentication and API requests - always network first
  if (url.pathname.includes('/auth') || 
      url.pathname.includes('/api/') ||
      url.origin.includes('supabase') ||
      url.pathname.includes('/rest/v1/')) {
    
    event.respondWith(
      fetch(request.clone())
        .then(response => {
          // Don't cache auth responses
          return response;
        })
        .catch(() => {
          // Fallback for offline scenario
          return new Response(JSON.stringify({error: 'Offline'}), {
            headers: {'Content-Type': 'application/json'}
          });
        })
    );
    return;
  }

  // News content - cache with network first strategy
  if (url.pathname.includes('/news')) {
    event.respondWith(
      caches.open(NEWS_CACHE).then(cache => {
        return fetch(request.clone())
          .then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(request);
          });
      })
    );
    return;
  }

  // Images - cache first with fallback
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) return response;
          
          return fetch(request.clone()).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // Return fallback image for offline
            return new Response(
              '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="18" fill="#666">Image unavailable offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          });
        });
      })
    );
    return;
  }

  // Static assets - stale-while-revalidate for fonts/CSS, cache first for JS
  if (url.pathname.includes('/static/') || 
      url.pathname.includes('/assets/') ||
      url.pathname.match(/\.(css|js|woff2?|ttf|eot)$/)) {
    
    const isFont = url.pathname.match(/\.(woff2?|ttf|eot)$/);
    const isCSS = url.pathname.match(/\.css$/);
    
    // Stale-while-revalidate for fonts and CSS (faster perceived load)
    if (isFont || isCSS) {
      event.respondWith(
        caches.open(STATIC_CACHE).then(cache => {
          return cache.match(request).then(cachedResponse => {
            const fetchPromise = fetch(request.clone()).then(networkResponse => {
              if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            }).catch(() => cachedResponse);
            
            return cachedResponse || fetchPromise;
          });
        })
      );
      return;
    }
    
    // Cache first for JS
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) return response;
          
          return fetch(request.clone()).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Default strategy - network first with cache fallback
  event.respondWith(
    fetch(request.clone())
      .then(response => {
        if (response.ok && response.status === 200) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle cache cleanup messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_AUTH_CACHE') {
    console.log('Clearing auth-related caches');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.filter(name => name.includes('api')).map(name => {
            return caches.delete(name);
          })
        );
      })
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic cache cleanup - every 60 minutes
setInterval(() => {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      if (!cacheName.includes(CACHE_VERSION)) {
        caches.delete(cacheName);
      }
    });
  });
}, 60 * 60 * 1000);