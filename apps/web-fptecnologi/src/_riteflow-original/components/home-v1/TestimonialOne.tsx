'use client';

import React from 'react';
import Image from 'next/image';
import { useSectionHeadingAnimation } from '@riteflow/hooks/useSectionHeadingAnimation';

export interface Testimonial {
  /**
   * Author name
   */
  name: string;
  /**
   * Author role/position
   */
  role: string;
  /**
   * Author profile image path
   */
  image: string;
  /**
   * Alt text for author image
   */
  imageAlt?: string;
  /**
   * Testimonial text
   */
  text: string;
}

export interface TestimonialOneProps {
  /**
   * Badge text displayed above the title
   */
  badgeText?: string;
  /**
   * Section title
   */
  title?: string;
  /**
   * Section description
   */
  description?: string;
  /**
   * Array of testimonials for the first column
   */
  columnOneTestimonials?: Testimonial[];
  /**
   * Array of testimonials for the second column
   */
  columnTwoTestimonials?: Testimonial[];
  /**
   * Array of testimonials for the third column
   */
  columnThreeTestimonials?: Testimonial[];
}

/**
 * TestimonialOne Component
 * 
 * Displays a testimonial section with auto-scrolling cards in a grid layout.
 * Features:
 * - Three-column responsive grid (1 on mobile, 2 on tablet, 3 on desktop)
 * - Auto-scroll animation for continuous testimonial display
 * - Fade overlay for smooth visual effect
 * - Section title with badge and description
 * 
 * All content is customizable via props with sensible defaults.
 * This is a client component due to scroll animations.
 * 
 * @param {string} badgeText - Badge text above title (default: 'Testimonial')
 * @param {string} title - Section title (default: 'Trusted by professionals, loved by every teams.')
 * @param {string} description - Section description
 * @param {Array<Testimonial>} columnOneTestimonials - Testimonials for first column (scrolls down)
 * @param {Array<Testimonial>} columnTwoTestimonials - Testimonials for second column (scrolls up, hidden on mobile)
 * @param {Array<Testimonial>} columnThreeTestimonials - Testimonials for third column (scrolls down, hidden on mobile/tablet)
 * 
 * @example
 * <TestimonialOne />
 */
const TestimonialOne: React.FC<TestimonialOneProps> = ({
  badgeText = 'Testimonial',
  title = 'Trusted by professionals, loved by every teams.',
  description = 'From startups to global enterprises, our users share how Riteflow\'s AI tools help them work smarter, faster, and more efficiently.',
  columnOneTestimonials = [
    {
      name: 'Jenifer Lawrence',
      role: 'CEO & Engineer',
      image: '/images/home/testimonial/testimonial-01.jpg',
      imageAlt: 'Jenifer Lawrence',
      text: 'Riteflow has completely transformed the way we manage projects. The automation features ',
    },
    {
      name: 'David Thompson',
      role: 'Marketing Director',
      image: '/images/home/testimonial/testimonial-02.jpg',
      imageAlt: 'David Thompson',
      text: 'With real-time insights, we make faster, better decisions. Riteflow is now a core part of our daily workflow.',
    },
    {
      name: 'Sophia Martinez',
      role: 'Product Manager',
      image: '/images/home/testimonial/testimonial-03.jpg',
      imageAlt: 'Sophia Martinez',
      text: 'Real-time analytics help us spot issues before they become problems. Riteflow keeps us proactive.',
    },
  ],
  columnTwoTestimonials = [
    {
      name: 'Emily Carter',
      role: 'Creative Director',
      image: '/images/home/testimonial/testimonial-04.jpg',
      imageAlt: 'Emily Carter',
      text: 'Integrations are seamless. Now all our design, feedback, and task tracking live in one place.',
    },
    {
      name: 'Daniel Kim',
      role: 'CTO',
      image: '/images/home/testimonial/testimonial-05.jpg',
      imageAlt: 'Daniel Kim',
      text: 'The AI-powered recommendations have improved our workflow efficiency by over 40%.',
    },
    {
      name: 'Olivia Green',
      role: 'Project Manager',
      image: '/images/home/testimonial/testimonial-06.jpg',
      imageAlt: 'Olivia Green',
      text: 'Finally, a platform that grows with our needs. We\'ve scaled without losing control of our processes.',
    },
  ],
  columnThreeTestimonials = [
    {
      name: 'Chloe Davis',
      role: 'HR Coordinator',
      image: '/images/home/testimonial/testimonial-07.jpg',
      imageAlt: 'Chloe Davis',
      text: 'Integrations are seamless. Now all our design, feedback, and task tracking live in one place.',
    },
    {
      name: 'Ryan Mitchell',
      role: 'Data Analyst',
      image: '/images/home/testimonial/testimonial-08.jpg',
      imageAlt: 'Ryan Mitchell',
      text: 'The dashboards are so clear and customizable—it\'s easy to present insights to leadership.',
    },
    {
      name: 'Grace Nguyen',
      role: 'Customer Success Manager',
      image: '/images/home/testimonial/testimonial-09.jpg',
      imageAlt: 'Grace Nguyen',
      text: 'Lead tracking is now effortless. Our close rate has improved significantly since using Riteflow.',
    },
  ],
}) => {
  // Duplicate testimonials for seamless scroll effect
  const duplicateTestimonials = (testimonials: Testimonial[]) => {
    return [...testimonials, ...testimonials];
  };

  const columnOne = duplicateTestimonials(columnOneTestimonials);
  const columnTwo = duplicateTestimonials(columnTwoTestimonials);
  const columnThree = duplicateTestimonials(columnThreeTestimonials);

  useSectionHeadingAnimation();

  const renderTestimonialCard = (testimonial: Testimonial, index: number) => (
    <div key={`${testimonial.name}-${index}`}>
      <div className="px-5 pt-5 pb-6 md:pb-10 bg-blue rounded-xl sm:rounded-2xl lg:rounded-[20px] border border-lineColor/70 relative">
        <div className="flex items-center gap-4">
          <Image
            className="w-10.5 h-10.5 object-cover rounded-full"
            src={testimonial.image}
            alt={testimonial.imageAlt || testimonial.name}
            width={42}
            height={42}
            loading="lazy"
          />
          <div className="flex-1">
            <h3 className="font-dmSans text-offWhite text-base leading-tight font-normal">
              {testimonial.name}
            </h3>
            <p className="text-offWhite/60 text-sm leading-tight mt-1">
              {testimonial.role}
            </p>
          </div>
        </div>
        <div className="my-4 md:my-5 lg:my-6 gradient-border w-full h-px"></div>
        <p className="text-offWhite">{testimonial.text}</p>
      </div>
    </div>
  );

  return (
    <section
      className="section-bottom-border"
      aria-label="Testimonials section"
    >
      <div className="container">
        <div className="border-container section-spacing-lg">
          {/* Section Title */}
          <div
            className="max-w-[450px] sm:max-w-[520px] lg:max-w-[600px] mx-auto text-center mb-10 sm:mb-12 md:mb-16 xl:mb-20"
            data-section-title
          >
            <span className="badge-button mb-5" data-subtitle>
              {badgeText}
            </span>
            <h2
              className="gradient-text text-3xl sm:text-4xl lg:text-5xl xl:text-[51px] !leading-[1.1] font-semibold -tracking-[0.4px] overflow-hidden"
              data-title
            >
              {title}
            </h2>
            <p
              className="mt-4 md:mt-5 text-offWhite/80 overflow-hidden"
              data-excerpt
            >
              {description}
            </p>
          </div>

          {/* Testimonial Grid */}
          <div className="relative" data-lag="0.3">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 overflow-hidden relative h-[500px] sm:h-[700px] testimonial-wrapper">
              {/* Column One - Scrolls Down */}
              <div className="flex flex-col gap-5 auto-scroll-content">
                {columnOne.map((testimonial, index) =>
                  renderTestimonialCard(testimonial, index)
                )}
              </div>

              {/* Column Two - Scrolls Up (Hidden on Mobile) */}
              <div className="hidden sm:flex flex-col gap-5 auto-scroll-content-reverse">
                {columnTwo.map((testimonial, index) =>
                  renderTestimonialCard(testimonial, index)
                )}
              </div>

              {/* Column Three - Scrolls Down (Hidden on Mobile/Tablet) */}
              <div className="hidden md:flex flex-col gap-5 auto-scroll-content">
                {columnThree.map((testimonial, index) =>
                  renderTestimonialCard(testimonial, index)
                )}
              </div>
            </div>

            {/* Fade Overlay */}
            <div className="testimonial-overlay h-[calc(100%+10px)] !top-[-5px] pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

TestimonialOne.displayName = 'TestimonialOne';

export default TestimonialOne;
