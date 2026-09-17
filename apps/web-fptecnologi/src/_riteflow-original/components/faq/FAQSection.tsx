'use client';

import React, { useState } from 'react';
import Heading from '@riteflow/components/ui/heading';
import FAQItem from './FAQItem';
import type { FAQItem as FAQItemType } from '@riteflow/data/faqData';
import SectionBanner from '../shortCode/SectionBanner';

export interface FAQSectionProps {
  title: string;
  description?: string;
  faqData: FAQItemType[];
  className?: string;
}

const FAQSection: React.FC<FAQSectionProps> = ({
  title,
  description,
  faqData,
  className = '',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`section-bottom-border relative z-1 ${className}`}>
      <div className="container">
        <div className="border-container section-spacing-lg">

          {/* Section Banner */}
          <SectionBanner> 
            <Heading as="h2" className='!leading-[1.1]' data-title>{title}</Heading>
            {description && (
              <p className="mt-4 md:mt-5 text-offWhite/80 overflow-hidden" data-excerpt>
                {description}
              </p>
            )}
          </SectionBanner>

          {/* FAQ Accordion */}
          <div className="flex flex-col gap-5 faq-wrapper" data-sttr-wrapper>
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

FAQSection.displayName = 'FAQSection';

export default FAQSection;
