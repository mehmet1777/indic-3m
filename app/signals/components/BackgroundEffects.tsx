'use client';

import React, { useEffect, useRef, useState } from 'react';
import { throttle, calculateParallax, ANIMATION_TIMINGS } from '../utils/animationHelpers';

export const BackgroundEffects = React.memo(() => {
  const [scrollY, setScrollY] = useState(0);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrollY(window.scrollY);
    }, ANIMATION_TIMINGS.scrollThrottle);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = calculateParallax(scrollY, 0.5);

  return (
    <>
      {/* Animated Grid Pattern */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 opacity-20"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
          willChange: 'transform'
        }}
      >
        <div 
          className="absolute inset-0 animate-gridMove" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div 
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl animate-pulseSlow"
        style={{
          transform: `translateY(${parallaxOffset * 0.3}px)`,
          willChange: 'transform'
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-3xl animate-pulseSlow" 
        style={{ 
          animationDelay: '1s',
          transform: `translateY(${parallaxOffset * 0.4}px)`,
          willChange: 'transform'
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-600/20 rounded-full blur-3xl animate-pulseSlow" 
        style={{ 
          animationDelay: '2s',
          transform: `translate(-50%, -50%) translateY(${parallaxOffset * 0.2}px)`,
          willChange: 'transform'
        }}
      />
    </>
  );
});

BackgroundEffects.displayName = 'BackgroundEffects';
