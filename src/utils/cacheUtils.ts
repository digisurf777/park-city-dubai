/**
 * Cache utilities for clearing the browser/asset cache.
 *
 * IMPORTANT: These helpers must NEVER remove Supabase auth tokens
 * (`supabase.auth.*` / `sb-*` keys). Clearing those wipes the user's session
 * and forces repeated logins. Only non-auth asset caches are cleared here.
 */

export const clearAuthCache = async () => {
  try {
    // Clear non-auth asset caches only (HTTP cache / service-worker image cache).
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Browser asset caches cleared (auth tokens preserved)');
    }

    // Ask the service worker to drop its image cache only — never auth data.
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.active) {
        registration.active.postMessage({ type: 'CLEAR_IMAGE_CACHE' });
      }
    }

    // Deliberately DO NOT touch localStorage/sessionStorage auth keys here.
  } catch (error) {
    console.error('Error clearing asset cache:', error);
  }
};

export const addCacheBustingHeaders = () => {
  // Add cache-busting meta tags
  const existingNoCache = document.querySelector('meta[http-equiv="Cache-Control"]');
  if (!existingNoCache) {
    const noCacheMeta = document.createElement('meta');
    noCacheMeta.setAttribute('http-equiv', 'Cache-Control');
    noCacheMeta.setAttribute('content', 'no-cache, no-store, must-revalidate');
    document.head.appendChild(noCacheMeta);
    
    const pragmaMeta = document.createElement('meta');
    pragmaMeta.setAttribute('http-equiv', 'Pragma');
    pragmaMeta.setAttribute('content', 'no-cache');
    document.head.appendChild(pragmaMeta);
    
    const expiresMeta = document.createElement('meta');
    expiresMeta.setAttribute('http-equiv', 'Expires');
    expiresMeta.setAttribute('content', '0');
    document.head.appendChild(expiresMeta);
  }
};