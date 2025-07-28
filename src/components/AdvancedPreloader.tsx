import { useEffect } from 'react';

const AdvancedPreloader = () => {
  useEffect(() => {
    // Preload critical images with high priority
    const criticalImages = [
      '/assets/dubai-skyline-hero.jpg',
      '/assets/dubai-parking-hero.jpg',
      '/lovable-uploads/atlantis-hotel-hero.jpg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
    });

    // Preload critical routes aggressively
    const criticalRoutes = ['/find-parking', '/rent-out-your-space', '/auth'];
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });

    // Preconnect to external domains
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://embed.tawk.to'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for better third-party performance
    const dnsPrefetchDomains = [
      '//tawk.to',
      '//va.tawk.to'
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Predictive loading based on user interaction
    let mousedownTime: number;
    let isPreloading = false;

    const handleMouseDown = (e: MouseEvent) => {
      mousedownTime = performance.now();
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && !isPreloading) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.includes('#')) {
          isPreloading = true;
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = href;
          document.head.appendChild(prefetchLink);
          
          setTimeout(() => {
            isPreloading = false;
          }, 100);
        }
      }
    };

    const handleMouseUp = () => {
      const clickDuration = performance.now() - mousedownTime;
      // If click was longer than 100ms, user might be hesitating - preload more aggressively
      if (clickDuration > 100) {
        const allLinks = document.querySelectorAll('a[href^="/"]');
        allLinks.forEach((link, index) => {
          if (index < 3) { // Limit to 3 additional preloads
            const href = link.getAttribute('href');
            if (href && !document.querySelector(`link[href="${href}"]`)) {
              setTimeout(() => {
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = href;
                document.head.appendChild(prefetchLink);
              }, index * 50);
            }
          }
        });
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Viewport-based preloading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const links = element.querySelectorAll('a[href^="/"]');
          
          links.forEach((link, index) => {
            if (index < 2) { // Limit viewport-based preloading
              const href = link.getAttribute('href');
              if (href && !document.querySelector(`link[href="${href}"]`)) {
                setTimeout(() => {
                  const prefetchLink = document.createElement('link');
                  prefetchLink.rel = 'prefetch';
                  prefetchLink.href = href;
                  document.head.appendChild(prefetchLink);
                }, index * 100);
              }
            }
          });
        }
      });
    }, { threshold: 0.5 });

    // Observe sections for viewport-based preloading
    setTimeout(() => {
      const sections = document.querySelectorAll('section, .hero, .popular-locations');
      sections.forEach(section => observer.observe(section));
    }, 1000);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      observer.disconnect();
    };
  }, []);

  return null;
};

export default AdvancedPreloader;