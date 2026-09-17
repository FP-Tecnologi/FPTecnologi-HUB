'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import SectionBanner from '@riteflow/components/shortCode/SectionBanner';
import { comparisonTableData } from '@riteflow/data/comparisonTableData';
import InfoIcon from '../icons/InfoIcon';

/**
 * ComparisonTable Component
 * 
 * Displays a feature comparison table comparing RiteFlow with other products.
 * Features:
 * - Responsive table with horizontal scroll on mobile
 * - Tooltip support for feature descriptions (keyboard accessible)
 * - Visual indicators (purple/red ticks) for feature availability
 * - Accessible table structure with proper ARIA labels
 * 
 * Data is fetched from comparisonTableData.ts. Table is scrollable
 * on smaller screens to maintain readability.
 * 
 * @example
 * <ComparisonTable />
 */
const ComparisonTable: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  // Safety check: ensure data exists
  if (!comparisonTableData || !comparisonTableData.features || comparisonTableData.features.length === 0) {
    return null;
  }

  // Validate data integrity: ensure columns match logos count
  const expectedColumns = comparisonTableData.logos.length;
  const hasInvalidData = comparisonTableData.features.some(
    (feature) => feature.columns.length !== expectedColumns
  );

  if (hasInvalidData) {
    console.warn(
      'ComparisonTable: Some features have column counts that do not match the number of logos.'
    );
  }

  const handleTooltipToggle = (featureId: number) => {
    setActiveTooltip(activeTooltip === featureId ? null : featureId);
  };

  const handleTooltipKeyDown = (
    e: React.KeyboardEvent,
    featureId: number
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTooltipToggle(featureId);
    } else if (e.key === 'Escape') {
      setActiveTooltip(null);
    }
  };

  return (
    <section className="section-bottom-border" aria-labelledby="comparison-table-heading">
      <div className="container">
        <div className="border-container section-spacing-lg">
          {/* Section Title */}
          <SectionBanner
            variant="two"
            outlineButtonText="Product Comparison"
            title="See How RiteFlow Clearly Stacks Up to Others"
            description="Compare features, pricing, and performance across leading AI platforms. Discover why teams choose RiteFlow for speed, simplicity, and smarter results."
          />

          {/* Comparison Table */}
          <div data-sttr-wrapper data-lag="0.05">
            <div 
              className="bg-blue rounded-20 overflow-auto border border-lineColor/50" 
              data-sttr-card
              role="region"
              aria-label="Product feature comparison table"
            >
              <table 
                className="min-w-[600px] w-full border-collapse text-white/80"
                aria-label="Feature comparison between RiteFlow and other products"
              >
                <thead className=" text-left">
                  <tr className="border-b border-lineColor/50 flex w-full bg-linear-to-b from-slateBlue/20 to-royalBlue/20">
                    <th 
                      className="p-4 text-lg tracking-[0.3px] font-normal text-white w-[55%] md:w-[40%] border-r border-lineColor/50"
                      scope="col"
                    >
                      Features
                    </th>
                    {comparisonTableData.logos.map((logo, index) => (
                      <th
                        key={`logo-${index}`}
                        className="p-4 text-lg tracking-[0.3px] font-normal text-white inline-flex items-center justify-center w-[15%] md:w-[20%] border-r border-lineColor/50 last:border-r-0"
                        scope="col"
                      >
                        <Image 
                          src={logo.src} 
                          alt={logo.alt} 
                          width={80} 
                          height={40}
                          aria-hidden="false"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-lineColor/50 ">
                  {comparisonTableData.features.map((feature) => (
                    <tr key={feature.id} className="flex w-full">
                      <td className="p-4 w-[55%] md:w-[40%] flex gap-3 items-center border-r border-lineColor/50">
                        <span>{feature.name}</span>
                        {feature.tooltip && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => handleTooltipToggle(feature.id)}
                              onKeyDown={(e) => handleTooltipKeyDown(e, feature.id)}
                              className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                              aria-label={`More information about ${feature.name}`}
                              aria-expanded={activeTooltip === feature.id}
                              aria-describedby={activeTooltip === feature.id ? `tooltip-${feature.id}` : undefined}
                            >
                              <InfoIcon className="w-4.5 h-4.5 cursor-pointer" aria-hidden="true" />
                            </button>
                            <div
                              id={`tooltip-${feature.id}`}
                              role="tooltip"
                              className={`absolute w-[200px] left-1/2 -translate-x-1/2 bottom-full mb-3 p-3 bg-secondary rounded-lg text-center z-10 transition-all duration-300 ${
                                activeTooltip === feature.id
                                  ? 'opacity-100 visible translate-y-0'
                                  : 'opacity-0 invisible translate-y-2 pointer-events-none'
                              }`}
                            >
                              <p className="text-xs text-white">{feature.tooltip}</p>
                              <div className="w-3 h-3 transform rotate-45 bg-secondary absolute left-1/2 -translate-x-1/2 -bottom-1.5"></div>
                            </div>
                          </div>
                        )}
                      </td>
                      {feature.columns.map((tickType, index) => {
                        const isLastColumn = index === feature.columns.length - 1;
                        return (
                          <td
                            key={`${feature.id}-col-${index}`}
                            className={`p-4 w-[15%] md:w-[20%] flex items-center justify-center text-center border-r border-lineColor/50 ${isLastColumn ? 'last:border-r-0' : ''}`}
                            aria-label={`${feature.name}: ${tickType === 'purple' ? 'Available' : 'Not available'}`}
                          >
                            <Image
                              src={`/images/home-v2/tick-${tickType}.svg`}
                              className="w-4 mx-auto"
                              alt=""
                              width={16}
                              height={16}
                              aria-hidden="true"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

ComparisonTable.displayName = 'ComparisonTable';

export default ComparisonTable;
