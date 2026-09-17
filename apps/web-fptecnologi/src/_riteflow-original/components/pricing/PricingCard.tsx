'use client';

import React from 'react';
import type { PricingPlan } from '@riteflow/data/pricingData';
import StarterIcon from '@riteflow/components/icons/StarterIcon';
import ProfessionalIcon from '@riteflow/components/icons/ProfessionalIcon';
import EnterpriceIcon from '@riteflow/components/icons/EnterpriceIcon';
import StarCheck from '@riteflow/components/icons/StarCheck';
import { PricingCTAButton } from '@riteflow/components/ui/pricing-cta-button';
import type { IconProps } from '@riteflow/components/icons/types';
export interface PricingCardProps {
  plan: PricingPlan;
  billingPeriod: 'monthly' | 'yearly';
}

// Icon mapping - maps iconId from data to icon components
const iconMap: Record<string, React.FC<IconProps>> = {
  starter: StarterIcon,
  professional: ProfessionalIcon,
  enterprise: EnterpriceIcon,
};

const PricingCard: React.FC<PricingCardProps> = ({ plan, billingPeriod }) => {
  const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const period = billingPeriod === 'monthly' ? '/mo' : '/year';

  // Get icon component from mapping using iconId from data
  const IconComponent = plan.iconId ? iconMap[plan.iconId] : null;
  const iconClassName = 'w-6 h-6 text-offWhite/80';

  return (
    <div className="flex flex-col justify-between h-full" data-sttr-card>
      <div
        className={`pricing-card bg-blue px-5 pt-5 pb-5 sm:pb-8 lg:pb-10 rounded-xl sm:rounded-2xl md:rounded-[20px] border border-lineColor/50 group border-moving relative before:rounded-xl sm:before:rounded-2xl md:before:rounded-[20px] z-1 h-full flex flex-col ${
          plan.isPopular ? 'active z-[1]' : ''
        }`}
      >
        {/* Plan Name */}
        <div className="flex items-center gap-4">
          {IconComponent && <IconComponent className={iconClassName} />}
          <span className="flex-1 text-base sm:text-lg !leading-none text-offWhite/80 font-medium sm:-tracking-[0.3px]">
            {plan.name}
          </span>
        </div>

        {/* Price */}
        <div className="mt-4 md:mt-7">
          <h3 className="price text-[40px] font-semibold !leading-tight tracking-tight">
            ${price}
          </h3>
          <span className="mt-2.5 flex gap-1 text-offWhite/60 text-sm tracking-[0.1px]">
            /per user <span className="period">{period}</span>
          </span>
        </div>

        {/* Description */}
        <p className="mt-5 md:mt-7 text-offWhite/80">{plan.description}</p>

        {/* CTA Button */}
        <PricingCTAButton
          href={plan.buttonLink || '#'}
          text={plan.buttonText || 'Start for free'}
          hoverText="Get Started"
          isPopular={plan.isPopular}
        />

        {/* Features List */}
        <div className="mt-6 md:mt-10">
          <p className="text-lg font-medium !leading-snug tracking-tight mb-4">Features:</p>
          <ul className="flex flex-col gap-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-offWhite/60">
                <StarCheck className="w-5 h-5 text-tertiary flex-shrink-0" />
                <span className="flex-1">{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </div>
  );
};

PricingCard.displayName = 'PricingCard';

export default PricingCard;
