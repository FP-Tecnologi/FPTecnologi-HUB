'use client';

import React, { useState } from 'react';
import SectionBanner from '@riteflow/components/shortCode/SectionBanner';
import PricingToggle from './PricingToggle';
import PricingCard from './PricingCard';
import { pricingPlans } from '@riteflow/data/pricingData';

export interface PricingSectionProps {
  variant?: 'one' | 'two';
}


const PricingSection: React.FC<PricingSectionProps> = ({ variant = 'one' }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section className="section-bottom-border relative z-1">
      <div className="container">
        <div className="border-container section-spacing-lg">
          
          {/* Section Banner */}
          <SectionBanner
            variant={variant}
            outlineButtonText="Pricing Plan"
            title="Smart Pricing That Scales With Your Growth"
            description="Choose a plan that fits your needs—whether you're a solo creator or a growing team. Simple, transparent pricing with No hidden charges — only value."
          />

          {/* Pricing Toggle and Table */}
          <div className="flex flex-col items-center" data-sttr-wrapper>
            <div data-sttr-card>
              <PricingToggle
                billingPeriod={billingPeriod}
                onBillingPeriodChange={setBillingPeriod}
              />
            </div>

            {/* Pricing Cards */}
            <div className="pricing-table grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10 sm:mt-12 items-stretch" data-lag="0.1">
              {pricingPlans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} billingPeriod={billingPeriod} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

PricingSection.displayName = 'PricingSection';

export default PricingSection;
