
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay } from 'swiper/modules';
import { useStaggerAnimation } from '@riteflow/hooks/useStaggerAnimation';
// Import Swiper styles
import 'swiper/css';

export interface ClientLogosOneProps {
  title?: string;
  logos?: Array<{ src: string; alt: string }>;
  speed?: number;
}

const ClientLogosOne: React.FC<ClientLogosOneProps> = ({
  title = 'Trusted by innovative teams',
  logos = [
    { src: '/images/client-logos/logo-01.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-02.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-03.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-04.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-05.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-06.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-07.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-08.svg', alt: 'client logo' },
  ],
  speed = 2000,
}) => {
  // Custom options - Hook must be called before any conditional returns
  useStaggerAnimation({
    stagger: 0.1,
    duration: 0.8,
    waitForPreloader: false,
    start: 'top 70%',
  });

  // Ref to store Swiper instance
  const swiperRef = useRef<SwiperType | null>(null);
  // State to track if component is mounted (fixes production hydration issues)
  const [isMounted, setIsMounted] = useState(false);
  // Key to force re-render on navigation
  const [swiperKey, setSwiperKey] = useState(0);

  // Ensure component is mounted on client-side
  useEffect(() => {
    setIsMounted(true);
    // Force re-render on mount to fix production issues
    setSwiperKey(prev => prev + 1);
  }, []);

  // Safety check: ensure logos exist
  if (!logos || logos.length === 0) {
    return null;
  }

  // Duplicate logos for seamless infinite loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  // Fix Swiper initialization issue on navigation (especially in production)
  useEffect(() => {
    if (!isMounted) return;

    const initializeSwiper = () => {
      if (swiperRef.current) {
        const swiper = swiperRef.current;
        try {
          // Force update and restart
          swiper.update();
          swiper.updateSize();
          
          // Restart autoplay
          if (swiper.autoplay) {
            swiper.autoplay.stop();
            swiper.autoplay.start();
          }
        } catch (error) {
          console.warn('Swiper initialization error:', error);
        }
      }
    };

    // Multiple attempts to ensure initialization in production
    const timer1 = setTimeout(initializeSwiper, 100);
    const timer2 = setTimeout(initializeSwiper, 300);
    const timer3 = setTimeout(initializeSwiper, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isMounted, logos]);
  return (
    <section 
      className="section-bottom-border relative z-10" 
      data-sttr-wrapper
      aria-label="Client logos section"
    >
      <div className="container data-sttr-card" data-sttr-card>
        <div className="border-container py-14 sm:py-16">
          <h2 className="text-xl leading-none font-normal font-dmSans text-offWhite/80 mb-8 text-center">
            {title}
          </h2>
          
          {/* Swiper Infinite Scrolling Carousel */}
          <div className="overflow-hidden relative">
          <div className="absolute w-[10%] h-full top-0 left-0 bg-linear-to-r from-secondary to-secondary/0 z-10"></div>
            {isMounted && (
              <Swiper
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                onInit={(swiper) => {
                  // Ensure proper initialization after swiper is fully initialized
                  setTimeout(() => {
                    try {
                      if (swiper) {
                        swiper.update();
                        swiper.updateSize();
                        if (swiper.autoplay) {
                          swiper.autoplay.start();
                        }
                      }
                    } catch (error) {
                      console.warn('Swiper init error:', error);
                    }
                  }, 150);
                }}
                onAfterInit={(swiper) => {
                  // Additional initialization after everything is ready
                  setTimeout(() => {
                    try {
                      if (swiper) {
                        swiper.update();
                        if (swiper.autoplay && !swiper.autoplay.running) {
                          swiper.autoplay.start();
                        }
                      }
                    } catch (error) {
                      console.warn('Swiper afterInit error:', error);
                    }
                  }, 200);
                }}
                modules={[Autoplay]}
                spaceBetween={20}
                breakpoints={{
                  0: {
                    spaceBetween: 25, // Mobile: 20px space
                  },
                  640: {
                    spaceBetween: 30, // Small devices: 30px space
                  },
                  768: {
                    spaceBetween: 40, // Tablets: 40px space
                  },
                  1024: {
                    spaceBetween: 50, // Desktop: 50px space
                  },
                }}
                slidesPerView="auto"
                centeredSlides={true}
                autoplay={{
                  delay: 1,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: false,
                }}
                speed={speed}
                loop={true}
                allowTouchMove={false}
                className="client-logos-swiper logo-auto-slider"
                key={`swiper-${swiperKey}-${logos.length}-${logos[0]?.src || 'default'}`}
              >

                {duplicatedLogos.map((logo, index) => (
                  <SwiperSlide key={`${logo.src}-${index}`} style={{ width: 'auto' }}>
                    <div className="flex items-center justify-center px-2 sm:px-4">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={120}
                        height={40}
                        loading="lazy"
                        className="h-auto w-auto max-w-[120px] opacity-80 hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
            <div className="absolute w-[10%] h-full top-0 right-0 bg-linear-to-r from-secondary/0 to-secondary z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

ClientLogosOne.displayName = 'ClientLogosOne';

export default ClientLogosOne;
