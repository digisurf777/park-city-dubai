import { useEffect } from 'react';

const PreloadResources = () => {
  useEffect(() => {
    // Preload critical images immediately
    const criticalImages = [
      '/lovable-uploads/atlantis-hotel-hero.jpg',
      '/assets/dubai-skyline-hero.jpg',
      '/assets/dubai-parking-hero.jpg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
    });

    // Preload critical routes
    const criticalRoutes = ['/find-parking', '/rent-out-your-space'];
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });

    // Remove TawkTo loading from here - now handled by OptimizedTawkTo component

    // Cleanup function (observer no longer needed)
    return () => {};
  }, []);

  return (
    <>
      {/* Add scroll trigger element */}
      <div id="scroll-trigger" style={{ position: 'absolute', top: '50vh', height: '1px' }} />
    </>
  );
};

export default PreloadResources;