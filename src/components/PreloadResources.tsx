import React, { useEffect } from 'react';

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

    // Optimize third-party script loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          // Load TawkTo chat after user starts scrolling
          const tawkScript = document.createElement('script');
          tawkScript.async = true;
          tawkScript.src = 'https://embed.tawk.to/669e2eabeaf3bd8d4d15776a/1i37fgn8s';
          tawkScript.charset = 'UTF-8';
          tawkScript.setAttribute('crossorigin', '*');
          document.head.appendChild(tawkScript);
          
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });

    // Start observing after a small delay
    const target = document.querySelector('#scroll-trigger') || document.body;
    setTimeout(() => observer.observe(target), 1000);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Add scroll trigger element */}
      <div id="scroll-trigger" style={{ position: 'absolute', top: '50vh', height: '1px' }} />
    </>
  );
};

export default PreloadResources;