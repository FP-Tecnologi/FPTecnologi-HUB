import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import XIcon from '@riteflow/components/icons/XIcon';
import LinkedinIcon from '@riteflow/components/icons/LinkedinIcon';
import InstaIcon from '@riteflow/components/icons/InstaIcon';

export interface TeamCardProps {
  name: string;
  position: string;
  image: string;
  socialMedia: {
    platform: 'twitter' | 'linkedIn' | 'insta';
    link: string;
  };
}

/**
 * TeamCard Component
 * 
 * Displays a team member card with image, name, position, and social media link.
 * Features hover effects and gradient overlay animations.
 * 
 * @param {string} name - Team member's full name
 * @param {string} position - Team member's job title/position
 * @param {string} image - Path to team member's photo
 * @param {Object} socialMedia - Social media information
 * @param {'twitter' | 'linkedIn' | 'insta'} socialMedia.platform - Social platform type
 * @param {string} socialMedia.link - URL to social media profile
 * 
 * @example
 * <TeamCard
 *   name="Alex Chen"
 *   position="Chief Executive Officer"
 *   image="/images/about/team-01.jpg"
 *   socialMedia={{ platform: 'twitter', link: '#' }}
 * />
 */
// Icon mapping - maps platform to icon components
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  twitter: XIcon,
  linkedIn: LinkedinIcon,
  insta: InstaIcon,
};

const TeamCard: React.FC<TeamCardProps> = ({ name, position, image, socialMedia }) => {
  const IconComponent = iconMap[socialMedia.platform];
  const iconClassName = 'w-4.5 h-4.5 fill-current text-white';

  return (
    <div
      className="p-2.5 bg-blue rounded-20 border-moving relative before:rounded-xl sm:before:rounded-2xl md:before:rounded-[20px] group"
      data-sttr-card
    >
      {/* Image */}
      <div className="overflow-hidden rounded-20 aspect-[8/8.8]">
        <Image
          src={image}
          alt={`${name}, ${position}`}
          width={400}
          height={500}
          className="w-full h-full object-cover duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Card Info */}
      <div className="absolute w-full bottom-0 left-0 z-20 p-5">
        <div className="p-5 bg-blue rounded-20 flex items-center justify-between gap-5 w-full">
          <div className="flex-1">
            <h3 className="text-lg text-offWhite font-medium font-dmSans">{name}</h3>
            <p className="text-sm text-offWhite/60">{position}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={socialMedia.link}
              className="w-9 h-9 flex items-center justify-center bg-primary rounded-[10px]"
              aria-label={`Visit ${name}'s ${socialMedia.platform} profile`}
            >
              {IconComponent && <IconComponent className={iconClassName} />}
            </Link>
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute w-full h-full bottom-0 left-0 z-10 bg-linear-to-b from-secondary/0 to-secondary/50 duration-300 group-hover:h-0"></div>
    </div>
  );
};

TeamCard.displayName = 'TeamCard';

export default TeamCard;
