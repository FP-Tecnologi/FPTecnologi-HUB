'use client';

import { useEffect, useLayoutEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseSectionHeadingAnimationOptions {
  waitForPreloader?: boolean;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  duration?: number;
  position?: string | number;
  start?: string;
  end?: string;
  subtitleScaleFrom?: number;
  subtitleScaleTo?: number;
}

export function useSectionHeadingAnimation(options: UseSectionHeadingAnimationOptions = {}) {
  const {
    waitForPreloader = true,
    from: customFrom = {},
    to: customTo = {},
    duration = 0.6,
    position = '-=0.5',
    start = 'top 80%',
    end = 'top 40%',
    subtitleScaleFrom = 0.8,
    subtitleScaleTo = 1,
  } = options;

  const sharedFrom = useMemo(
    () => ({
      y: 100,
      opacity: 0,
      filter: 'blur(16px)',
      ...customFrom,
    }),
    [customFrom]
  );

  const sharedTo = useMemo(
    () => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      ease: 'power3.out',
      duration: duration,
      ...customTo,
    }),
    [duration, customTo]
  );

  // Use useLayoutEffect to set initial state synchronously before paint
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial state immediately to keep content invisible
    const setInitialState = () => {
      const demoHeading = document.querySelectorAll<HTMLElement>('[data-section-title]');
      demoHeading.forEach((section) => {
        const subtitle = section.querySelector<HTMLElement>('[data-subtitle]');
        const title = section.querySelector<HTMLElement>('[data-title]');
        const excerpt = section.querySelector<HTMLElement>('[data-excerpt]');

        if (subtitle) {
          gsap.set(subtitle, { ...sharedFrom, scale: subtitleScaleFrom });
        }
        if (title) {
          gsap.set(title, sharedFrom);
        }
        if (excerpt) {
          gsap.set(excerpt, sharedFrom);
        }
      });
      return demoHeading.length > 0;
    };

    // Try immediately
    const found = setInitialState();

    // If not found, retry with requestAnimationFrame (for client-side navigation)
    if (!found) {
      requestAnimationFrame(() => {
        setInitialState();
      });
    }
  }, [sharedFrom, subtitleScaleFrom]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const waitForPreloaderFinish = () => {
      if (!waitForPreloader) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        if (!document.documentElement.classList.contains('preloader-active')) {
          setTimeout(resolve, 100);
          return;
        }

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

      const demoHeading = document.querySelectorAll<HTMLElement>('[data-section-title]');

      if (!demoHeading.length) return;

      demoHeading.forEach((section) => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === section) {
            st.kill();
          }
        });

        const subtitle = section.querySelector<HTMLElement>('[data-subtitle]');
        const title = section.querySelector<HTMLElement>('[data-title]');
        const excerpt = section.querySelector<HTMLElement>('[data-excerpt]');

        const tl = gsap.timeline({ paused: true });

        if (subtitle) {
          tl.fromTo(
            subtitle,
            { ...sharedFrom, scale: subtitleScaleFrom },
            { ...sharedTo, scale: subtitleScaleTo },
            0
          );
        }

        if (title) {
          tl.fromTo(title, sharedFrom, { ...sharedTo }, position);
        }

        if (excerpt) {
          tl.fromTo(excerpt, sharedFrom, { ...sharedTo }, position);
        }

        timelines.push(tl);

        const scrollTrigger = ScrollTrigger.create({
          trigger: section,
          start: start,
          end: end,
          animation: tl,
          toggleActions: 'play none none none',
          invalidateOnRefresh: true,
        });

        scrollTriggers.push(scrollTrigger);
      });

      ScrollTrigger.refresh();
    };

    initAnimation();

    return () => {
      scrollTriggers.forEach((st) => st.kill());
      timelines.forEach((tl) => tl.kill());
      scrollTriggers = [];
      timelines = [];
    };
  }, [
    waitForPreloader,
    sharedFrom,
    sharedTo,
    position,
    start,
    end,
    subtitleScaleFrom,
    subtitleScaleTo,
  ]);
}
