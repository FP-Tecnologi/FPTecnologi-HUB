'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@riteflow/components/ui/button';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface HomeBannerOneProps {
  badgeText?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  /** Segundo botón opcional (no está en el original -- home-v1/home-v2
   *  verbatim siguen con uno solo porque no lo pasan). */
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  buttonIcon?: React.ReactNode;
  secondaryButtonIcon?: React.ReactNode;
  backgroundImage?: string;
  dashboardImage?: string;
  dashboardImageAlt?: string;
}

const HomeBannerOne: React.FC<HomeBannerOneProps> = ({
  badgeText = 'AI-Powered Productivity',
  title = 'Smarter Workflows Start with',
  titleHighlight = 'RiteFlow',
  description = 'Unlock the power of AI to automate tasks, boost creativity, and streamline your work—no code needed. Designed for every team.',
  buttonText = 'Start for Free',
  buttonLink = '#',
  secondaryButtonText,
  secondaryButtonLink = '#',
  buttonIcon,
  secondaryButtonIcon,
  backgroundImage = '/images/home/banner-bg.webp',
  dashboardImage = '/images/home/banner-dashboard.png',
  dashboardImageAlt = 'RiteFlow dashboard preview',
}) => {
  const heroSectionRef = useRef<HTMLElement>(null);
  const isInitializedRef = useRef(false);

  // Set initial hidden state immediately on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !heroSectionRef.current) return;

    const homeV1Hero = heroSectionRef.current;
    const bgShape = homeV1Hero.querySelector('[data-bg-shape]');
    const subtitle = homeV1Hero.querySelector('[data-subtitle]');
    const titleEl = homeV1Hero.querySelector('[data-title]');
    const excerpt = homeV1Hero.querySelector('[data-excerpt]');
    const button = homeV1Hero.querySelector('[data-button]');
    const thumbnail = homeV1Hero.querySelector('[data-thumbnail]');
    const header = document.querySelector('.header-wrapper');

    // Set initial hidden state immediately
    if (subtitle) {
      gsap.set(subtitle, { opacity: 0, y: 50 });
    }
    if (titleEl) {
      gsap.set(titleEl, { opacity: 0, y: 50 });
    }
    if (excerpt) {
      gsap.set(excerpt, { opacity: 0, y: 50 });
    }
    if (bgShape) {
      gsap.set(bgShape, { opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom left' });
    }
    if (button) {
      gsap.set(button, { opacity: 0, y: 50 });
    }
    if (thumbnail) {
      gsap.set(thumbnail, { opacity: 0, y: 50 });
    }
    if (header) {
      gsap.set(header, { y: -100, opacity: 0, filter: 'blur(16px)' });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !heroSectionRef.current) return;

    // Capture ref value at the start of the effect
    const heroSectionElement = heroSectionRef.current;

    // Wait for preloader to finish before starting animation
    const waitForPreloader = () => {
      return new Promise<void>((resolve) => {
        // Check if preloader is already done
        if (!document.documentElement.classList.contains('preloader-active')) {
          // Add a small delay to ensure DOM is ready
          setTimeout(resolve, 100);
          return;
        }

        // Watch for preloader-active class removal
        const observer = new MutationObserver(() => {
          if (!document.documentElement.classList.contains('preloader-active')) {
            observer.disconnect();
            // Add a small delay after preloader finishes
            setTimeout(resolve, 300);
          }
        });

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
        });

        // Fallback timeout (in case preloader doesn't fire)
        setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 5000);
      });
    };

    let scrollTrigger: ScrollTrigger | null = null;
    let tl: gsap.core.Timeline | null = null;

    const initAnimation = async () => {
      // Prevent duplicate initialization
      if (isInitializedRef.current) return;

      // Wait for preloader to finish
      await waitForPreloader();

      if (!heroSectionRef.current) return;

      const homeV1Hero = heroSectionRef.current;

      // Kill any existing ScrollTriggers for this element to prevent duplicates
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === homeV1Hero) {
          st.kill();
        }
      });
      const header = document.querySelector('.header-wrapper');
      const bgShape = homeV1Hero.querySelector('[data-bg-shape]');
      const subtitle = homeV1Hero.querySelector('[data-subtitle]');
      const titleEl = homeV1Hero.querySelector('[data-title]');
      const excerpt = homeV1Hero.querySelector('[data-excerpt]');
      const button = homeV1Hero.querySelector('[data-button]');
      const thumbnail = homeV1Hero.querySelector('[data-thumbnail]');

      // Shared animation properties
      const sharedFrom = {
        opacity: 0,
        y: 50,
        filter: "blur(16px)" 
      };

      const sharedTo = {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        filter: "blur(0px)"
      };

      // Set all elements to initial hidden state (opacity 0) before animation
      if (subtitle) {
        gsap.set(subtitle, { opacity: 0, y: 50 });
      }
      if (titleEl) {
        gsap.set(titleEl, { opacity: 0, y: 50 });
      }
      if (excerpt) {
        gsap.set(excerpt, { opacity: 0, y: 50 });
      }
      if (bgShape) {
        gsap.set(bgShape, { opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom left' });
      }
      if (button) {
        gsap.set(button, { opacity: 0, y: 50 });
      }
      if (thumbnail) {
        gsap.set(thumbnail, { opacity: 0, y: 50 });
      }
      if (header) {
        gsap.set(header, { y: -100, opacity: 0, filter: 'blur(16px)' });
      }

      // Create timeline for scroll animation
      tl = gsap.timeline({ paused: true });

      // Subtitle starts at 0 with 0.4 delay (original syntax)
      if (subtitle) {
        tl.fromTo(
          subtitle,
          sharedFrom,
          { ...sharedTo, delay: 0.4 },
          0
        )
      }

      // Title starts 0.6 seconds before subtitle ends
      if (titleEl) {
        tl.fromTo(titleEl, sharedFrom, { ...sharedTo }, '-=0.6')
      }

      // Excerpt starts 0.6 seconds before previous animation ends
      if (excerpt) {
        tl.fromTo(excerpt, sharedFrom, { ...sharedTo }, '-=0.6')
      }

      // Background shape with custom animation
      if (bgShape) {
        tl.fromTo(
          bgShape,
          {
            ...sharedFrom,
            scale: 0.8,
            transformOrigin: 'bottom left',
            y: 100,
          },
          {
            ...sharedTo,
            scale: 1,
            duration: 0.8,
            y: 0,
          },
          '-=0.6'
        )
      }

      // Button animation
      if (button) {
        tl.fromTo(button, sharedFrom, { ...sharedTo }, '-=0.6')
      }

      // Thumbnail animation
      if (thumbnail) {
        tl.fromTo(thumbnail, sharedFrom, { ...sharedTo }, '-=0.6')
      }

      // Header animation
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

      // ScrollTrigger attached separately to timeline
      scrollTrigger = ScrollTrigger.create({
        trigger: homeV1Hero,
        start: 'top 80%',
        end: 'top 40%',
        animation: tl,
        toggleActions: 'play none none none',
        invalidateOnRefresh: true,
        // markers: true, // Uncomment for debugging
      });

      isInitializedRef.current = true;

      // In case layout shifts (fonts/images load), refresh triggers
      ScrollTrigger.refresh();

      // El hero está arriba del todo, así que su "top 80%" ya pasó apenas
      // se crea el ScrollTrigger (scroll 0) -- en la práctica a veces no
      // dispara el play a tiempo y el contenido queda en opacity:0 para
      // siempre (bug real del template, no de este fork; reproducible en
      // /preview/riteflow-home-v1 tal cual vino). Red de seguridad: si a los
      // 1200ms el timeline no arrancó, se lo salta al final.
      window.setTimeout(() => {
        if (tl && tl.progress() === 0) {
          tl.progress(1);
        }
      }, 1200);
    };

    initAnimation();

    // Cleanup on unmount
    return () => {
      // Kill ScrollTrigger
      if (scrollTrigger) {
        scrollTrigger.kill();
      }
      
      // Kill timeline
      if (tl) {
        tl.kill();
      }
      
      // Also kill any ScrollTriggers that might be attached to the hero section
      if (heroSectionElement) {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === heroSectionElement) {
            st.kill();
          }
        });
      }
      
      isInitializedRef.current = false;
    };
  }, []);

  return (
    <section 
      ref={heroSectionRef}
      className="section-bottom-border relative z-1 overflow-hidden" 
      data-hero-section
      aria-label="Hero banner section"
    >
      {/* Background Image */}
      <div className="absolute w-full h-full top-0 left-0 z-[-1]">
        <div className="relative w-full h-full">
          <Image
            src={backgroundImage}
            alt="banner-circles-shape"
            fill
            className="object-cover"
            priority
            quality={90}
            data-bg-shape
            data-lag="0.2"
            data-speed="0.6"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="container">
        <div className="border-container pt-14 sm:pt-[72px] relative z-1">
          {/* Hero Content */}
          <div className="max-w-[500px] lg:max-w-[670px] mx-auto text-center">
            <span 
              className="badge-button" 
              data-subtitle
            >
              {badgeText}
            </span>
            
            <h1 
              className="font-semibold !leading-[1.2] gradient-text mt-5" 
              data-title
            >
              {title}{' '}
              <span className="font-instrument italic font-medium">
                {titleHighlight}
              </span>
            </h1>
            
            <p 
              className="mt-2 sm:mt-5 text-base sm:text-lg md:text-xl font-medium tracking-[0.2px] text-offWhite/80" 
              data-excerpt
            >
              {description}
            </p>
            
            <div className="mt-5 sm:mt-8 lg:mt-10 flex flex-wrap items-center justify-center gap-3" data-button >
              <Button
                href={buttonLink}
                variant={secondaryButtonText ? 'primary' : 'secondary'}
                size="md"
              >
                <span className="inline-flex items-center gap-2">{buttonIcon}{buttonText}</span>
              </Button>
              {secondaryButtonText && (
                <Button
                  href={secondaryButtonLink}
                  variant="secondary"
                  size="md"
                >
                  <span className="inline-flex items-center gap-2">{secondaryButtonIcon}{secondaryButtonText}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Dashboard Thumbnail */}
          <div 
            className="home-banner-dashboard mt-10 lg:mt-11.5 rounded-t-[20px] overflow-hidden p-1 sm:p-2.5 !pb-0 border border-tertiary/20 border-b-0 bg-linear-to-b from-tertiary/20 to-primary/20 glowing-border aspect-[16/6.8] " 
            data-thumbnail
          >
            <Image
              className="rounded-t-[20px] w-full h-full object-cover"
              src={dashboardImage}
              alt={dashboardImageAlt}
              width={1200}
              height={600}
              priority
              quality={90}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

HomeBannerOne.displayName = 'HomeBannerOne';

export default HomeBannerOne;
