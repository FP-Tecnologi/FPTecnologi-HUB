'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@riteflow/components/ui/button';
import { useWorkflowSectionAnimation } from '@riteflow/hooks/useWorkflowSectionAnimation';

export interface WorkflowSectionProps {
  /**
   * Section title
   */
  title?: string;
  /**
   * Section description text
   */
  description?: string;
  /**
   * CTA button text
   */
  buttonText?: string;
  /**
   * CTA button link
   */
  buttonLink?: string;
  /**
   * Workflow icons image path
   */
  workflowIconsImage?: string;
  /**
   * Alt text for workflow icons image
   */
  workflowIconsAlt?: string;
  /**
   * Background shape image path (bottom left)
   */
  backgroundShapeImage?: string;
  /**
   * Alt text for background shape
   */
  backgroundShapeAlt?: string;
  /**
   * Glow shape image path (top right)
   */
  glowShapeImage?: string;
  /**
   * Alt text for glow shape
   */
  glowShapeAlt?: string;
}

/**
 * WorkflowSection Component
 * 
 * Displays a workflow/integration section with app connections.
 * Features:
 * - Responsive card layout with background shapes
 * - Title, description, and CTA button
 * - Workflow icons image
 * - Decorative background shapes
 * 
 * All content is customizable via props with sensible defaults.
 * This is a client component due to potential interactions.
 * 
 * @param {string} title - Section title (default: 'Connect RiteFlow Seamlessly to Your Apps')
 * @param {string} description - Section description
 * @param {string} buttonText - CTA button text (default: 'Explore Integrations')
 * @param {string} buttonLink - CTA button link (default: '#')
 * @param {string} workflowIconsImage - Path to workflow icons image (default: '/images/home/workflow-icons.svg')
 * @param {string} workflowIconsAlt - Alt text for workflow icons (default: 'workflow-icons')
 * @param {string} backgroundShapeImage - Path to background shape image (default: '/images/home/workflow-shape.png')
 * @param {string} backgroundShapeAlt - Alt text for background shape (default: 'workflow-shape')
 * @param {string} glowShapeImage - Path to glow shape image (default: '/images/newsletter-top-glow-shape.png')
 * @param {string} glowShapeAlt - Alt text for glow shape (default: 'newsletter-shape')
 * 
 * @example
 * <WorkflowSection />
 * 
 * @example
 * <WorkflowSection 
 *   title="Custom Title"
 *   description="Custom description"
 *   buttonText="Learn More"
 * />
 */
const WorkflowSection: React.FC<WorkflowSectionProps> = ({
  title = 'Connect RiteFlow Seamlessly to Your Apps',
  description = 'Plug our AI into the tools you already love—Slack, Zapier, Salesforce, Notion, and more. Sync data instantly, automate platforms, and keep every workflow.',
  buttonText = 'Explore Integrations',
  buttonLink = '#',
  workflowIconsImage = '/images/home/workflow-icons.svg',
  workflowIconsAlt = 'workflow-icons',
  backgroundShapeImage = '/images/home/workflow-shape.png',
  backgroundShapeAlt = 'workflow-shape',
  glowShapeImage = '/images/newsletter-top-glow-shape.png',
  glowShapeAlt = 'newsletter-shape',
}) => {
  useWorkflowSectionAnimation();

  return (
    <section
      className="section-bottom-border"
      aria-label="Workflow integration section"
    >
      <div className="container">
        <div className="border-container section-spacing-lg">
          <div>
            <div
              className="bg-blue rounded-xl sm:rounded-2xl md:rounded-[20px] border border-lineColor/70 px-4 sm:px-6 md:px-9 pt-8 sm:pt-12 pb-10 sm:pb-20 md:pb-24 lg:pb-[150px] relative z-1 overflow-hidden flex items-center sm:items-start justify-between gap-10 flex-col sm:flex-row"
              data-container="apps-section"
            >
              {/* Content */}
              <div className="w-full max-w-[400px] sm:max-w-[590px] text-center sm:text-left">
                <h3
                  data-title
                  className="gradient-text !leading-[1.1] text-3xl md:text-4xl lg:text-5xl xl:text-[51px] font-semibold"
                >
                  {title}
                </h3>
                <p data-excerpt className="mt-4 sm:mt-5">
                  {description}
                </p>
                <div data-button className="mt-5 sm:mt-8 lg:mt-9">
                  <Button href={buttonLink} variant="primary" size="md">
                    {buttonText}
                  </Button>
                </div>
              </div>

              {/* Workflow Icons Image */}
              <div className="max-w-[351px] w-full" data-thumbnail>
                <Image
                  className="w-full"
                  src={workflowIconsImage}
                  alt={workflowIconsAlt}
                  width={351}
                  height={300}
                  loading="lazy"
                  data-lag="0.2"
                />
              </div>

              {/* Background Shapes */} 
              <div className="absolute bottom-0 left-0 w-full h-full -z-1">
                <div className="relative w-full h-full">
                  <Image
                    data-bg-shape
                    src={backgroundShapeImage}
                    alt={backgroundShapeAlt}
                    fill
                    className="object-contain object-left-bottom"
                    sizes="100vw"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <Image
                data-glow-shape
                src={glowShapeImage}
                alt={glowShapeAlt}
                width={300}
                height={300}
                className="absolute top-0 right-0 -z-1"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

WorkflowSection.displayName = 'WorkflowSection';

export default WorkflowSection;
