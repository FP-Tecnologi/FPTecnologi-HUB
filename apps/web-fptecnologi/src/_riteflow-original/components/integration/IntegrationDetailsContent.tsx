import React from 'react';
import Image from 'next/image';

export interface IntegrationDetailsContentProps {
  title: string;
  paragraphs: string[];
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
  codeBlock?: {
    language: string;
    code: string;
  };
  features?: Array<{
    title: string;
    description: string;
  }>;
  featuresSectionTitle?: string;
}

/**
 * IntegrationDetailsContent Component
 * 
 * Article content section for integration details with paragraphs, images, code blocks, and features.
 * 
 * @example
 * <IntegrationDetailsContent
 *   title="Seamless Productivity..."
 *   paragraphs={["...", "..."]}
 *   image={{ src: "...", alt: "..." }}
 * />
 */
const IntegrationDetailsContent: React.FC<IntegrationDetailsContentProps> = ({
  title,
  paragraphs,
  image,
  codeBlock,
  features,
  featuresSectionTitle = 'What This Integration Unlocks',
}) => {
  return (
    <article className="article-content">
      <h5>{title}</h5>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}

      {image && (
        <figure>
          <Image src={image.src} alt={image.alt} width={793} height={500} className="w-full" />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      )}

      {codeBlock && (
        <pre>
          <code>{codeBlock.code}</code>
        </pre>
      )}

      {features && features.length > 0 && (
        <>
          <h5>{featuresSectionTitle}</h5>
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              <h6>✅ {feature.title}</h6>
              <p>{feature.description}</p>
            </React.Fragment>
          ))}
        </>
      )}
    </article>
  );
};

IntegrationDetailsContent.displayName = 'IntegrationDetailsContent';

export default IntegrationDetailsContent;
