'use client';

import React from 'react';

export interface IntegrationFiltersProps {
  categories: Array<{ id: string; label: string; value: string }>;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

/**
 * IntegrationFilters Component
 * 
 * Filter buttons for integration categories.
 * 
 * @example
 * <IntegrationFilters
 *   categories={integrationCategories}
 *   activeFilter="*"
 *   onFilterChange={setActiveFilter}
 * />
 */
const IntegrationFilters: React.FC<IntegrationFiltersProps> = ({
  categories,
  activeFilter,
  onFilterChange,
}) => {
  return (
    <div
      className="filters lg:max-w-[162px] w-full flex lg:flex-col flex-wrap lg:flex-nowrap items-center lg:items-start justify-center lg:justify-stretch gap-2 lg:gap-0"
      id="filters"
      data-sttr-card
    >
      <h4 className="text-base font-medium mb-2 lg:pl-5 tracking-[0.1px] font-dmSans w-full text-center lg:text-left">
        Filter by
      </h4>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onFilterChange(category.value)}
          className={`integration-button w-auto lg:w-full cursor-pointer py-1.5 px-3 text-sm leading-normal tracking-[0.1px] text-white/60 rounded-[10px] border border-transparent transition-all duration-300 text-left ${
            activeFilter === category.value ? 'is-checked active' : ''
          }`}
          data-filter={category.value}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

IntegrationFilters.displayName = 'IntegrationFilters';

export default IntegrationFilters;
