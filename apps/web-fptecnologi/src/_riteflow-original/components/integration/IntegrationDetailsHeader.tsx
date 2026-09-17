import React from 'react';
import Image from 'next/image';

export interface IntegrationDetailsHeaderProps {
  name: string;
  icon: string;
  description: string;
}

/**
 * IntegrationDetailsHeader Component
 * 
 * Header section for integration details page with logo overlay and title.
 * 
 * @example
 * <IntegrationDetailsHeader
 *   name="TaskPilot + Riteflow"
 *   icon="/images/integration/taskpilot.svg"
 *   description="AI-driven project manager..."
 * />
 */
const IntegrationDetailsHeader: React.FC<IntegrationDetailsHeaderProps> = ({
  name,
  icon,
  description,
}) => {
  return (
    <div className="text-center max-w-[600px] mx-auto">
      {/* Logo Overlay */}
      <div className="flex items-center justify-center gap-0" data-sttr-card>
        <div className="w-[84px] h-[84px] rounded-full bg-white flex items-center justify-center">
          <Image src={icon} alt={name} width={84} height={84} />
        </div>
        <div className="-ml-5 w-[84px] h-[84px] rounded-full bg-white flex items-center justify-center shadow-[-5.25px_5.25px_5.25px_0px_rgba(0,0,0,0.35)]">
          <Image
            src="/images/integration/riteflow-logo.svg"
            alt="RiteFlow logo"
            width={84}
            height={84}
          />
        </div>
      </div>

      {/* Title */}
      <h1
        className="text-3xl sm:text-4xl lg:text-5xl xl:text-[51px] font-semibold tracking-[-0.4px] text-white mt-5"
        data-sttr-card
      >
        {name} + Riteflow
      </h1>

      {/* Description */}
      <p className="mt-5" data-sttr-card>
        {description}
      </p>
    </div>
  );
};

IntegrationDetailsHeader.displayName = 'IntegrationDetailsHeader';

export default IntegrationDetailsHeader;
