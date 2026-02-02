import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";

// Create root immediately for fastest TTI
const root = createRoot(document.getElementById("root")!);

// Preload critical fonts with high priority
const preloadFonts = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap';
  link.as = 'style';
  link.onload = () => { link.rel = 'stylesheet'; };
  document.head.appendChild(link);
};

// Initialize font preload immediately
preloadFonts();

// Register service worker after page load (non-blocking)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
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
