import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ArrowTopRight from '@riteflow/components/icons/ArrowTopRight';

export interface IntegrationCardProps {
  name: string;
  icon: string;
  description: string;
  category: string;
  link: string;
}

/**
 * IntegrationCard Component
 * 
 * Displays a single integration card with icon, name, description, category badge, and link.
 * 
 * @example
 * <IntegrationCard
 *   name="TaskPilot"
 *   icon="/images/integration/taskpilot.svg"
 *   description="AI-driven project manager..."
 *   category="productivity"
 *   link="/integration/taskpilot"
 * />
 */
const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  icon,
  description,
  category,
  link,
}) => {
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="integration-card" data-cat={category}>
      <div data-sttr-card>
        <Link
          href={link}
          className="p-5 bg-blue rounded-20 border border-lineColor/70 relative group border-moving before:rounded-xl sm:before:rounded-2xl lg:before:rounded-[20px] z-1 useCase-card flex flex-col justify-between h-full"
        >
          <div className="">
            <div className="flex items-center gap-4">
              <Image src={icon} alt={`${name} icon`} width={40} height={40} />
              <span className="text-lg sm:text-xl !leading-none text-white font-medium">
                {name}
              </span>
            </div>
            <div className="mt-5 md:mt-7.5 gradient-border w-full h-[1px]"></div>
            <p className="text-offWhite/60 mt-4">{description}</p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-10">
            <span className="bg-primary inline-flex items-center justify-center px-3 py-[6px] text-white font-medium text-[12px] !leading-[1.1] rounded-[10px] relative z-1 overflow-hidden text-center tracking-[0.4px]">
              {capitalizeFirst(category)}
            </span>
            <div className="w-11 h-9 flex items-center justify-center bg-linear-to-b from-slateBlue/20 to-royalBlue/20 rounded-[10px] relative overflow-hidden">
              <ArrowTopRight className="w-6 h-6 fill-current text-white transition-all duration-300 ease-in-out group-hover:translate-x-6 group-hover:-translate-y-5 group-hover:opacity-0" />
              <ArrowTopRight className="w-6 h-6 fill-current text-white absolute transform -translate-x-6 translate-y-5 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:-translate-y-0 opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

IntegrationCard.displayName = 'IntegrationCard';

export default IntegrationCard;
