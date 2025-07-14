import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

// Animation wrapper components for easier usage
export const AnimateOnScroll = ({ 
  children, 
  animation = 'fade-up',
  delay = 0,
  className = '',
  ...options 
}: {
  children: React.ReactNode;
  animation?: 'fade-up' | 'slide-left' | 'fade-in' | 'slide-right';
  delay?: number;
  className?: string;
} & UseScrollAnimationOptions) => {
  const { ref, isVisible } = useScrollAnimation(options);

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-700 ease-out';
    const delayClass = delay > 0 ? `delay-${delay}` : '';
    
    switch (animation) {
      case 'fade-up':
        return `${baseClasses} ${delayClass} ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`;
      case 'slide-left':
        return `${baseClasses} ${delayClass} ${
          isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-12'
        }`;
      case 'slide-right':
        return `${baseClasses} ${delayClass} ${
          isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-12'
        }`;
      case 'fade-in':
      default:
        return `${baseClasses} ${delayClass} ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`;
    }
  };

  return (
    <div ref={ref} className={`${getAnimationClasses()} ${className}`}>
      {children}
    </div>
  );
};