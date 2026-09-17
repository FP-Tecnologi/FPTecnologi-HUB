'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import { demoBannerStats, demoSliderItems } from '@riteflow/data/demoData';
import { useCounterAnimation } from '@riteflow/hooks/useCounterAnimation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'swiper/css';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * DemoBanner – Template demo hero section.
 * Matches Riteflow HTML demo: stats, CTAs, Swiper marquee slider (Autoplay + FreeMode).
 */

function CounterStat({ stat }: { stat: typeof demoBannerStats[0] }) {
  const { count, ref } = useCounterAnimation(
    stat.isCounter && stat.target != null ? stat.target : null,
    2000
  );

  return (
    <div className="relative z-1 p-[1px] w-[calc(100%/2-12px)] sm:w-auto rounded-20 overflow-hidden flex items-center justify-center sttr-card">
      <Image
        className="rotate-animation absolute w-[200%] h-[200%] z-[-1]"
        src="/images/demo/couter-shape.png"
        alt=""
        width={200}
        height={200}
        aria-hidden
      />
      <div className="p-5 bg-linear-to-b rounded-20 from-[#27295A] to-[#191A4C] flex flex-col gap-2 border border-lineColor w-full">
        <h3 className="text-3xl md:text-[32px] lg:text-[40px] font-semibold">
          {stat.isCounter && stat.target != null ? (
            <>
              <span ref={ref} className="counter" data-target={stat.target}>
                {count}
              </span>
              <span className="text-tertiary">+</span>
            </>
          ) : (
            stat.value
          )}
        </h3>
        <p className="text-base sm:text-lg lg:text-xl text-white/80 tracking-[0.2px]">{stat.label}</p>
      </div>
    </div>
  );
}

export default function DemoBanner() {
  const demoBannerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !demoBannerRef.current) return;

    // Capture ref value at the start of the effect
    const demoBannerElement = demoBannerRef.current;

    // Shared animation properties
    const sharedFrom = { y: 100, opacity: 0, filter: 'blur(16px)' };
    const sharedTo = {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      ease: 'power3.out',
      duration: 0.6,
    };

    // Set initial hidden state immediately to prevent content flash
    const setInitialStates = () => {
      if (!demoBannerRef.current) return;

      const demoHero = demoBannerRef.current;
      const title = demoHero.querySelector('h1');
      const excerpt = demoHero.querySelector('p');
      const sttrCard = demoHero.querySelectorAll('.sttr-card');
      const marquee = demoHero.querySelector('[data-slider-animi]');
      const header = document.querySelector('.header-wrapper');

      if (title) {
        gsap.set(title, sharedFrom);
      }
      if (excerpt) {
        gsap.set(excerpt, sharedFrom);
      }
      if (sttrCard && sttrCard.length > 0) {
        sttrCard.forEach((card) => {
          gsap.set(card, sharedFrom);
        });
      }
      if (header) {
        gsap.set(header, { y: -100, opacity: 0, filter: 'blur(16px)' });
      }
      if (marquee) {
        gsap.set(marquee, { transformOrigin: 'top center', opacity: 0, filter: 'blur(16px)' });
      }
    };

    // Set initial states immediately
    setInitialStates();

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
      // Wait for preloader to finish
      await waitForPreloader();

      if (!demoBannerRef.current) return;

      const demoHero = demoBannerRef.current;
      const header = document.querySelector('.header-wrapper');
      const title = demoHero.querySelector('h1');
      const excerpt = demoHero.querySelector('p');
      const sttrCard = demoHero.querySelectorAll('.sttr-card');
      const marquee = demoHero.querySelector('[data-slider-animi]');

      // Kill any existing ScrollTriggers for this element to prevent duplicates
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === demoHero) {
          st.kill();
        }
      });

      // Create timeline
      tl = gsap.timeline({ paused: true });

      // Animation sequence for smooth sequential flow:
      // Header (earliest) -> Title -> Excerpt -> Cards (stagger) -> Marquee (last)
      
      // 1. Header animates first (can start slightly before title)
      if (header) {
        tl.fromTo(
          header,
          { y: -100, opacity: 0, filter: 'blur(16px)' },
          { y: 0, opacity: 1, duration: 0.6, filter: 'blur(0px)', ease: 'power3.out' },
          0
        );
      }

      // 2. Title starts (can overlap slightly with header)
      if (title) {
        tl.fromTo(title, sharedFrom, { ...sharedTo }, '-=0.5');
      }

      // 3. Excerpt starts after title (sequential flow)
      if (excerpt) {
        tl.fromTo(excerpt, sharedFrom, { ...sharedTo }, '-=0.5');
      }

      // 4. Cards start after excerpt with stagger effect
      if (sttrCard && sttrCard.length > 0) {
        // Convert NodeList to Array for stagger
        const cardsArray = Array.from(sttrCard);
        tl.fromTo(
          cardsArray,
          sharedFrom,
          {
            ...sharedTo,
            stagger: 0.05,
          },
          '-=0.4'
        );
      }

      // 5. Marquee starts after cards finish (last element)
      if (marquee) {
        tl.fromTo(
          marquee,
          { y: 10, opacity: 0, filter: 'blur(10px)' },
          { y: 0, opacity: 1, duration: 1.2, filter: 'blur(0px)', ease: 'power3.out' },
          '-=0.3'
        );
      }

      // ScrollTrigger attached separately to timeline
      scrollTrigger = ScrollTrigger.create({
        trigger: demoHero,
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
      // Also kill any ScrollTriggers that might be attached to the demo banner
      if (demoBannerElement) {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === demoBannerElement) {
            st.kill();
          }
        });
      }
    };
  }, []);

  return (
    <section ref={demoBannerRef} className="overflow-hidden demo-banner">
      <div className="container">
        <div className="border-container pt-15 sm:pt-20 pb-10 md:pb-15">
          <div className="max-w-[700px] mx-auto text-center">
            <h1 className="font-semibold !leading-[1.2] gradient-text lg:tracking-[-0.8px] text-[40px] sm:text-5xl md:text-[52px] lg:text-[64px]">
              AI Productivity & Automation <span className="font-instrument italic font-medium">SaaS Template</span>
            </h1>
            <p className="mt-2 sm:mt-5 text-base sm:text-lg font-medium lg:tracking-[0.3px] text-offWhite/80">
              RiteFlow is a clean, conversion-focused SaaS Template with AI-powered style. Fast, modern, and built for founders, startups, and product teams.
            </p>
            <div className="flex items-center justify-center flex-wrap sm:grid sm:grid-cols-3 gap-3 sm:gap-5 mt-6 sm:mt-8 lg:mt-10">
              {demoBannerStats.map((stat, i) => (
                <CounterStat key={i} stat={stat} />
              ))}
            </div>
            <div className="mt-6 sm:mt-8 lg:mt-10 flex justify-center gap-3 sm:gap-4 flex-wrap">
              <div className="sttr-card">
                <Link
                  href="#home"
                  className="button-primary inline-flex items-center justify-center px-[22px] py-3 text-white font-medium text-sm leading-normal rounded-[10px] relative z-1 overflow-hidden text-center scroll-to-home"
                >
                  Explore Homepages
                </Link>
              </div>
              <div className="sttr-card">
                <Link
                  href="#inner"
                  className="button-secondary scroll-to-inner"
                >
                  Explore Innerpages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative pb-1" data-lag="0.05">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="container h-full w-full">
            <div className="border-container h-full w-full" />
          </div>
        </div>
        <div className="marquee-slider" data-slider-animi aria-label="Demo pages slider">
          <Swiper
            modules={[Autoplay, FreeMode]}
            className="demo-banner-swiper"
            slidesPerView="auto"
            spaceBetween={12}
            loop={true}
            freeMode={{ enabled: true, momentum: false }}
            speed={8000}
            allowTouchMove={true}
            grabCursor={true}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            breakpoints={{
              0: { spaceBetween: 12 },
              640: { spaceBetween: 20 },
              768: { spaceBetween: 28 },
            }}
          >
            {demoSliderItems.map((item, i) => (
              <SwiperSlide key={i} className="!w-[400px] sm:!w-1/2 flex-none">
                <Link
                  href={item.href}
                  className="demo-banner-slide flex-none rounded-2xl block"
                >
                  <Image
                    className="w-full rounded-2xl"
                    src={item.image}
                    alt={item.alt}
                    width={1200}
                    height={550}
                    sizes="(max-width: 640px) 400px, 960px"
                    quality={95}
                    priority={i < 4}
                  />
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="demo-slider-overlay" />
      </div>
    </section>
  );
}
