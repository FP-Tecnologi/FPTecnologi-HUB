import React from 'react';
import SectionBanner from '@riteflow/components/shortCode/SectionBanner';
import TeamCard from './TeamCard';
import { teamMembers } from '@riteflow/data/aboutData';
import Heading from '../ui/heading';

/**
 * TeamSection Component
 * 
 * Displays team section with title, description, and team member cards.
 * Fetches team data internally from aboutData.ts.
 * 
 * @example
 * <TeamSection />
 */
const TeamSection: React.FC = () => {

  // Safety check: ensure data exists
  if (!teamMembers || teamMembers.length === 0) {
    return null;
  }

  return (
    <section className="section-bottom-border relative z-1">
      <div className="container">
        <div className="border-container section-spacing-lg">
          {/* Section Title */}
          <SectionBanner>
            <Heading as="h2" className="!leading-[1.2]" data-title>
              Our Team
            </Heading>
            <p className="mt-4 md:mt-5 text-offWhite/80 overflow-hidden" data-excerpt>
              A passionate group of innovators, designers, and AI experts dedicated to shaping the future of intelligent, efficient, and human-centered work.
            </p>
          </SectionBanner>

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-sttr-wrapper>
            {teamMembers.map((member) => (
              <TeamCard
                key={member.id}
                name={member.name}
                position={member.position}
                image={member.image}
                socialMedia={member.socialMedia}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

TeamSection.displayName = 'TeamSection';

export default TeamSection;
