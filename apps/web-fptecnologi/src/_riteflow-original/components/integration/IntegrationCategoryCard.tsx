import React from 'react';
import Link from 'next/link';
import ArrowTopRight from '@riteflow/components/icons/ArrowTopRight';

export interface IntegrationCategoryCardProps {
  title: string;
  description: string;
  toolsCount: number;
  link: string;
}

/**
 * IntegrationCategoryCard Component
 * 
 * Displays a single integration category card with title, description, tools count, and link.
 * 
 * @example
 * <IntegrationCategoryCard
 *   title="Project Management"
 *   description="Connect with tools like Asana..."
 *   toolsCount={8}
 *   link="/integration-category/project-management"
 * />
 */
const IntegrationCategoryCard: React.FC<IntegrationCategoryCardProps> = ({
  title,
  description,
  toolsCount,
  link,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (link === '#') {
      e.preventDefault();
    }
  };

  return (
    <div data-sttr-card>
      <Link 
        href={link} 
        onClick={handleClick}
        className="p-5 bg-blue rounded-20 border border-lineColor/70 relative group border-moving before:rounded-xl sm:before:rounded-2xl lg:before:rounded-[20px] z-1 useCase-card flex flex-col justify-between h-full"
      >
        <div className="">
          <div className="flex items-center gap-4">
            <span className="text-lg sm:text-xl text-white font-medium">{title}</span>
          </div>
          <div className="mt-4 gradient-border w-full h-[1px]"></div>
          <p className="text-offWhite/60 mt-4">{description}</p>
        </div>
        <div className="mt-5 sm:mt-6 lg:mt-7.5 flex items-center justify-between gap-10">
          <span className="bg-linear-to-b from-slateBlue/20 to-royalBlue/20 inline-flex items-center justify-center px-3 py-2 text-white font-medium text-sm leading-normal rounded-[10px] relative z-1 overflow-hidden text-center">
            {toolsCount} Tools
          </span>
          <div className="w-11 h-9 flex items-center justify-center bg-linear-to-b from-slateBlue/20 to-royalBlue/20 rounded-[10px] relative overflow-hidden">
            <ArrowTopRight className="w-6 h-6 fill-current text-white transition-all duration-300 ease-in-out group-hover:translate-x-6 group-hover:-translate-y-5 group-hover:opacity-0" />
            <ArrowTopRight className="w-6 h-6 fill-current text-white absolute transform -translate-x-6 translate-y-5 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:-translate-y-0 opacity-0 group-hover:opacity-100" />
          </div>
        </div>
      </Link>
    </div>
  );
};

IntegrationCategoryCard.displayName = 'IntegrationCategoryCard';

export default IntegrationCategoryCard;
