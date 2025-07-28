// Service Worker for aggressive caching and performance optimization
const CACHE_NAME = 'shazam-parking-v1';
const STATIC_CACHE_NAME = 'shazam-static-v1';
const DYNAMIC_CACHE_NAME = 'shazam-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/dubai-skyline-hero.jpg',
  '/assets/dubai-parking-hero.jpg',
  '/lovable-uploads/atlantis-hotel-hero.jpg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap'
];

// Routes to cache dynamically
const DYNAMIC_ROUTES = [
  '/find-parking',
  '/rent-out-your-space',
  '/auth',
  '/calculator'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests except for fonts and images
  if (url.origin !== location.origin && 
      !url.hostname.includes('fonts.googleapis.com') && 
      !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // Cache strategy for different resource types
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request));
  } else if (request.destination === 'font' || url.hostname.includes('fonts')) {
    event.respondWith(cacheFirst(request));
  } else if (request.destination === 'document' || DYNAMIC_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// Cache strategies
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(DYNAMIC_CACHE_NAME);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}