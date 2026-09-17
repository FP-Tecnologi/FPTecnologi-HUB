'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface AboutStatCardProps {
  /**
   * The target value to count up to
   */
  value: number;
  /**
   * Optional suffix to display after the number (e.g., '+', 'K+', '%')
   */
  suffix?: string;
  /**
   * Label text displayed below the number
   */
  label: string;
  /**
   * Animation duration in milliseconds (default: 2000)
   */
  duration?: number;
  /**
   * Delay before starting the animation in milliseconds (default: 0)
   */
  delay?: number;
  /**
   * Custom className for the card container
   */
  className?: string;
}

/**
 * AboutStatCard Component
 * 
 * A reusable stat card component with animated counter that counts from 0 to the target value.
 * The animation triggers when the card enters the viewport using Intersection Observer.
 * 
 * @example
 * <AboutStatCard 
 *   value={700} 
 *   suffix="+" 
 *   label="5-Star Reviews" 
 * />
 */
const AboutStatCard: React.FC<AboutStatCardProps> = ({
  value,
  suffix,
  label,
  duration = 2000,
  delay = 0,
  className = '',
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  /**
   * Formats the number based on the suffix
   * If suffix contains 'K', divide by 1000; if 'M', divide by 1000000
   */
  const formatNumber = (num: number): string => {
    if (suffix?.includes('K') && num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1);
    }
    if (suffix?.includes('M') && num >= 1000000) {
      return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1);
    }
    return num.toLocaleString();
  };

  const animateCounter = useCallback(() => {
    const startTime = Date.now();
    const startValue = 0;
    const endValue = value;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue); // Ensure final value is exact
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            
            // Start animation after delay
            setTimeout(() => {
              animateCounter();
            }, delay);
            
            // Disconnect observer after animation starts
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the card is visible
        rootMargin: '0px',
      }
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated, delay, duration, value, animateCounter]);

  return (
    <div
      ref={cardRef}
      className={`p-5 rounded-20 bg-linear-to-b from-slateBlue/20 to-royalBlue/20 flex flex-col gap-2 ${className}`}
    >
      <h3 className="text-3xl lg:text-[32px] font-semibold">
        <span className="text-white">
          {formatNumber(count)}
        </span>
        {suffix && (
          <>
            {' '}
            <span className="text-tertiary">{suffix}</span>
          </>
        )}
      </h3>
      <p className="text-white/80 tracking-[0.1px]">{label}</p>
    </div>
  );
};

AboutStatCard.displayName = 'AboutStatCard';

export default AboutStatCard;
