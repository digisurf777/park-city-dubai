import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const TawkToChat = () => {
  useEffect(() => {
    // Only load Tawk.to if it hasn't been loaded already and DOM is ready
    if (!window.Tawk_API && document.readyState === 'complete') {
      try {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://embed.tawk.to/YOUR_PROPERTY_ID/YOUR_WIDGET_ID';
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');
        
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript?.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
          
          // Set up Tawk_LoadStart
          window.Tawk_LoadStart = new Date();
        }
      } catch (error) {
        console.error('Failed to load TawkTo:', error);
      }
    }
  }, []);

  return null; // This component doesn't render anything visible
};

export default TawkToChat;