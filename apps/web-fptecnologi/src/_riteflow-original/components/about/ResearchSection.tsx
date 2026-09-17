'use client';

import React, { useEffect, useRef } from 'react';
import ResearchCard from './ResearchCard';
import { researchItems } from '@riteflow/data/aboutData';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * ResearchSection Component
 * 
 * Displays research section with title, description, and research cards.
 * Fetches research data internally from aboutData.ts.
 * 
 * @example
 * <ResearchSection />
 */
const ResearchSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const title = 'AI Research';
  const description = 'At RiteFlow, our AI research drives innovation that transforms ideas into intelligent solutions. We explore cutting-edge machine learning, automation, and data science to build tools that think, learn, and adapt — empowering businesses and individuals to achieve more with the power of AI.';

  // Set initial hidden state immediately on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const processArea = containerRef.current;
    const title = processArea.querySelector('[data-title]');
    const excerpt = processArea.querySelector('[data-excerpt]');

    const trailFrom = { x: -100, opacity: 0, filter: 'blur(16px)' };

    // Set initial hidden state
    if (title) {
      gsap.set(title, trailFrom);
    }
    if (excerpt) {
      gsap.set(excerpt, trailFrom);
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

      const trailFrom = { x: -100, opacity: 0, filter: 'blur(16px)' };
      const trailTo = { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'back' };

      tl = gsap.timeline({ paused: true });

      if (!tl) return;

      if (title) {
        tl.fromTo(title, { ...trailFrom }, { ...trailTo }, 0);
      }

      if (excerpt) {
        tl.fromTo(excerpt, { ...trailFrom }, { ...trailTo }, '-=0.6');
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

  // Safety check: ensure data exists
  if (!researchItems || researchItems.length === 0) {
    return null;
  }

  return (
    <section className="section-bottom-border relative z-1 overflow-hidden">
      <div className="container">
        <div className="border-container section-spacing-lg">
          <div className="flex items-center justify-between gap-10 flex-col lg:flex-row">
            {/* Content */}
            <div
              ref={containerRef}
              className="max-w-[600px] lg:max-w-[434px] w-full mx-auto lg:mx-0 text-center lg:text-left"
              data-container="process-area"
            >
              <h2
                data-title
                className="gradient-text text-3xl sm:text-4xl lg:text-5xl xl:text-[51px] font-semibold -tracking-[0.4px] !leading-[1.1]"
              >
                {title}
              </h2>
              <p data-excerpt className="mt-4 md:mt-5 text-offWhite/80">
                {description}
              </p>
            </div>

            {/* Research Grid */}
            <div className="lg:max-w-[677px] w-full grid sm:grid-cols-2 gap-6" data-sttr-wrapper>
              {researchItems.map((item) => (
                <ResearchCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  logo={item.logo}
                  link={item.link}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

ResearchSection.displayName = 'ResearchSection';

export default ResearchSection;
