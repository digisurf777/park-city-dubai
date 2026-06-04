/**
 * Auth utilities for handling authentication state cleanup and preventing limbo states
 */

export const cleanupAuthState = () => {
  try {
    // Remove the persisted Supabase auth session from localStorage ONLY.
    // IMPORTANT: do NOT touch sessionStorage here — Supabase stores the PKCE
    // code verifier there during OAuth/email flows. Wiping it mid-flow (or on a
    // mobile browser that restores a suspended tab) breaks token exchange and
    // logs the user out unexpectedly.
    localStorage.removeItem('supabase.auth.token');

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const forcePageRefresh = (url: string = '/') => {
  window.location.href = url;
};
