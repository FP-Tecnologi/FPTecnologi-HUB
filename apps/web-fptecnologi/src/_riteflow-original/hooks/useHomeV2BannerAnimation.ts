'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseHomeV2BannerAnimationOptions {
  /**
   * Whether to wait for preloader to finish before initializing
   * @default true
   */
  waitForPreloader?: boolean;
  /**
   * Animation duration in seconds for content elements
   * @default 0.8
   */
  duration?: number;
  /**
   * Timeline position offset for child elements
   * @default "-=0.6"
   */
  position?: string | number;
  /**
   * ScrollTrigger start position
   * @default "top 80%"
   */
  start?: string;
  /**
   * ScrollTrigger end position
   * @default "top 40%"
   */
  end?: string;
  /**
   * Container selector
   * @default '[data-container="homeV2-hero"]'
   */
  containerSelector?: string;
  /**
   * Header selector
   * @default '.header-wrapper'
   */
  headerSelector?: string;
  /**
   * Subtitle delay in seconds
   * @default 0.4
   */
  subtitleDelay?: number;
  /**
   * Stagger delay between list items
   * @default 0.05
   */
  listStagger?: number;
}

/**
 * useHomeV2BannerAnimation Hook
 * 
 * Custom hook for animating HomeV2 banner section with subtitle, title, excerpt,
 * buttons, feature list, thumbnail, video, and header.
 * 
 * @param {UseHomeV2BannerAnimationOptions} options - Animation configuration options
 * 
 * @example
 * // Basic usage
 * useHomeV2BannerAnimation();
 * 
 * @example
 * // With custom options
 * useHomeV2BannerAnimation({
 *   duration: 1,
 *   position: "-=0.5",
 *   subtitleDelay: 0.6
 * });
 */
export function useHomeV2BannerAnimation(options: UseHomeV2BannerAnimationOptions = {}) {
  const {
    waitForPreloader = true,
    duration = 0.8,
    position = '-=0.6',
    start = 'top 80%',
    end = 'top 40%',
    containerSelector = '[data-container="homeV2-hero"]',
    headerSelector = '.header-wrapper',
    subtitleDelay = 0.4,
    listStagger = 0.05,
  } = options;

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial opacity 0 immediately to prevent content flash
    const setInitialStates = () => {
      const h4HeroSection = document.querySelector<HTMLElement>(containerSelector);
      if (!h4HeroSection) return;

      const header = document.querySelector<HTMLElement>(headerSelector);
      const subTitle = h4HeroSection.querySelector<HTMLElement>('[data-subtitle]');
      const title = h4HeroSection.querySelector<HTMLElement>('[data-title]');
      const excerpt = h4HeroSection.querySelector<HTMLElement>('[data-excerpt]');
      const button = h4HeroSection.querySelector<HTMLElement>('[data-button]');
      const listItems = h4HeroSection.querySelectorAll<HTMLElement>('[data-list] li');
      const thumbnail = h4HeroSection.querySelector<HTMLElement>('[data-thumbnail]');
      const video = h4HeroSection.querySelector<HTMLVideoElement>('[data-video]');

      // Set opacity 0 immediately for all elements
      if (subTitle) gsap.set(subTitle, { opacity: 0 });
      if (title) gsap.set(title, { opacity: 0 });
      if (excerpt) gsap.set(excerpt, { opacity: 0 });
      if (button) gsap.set(button, { opacity: 0 });
      if (listItems.length) {
        listItems.forEach((listItem) => gsap.set(listItem, { opacity: 0 }));
      }
      if (video) gsap.set(video, { opacity: 0 });
      if (thumbnail) gsap.set(thumbnail, { opacity: 0 });
      if (header) gsap.set(header, { opacity: 0 });
    };

    // Set initial states immediately
    setInitialStates();

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
      // Prevent duplicate initialization
      if (isInitializedRef.current) return;
      
      await waitForPreloaderFinish();

      const h4HeroSection = document.querySelector<HTMLElement>(containerSelector);

      if (!h4HeroSection) return;

      // Kill any existing ScrollTriggers for this element to prevent duplicates
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === h4HeroSection) {
          st.kill();
        }
      });

      const header = document.querySelector<HTMLElement>(headerSelector);
      const subTitle = h4HeroSection.querySelector<HTMLElement>('[data-subtitle]');
      const title = h4HeroSection.querySelector<HTMLElement>('[data-title]');
      const excerpt = h4HeroSection.querySelector<HTMLElement>('[data-excerpt]');
      const button = h4HeroSection.querySelector<HTMLElement>('[data-button]');
      const listItems = h4HeroSection.querySelectorAll<HTMLElement>('[data-list] li');
      const thumbnail = h4HeroSection.querySelector<HTMLElement>('[data-thumbnail]');
      const video = h4HeroSection.querySelector<HTMLVideoElement>('[data-video]');

      const trailFrom = { x: -100, opacity: 0, filter: 'blur(16px)' };
      const trailTo = {
        x: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: duration,
        ease: 'back',
      };

      // Set initial hidden state
      if (subTitle) {
        gsap.set(subTitle, trailFrom);
      }
      if (title) {
        gsap.set(title, trailFrom);
      }
      if (excerpt) {
        gsap.set(excerpt, trailFrom);
      }
      if (button) {
        gsap.set(button, trailFrom);
      }
      if (listItems.length) {
        listItems.forEach((listItem) => {
          gsap.set(listItem, trailFrom);
        });
      }
      if (video) {
        gsap.set(video, {
          y: 100,
          opacity: 0,
          filter: 'blur(100px)',
          scale: 0.8,
          transformOrigin: 'bottom left',
        });
      }
      if (thumbnail) {
        gsap.set(thumbnail, { x: 100, opacity: 0, filter: 'blur(16px)' });
      }
      if (header) {
        gsap.set(header, { y: -100, opacity: 0, filter: 'blur(16px)' });
      }

      // Create timeline
      const tl = gsap.timeline({ paused: true });

      // Animate subtitle with delay
      if (subTitle) {
        tl.fromTo(
          subTitle,
          trailFrom,
          { ...trailTo, delay: subtitleDelay },
          0
        );
      }

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

      // Animate list items with stagger
      if (listItems.length) {
        listItems.forEach((listItem) => {
          tl.fromTo(
            listItem,
            trailFrom,
            { ...trailTo, stagger: listStagger },
            position
          );
        });
      }

      // Animate video
      if (video) {
        tl.fromTo(
          video,
          {
            y: 100,
            opacity: 0,
            filter: 'blur(100px)',
            scale: 0.8,
            transformOrigin: 'bottom left',
          },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            duration: duration,
            ease: 'power3.out',
          },
          '-=1'
        );
      }

      // Animate thumbnail
      if (thumbnail) {
        tl.fromTo(
          thumbnail,
          {
            x: 100,
            opacity: 0,
            filter: 'blur(16px)',
          },
          {
            x: 0,
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            duration: duration,
            ease: 'power3.out',
          },
          '-=0.4'
        );
      }

      // Animate header
      if (header) {
        tl.fromTo(
          header,
          { y: -100, opacity: 0, filter: 'blur(16px)' },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            filter: 'blur(0px)',
            ease: 'power3.out',
          },
          '-=0.8'
        );
      }

      timelines.push(tl);

      // Create ScrollTrigger
      const scrollTrigger = ScrollTrigger.create({
        trigger: h4HeroSection,
        start: start,
        end: end,
        animation: tl,
        toggleActions: 'play none none none',
        invalidateOnRefresh: true,
        // markers: true, // Uncomment for debugging
      });

      scrollTriggers.push(scrollTrigger);
      isInitializedRef.current = true;

      // Refresh ScrollTrigger in case of layout shifts (fonts/images load)
      ScrollTrigger.refresh();
    };

    initAnimation();

    // Cleanup on unmount
    return () => {
      // Kill all ScrollTriggers
      scrollTriggers.forEach((st) => {
        if (st) {
          st.kill();
        }
      });
      
      // Kill all timelines
      timelines.forEach((tl) => {
        if (tl) {
          tl.kill();
        }
      });
      
      // Also kill any ScrollTriggers that might be attached to the container
      const h4HeroSection = document.querySelector<HTMLElement>(containerSelector);
      if (h4HeroSection) {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === h4HeroSection) {
            st.kill();
          }
        });
      }
      
      scrollTriggers = [];
      timelines = [];
      isInitializedRef.current = false;
    };
  }, [
    waitForPreloader,
    duration,
    position,
    start,
    end,
    containerSelector,
    headerSelector,
    subtitleDelay,
    listStagger,
  ]);
}

