'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseNewsletterAnimationOptions {
  waitForPreloader?: boolean;
  wrapperDuration?: number;
  videoDuration?: number;
  contentDuration?: number;
  position?: string | number;
  start?: string;
  end?: string;
  containerSelector?: string;
}
export function useNewsletterAnimation(options: UseNewsletterAnimationOptions = {}) {
  const {
    waitForPreloader = true,
    wrapperDuration = 0.6,
    videoDuration = 0.8,
    contentDuration = 0.6,
    position = '-=0.6',
    start = 'top 80%',
    end = 'top 40%',
    containerSelector = '[data-newsletter-wrapper]',
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

      const newsletterWrappers = document.querySelectorAll<HTMLElement>(containerSelector);

      if (!newsletterWrappers.length) return;

      // Shared animation properties for title, excerpt, and button
      const sharedFrom = { y: 100, opacity: 0, filter: 'blur(16px)' };
      const sharedTo = {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        ease: 'power3.out',
        duration: contentDuration,
      };

      newsletterWrappers.forEach((sttrWrapper) => {
        // Kill any existing ScrollTriggers for this wrapper to prevent duplicates
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === sttrWrapper) {
            st.kill();
          }
        });

        const title = sttrWrapper.querySelector<HTMLElement>('[data-news-title]');
        const excerpt = sttrWrapper.querySelector<HTMLElement>('[data-news-excerpt]');
        const button = sttrWrapper.querySelector<HTMLElement>('[data-news-button]');
        const video = sttrWrapper.querySelector<HTMLVideoElement>('[data-news-video]');

        // Set initial hidden state
        gsap.set(sttrWrapper, { y: 100, opacity: 0, filter: 'blur(16px)' });

        if (video) {
          gsap.set(video, { x: 100, opacity: 0, filter: 'blur(16px)' });
        }
        if (title) {
          gsap.set(title, sharedFrom);
        }
        if (excerpt) {
          gsap.set(excerpt, sharedFrom);
        }
        if (button) {
          gsap.set(button, sharedFrom);
        }

        // Create timeline
        const tl = gsap.timeline({ paused: true });

        // Animate wrapper
        tl.fromTo(
          sttrWrapper,
          { y: 100, opacity: 0, filter: 'blur(16px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            ease: 'power3.out',
            duration: wrapperDuration,
          },
          0
        );

        // Animate video
        if (video) {
          tl.fromTo(
            video,
            { x: 100, opacity: 0, filter: 'blur(16px)' },
            {
              x: 0,
              opacity: 1,
              filter: 'blur(0px)',
              ease: 'power3.out',
              duration: videoDuration,
            },
            position
          );
        }

        // Animate title
        if (title) {
          tl.fromTo(title, sharedFrom, sharedTo, position);
        }

        // Animate excerpt
        if (excerpt) {
          tl.fromTo(excerpt, sharedFrom, sharedTo, position);
        }

        // Animate button
        if (button) {
          tl.fromTo(button, sharedFrom, sharedTo, position);
        }

        timelines.push(tl);

        // Create ScrollTrigger
        const scrollTrigger = ScrollTrigger.create({
          trigger: sttrWrapper,
          start: start,
          end: end,
          animation: tl,
          toggleActions: 'play none none none',
          invalidateOnRefresh: true,
          // markers: true, // Uncomment for debugging
        });

        scrollTriggers.push(scrollTrigger);
      });

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
  }, [
    waitForPreloader,
    wrapperDuration,
    videoDuration,
    contentDuration,
    position,
    start,
    end,
    containerSelector,
  ]);
}

