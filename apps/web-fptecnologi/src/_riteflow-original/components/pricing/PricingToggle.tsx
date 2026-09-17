'use client';

import React from 'react';
import YearlySaved from '../icons/YearlySaved';

/**
 * PricingToggle Component
 * 
 * Toggle switch for switching between monthly and yearly billing periods.
 * 
 * @example
 * <PricingToggle 
 *   billingPeriod={billingPeriod}
 *   onBillingPeriodChange={setBillingPeriod}
 * />
 */
export interface PricingToggleProps {
  billingPeriod: 'monthly' | 'yearly';
  onBillingPeriodChange: (period: 'monthly' | 'yearly') => void;
}

const PricingToggle: React.FC<PricingToggleProps> = ({
  billingPeriod,
  onBillingPeriodChange,
}) => {
  const handleToggle = () => {
    onBillingPeriodChange(billingPeriod === 'monthly' ? 'yearly' : 'monthly');
  };

  return (
    <div data-sttr-card>
      <div className="toggle-wrapper inline-flex items-center justify-center gap-4 relative" data-lag="0.05">
        {/* Savings Badge */}
          <div className="flex items-end sm:items-start gap-1.5 absolute left-[80%] sm:left-full bottom-full">

            <YearlySaved className="fill-tertiary" />
            
            <span className="text-tertiary text-sm font-medium sm:whitespace-nowrap">
              20% Saved
            </span>
          </div>

        {/* Toggle Switch */}
        <span className="monthly text-base sm:text-lg sm:-tracking-[0.2px] text-offWhite/40 duration-300">
          Monthly
        </span>
        <label className="pricing-switch relative inline-block w-14 h-7 rounded-2xl bg-tertiary cursor-pointer">
          <input
            type="checkbox"
            checked={billingPeriod === 'yearly'}
            onChange={handleToggle}
            className="hidden"
          />
          <span className="pricing-switch-slider absolute w-5 h-5 rounded-full bg-offWhite top-1 left-1 transition-transform duration-300"></span>
        </label>
        <span className="yearly text-base sm:text-lg sm:-tracking-[0.2px] text-offWhite/40 duration-300">
          Yearly
        </span>
      </div>
    </div>
  );
};

PricingToggle.displayName = 'PricingToggle';

export default PricingToggle;
