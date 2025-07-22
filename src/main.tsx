import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import CriticalCSS from "./components/CriticalCSS.tsx";

// Performance optimizations
const root = createRoot(document.getElementById("root")!);

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

root.render(
  <StrictMode>
    <HelmetProvider>
      <CriticalCSS />
      <App />
    </HelmetProvider>
  </StrictMode>
);
