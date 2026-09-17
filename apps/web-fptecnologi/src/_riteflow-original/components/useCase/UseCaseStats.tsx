import React from 'react';
import type { UseCaseStat } from '@riteflow/data/useCaseDetailsData';

/**
 * UseCaseStats Component
 * 
 * Displays statistics cards for use case details page.
 * Shows 3 stat cards with values, labels, and descriptions.
 * 
 * @example
 * <UseCaseStats stats={useCaseDetails.stats} />
 * 
 * @param stats - Array of statistics to display
 */
export interface UseCaseStatsProps {
  stats: UseCaseStat[];
}

const UseCaseStats: React.FC<UseCaseStatsProps> = ({ stats }) => {
  // Don't render if no stats provided
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <>
      {/* Divider */}
      <div className="my-8 sm:my-10 md:my-13 gradient-border max-w-[320px] mx-auto w-full h-[1px]" data-sttr-card ></div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-[793px] mx-auto">
        {stats.map((stat, index) => (
          <div key={index} className="p-5 rounded-20 bg-blue border border-lineColor/70 text-center" data-sttr-card >
            {/* Stat Value */}
            <h3 className="text-3xl md:text-4xl lg:text-[40px] font-semibold sm:tracking-[-0.2px]">
              {stat.prefix && <span>{stat.prefix}</span>}
              <span className="counter" data-target={stat.value}>
                {stat.value}
              </span>
              {stat.suffix && (
                <span className={stat.suffix.includes('+') ? 'text-tertiary' : ''}>
                  {stat.suffix}
                </span>
              )}
            </h3>

            {/* Stat Label */}
            <h5 className="font-dmSans font-medium text-lg md:text-xl sm:tracking-[-0.2px] text-offWhite/80 mt-2">
              {stat.label}
            </h5>

            {/* Divider */}
            <div className="my-4 sm:my-6 gradient-border max-w-[320px] mx-auto w-full h-[1px]"></div>

            {/* Stat Description */}
            <p className="text-white/80 tracking-[0.1px]">{stat.description}</p>
          </div>
        ))}
      </div>
    </>
  );
};

UseCaseStats.displayName = 'UseCaseStats';

export default UseCaseStats;
