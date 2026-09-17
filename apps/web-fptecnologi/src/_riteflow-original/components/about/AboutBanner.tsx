'use client';
import React from 'react';
import Image from 'next/image';
import { useStaggerAnimation } from '@riteflow/hooks/useStaggerAnimation';
export interface AboutBannerProps {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
}

const AboutBanner: React.FC<AboutBannerProps> = ({
  title,
  description,
  image,
  imageAlt = 'about banner thumb',
}) => {
  // Custom options
  useStaggerAnimation({
    stagger: 0.1,
    duration: 0.8,
    waitForPreloader: true,
    start: 'top 70%',
  });
  return (
    <section className="section-bottom-border relative z-1">
      <div className="container">
        <div className="border-container section-spacing-lg">
          <div className="flex items-center justify-between gap-7 md:gap-10 flex-col md:flex-row" data-sttr-wrapper >
            {/* Image */}
            <div className="md:max-w-[560px] w-full rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden" data-sttr-card >
              <Image
                src={image}
                alt={imageAlt}
                width={560}
                height={400}
                className="w-full h-full object-cover"
                priority
                data-lag="0.1"
              />
            </div>

            {/* Content */}
            <div className="md:max-w-[560px] w-full">
              <h1 className="text-4xl sm:text-5xl lg:text-[51px] font-semibold gradient-text" data-sttr-card>
                {title}
              </h1>
              <p className="mt-3 sm:mt-5" data-sttr-card>
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

AboutBanner.displayName = 'AboutBanner';

export default AboutBanner;
