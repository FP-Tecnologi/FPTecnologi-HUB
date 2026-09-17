'use client';

import React from 'react';
import Link from 'next/link';
import { homepagesData } from '@riteflow/data/demoData';
import ArrowTopRight from '@riteflow/components/icons/ArrowTopRight';
import { useSectionHeadingAnimation } from '@riteflow/hooks/useSectionHeadingAnimation';

export default function HomepagesSection() {
  useSectionHeadingAnimation();
  return (
    <section id="home" className="section-bottom-border">
      <div className="container">
        <div className="border-container section-spacing-lg">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 xl:mb-20" data-section-title>
            <span className="demoGradient-text text-5xl sm:text-6xl md:text-7xl lg:text-[80px] tracking-[-1.2px] font-urbanist font-semibold inline-block" data-subtitle>
              02
            </span>
            <h2 className="gradient-text text-3xl sm:text-4xl lg:text-5xl xl:text-[51px] !leading-[1.2] font-semibold -tracking-[0.4px]" data-title>
              Homepages
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 choose-us" data-sttr-wrapper>
            {homepagesData.map((item) => (
              <div
                key={item.href}
                className="p-4 sm:p-5 bg-blue rounded-20 border border-lineColor/70 relative group border-moving before:rounded-xl sm:before:rounded-2xl lg:before:rounded-[20px] z-1 useCase-card"
                data-sttr-card
              >
                <Link href={item.href} className="block" aria-label={`View ${item.title}`}>
                  <div
                    className="h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[690px] demo-home-card rounded-xl md:rounded-[18px] overflow-hidden"
                    style={{ backgroundImage: `url('${item.image}')` }}
                    aria-hidden
                  />
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
