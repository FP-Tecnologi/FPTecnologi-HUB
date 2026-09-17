'use client';

import React from 'react';
import Heading from '@riteflow/components/ui/heading';
import { Button } from '@riteflow/components/ui/button';
import { useSectionHeadingAnimation } from '@riteflow/hooks/useSectionHeadingAnimation';
export interface SectionBannerProps {
  outlineButtonText?: string;
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: 'one' | 'two';
}

/**
 * SectionBanner Component
 * 
 * Reusable section title component with optional outline button, heading, and description/content.
 * You can use it with props or pass custom content as children.
 * 
 * @example
 * // With props - variant one (h1 - default)
 * <SectionBanner 
 *   outlineButtonText="Pricing Plan"
 *   title="Smart Pricing That Scales With Your Growth"
 *   description="Choose a plan that fits your needs..."
 * />
 * 
 * // With props - variant two (h2)
 * <SectionBanner 
 *   variant="two"
 *   outlineButtonText="Pricing Plan"
 *   title="Smart Pricing That Scales With Your Growth"
 *   description="Choose a plan that fits your needs..."
 * />
 * 
 * // With children (custom content)
 * <SectionBanner outlineButtonText="Pricing Plan">
 *   <Heading as="h2">Custom Title</Heading>
 *   <p>Custom description</p>
 * </SectionBanner>
 * 
 * // Just title (no button, no description)
 * <SectionBanner title="Simple Title" />
 */
const SectionBanner: React.FC<SectionBannerProps> = ({
  outlineButtonText,
  title,
  description,
  className,
  children,
  variant = 'one',
}) => {
  useSectionHeadingAnimation({
    duration: 0.8,
    position: "-=0.5",
    start: "top 75%"
  });
  return (
    <div className={`max-w-[450px] sm:max-w-[520px] lg:max-w-[600px] mx-auto text-center mb-10 sm:mb-12 md:mb-16 xl:mb-20 ${className || ''}`} data-section-title >
      {outlineButtonText && (
        <div data-subtitle>
          <Button variant="outline" className="badge-button mb-5 ">
            {outlineButtonText}
          </Button>
        </div>
      )}
      {children ? (
        children
      ) : (
        <>
          {title && (
            <Heading as={variant === 'one' ? 'h1' : 'h2'} className="!leading-[1.2]" data-title>
              {title}
            </Heading>
          )}
          {description && (
            <p className="mt-4 md:mt-5 text-offWhite/80 overflow-hidden" data-excerpt>
              {description}
            </p>
          )}
        </>
      )}
    </div>
  );
};

SectionBanner.displayName = 'SectionBanner';

export default SectionBanner;
