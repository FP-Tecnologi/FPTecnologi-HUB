'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@riteflow/lib/utils';

/**
 * PricingCTAButton Component
 * 
 * Special button component for pricing cards with hover animation effect.
 * Features dual text layers that slide on hover.
 * 
 * @example
 * <PricingCTAButton 
 *   href="/signup"
 *   text="Start for free"
 *   hoverText="Get Started"
 *   isPopular={true}
 * />
 */
export interface PricingCTAButtonProps {
  href?: string;
  text?: string;
  hoverText?: string;
  isPopular?: boolean;
  className?: string;
}

const PricingCTAButton: React.FC<PricingCTAButtonProps> = ({
  href = '#',
  text = 'Start for free',
  hoverText = 'Get Started',
  isPopular = false,
  className,
}) => {
  const baseStyles =
    'mt-5 md:mt-7.5 w-full text-sm tracking-[0.1px] font-medium relative text-center rounded-xl z-1 before:absolute before:w-full before:h-full before:bg-linear-to-b before:from-slateBlue before:to-royalBlue before:top-0 before:left-0 before:-z-1 before:rounded-[11px] duration-300 before:duration-300 flex flex-col h-11';

  const popularStyles =
    'text-white bg-linear-to-b from-offWhite to-platinum before:opacity-100 before:visible';

  const defaultStyles =
    'text-secondary bg-linear-to-b from-offWhite to-platinum before:opacity-0 before:invisible group-hover:text-offWhite group-hover:before:opacity-100 group-hover:before:visible group-hover:!bg-transparent';

  return (
    <Link
      href={href}
      className={cn(
        baseStyles,
        isPopular ? popularStyles : defaultStyles,
        className
      )}
    >
      <div className="overflow-hidden flex flex-col">
        <span className="p-3 transform duration-300 group-hover:-translate-y-full">
          {text}
        </span>
        <span className="p-3 transform duration-300 group-hover:-translate-y-full">
          {hoverText}
        </span>
      </div>
    </Link>
  );
};

PricingCTAButton.displayName = 'PricingCTAButton';

export { PricingCTAButton };
