import { useEffect } from 'react';

// Critical CSS for above-the-fold content
const criticalCSS = `
  /* Critical styles for hero section */
  .hero-critical {
    min-height: 100vh;
    background-color: #1a1a1a;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Critical font loading */
  @font-display: swap;
  
  /* Prevent layout shift */
  .hero-text {
    font-size: 3rem;
    line-height: 1.1;
    font-weight: 900;
    margin-bottom: 1rem;
  }
  
  @media (min-width: 640px) {
    .hero-text {
      font-size: 4rem;
    }
  }
  
  @media (min-width: 1024px) {
    .hero-text {
      font-size: 6rem;
    }
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