'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@riteflow/components/ui/button';
import AboutStatCard from './AboutStatCard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface AboutSectionProps {
  variant?: 'one' | 'two';
  title?: string;
  description?: string;
  videoSrc?: string;
  stats?: Array<{ value: number; suffix?: string; label: string }>;
  listItems?: string[];
  buttonText?: string;
  buttonLink?: string;
}

/**
 * AboutSection Component
 * 
 * About section with video demonstration and two variants:
 * - Variant One: Displays a list with checkmarks
 * - Variant Two: Displays statistics cards with animated counters
 * 
 * Features:
 * - Responsive video player with autoplay
 * - Two display variants (list or stats)
 * - Statistics counter animation (variant two)
 * - Call-to-action button
 * 
 * All content is customizable via props with sensible defaults.
 * 
 * @param {'one' | 'two'} variant - Display variant: 'one' for list, 'two' for stats (default: 'two')
 * @param {string} title - Section heading
 * @param {string} description - Section description text
 * @param {string} videoSrc - Path to video file
 * @param {Array} stats - Array of stat objects with value, suffix, and label (variant two)
 * @param {Array<string>} listItems - Array of list item strings (variant one)
 * @param {string} buttonText - CTA button text
 * @param {string} buttonLink - CTA button link
 * 
 * @example
 * <AboutSection variant="one" listItems={['From $0 to $500,000 in revenue.', '47% growth in new customers.']} />
 * <AboutSection variant="two" stats={[...]} />
 */
const AboutSection: React.FC<AboutSectionProps> = ({
  variant = 'two',
  title = 'See RiteFlow in Action: Watch Our Tools Shine',
  description = "Play the video to see RiteFlow's flagship AI suite turn ideas into results. In under a minute, you'll watch workflows automated, insights revealed, and content created in real time—no coding, no complexity. Imagine what your team achieves when intelligent tools handle the heavy lifting.",
  videoSrc = '/images/home/about.mp4',
  stats = [
    { value: 700, suffix: '+', label: '5-Star Reviews' },
    { value: 10000, suffix: 'K+', label: 'Users Worldwide' },
    { value: 452000, suffix: 'K+', label: 'Tasks Completed' },
  ],
  listItems = [
    'From $0 to $500,000 in revenue.',
    '47% growth in new customers.',
  ],
  buttonText = 'Start Your Free Trial',
  buttonLink = '#',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Set initial hidden state immediately on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const container = containerRef.current;
    const thumbnail = container.querySelector('[data-video]');
    const title = container.querySelector('[data-title]');
    const excerpt = container.querySelector('[data-excerpt]');
    const topLine = container.querySelector('[data-line-top]');
    const list = container.querySelector('[data-list]');
    const lists = container.querySelectorAll('[data-lists]');
    const bottomLine = container.querySelector('[data-line-bottom]');
    const button = container.querySelector('[data-button]');

    const trailFrom = { y: 100, opacity: 0, filter: 'blur(16px)' };

    // Set initial hidden state
    if (title) {
      gsap.set(title, trailFrom);
    }
    if (thumbnail) {
      gsap.set(thumbnail, { ...trailFrom, scale: 0.8, transformOrigin: 'bottom left', y: 100 });
    }
    if (excerpt) {
      gsap.set(excerpt, trailFrom);
    }
    if (topLine) {
      gsap.set(topLine, trailFrom);
    }
    if (list) {
      gsap.set(list, trailFrom);
    }
    if (lists.length) {
      lists.forEach((listItem) => {
        gsap.set(listItem, trailFrom);
      });
    }
    if (bottomLine) {
      gsap.set(bottomLine, trailFrom);
    }
    if (button) {
      gsap.set(button, trailFrom);
    }
  }, [variant]);

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

      const container = containerRef.current;
      const thumbnail = container.querySelector('[data-video]');
      const title = container.querySelector('[data-title]');
      const excerpt = container.querySelector('[data-excerpt]');
      const topLine = container.querySelector('[data-line-top]');
      const list = container.querySelector('[data-list]');
      const lists = container.querySelectorAll('[data-lists]');
      const bottomLine = container.querySelector('[data-line-bottom]');
      const button = container.querySelector('[data-button]');

      const trailFrom = { y: 100, opacity: 0, filter: 'blur(16px)' };
      const trailTo = { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'back' };

      tl = gsap.timeline({ paused: true });

      if (!tl) return;

      if (title) {
        tl.fromTo(
          title,
          { ...trailFrom },
          { ...trailTo },
          0
        );
      }

      if (thumbnail) {
        tl.fromTo(
          thumbnail,
          {
            ...trailFrom,
            scale: 0.8,
            transformOrigin: 'bottom left',
            y: 100,
          },
          {
            ...trailTo,
            scale: 1,
            duration: 0.8,
            y: 0,
          },
          '-=0.6'
        );
      }

      if (excerpt) {
        tl.fromTo(excerpt, { ...trailFrom }, { ...trailTo }, '-=0.6');
      }

      if (topLine) {
        tl.fromTo(topLine, { ...trailFrom }, { ...trailTo }, '-=0.6');
      }

      // Variant two: Use [data-lists] with stagger
      if (variant === 'two' && lists.length) {
        lists.forEach((listItem) => {
          tl!.fromTo(
            listItem,
            { ...trailFrom },
            { ...trailTo, stagger: 0.05 },
            '-=0.6'
          );
        });
      }

      // Variant one: Use [data-list]
      if (variant === 'one' && list) {
        tl.fromTo(list, { ...trailFrom }, { ...trailTo }, '-=0.6');
      }

      if (bottomLine) {
        tl.fromTo(bottomLine, { ...trailFrom }, { ...trailTo }, '-=0.6');
      }

      if (button) {
        tl.fromTo(button, { ...trailFrom }, { ...trailTo }, '-=0.6');
      }

      // ScrollTrigger attached separately to timeline
      scrollTrigger = ScrollTrigger.create({
        trigger: container,
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
  }, [variant]);

  return (
    <section className="section-bottom-border relative z-10">
      <div className="container">
        <div className="border-container section-spacing-lg">
          <div
            ref={containerRef}
            className="flex justify-between gap-8 sm:gap-10 flex-col md:flex-row"
            data-container={variant === 'two' ? 'review-section' : 'trail-section'}
          >
            {/* Video */}
            <div className="md:max-w-[560px] w-full relative rounded-20 overflow-hidden" data-video>
              <video
                data-lag="0.2"
                className="md:absolute top-0 left-0 w-full h-full object-cover rounded-20 min-h-[300px]"
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                aria-label="RiteFlow AI tools demonstration video"
              ></video>
            </div>

            {/* Content */}
            <div className="md:max-w-[575px] w-full md:py-5">
              <h2
                data-title
                className="gradient-text text-3xl sm:text-4xl lg:text-5xl xl:text-[51px] font-semibold -tracking-[0.4px] !leading-[1.2]"
              >
                {title}
              </h2>
              <p data-excerpt className="mt-4 md:mt-5 text-offWhite/80 tracking-[0.1px]">
                {description}
              </p>

              <Image
                data-line-top
                className="my-5 lg:my-9 w-full"
                src="/images/gradient-border.svg"
                alt=""
                width={560}
                height={2}
                aria-hidden="true"
              />

              {/* Variant One: List with checkmarks */}
              {variant === 'one' && (
                <ul data-list className="font-medium text-offWhite/80 space-y-4">
                  {listItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Image
                        src="/images/home/list-check.svg"
                        alt="check"
                        width={20}
                        height={20}
                        className="flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Variant Two: Stats Grid */}
              {variant === 'two' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                  {stats.map((stat, index) => (
                    <div key={index} data-lists>
                      <AboutStatCard
                        value={stat.value}
                        suffix={stat.suffix}
                        label={stat.label}
                        delay={index * 100} // Stagger animation for each card
                      />
                    </div>
                  ))}
                </div>
              )}

              <Image
                data-line-bottom
                className="my-5 lg:my-9 w-full"
                src="/images/gradient-border.svg"
                alt=""
                width={560}
                height={2}
                aria-hidden="true"
              />

              {/* Button */}
              <div className="" data-button>
                <Button href={buttonLink} variant="primary" size="md">
                  {buttonText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

AboutSection.displayName = 'AboutSection';

export default AboutSection;
