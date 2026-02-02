import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const TawkToChat = () => {
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initialized.current || window.Tawk_API) return;
    
    const loadTawkTo = () => {
      if (initialized.current || window.Tawk_API) return;
      initialized.current = true;
      
      // Set up Tawk_LoadStart
      window.Tawk_LoadStart = new Date();
      
      // Create TawkTo script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/669e2eabeaf3bd8d4d15776a/1i37fgn8s';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      
      // Add to document
      document.head.appendChild(script);
    };

    // Defer loading until after critical content is loaded
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadTawkTo, { timeout: 5000 });
    } else {
      // Fallback: load after 3 seconds to ensure main content loads first
      const timer = setTimeout(loadTawkTo, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return null; // This component doesn't render anything visible
};

export default TawkToChat;