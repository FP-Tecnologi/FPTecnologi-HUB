'use client';

import { useEffect, useLayoutEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseStaggerAnimationOptions {
  waitForPreloader?: boolean;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  duration?: number;
  stagger?: number;
  position?: string | number;
  start?: string;
  end?: string;
  delay?: number;
}

export function useStaggerAnimation(options: UseStaggerAnimationOptions = {}) {
  const {
    waitForPreloader = true,
    from: customFrom = {},
    to: customTo = {},
    duration = 0.6,
    stagger = 0.1,
    position = 0,
    start = 'top 70%',
    end = 'top 40%',
    delay = 0,
  } = options;

  const from = useMemo(
    () => ({
      y: 100,
      opacity: 0,
      filter: 'blur(16px)',
      ...customFrom,
    }),
    [customFrom]
  );

  const to = useMemo(
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
      const sttrWrappers = document.querySelectorAll<HTMLElement>('[data-sttr-wrapper]');
      sttrWrappers.forEach((sttrWrapper) => {
        const sttrCards = sttrWrapper.querySelectorAll<HTMLElement>('[data-sttr-card]');
        sttrCards.forEach((sttrCard) => {
          gsap.set(sttrCard, from);
        });
      });
      return sttrWrappers.length > 0;
    };

    // Try immediately
    const found = setInitialState();

    // If not found, retry with requestAnimationFrame (for client-side navigation)
    if (!found) {
      requestAnimationFrame(() => {
        setInitialState();
      });
    }
  }, [from]);

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

      const sttrWrappers = document.querySelectorAll<HTMLElement>('[data-sttr-wrapper]');
      if (!sttrWrappers.length) return;

      sttrWrappers.forEach((sttrWrapper) => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === sttrWrapper) {
            st.kill();
          }
        });

        const sttrCards = sttrWrapper.querySelectorAll<HTMLElement>('[data-sttr-card]');
        if (!sttrCards.length) return;

        const tl = gsap.timeline({ paused: true, delay: delay });
        const cardsArray = Array.from(sttrCards);

        tl.fromTo(
          cardsArray,
          from,
          {
            ...to,
            stagger: stagger,
          },
          position
        );

        timelines.push(tl);

        const scrollTrigger = ScrollTrigger.create({
          trigger: sttrWrapper,
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
  }, [waitForPreloader, from, to, stagger, position, start, end, delay]);
}

