import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";

console.log('main.tsx: Starting app initialization');

// Global error handlers for better debugging
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', event.error);
  console.error('Error message:', event.message);
  console.error('Error filename:', event.filename);
  console.error('Error line:', event.lineno);
  console.error('Error column:', event.colno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
  console.error('Promise:', event.promise);
});

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

root.render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);

console.log('main.tsx: App render initiated');
