import React, { useEffect } from 'react';

// Critical CSS for above-the-fold content
const criticalCSS = `
  /* Critical font face for immediate text rendering */
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  
  /* Critical styles for hero section */
  .hero-critical {
    min-height: 100vh;
    background: linear-gradient(135deg, hsl(174 66% 56%) 0%, hsl(174 66% 46%) 100%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    contain: layout style paint;
  }
  
  /* Prevent layout shift */
  .hero-text {
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 1.1;
    font-weight: 900;
    margin-bottom: 1rem;
    font-family: 'Inter', sans-serif;
    contain: layout style;
  }
  
  /* Critical button styles */
  .btn-critical {
    background: hsl(174 66% 56%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: background-color 0.2s;
    contain: layout style;
  }
  
  /* Optimize images for LCP */
  img {
    content-visibility: auto;
    contain-intrinsic-size: 1px 1000px;
  }
  
  /* Critical layout containers */
  .container-critical {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    contain: layout;
  }
`;

const CriticalCSS = () => {
  useEffect(() => {
    // Inject critical CSS as early as possible
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);
    
    return () => {
      // Cleanup on unmount
      const criticalStyle = document.querySelector('[data-critical="true"]');
      if (criticalStyle) {
        criticalStyle.remove();
      }
    };
  }, []);

  return null;
};

export default CriticalCSS;