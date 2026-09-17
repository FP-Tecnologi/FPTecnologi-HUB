'use client';

import React from 'react';
import Image from 'next/image';
import { useStaggerAnimation } from '@riteflow/hooks/useStaggerAnimation';
export interface ClientLogosProps {
  title?: string;
  logos?: Array<{ src: string; alt: string }>;
}

/**
 * ClientLogos Component
 * 
 * Displays client logos in a responsive grid format. Logos are lazy-loaded
 * for better performance. Supports custom title and logo array via props.
 * 
 * @param {string} title - Optional title text above the logos
 * @param {Array<{src: string, alt: string}>} logos - Array of logo objects with src and alt
 * 
 * @example
 * <ClientLogos />
 * 
 * @example
 * <ClientLogos 
 *   title="Our Partners"
 *   logos={[{src: '/logo1.svg', alt: 'Company 1'}]}
 * />
 */
const ClientLogos: React.FC<ClientLogosProps> = ({
  title = 'Trusted by innovative teams',
  logos = [
    { src: '/images/client-logos/logo-01.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-02.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-03.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-04.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-05.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-06.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-07.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-08.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-01.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-02.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-03.svg', alt: 'client logo' },
    { src: '/images/client-logos/logo-04.svg', alt: 'client logo' },
  ],
}) => {
    // Custom options
    useStaggerAnimation({
      stagger: 0.1,
      duration: 0.8,
      waitForPreloader: false,
      start: 'top 70%',
    });
  return (
    <section className="section-bottom-border relative z-10" data-sttr-wrapper>
      <div className="container">
        <div className="border-container py-14 sm:py-16" data-sttr-card>
          <h2 className="text-xl leading-none font-normal font-dmSans text-offWhite/80 mb-8 text-center">
            {title}
          </h2>
          {/* Logos Grid */}
          <div className="grid grid-cols-3 md:flex items-center justify-center flex-wrap gap-6 sm:gap-10 md:gap-15">
            {logos.map((logo, index) => (
              <div key={index} className="flex items-center justify-center max-w-[80px] md:max-w-none mx-auto md:mx-0">
                <Image 
                  src={logo.src} 
                  alt={logo.alt} 
                  width={100} 
                  height={30}
                  loading="lazy"
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

ClientLogos.displayName = 'ClientLogos';

export default ClientLogos;
