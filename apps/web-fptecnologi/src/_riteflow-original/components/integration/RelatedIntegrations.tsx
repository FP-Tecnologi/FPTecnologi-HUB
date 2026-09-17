import React from 'react';
import IntegrationCard from './IntegrationCard';
import { integrationsData } from '@riteflow/data/integrationData';

export interface RelatedIntegrationsProps {
  currentSlug: string;
  title?: string;
}

/**
 * RelatedIntegrations Component
 * 
 * Displays related integrations section (excludes current integration, shows first 3).
 * 
 * @example
 * <RelatedIntegrations currentSlug="taskpilot" />
 */
const RelatedIntegrations: React.FC<RelatedIntegrationsProps> = ({
  currentSlug,
  title = 'Related Integrations',
}) => {
  // Filter and get related integrations (exclude current, get first 3)
  const currentLink = `/integration/${currentSlug}`;
  const relatedIntegrations = integrationsData
    .filter((item) => item.link !== currentLink)
    .slice(0, 3);
  return (
    <section className="section-bottom-border relative z-1">
      <div className="container">
        <div className="border-container section-spacing-lg" >
          {/* Section Title */}
          <div className="text-center mb-10 sm:mb-12 md:mb-15" >
            <h2 className="gradient-text text-3xl sm:text-4xl lg:text-5xl xl:text-[51px] font-semibold -tracking-[0.4px] !leading-[1.2]">
              {title}
            </h2>
          </div>

          {/* Integration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">

            {relatedIntegrations.map((integration) => (

              <div key={integration.id} className="integration-card" >
                <IntegrationCard
                  name={integration.name}
                  icon={integration.icon}
                  description={integration.description}
                  category={integration.category}
                  link={integration.link}
                />
              </div>
              
            ))}

          </div>
        </div>
      </div>
    </section>
  );
};

RelatedIntegrations.displayName = 'RelatedIntegrations';

export default RelatedIntegrations;
