'use client';

import React from 'react';
import Image from 'next/image';
import Heading from '@riteflow/components/ui/heading';
import { Button } from '@riteflow/components/ui/button';
import UseCaseStats from './UseCaseStats';
import { useSectionHeadingAnimation } from '@riteflow/hooks/useSectionHeadingAnimation';
import { useStaggerAnimation } from '@riteflow/hooks/useStaggerAnimation';
import type { UseCase } from '@riteflow/data/useCaseData';
import type { UseCaseDetails } from '@riteflow/data/useCaseDetailsData';

interface UseCaseDetailsClientProps {
  useCase: UseCase;
  useCaseDetails: UseCaseDetails;
}

export default function UseCaseDetailsClient({
  useCase,
  useCaseDetails,
}: UseCaseDetailsClientProps) {
  // Initialize animations
  useSectionHeadingAnimation();
  useStaggerAnimation();

  return (
    <>
      {/* Use Case Details Area Start */}
      <section className="section-bottom-border relative z-1">
        <div className="container">
          <div className="border-container section-spacing-lg" data-sttr-wrapper>
            {/* Header Section */}
            <div className="text-center max-w-[600px] mx-auto" data-section-title>
              <div data-subtitle>
                <Button variant="outline" className="mb-5">
                    Use Case Details
                </Button>
              </div>
              <Heading as="h1" className="!leading-[1.2]" data-title>
                {useCase.title}
              </Heading>
              <p className="mt-4 md:mt-5 text-offWhite/80" data-excerpt>
                {useCase.description}
              </p>
            </div>

            {/* Stats Section */}
            {useCaseDetails.stats && <UseCaseStats stats={useCaseDetails.stats} />}

            {/* Content Section */}
            {useCaseDetails.content && useCaseDetails.content.length > 0 && (
              <>
                <div className="my-8 sm:my-10 md:my-13 gradient-border max-w-[320px] mx-auto w-full h-[1px]" data-sttr-card></div>
                <div className="max-w-[793px] mx-auto" data-sttr-card>
                  <article className="article-content">
                    {useCaseDetails.content.map((section, index) => (
                      <React.Fragment key={index}>
                        <h2 className="text-2xl sm:!text-[32px] !leading-[1.2]">{section.heading}</h2>
                        {section.paragraphs.map((paragraph, pIndex) => (
                          <p key={pIndex}>{paragraph}</p>
                        ))}
                        {section.listItems && section.listItems.length > 0 && (
                          <ul>
                            {section.listItems.map((item, liIndex) => (
                              <li key={liIndex}>{item}</li>
                            ))}
                          </ul>
                        )}
                        {section.image && (
                          <figure>
                            <Image
                              src={section.image.src}
                              alt={section.image.alt}
                              width={1200}
                              height={600}
                              className="w-full h-auto rounded-[10px]"
                            />
                            {section.image.caption && (
                              <figcaption className="mt-3 text-center text-offWhite/60 text-sm">
                                {section.image.caption}
                              </figcaption>
                            )}
                          </figure>
                        )}
                      </React.Fragment>
                    ))}
                  </article>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      {/* Use Case Details Area End */}
    </>
  );
}

