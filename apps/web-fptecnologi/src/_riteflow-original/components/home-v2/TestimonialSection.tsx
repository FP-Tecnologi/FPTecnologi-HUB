'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import SectionBanner from '@riteflow/components/shortCode/SectionBanner';
import { testimonialData, testimonialStats } from '@riteflow/data/testimonialData';
import Link from 'next/link';
import LeftArrow from '../icons/LeftArrow';
import RightArrow from '../icons/RightArrow';
import TestimonialCard from './TestimonialCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

/**
 * TestimonialSection Component
 * 
 * Displays testimonial section with review statistics and testimonial cards.
 * Features:
 * - Review rating display with star icons
 * - Reviewer profile images
 * - Testimonial cards in a responsive slider
 * - Navigation buttons for slider
 * - Autoplay functionality
 * 
 * Data is fetched from testimonialData.ts. This is a client component
 * due to Swiper slider interactions.
 * 
 * @example
 * <TestimonialSection />
 */
const TestimonialSection: React.FC = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  // Safety check: ensure data exists
  if (!testimonialData || testimonialData.length === 0) {
    return null;
  }
  return (
    <section className="section-bottom-border">
      <div className="container">
        <div className="border-container section-spacing-lg" data-container="testimonial-section">
          {/* Section Title */}
          <SectionBanner
            variant="two"
            outlineButtonText="Testimonial"
            title="What Our Happy Users Say About RiteFlow"
            description="Discover how professionals in marketing, product, and operations boost results with RiteFlow's AI—saving time, cutting costs, and sparking innovation."
          />

          {/* Review Stats */}
          <div
            data-review
            className="mb-10 md:mb-12.5 flex items-center justify-center gap-3 flex-wrap"
          >
            <div className="flex">
              {testimonialStats.reviewerImages.map((img, index) => (
                <Image
                  key={index}
                  className={`w-12 h-12 rounded-full border-2 border-white object-cover ${
                    index > 0 ? '-ml-5' : ''
                  }`}
                  src={img}
                  alt="people"
                  width={48}
                  height={48}
                />
              ))}
            </div>
            <div className="">
              <div className="flex items-center gap-3">
                <h3 className="text-lg sm:text-xl font-medium font-dmSans text-white tracking-[0.2px] leading-none">
                  {testimonialStats.rating}
                </h3>
                <div className="flex">
                  {[1, 2, 3, 4].map((i) => (
                  <Image
                    key={i}
                    src="/images/home-v2/star.svg"
                    alt=""
                    width={20}
                    height={20}
                    aria-hidden="true"
                  />
                  ))}
                  <Image
                    src="/images/home-v2/star-half.svg"
                    alt=""
                    width={20}
                    height={20}
                    aria-hidden="true"
                  />
                </div>
              </div>
              <Link
                href={testimonialStats.reviewLink}
                className="underline text-sm leading-snug text-white/80 mt-1 duration-300 hover:text-white"
              >
                See all {testimonialStats.totalReviews} reviews
              </Link>
            </div>
          </div>

          {/* Testimonial Slider */}
          <div className="overflow-hidden relative">
            {/* Gradient Overlays */}
            <div className="absolute w-[10%] h-full top-0 left-0 bg-linear-to-r from-secondary to-secondary/0 z-10 pointer-events-none"></div>
            <div className="absolute w-[10%] h-full top-0 right-0 bg-linear-to-r from-secondary/0 to-secondary z-10 pointer-events-none"></div>

            {/* Swiper Slider */}
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={testimonialData.length > 3}
              navigation={{
                prevEl: '.tmnl-slider-prev',
                nextEl: '.tmnl-slider-next',
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              className="testimonial-slider"
            >
              {testimonialData.map((testimonial) => (
                <SwiperSlide key={testimonial.id}>
                  <TestimonialCard testimonial={testimonial} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Buttons */}
            <div
              className="mt-8 sm:mt-10 lg:mt-12 flex items-center justify-center gap-3 sm:gap-4.5"
              data-button
            >
              <button
                className="tmnl-slider-prev w-10.5 h-10.5 rounded-full border border-white text-white flex items-center justify-center cursor-pointer duration-300 hover:bg-primary hover:border-transparent transition-colors"
                aria-label="Previous testimonial"
              >
                <LeftArrow className="w-2.5 h-4" />
              </button>
              <button
                className="tmnl-slider-next w-10.5 h-10.5 rounded-full border border-white text-white flex items-center justify-center cursor-pointer duration-300 hover:bg-primary hover:border-transparent transition-colors"
                aria-label="Next testimonial"
              >
                <RightArrow className="w-2.5 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

TestimonialSection.displayName = 'TestimonialSection';

export default TestimonialSection;
