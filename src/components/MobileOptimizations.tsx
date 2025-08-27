import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileOptimizations = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    // Cross-browser viewport optimization
    const optimizeViewport = () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
    };

    // CSS custom properties fallbacks for older browsers
    const addCSSFallbacks = () => {
      const root = document.documentElement;
      
      // Add fallback values for CSS custom properties
      if (!CSS.supports('color', 'var(--primary)')) {
        root.style.setProperty('--primary', '222.2 84% 4.9%');
        root.style.setProperty('--primary-foreground', '210 40% 98%');
        root.style.setProperty('--secondary', '210 40% 96%');
        root.style.setProperty('--accent', '210 40% 96%');
      }
    };

    // Enhanced touch optimization for all devices
    const optimizeTouchInteractions = () => {
      // Prevent double-tap zoom on all elements
      let lastTouchEnd = 0;
      const preventDoubleTouch = (event: TouchEvent) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      };

      // Add passive event listeners for better performance
      document.addEventListener('touchend', preventDoubleTouch, { passive: false });
      
      // Improve button interactions on touch devices
      document.addEventListener('touchstart', (e) => {
        const target = e.target as HTMLElement;
        if (target.matches('button, [role="button"], .btn, input[type="submit"]')) {
          target.style.transform = 'scale(0.98)';
        }
      }, { passive: true });

      document.addEventListener('touchend', (e) => {
        const target = e.target as HTMLElement;
        if (target.matches('button, [role="button"], .btn, input[type="submit"]')) {
          setTimeout(() => {
            target.style.transform = '';
          }, 150);
        }
      }, { passive: true });

      return () => {
        document.removeEventListener('touchend', preventDoubleTouch);
      };
    };

    // Enhanced focus management for forms
    const optimizeFocusManagement = () => {
      const handleFocus = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        
        // Scroll form inputs into view on mobile
        if (target instanceof HTMLInputElement || 
            target instanceof HTMLTextAreaElement || 
            target instanceof HTMLSelectElement) {
          
          // Wait for keyboard to show up on mobile
          const delay = isMobile ? 300 : 100;
          
          setTimeout(() => {
            // Check if element is still focused (user didn't navigate away)
            if (document.activeElement === target) {
              const rect = target.getBoundingClientRect();
              const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
              
              if (!isInViewport) {
                target.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center',
                  inline: 'nearest' 
                });
              }
            }
          }, delay);
        }
      };

      document.addEventListener('focusin', handleFocus);
      
      return () => {
        document.removeEventListener('focusin', handleFocus);
      };
    };

    // Network status monitoring for better UX
    const monitorNetworkStatus = () => {
      const updateOnlineStatus = () => {
        if (!navigator.onLine) {
          const existingOfflineMsg = document.getElementById('offline-indicator');
          if (!existingOfflineMsg) {
            const offlineDiv = document.createElement('div');
            offlineDiv.id = 'offline-indicator';
            offlineDiv.style.cssText = `
              position: fixed; 
              top: 0; 
              left: 0; 
              right: 0; 
              background: #ef4444; 
              color: white; 
              text-align: center; 
              padding: 8px; 
              z-index: 9999; 
              font-size: 14px;
              font-weight: 500;
            `;
            offlineDiv.textContent = 'No internet connection - some features may not work';
            document.body.appendChild(offlineDiv);
          }
        } else {
          const offlineMsg = document.getElementById('offline-indicator');
          if (offlineMsg) {
            offlineMsg.remove();
          }
        }
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      
      // Check initial status
      updateOnlineStatus();
      
      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    };

    // Enhanced error boundary for cross-browser compatibility
    const setupErrorHandling = () => {
      window.addEventListener('error', (event) => {
        console.error('Global error caught:', event.error);
        
        // Handle specific browser compatibility issues
        if (event.error?.message?.includes('ResizeObserver')) {
          // Ignore ResizeObserver errors (common in some browsers)
          event.preventDefault();
          return false;
        }
        
        return true;
      });

      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Handle network-related promise rejections gracefully
        if (event.reason?.message?.includes('fetch') || event.reason?.code === 'NETWORK_ERROR') {
          event.preventDefault();
          console.warn('Network error handled gracefully');
        }
      });
    };

    // Initialize all optimizations
    optimizeViewport();
    addCSSFallbacks();
    setupErrorHandling();
    
    const cleanupTouch = optimizeTouchInteractions();
    const cleanupFocus = optimizeFocusManagement();
    const cleanupNetwork = monitorNetworkStatus();

    // Cleanup function
    return () => {
      cleanupTouch?.();
      cleanupFocus?.();
      cleanupNetwork?.();
    };
  }, [isMobile]);

  return null;
};