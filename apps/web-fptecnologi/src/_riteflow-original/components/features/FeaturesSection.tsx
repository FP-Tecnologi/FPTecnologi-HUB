import React from 'react';
import SectionBanner from '@riteflow/components/shortCode/SectionBanner';
import FeaturesCard from './FeaturesCard';
import { featuresData } from '@riteflow/data/featuresData';

export interface FeaturesSectionProps {
  variant?: 'one' | 'two';
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ variant = 'one' }) => {
  const firstRow = featuresData.filter((feature) => 
    feature.id === 1 || feature.id === 2
  );
  
  const secondRow = featuresData.filter((feature) =>
    feature.id === 3 || 
    feature.id === 4 || 
    feature.id === 5
  );

  // Safety check: ensure data exists
  if (!featuresData || featuresData.length === 0) {
    return null;
  }

  return (
    <section className="section-bottom-border relative z-1">
      <div className="container">
        <div className="border-container section-spacing-lg">
          {/* Section Banner */}
          <SectionBanner
            variant={variant}
            outlineButtonText="Why Choose RiteFlow"
            title="Intuitive AI That Works Beside You, Seamlessly"
            description="Our AI tools are built to simplify work, spark ideas, and scale with you. From automation to insights, explore the benefits that set RiteFlow apart."
          />

          {/* Features Grid */}
          <div className="flex flex-col gap-5">
            {/* First Row */}
            <div className="grid sm:grid-cols-2 lg:flex gap-5" data-sttr-wrapper>
              {firstRow.map((feature) => (
                <FeaturesCard
                  key={feature.id}
                  title={feature.title}
                  description={feature.description}
                  image={feature.image}
                  size={feature.size}
                />
              ))}
            </div>

            {/* Second Row */}
            <div className="grid sm:grid-cols-2 md:flex gap-5" data-sttr-wrapper>
              {secondRow.map((feature) => (
                <FeaturesCard
                  key={feature.id}
                  title={feature.title}
                  description={feature.description}
                  image={feature.image}
                  size={feature.size}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;
