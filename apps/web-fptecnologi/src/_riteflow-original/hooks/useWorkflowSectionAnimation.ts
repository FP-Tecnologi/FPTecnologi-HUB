'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseWorkflowSectionAnimationOptions {
  waitForPreloader?: boolean;
  duration?: number;
  position?: string | number;
  start?: string;
  end?: string;
  containerSelector?: string;
}

export function useWorkflowSectionAnimation(options: UseWorkflowSectionAnimationOptions = {}) {
  const {
    waitForPreloader = true,
    duration = 0.8,
    position = '-=0.6',
    start = 'top 80%',
    end = 'top 40%',
    containerSelector = '[data-container="apps-section"]',
  } = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Wait for preloader to finish
    const waitForPreloaderFinish = () => {
      if (!waitForPreloader) {
        return Promise.resolve();
      }

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

    let scrollTriggers: ScrollTrigger[] = [];
    let timelines: gsap.core.Timeline[] = [];

    const initAnimation = async () => {
      await waitForPreloaderFinish();

      const appSection = document.querySelector<HTMLElement>(containerSelector);

      if (!appSection) return;

      // Kill any existing ScrollTriggers for this element to prevent duplicates
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === appSection) {
          st.kill();
        }
      });

      const title = appSection.querySelector<HTMLElement>('[data-title]');
      const excerpt = appSection.querySelector<HTMLElement>('[data-excerpt]');
      const button = appSection.querySelector<HTMLElement>('[data-button]');
      const thumbnail = appSection.querySelector<HTMLElement>('[data-thumbnail]');
      const bgShape = appSection.querySelector<HTMLElement>('[data-bg-shape]');
      const glowShape = appSection.querySelector<HTMLElement>('[data-glow-shape]');

      const trailFrom = { x: -100, opacity: 0, filter: 'blur(16px)' };
      const trailTo = {
        x: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: duration,
        ease: 'back',
      };

      // Set initial hidden state
      gsap.set(appSection, { y: 100, opacity: 0, filter: 'blur(16px)' });

      if (title) {
        gsap.set(title, trailFrom);
      }
      if (excerpt) {
        gsap.set(excerpt, trailFrom);
      }
      if (button) {
        gsap.set(button, trailFrom);
      }
      if (thumbnail) {
        gsap.set(thumbnail, {
          x: 100,
          opacity: 0,
          filter: 'blur(16px)',
          scale: 0.7,
          transformOrigin: 'top right',
        });
      }
      if (bgShape) {
        gsap.set(bgShape, { y: 100, opacity: 0, filter: 'blur(16px)' });
      }
      if (glowShape) {
        gsap.set(glowShape, { x: 100, opacity: 0, filter: 'blur(16px)' });
      }

      // Create timeline
      const tl = gsap.timeline({ paused: true });

      // Animate container
      tl.fromTo(
        appSection,
        {
          y: 100,
          opacity: 0,
          filter: 'blur(16px)',
        },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: duration,
          ease: 'back',
        },
        0
      );

      // Animate title
      if (title) {
        tl.fromTo(title, trailFrom, trailTo, position);
      }

      // Animate excerpt
      if (excerpt) {
        tl.fromTo(excerpt, trailFrom, trailTo, position);
      }

      // Animate button
      if (button) {
        tl.fromTo(button, trailFrom, trailTo, position);
      }

      // Animate thumbnail
      if (thumbnail) {
        tl.fromTo(
          thumbnail,
          {
            x: 100,
            opacity: 0,
            filter: 'blur(16px)',
            scale: 0.7,
            transformOrigin: 'top right',
          },
          {
            x: 0,
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            duration: duration,
            ease: 'back',
          },
          position
        );
      }

      // Animate background shape
      if (bgShape) {
        tl.fromTo(
          bgShape,
          {
            y: 100,
            opacity: 0,
            filter: 'blur(16px)',
          },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: duration,
            ease: 'power3.out',
          },
          position
        );
      }

      // Animate glow shape
      if (glowShape) {
        tl.fromTo(
          glowShape,
          {
            x: 100,
            opacity: 0,
            filter: 'blur(16px)',
          },
          {
            x: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: duration,
            ease: 'power3.out',
          },
          position
        );
      }

      timelines.push(tl);

      // Create ScrollTrigger
      const scrollTrigger = ScrollTrigger.create({
        trigger: appSection,
        start: start,
        end: end,
        animation: tl,
        toggleActions: 'play none none none',
        invalidateOnRefresh: true,
        // markers: true, // Uncomment for debugging
      });

      scrollTriggers.push(scrollTrigger);

      // Refresh ScrollTrigger in case of layout shifts (fonts/images load)
      ScrollTrigger.refresh();
    };

    initAnimation();

    // Cleanup on unmount
    return () => {
      scrollTriggers.forEach((st) => st.kill());
      timelines.forEach((tl) => tl.kill());
      scrollTriggers = [];
      timelines = [];
    };
  }, [waitForPreloader, duration, position, start, end, containerSelector]);
}

