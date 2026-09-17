'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { innerPagesData } from '@riteflow/data/demoData';
import ArrowTopRight from '@riteflow/components/icons/ArrowTopRight';
import { useSectionHeadingAnimation } from '@riteflow/hooks/useSectionHeadingAnimation';

export default function InnerPagesSection() {
  useSectionHeadingAnimation();
  return (
    <section id="inner" className="section-bottom-border">
      <div className="container">
        <div className="border-container section-spacing-lg">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 xl:mb-20" data-section-title>
            <span className="demoGradient-text text-5xl sm:text-6xl md:text-7xl lg:text-[80px] tracking-[-1.2px] font-urbanist font-semibold inline-block" data-subtitle>
              15+
            </span>
            <h2 className="gradient-text text-3xl sm:text-4xl lg:text-5xl xl:text-[51px] !leading-[1.2] font-semibold -tracking-[0.4px]" data-title>
              Inner Pages
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-sttr-wrapper>
            {innerPagesData.map((item, index) => (
              <div
                key={`${item.href}-${index}`}
                className="data-lag-card p-4 md:p-5 bg-blue rounded-20 border border-lineColor/70 relative group border-moving before:rounded-xl sm:before:rounded-2xl lg:before:rounded-[20px] z-1 useCase-card"
                data-sttr-card
              >
                <Link href={item.href} className="block" aria-label={`View ${item.title}`}>
                  <div className="overflow-hidden rounded-xl md:rounded-[18px]">
                    <Image
                      className="w-full h-auto"
                      src={item.image}
                      alt={item.alt}
                      width={400}
                      height={250}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex justify-between items-center gap-2 mt-5">
                    <p className="text-lg sm:text-xl font-medium text-white">{item.title}</p>
                    <div className="w-11 h-9 flex items-center justify-center bg-linear-to-b from-slateBlue/20 to-royalBlue/20 rounded-[10px] relative overflow-hidden">
                      <ArrowTopRight className="w-6 h-6 fill-current text-white transition-all duration-300 ease-in-out group-hover:translate-x-6 group-hover:-translate-y-5 group-hover:opacity-0" />
                      <ArrowTopRight className="w-6 h-6 fill-current text-white absolute transform -translate-x-6 translate-y-5 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:-translate-y-0 opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
