import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileOptimizations = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      // Disable zoom on double tap
      let lastTouchEnd = 0;
      document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, false);

      // Add viewport meta tag for mobile optimization
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }

      // Optimize focus behavior on mobile
      document.addEventListener('focusin', (e) => {
        const target = e.target as HTMLElement;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
          // Small delay to ensure keyboard is shown
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      });
    }
  }, [isMobile]);

  return null;
};