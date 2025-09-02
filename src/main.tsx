import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";
import CriticalCSS from "./components/CriticalCSS.tsx";
import PreloadResources from "./components/PreloadResources.tsx";

console.log('main.tsx: Starting app initialization');

// Performance optimizations
const root = createRoot(document.getElementById("root")!);
console.log('main.tsx: Root created successfully');

// Preload critical resources
const preloadResources = () => {
  // Preload critical fonts
  const fontLinks = [
    { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap', as: 'style' }
  ];
  
  fontLinks.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Initialize performance optimizations
preloadResources();

// Register service worker for cache management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Force update when new version is available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, refresh the page
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Clear any problematic caches on app start
const clearProblematicCaches = async () => {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    console.log('Cleared all caches for fresh start');
  } catch (error) {
    console.log('Cache clearing failed:', error);
  }
};

// Clear caches before rendering
clearProblematicCaches().then(() => {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
});

console.log('main.tsx: App render initiated');
