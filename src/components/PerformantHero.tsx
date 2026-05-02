import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import heroPhoneMockup from "@/assets/hero-phone-mockup.png";

// Lazy load non-critical components
const LazyImage = lazy(() => import('./LazyImage'));

const PerformantHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-section hero-bg">
      {/* Critical resource preloads */}
      <link 
        rel="preload" 
        as="image" 
        href="/lovable-uploads/25c56481-0d03-4055-bd47-67635ac0d1b0.webp"
        fetchPriority="high"
      />
      <link 
        rel="preload" 
        as="image" 
        href={heroPhoneMockup}
        fetchPriority="high"
      />
      
      {/* Optimized background - now handled by critical CSS */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen pt-20 sm:pt-24 lg:pt-0 py-8 sm:py-16 lg:py-[141px]">
          {/* Left side - Text */}
          <div className="text-center lg:text-left lg:flex-1 mb-8 lg:mb-0 mt-8 sm:mt-16 lg:mt-0">
            <div className="hero-copy-frame inline-block px-5 sm:px-7 py-5 sm:py-7 lg:px-9 lg:py-8 max-w-2xl">
              <span className="inline-block mb-3 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase shadow-lg">
                ★ Trusted in Dubai
              </span>
              <h1 className="hero-title leading-tight">
                <span className="block text-white text-3d-light font-extrabold">
                  YOUR TRUSTED
                </span>
                <span className="block font-black text-3d bg-gradient-to-r from-primary-glow via-white to-primary bg-clip-text text-transparent">
                  PARKING PLATFORM
                </span>
                <span className="block text-white text-3d-light font-extrabold">
                  IN DUBAI
                </span>
              </h1>
              <p className="text-base sm:text-lg text-white mt-4 font-medium drop-shadow-lg">
                List your parking space in minutes and start earning every month.
              </p>
            </div>
          </div>
          
          {/* Right side - Phone Mockup (slightly smaller, optimized) */}
          <div className="lg:flex-1 flex justify-center lg:justify-end">
            <img
              alt="Shazam Parking Mobile App"
              className="w-52 sm:w-64 md:w-72 lg:w-80 xl:w-96 h-auto transition-transform duration-300 hover:scale-105 drop-shadow-2xl"
              src={heroPhoneMockup}
              loading="eager"
              {...({ fetchpriority: 'high' })}
              decoding="async"
              width="384"
              height="700"
            />
          </div>
        </div>
        
        {/* CTA Button - Optimized */}
        <div className="flex justify-center mt-8 sm:mt-12 lg:absolute lg:bottom-20 lg:left-1/2 lg:transform lg:-translate-x-1/2 px-4">
          <Link to="/auth" className="touch-manipulation">
            <button className="btn-3d-primary px-8 py-4 rounded-xl font-bold text-base tracking-[0.15em] uppercase min-h-[52px] touch-target">
              Get Started Free
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PerformantHero;