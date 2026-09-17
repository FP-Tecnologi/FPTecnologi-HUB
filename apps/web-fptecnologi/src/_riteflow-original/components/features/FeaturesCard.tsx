import React from 'react';
import Image from 'next/image';
export interface FeaturesCardProps {
  title: string;
  description: string;
  image: string;
  size: 'lg' | 'md' | 'sm';
}

const FeaturesCard: React.FC<FeaturesCardProps> = ({
  title,
  description,
  image,
  size,
}) => {
  const sizeClasses = {
    lg: 'sm:max-w-[699px]',
    md: 'sm:max-w-[481px]',
    sm: 'sm:max-w-[339px]',
  };

  // Size-specific aspect ratios and image classes
  const imageContainerClasses = {
    lg: 'aspect-[16/9] sm:aspect-[16/6.8]',
    md: 'aspect-[16/9] sm:aspect-[16/9.3]', 
    sm: 'aspect-[16/9] sm:aspect-[8/6.8]', 
  };

  return (
    <div className={`${sizeClasses[size]} w-full`} data-sttr-card>
      <div className="p-4 sm:p-5 rounded-20 border border-lineColor/70 bg-linear-to-b from-slateBlue/20 to-royalBlue/20 relative z-1 overflow-hidden h-full">
        {/* Background Glow */}
        <Image
          src="/images/features/feature-glow.png"
          alt=""
          width={700}
          height={500}
          className="absolute bottom-0 left-0 -z-1 w-full h-full object-cover"
          aria-hidden="true"
        />

        {/* Image */}
        <div className="overflow-hidden rounded-xl md:rounded-2xl">
          <div className={`border border-lineColor/70 rounded-xl md:rounded-2xl ${imageContainerClasses[size]}`} data-lag="0.1">
            <Image
              src={image}
              alt={title}
              width={699}
              height={400}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Content */}
        <div className="pt-5 md:py-5">
          <h3 className="text-xl !leading-tight font-medium sm:tracking-[0.2px] text-offWhite">
            {title}
          </h3>
          <div className="my-4 gradient-border w-full h-[1px]"></div>
          <p className="text-offWhite/60">{description}</p>
        </div>
      </div>
    </div>
  );
};

FeaturesCard.displayName = 'FeaturesCard';

export default FeaturesCard;
