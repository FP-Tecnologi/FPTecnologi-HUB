'use client';

import React from 'react';
import Link from 'next/link';
import { UseCase } from '@riteflow/data/useCaseData';
import UpArrow from '../icons/UpArrow';
import MarketingIcon from '../icons/MarketingIcon';
import ChartIcon from '../icons/ChartIcon';
import TtIcon from '../icons/TtIcon';
import SupportIcon from '../icons/SupportIcon';
import TalentIcon from '../icons/TalentIcon';
import InsightsIcon from '../icons/InsightsIcon';
import type { IconProps } from '../icons/types';

/**
 * UseCaseCard Component
 * 
 * A beautiful card component for displaying use cases with hover animations.
 * 
 * @example
 * <UseCaseCard useCase={useCaseData[0]} />
 * 
 * @param useCase - The use case object containing title, description, slug, and iconId
 */
export interface UseCaseCardProps {
  useCase: UseCase;
}

// Icon mapping - Maps iconId to actual icon components
const iconMap: Record<string, React.FC<IconProps>> = {
  MarketingIcon,
  ChartIcon,
  TtIcon,
  SupportIcon,
  TalentIcon,
  InsightsIcon,
};

const UseCaseCard: React.FC<UseCaseCardProps> = ({ useCase }) => {
  // Get the icon component based on iconId
  const IconComponent = iconMap[useCase.iconId];

  return (
    <div className="px-5 pt-5 pb-6 md:pb-10 bg-blue rounded-20 border border-lineColor/70 relative group border-moving before:rounded-xl sm:before:rounded-2xl lg:before:rounded-[20px] z-1 useCase-card" data-sttr-card >

      <Link href={`/use-cases/${useCase.slug}`} className="">
        
        {/* Top Section: Icon and Arrow */}
        <div className="flex items-center justify-between gap-5">
          {/* Icon Container */}
          <div className="w-10.5 h-10.5 flex items-center justify-center bg-primary rounded-[10px] p-2.5">
            {IconComponent ? (
              <IconComponent className="fill-current text-white max-w-7 max-h-5" />
            ) : (
              <span className="text-white text-xs">Icon</span>
            )}
          </div>

          {/* Arrow Icon with Hover Animation */}
          <div className="w-11 h-9 flex items-center justify-center bg-linear-to-b from-slateBlue/20 to-royalBlue/20 rounded-[10px] relative overflow-hidden">
            {/* Default Arrow (moves out on hover) */}
            <UpArrow className="w-6 h-6 fill-current text-white transition-all duration-300 ease-in-out group-hover:translate-x-6 group-hover:-translate-y-5 group-hover:opacity-0" />
            {/* Hover Arrow (slides in on hover) */}
            <UpArrow className="w-6 h-6 fill-current text-white absolute transform -translate-x-6 translate-y-5 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:-translate-y-0 opacity-0 group-hover:opacity-100" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl text-offWhite font-medium leading-normal mt-7.5">
          {useCase.title}
        </h3>

        {/* Gradient Border Divider */}
        <div className="my-4 gradient-border w-full h-[1px]"></div>

        {/* Description */}
        <p className="text-offWhite/60">{useCase.description}</p>
      </Link>
    </div>
  );
};

UseCaseCard.displayName = 'UseCaseCard';

export default UseCaseCard;
