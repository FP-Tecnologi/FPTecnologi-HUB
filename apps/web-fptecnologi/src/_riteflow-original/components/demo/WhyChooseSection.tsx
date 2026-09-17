'use client';

import React from 'react';
import Image from 'next/image';
import { whyChooseData } from '@riteflow/data/demoData';
import { useCounterAnimation } from '@riteflow/hooks/useCounterAnimation';
import { useSectionHeadingAnimation } from '@riteflow/hooks/useSectionHeadingAnimation';

function WhyChooseCard({ card }: { card: (typeof whyChooseData.cards)[0] }) {
  const { count: animatedCount, ref } = useCounterAnimation(
    card.isCounter && card.target != null ? card.target : null,
    2000
  );
  return (
    <div
      className={`p-4 sm:p-5 rounded-20 overflow-hidden grid sm:grid-cols-2 gap-6 relative z-1 border border-white/10 c-sttr-card ${card.fullWidth ? 'md:col-span-2' : ''}`} data-sttr-card
    >
      {card.isFigma ? (
        <>
          <Image
            className="absolute bottom-0 left-0 z-[-1] w-full h-full object-cover object-left-bottom"
            src="/images/demo/glow-shape-03.png"
            alt=""
            fill
            sizes="100vw"
            aria-hidden
          />
          <Image
            className="absolute bottom-0 right-0 z-[-1] object-contain object-right-bottom"
            src="/images/demo/glow-shape-02.png"
            alt=""
            width={200}
            height={200}
            aria-hidden
          />
          <div className="flex flex-col justify-between gap-5">
            <div className="w-16 h-16 bg-primary rounded-[15px] flex items-center justify-center">
              {card.figmaIcon && (
                <Image src={card.figmaIcon} alt="Figma" width={32} height={32} />
              )}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl md:text-[32px] font-medium">{card.title}</h3>
              <p className="mt-4 text-white/60">{card.description}</p>
            </div>
          </div>
          <div className="rounded-[18px] overflow-hidden" data-lag="0.05">
            <Image
              className="w-full h-auto"
              src={card.image}
              alt={card.alt}
              width={600}
              height={300}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </>
      ) : (
        <>
          <Image
            className="absolute bottom-0 left-0 z-[-1] w-full h-full object-cover object-left-bottom"
            src="/images/demo/glow-shape.png"
            alt=""
            fill
            sizes="100vw"
            aria-hidden
          />
          <div data-lag="0.05">
            <Image
              className="w-full h-auto"
              src={card.image}
              alt={card.alt}
              width={280}
              height={200}
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-3xl md:text-[32px] lg:text-[40px] font-semibold">
                {card.isCounter && card.target != null ? (
                  <>
                    <span ref={ref} className="counter" data-target={card.target}>
                      {animatedCount}
                    </span>
                    {card.countSuffix && <span className="text-tertiary">{card.countSuffix}</span>}
                  </>
                ) : (
                  <>
                    {card.count}
                    {card.countSuffix && <span className="text-tertiary">{card.countSuffix}</span>}
                  </>
                )}
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-white/80 tracking-[0.2px]">{card.title}</p>
            </div>
            <div className="gradient-border w-full h-[1px]" />
            <p className="text-white/60">{card.description}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function WhyChooseSection() {
  const { badge, title, excerpt, cards } = whyChooseData;
  
  useSectionHeadingAnimation();
  
  return (
    <section className="section-bottom-border">
      <div className="container">
        <div className="border-container section-spacing-lg" data-lag="0.1">
          <div>
            <div className="max-w-[450px] sm:max-w-[520px] lg:max-w-[600px] mx-auto text-center mb-10 sm:mb-12 md:mb-16 xl:mb-20" data-section-title>
              <span className="badge-button mb-5" data-subtitle>{badge}</span>
              <h2 className="gradient-text text-3xl sm:text-4xl lg:text-5xl xl:text-[51px] !leading-[1.2] font-semibold -tracking-[0.4px] overflow-hidden" data-title>
                {title}
              </h2>
              <p className="mt-4 md:mt-5 text-offWhite/80 overflow-hidden" data-excerpt>
                {excerpt}
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5 choose-us" data-sttr-wrapper>
            {cards.map((card, i) => (
              <WhyChooseCard key={i} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
