'use client';

import React from 'react';
import type { FAQItem } from '@riteflow/data/faqData';

interface FAQItemProps extends FAQItem {
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => {

  return (
    <div className={`single-faq p-4 sm:p-5 rounded-20 border border-lineColor/70 bg-blue ${
        isOpen ? 'active' : ''
      }`} data-sttr-card>
      <div className="faq-head cursor-pointer duration-300 flex items-center justify-between gap-5"
        onClick={onToggle}>
        <button className="font-medium text-lg sm:text-xl text-left text-offWhite font-dmSans cursor-pointer">
          {question}
        </button>
        <div className={`plus ${isOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
        </div>
      </div>
      <div 
        className={`faq-body grid transition-all duration-500 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 sm:mt-5 sm:max-w-[90%]">
            <p className="text-offWhite/60">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQItem;

