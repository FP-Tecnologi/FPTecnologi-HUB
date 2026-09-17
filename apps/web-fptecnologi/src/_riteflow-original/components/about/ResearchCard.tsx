import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ArrowTopRight from '@riteflow/components/icons/ArrowTopRight';

export interface ResearchCardProps {
  title: string;
  description: string;
  logo: string;
  link: string;
}

/**
 * ResearchCard Component
 * 
 * Displays a research card with logo, title, description, and link.
 * Features hover animations on logo and arrow icon.
 * 
 * @param {string} title - Research project title
 * @param {string} description - Brief description of the research
 * @param {string} logo - Path to research project logo
 * @param {string} link - URL to research details page
 * 
 * @example
 * <ResearchCard
 *   title="Flow-Predict"
 *   description="Predictive workflow analytics"
 *   logo="/images/about/research-loog-01.svg"
 *   link="#"
 * />
 */
const ResearchCard: React.FC<ResearchCardProps> = ({ title, description, logo, link }) => {
  return (
    <div
      className="bg-blue rounded-20 border-moving relative before:rounded-xl sm:before:rounded-2xl md:before:rounded-[20px] group p-2.5 flex flex-col gap-2.5"
      data-sttr-card
    >
      {/* Logo */}
      <Link
        href={link}
        className="w-full flex items-center justify-center bg-linear-to-b from-slateBlue/20 to-royalBlue/20 rounded-20 p-10 h-[120px]"
      >
        <Image
          src={logo}
          alt={`${title} logo`}
          width={100}
          height={100}
          className="duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="p-2.5 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg text-offWhite font-medium font-dmSans">{title}</h3>
          <p className="text-sm text-offWhite/60">{description}</p>
        </div>
        <Link
          href={link}
          className="w-11 h-9 flex items-center justify-center bg-linear-to-b from-slateBlue/20 to-royalBlue/20 rounded-[10px] relative overflow-hidden"
          aria-label={`Learn more about ${title}`}
        >
          <ArrowTopRight className="w-6 h-6 fill-current text-white transition-all duration-300 ease-in-out group-hover:translate-x-6 group-hover:-translate-y-5 group-hover:opacity-0" />
          <ArrowTopRight className="w-6 h-6 fill-current text-white absolute transform -translate-x-6 translate-y-5 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:-translate-y-0 opacity-0 group-hover:opacity-100" />
        </Link>
      </div>
    </div>
  );
};

ResearchCard.displayName = 'ResearchCard';

export default ResearchCard;
