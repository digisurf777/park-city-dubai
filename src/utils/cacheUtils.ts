/**
 * Cache utilities for clearing browser cache and preventing authentication issues
 */

export const clearAuthCache = async () => {
  try {
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Browser caches cleared');
    }
    
    // Clear service worker cache
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.active) {
        registration.active.postMessage({ type: 'CLEAR_AUTH_CACHE' });
      }
    }
    
    // Clear localStorage auth data
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage auth data
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
  } catch (error) {
    console.error('Error clearing auth cache:', error);
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