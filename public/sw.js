// Enhanced Service Worker for optimal performance and cross-browser compatibility
// IMPORTANT: bump CACHE_VERSION manually when you ship changes that must invalidate caches.
// Using Date.now() here would defeat the cache entirely (every load = new cache = nothing reused).
const CACHE_VERSION = 'v6';
const STATIC_CACHE = 'static-' + CACHE_VERSION;
const IMAGE_CACHE = 'images-' + CACHE_VERSION;
const NEWS_CACHE = 'news-' + CACHE_VERSION;

// Tunables for the image cache (keeps storage bounded so the browser doesn't evict everything)
const IMAGE_CACHE_MAX_ENTRIES = 200;
const IMAGE_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Resources to cache immediately (only safe, stable URLs)
const CRITICAL_RESOURCES = [
  '/',
  '/favicon.ico',
];

// ---------- Install ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      // addAll fails atomically if any URL 404s — wrap each so install never fails
      Promise.all(
        CRITICAL_RESOURCES.map((url) =>
          fetch(url, { cache: 'reload' })
            .then((res) => (res.ok ? cache.put(url, res) : null))
            .catch(() => null)
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ---------- Activate ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            // Delete only OUR old caches (different version), keep current ones
            if (
              (name.startsWith('static-') ||
                name.startsWith('images-') ||
                name.startsWith('news-') ||
                name.startsWith('api-') ||
                name.startsWith('shazam-parking-')) &&
              !name.endsWith(CACHE_VERSION)
            ) {
              return caches.delete(name);
            }
            return null;
          })
        )
      ),
      self.clients.claim(),
    ])
  );
});

// ---------- Helpers ----------
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // FIFO eviction
    for (let i = 0; i < keys.length - maxEntries; i++) {
      await cache.delete(keys[i]);
    }
  }
}

function isExpired(response, maxAgeMs) {
  const dateHeader = response.headers.get('sw-cached-at');
  if (!dateHeader) return false;
  return Date.now() - parseInt(dateHeader, 10) > maxAgeMs;
}

async function cachePut(cacheName, request, response) {
  // Stamp with timestamp so we can expire later
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', Date.now().toString());
  const body = await response.clone().blob();
  const stamped = new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
  const cache = await caches.open(cacheName);
  await cache.put(request, stamped);
}

// ---------- Fetch ----------
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept non-http(s) (chrome-extension, data:, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Skip Supabase / API / auth / analytics — always live network
  if (
    url.origin.includes('supabase.co') ||
    url.pathname.includes('/rest/v1/') ||
    url.pathname.includes('/auth/v1/') ||
    url.pathname.includes('/realtime/v1/') ||
    url.pathname.includes('/storage/v1/') ||
    url.pathname.includes('/functions/v1/') ||
    url.pathname.startsWith('/api/')
  ) {
    return; // let browser handle
  }

  // Skip HTML navigations — always fresh so deploys are picked up immediately
  if (request.mode === 'navigate' || request.destination === 'document') {
    return;
  }

  // ---------- Images: stale-while-revalidate with expiry ----------
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);

        const fetchAndUpdate = fetch(request)
          .then(async (response) => {
            if (response && response.ok && response.status === 200) {
              await cachePut(IMAGE_CACHE, request, response);
              trimCache(IMAGE_CACHE, IMAGE_CACHE_MAX_ENTRIES);
            }
            return response;
          })
          .catch(() => null);

        // Serve fresh cached copy instantly
        if (cached && !isExpired(cached, IMAGE_CACHE_MAX_AGE_MS)) {
          // refresh in background
          event.waitUntil(fetchAndUpdate);
          return cached;
        }

        // No cache (or expired): wait for network, fall back to (stale) cache, then offline svg
        const fresh = await fetchAndUpdate;
        if (fresh) return fresh;
        if (cached) return cached;

        return new Response(
          '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="18" fill="#666">Image unavailable</text></svg>',
          { headers: { 'Content-Type': 'image/svg+xml' } }
        );
      })
    );
    return;
  }

  // ---------- Hashed JS/CSS/font assets: cache-first (immutable) ----------
  if (
    url.pathname.startsWith('/assets/') ||
    /\.(?:js|css|woff2?|ttf|eot|otf)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // ---------- /lovable-uploads (uploaded media): treat like images ----------
  if (url.pathname.startsWith('/lovable-uploads/') || url.pathname.startsWith('/news/')) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached && !isExpired(cached, IMAGE_CACHE_MAX_AGE_MS)) {
          event.waitUntil(
            fetch(request)
              .then((res) => res && res.ok && cachePut(IMAGE_CACHE, request, res))
              .catch(() => null)
          );
          return cached;
        }
        try {
          const response = await fetch(request);
          if (response && response.ok) {
            await cachePut(IMAGE_CACHE, request, response);
            trimCache(IMAGE_CACHE, IMAGE_CACHE_MAX_ENTRIES);
          }
          return response;
        } catch {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // Everything else: network only (no interception)
});

// ---------- Messages ----------
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'CLEAR_IMAGE_CACHE') {
    event.waitUntil(caches.delete(IMAGE_CACHE));
  }
  if (event.data.type === 'CLEAR_ALL_CACHES') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
    );
  }
});
