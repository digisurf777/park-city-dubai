import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";

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
        
        // Update found; defer activation without auto-reload to prevent flashing
        // registration.addEventListener('updatefound', () => { /* no-op */ });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

console.log('main.tsx: App render initiated');
