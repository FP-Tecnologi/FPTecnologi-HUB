import React from 'react';
import UseCaseCard from './UseCaseCard';
import { useCaseData } from '@riteflow/data/useCaseData';
import SectionBanner from '../shortCode/SectionBanner';

/**
 * UseCaseSection Component
 * 
 * Displays use case section with all use case cards in a responsive grid.
 * Shows all use cases from useCaseData.
 * 
 * Uses existing UseCaseCard component for consistency.
 * 
 * @example
 * <UseCaseSection />
 * <UseCaseSection variant="two" />
 */

export interface UseCaseSectionProps {
  variant?: 'one' | 'two';
}



const UseCaseSection: React.FC<UseCaseSectionProps> = ({ variant = 'one' }) => {
  // Safety check: ensure data exists
  if (!useCaseData || useCaseData.length === 0) {
    return null;
  }

  return (
    <section className="section-bottom-border relative z-1">
    <div className="container">
      <div className="border-container section-spacing-lg">
        <SectionBanner 
        variant={variant}
        outlineButtonText="Use Cases"
        title="Powerful AI solutions built for modern teams."
        description="Riteflow combines smart automation, analytics, and real-time insights to streamline how your team works — no matter the industry or size." 
        />

    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-sttr-wrapper>
      {useCaseData.map((useCase) => (
        <UseCaseCard key={useCase.id} useCase={useCase} />
      ))}
    </div>


    </div>
        </div>
    </section>


  );
};

UseCaseSection.displayName = 'UseCaseSection';

export default UseCaseSection;
