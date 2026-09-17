'use client';

import React, { useState, useMemo } from 'react';
import SectionBanner from '@riteflow/components/shortCode/SectionBanner';
import IntegrationFilters from './IntegrationFilters';
import IntegrationCard from './IntegrationCard';
import { integrationsData, integrationCategories } from '@riteflow/data/integrationData';

export interface IntegrationSectionProps {
  showFilters?: boolean;
  variant?: 'one' | 'two';
}

const IntegrationSection: React.FC<IntegrationSectionProps> = ({ showFilters = true, variant = 'one' }) => {
  // Filter state management
  const [activeFilter, setActiveFilter] = useState<string>('*');

  // Filter integrations based on active filter
  const filteredIntegrations = useMemo(() => {
    if (activeFilter === '*') {
      return integrationsData;
    }
    return integrationsData.filter((integration) => integration.category === activeFilter);
  }, [activeFilter]);

  return (
    <section className="section-bottom-border relative z-1">
      <div className="container">
        <div className="border-container section-spacing-lg">
          {/* Section Title */}
          <SectionBanner
            variant={variant}
            outlineButtonText="Seamless Integrations"
            title="Connect RiteFlow Seamlessly to Your Apps"
            description="Plug our AI into the tools you already love—Slack, Zapier, Salesforce, Notion, and more. Sync data instantly, automate platforms, and keep every workflow."
          />

          {/* Filters and Grid */}
          {showFilters ? (
            <div className="flex integration-cards-start justify-between gap-10 flex-col lg:flex-row">
              {/* Filters */}
              <div data-sttr-wrapper>
                <IntegrationFilters
                  categories={integrationCategories}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                />
              </div>
              {/* Integration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:max-w-[968px] w-full"
                id="integration-grid"
                data-sttr-wrapper>

              {filteredIntegrations.map((integration) => (

                <IntegrationCard
                  key={integration.id}
                  name={integration.name}
                  icon={integration.icon}
                  description={integration.description}
                  category={integration.category}
                  link={integration.link}
                />

              ))}
              </div>
            </div>
          ) : (
            /* Integration Grid without Filters */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5" data-sttr-wrapper>
              {filteredIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  name={integration.name}
                  icon={integration.icon}
                  description={integration.description}
                  category={integration.category}
                  link={integration.link}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

IntegrationSection.displayName = 'IntegrationSection';

export default IntegrationSection;
