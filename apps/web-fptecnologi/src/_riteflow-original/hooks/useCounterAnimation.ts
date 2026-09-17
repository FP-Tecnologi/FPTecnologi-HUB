'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hook to animate a counter from 0 to target value
 * Uses Intersection Observer to trigger animation when element enters viewport
 * @param target - Target number to count to (0 if not provided or invalid)
 * @param duration - Animation duration in milliseconds (default: 2000)
 */
export function useCounterAnimation(target: number | null | undefined, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const targetValue = target ?? 0;

  useEffect(() => {
    if (!ref.current || hasAnimated || targetValue === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            
            // Animate counter
            const startTime = Date.now();
            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Easing function for smooth animation
              const easeOutQuart = 1 - Math.pow(1 - progress, 4);
              const current = Math.floor(easeOutQuart * targetValue);
              
              setCount(current);
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setCount(targetValue);
              }
            };
            
            requestAnimationFrame(animate);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% visible
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [targetValue, duration, hasAnimated]);

  return { count: targetValue === 0 ? 0 : count, ref };
}
