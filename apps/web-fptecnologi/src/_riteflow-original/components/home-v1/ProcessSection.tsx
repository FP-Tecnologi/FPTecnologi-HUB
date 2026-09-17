'use client';

import React, { useEffect, useRef } from 'react';
import BulbIcon from '../icons/BulbIcon';
import BuildIcon from '../icons/BuildIcon';
import LanchIcon from '../icons/LanchIcon';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
export interface ProcessStep {
  /**
   * Step number (e.g., 1, 2, 3)
   */
  step: number;
  /**
   * Step title
   */
  title: string;
  /**
   * Step description
   */
  description: string;
  /**
   * Icon path or component
   */
  icon?: React.ReactNode;
  /**
   * Icon SVG path (alternative to icon component)
   */
  iconPath?: string;
}

export interface ProcessSectionProps {
  /**
   * Section title
   */
  title?: string;
  /**
   * Section description
   */
  description?: string;
  /**
   * Array of process steps
   */
  steps?: ProcessStep[];
}

/**
 * ProcessSection Component
 * 
 * Displays a three-step process section with sticky cards.
 * Features:
 * - Sticky layout on desktop
 * - Process cards with icons and step badges
 * - Responsive design
 * - Customizable steps array
 * 
 * @param {string} title - Section title
 * @param {string} description - Section description
 * @param {Array<ProcessStep>} steps - Array of process step objects
 * 
 * @example
 * <ProcessSection />
 */
const ProcessSection: React.FC<ProcessSectionProps> = ({
  title = 'Turn Ideas Into Impact with Three-Step Process',
  description = 'Follow a clear path from first spark to full deployment. We align goals, craft custom AI, and launch solutions that scale with your business—fast.',
  steps = [
    {
      step: 1,
      title: 'Discover',
      description: 'We start by understanding your goals and challenges. Through a quick audit of your current workflows, we identify where AI can create the biggest impact.',
      icon: <BulbIcon className="w-4 h-[22px]" />,
    },
    {
      step: 2,
      title: 'Build',
      description: 'Our team develops and tests AI solutions tailored to your needs. We combine data science and thoughtful UX to ensure everything runs smoothly and feels intuitive.',
      icon: <BuildIcon className="w-4 h-[22px]" />,
    },
    {
      step: 3,
      title: 'Launch & Optimize',
      description: 'We help you go live with confidence. After launch, we monitor performance and make improvements so your tools stay sharp, relevant, and effective over time.',
      icon: <LanchIcon className="w-4 h-[22px]" />,
    },
  ],
}) => {
  const containerRef = useRef<HTMLElement>(null);

  // Set initial hidden state immediately on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const processArea = containerRef.current;
    const title = processArea.querySelector('[data-title]');
    const excerpt = processArea.querySelector('[data-excerpt]');
    const cards = processArea.querySelectorAll('[data-card]');

    const trailFrom = { x: -100, opacity: 0, filter: 'blur(16px)' };
    const sharedFrom = { y: 100, opacity: 0, filter: 'blur(16px)' };

    // Set initial hidden state
    if (title) {
      gsap.set(title, trailFrom);
    }
    if (excerpt) {
      gsap.set(excerpt, trailFrom);
    }
    if (cards.length) {
      cards.forEach((card) => {
        gsap.set(card, sharedFrom);
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Wait for preloader to finish
    const waitForPreloader = () => {
      return new Promise<void>((resolve) => {
        // Check if preloader is already done
        if (!document.documentElement.classList.contains('preloader-active')) {
          setTimeout(resolve, 100);
          return;
        }

        // Watch for preloader-active class removal
        const observer = new MutationObserver(() => {
          if (!document.documentElement.classList.contains('preloader-active')) {
            observer.disconnect();
            setTimeout(resolve, 300);
          }
        });

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
        });

        // Fallback timeout
        setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 5000);
      });
    };

    let scrollTrigger: ScrollTrigger | null = null;
    let tl: gsap.core.Timeline | null = null;

    const initAnimation = async () => {
      // Wait for preloader to finish
      await waitForPreloader();

      if (!containerRef.current) return;

      const processArea = containerRef.current;
      const title = processArea.querySelector('[data-title]');
      const excerpt = processArea.querySelector('[data-excerpt]');
      const cards = processArea.querySelectorAll('[data-card]');

      const trailFrom = { x: -100, opacity: 0, filter: 'blur(16px)' };
      const trailTo = { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'back' };
      const sharedFrom = { y: 100, opacity: 0, filter: 'blur(16px)' };
      const sharedTo = { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' };

      tl = gsap.timeline({ paused: true });

      if (!tl) return;

      if (title) {
        tl.fromTo(title, { ...trailFrom }, { ...trailTo }, 0);
      }

      if (excerpt) {
        tl.fromTo(excerpt, { ...trailFrom }, { ...trailTo }, '-=0.6');
      }

      if (cards.length && tl) {
        cards.forEach((card) => {
          tl!.fromTo(card, { ...sharedFrom }, { ...sharedTo }, '-=0.6');
        });
      }

      // ScrollTrigger attached separately to timeline
      scrollTrigger = ScrollTrigger.create({
        trigger: processArea,
        start: 'top 80%',
        end: 'top 40%',
        animation: tl,
        toggleActions: 'play none none none',
        invalidateOnRefresh: true,
        // markers: true, // Uncomment for debugging
      });

      // In case layout shifts (fonts/images load), refresh triggers
      ScrollTrigger.refresh();
    };

    initAnimation();

    // Cleanup on unmount
    return () => {
      if (scrollTrigger) {
        scrollTrigger.kill();
      }
      if (tl) {
        tl.kill();
      }
    };
  }, []);

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section 
      ref={containerRef}
      className="section-bottom-border" 
      id="process-area" 
      data-container="process-area"
      aria-label="Process section"
    >
      <div className="container">
        <div className="border-container section-spacing-lg sticky-cards">
          <div className="flex items-start justify-between gap-10 relative flex-col md:flex-row process-wrapper">
            {/* Left Content */}
            <div className="max-w-[520px] md:max-w-[560px] w-full md:sticky sticky-card" style={{ top: '80px' }}>
              <h2 
                data-title 
                className="gradient-text text-3xl sm:text-4xl lg:text-5xl xl:text-[51px] font-semibold -tracking-[0.4px] !leading-[1.2]"
              >
                {title}
              </h2>
              <p 
                data-excerpt 
                className="mt-4 md:mt-5 text-offWhite/80"
              >
                {description}
              </p>
            </div>

            {/* Process Cards */}
            <div className="md:max-w-[560px] w-full flex flex-col gap-5">
              {steps.map((step, index) => {
                // Different top values for sequential sticky effect
                const topValues = [80, 150, 220];
                const topValue = topValues[index] || 80;
                
                return (
                  <div 
                    key={step.step} 
                    className="md:sticky sticky-card"
                    style={{ top: `${topValue}px` }}
                    data-card
                  >
                  <div className="px-5 pt-5 pb-5 md:pb-10 bg-blue rounded-[20px] border border-lineColor/70">
                    {/* Header with Icon and Step Badge */}
                    <div className="flex items-center justify-between gap-5">
                      <div className="w-10.5 h-10.5 flex items-center justify-center bg-primary rounded-[10px]">
                        {step.icon || (
                          <span className="text-white text-lg font-semibold">{step.step}</span>
                        )}
                      </div>
                      <span className="py-1.5 px-3 text-sm font-medium leading-normal tracking-[-0.1px] rounded-[10px] inline-block bg-linear-to-b from-slateBlue/20 to-royalBlue/20 text-tertiary">
                        Step {step.step}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-xl text-offWhite font-medium leading-normal mt-7.5 tracking-[0.2px]">
                      {step.title}
                    </h3>

                    {/* Gradient Border */}
                    <div className="my-4 gradient-border w-full h-[1px]"></div>

                    {/* Step Description */}
                    <p className="text-offWhite/60">
                      {step.description}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Process End Spacer */}
          {/* <section className="process-end md:h-[150px]"></section> */}
        </div>
      </div>
    </section>
  );
};

ProcessSection.displayName = 'ProcessSection';

export default ProcessSection;
