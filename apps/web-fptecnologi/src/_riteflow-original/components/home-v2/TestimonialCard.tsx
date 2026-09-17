import React from 'react';
import Image from 'next/image';
import { TestimonialItem } from '@riteflow/data/testimonialData';

export interface TestimonialCardProps {
  /**
   * Testimonial data object containing id, name, role, image, and text
   */
  testimonial: TestimonialItem;
  /**
   * Custom className for the card container
   */
  className?: string;
}

/**
 * TestimonialCard Component
 * 
 * A reusable testimonial card component that displays user review information.
 * Features:
 * - User profile image
 * - User name and role
 * - Testimonial text
 * - Gradient border separator
 * 
 * @example
 * <TestimonialCard 
 *   testimonial={{
 *     id: 1,
 *     name: 'John Doe',
 *     role: 'CEO',
 *     image: '/path/to/image.jpg',
 *     text: 'Great product!'
 *   }}
 * />
 */
const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  className = '',
}) => {
  return (
    <div className={className}>
      <div className="px-5 pt-5 pb-6 md:pb-10 bg-blue rounded-xl sm:rounded-2xl lg:rounded-[20px] border border-lineColor/70 relative h-full">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <Image
            className="w-10.5 h-10.5 object-cover rounded-full"
            src={testimonial.image}
            alt={`${testimonial.name}, ${testimonial.role}`}
            width={42}
            height={42}
            loading="lazy"
          />
          <div className="flex-1">
            <h3 className="font-dmSans text-offWhite text-base leading-tight font-normal">
              {testimonial.name}
            </h3>
            <p className="text-offWhite/60 text-sm leading-tight mt-1">
              {testimonial.role}
            </p>
          </div>
        </div>

        {/* Gradient Border Separator */}
        <div className="my-4 md:my-5 lg:my-6 gradient-border w-full h-px"></div>

        {/* Testimonial Text */}
        <p className="text-offWhite">{testimonial.text}</p>
      </div>
    </div>
  );
};

TestimonialCard.displayName = 'TestimonialCard';

export default TestimonialCard;
