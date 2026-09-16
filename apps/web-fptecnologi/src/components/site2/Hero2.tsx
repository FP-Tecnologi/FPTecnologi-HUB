'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { HERO_SLIDES } from '@/lib/content';
import { HeroTabs } from '@/components/site/HeroTabs';

export function Hero2() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[active];

  return (
    <section id="inicio" className="relative overflow-hidden bg-ink pt-40 pb-24 text-white lg:pt-48">
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute -right-40 -top-40 h-[560px] w-[560px] animate-zoom-slow rounded-full bg-brand-primary/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-brand-teal/15 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.08]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.4" fill="white" />
            </pattern>
          </defs>
          <rect width="800" height="600" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <HeroTabs active={active} onChange={setActive} tone="dark" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pt-8 lg:grid-cols-2 lg:items-center">
        <div key={active} className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-teal-light ring-1 ring-white/20">
            {slide.eyebrow}
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold uppercase leading-[1.1] sm:text-5xl lg:text-6xl">{slide.title}</h1>
          <p className="mt-6 max-w-lg text-base text-white/70 sm:text-lg">{slide.text}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href={slide.cta.href} className="btn-sweep rounded-full bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white before:bg-brand-dark">
              {slide.cta.label}
            </a>
            <a href="#nosotros" className="btn-sweep rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white before:bg-white/10">
              Conocer más
            </a>
          </div>
        </div>

        <div key={`visual-${active}`} className="animate-fade-up relative hidden lg:block">
          <div className="animate-float-slow relative mx-auto aspect-square w-full max-w-md">
            {slide.kind === 'photo' ? (
              <Image src={slide.image!} alt={slide.imageAlt} fill priority={active === 0} sizes="400px" className="object-contain drop-shadow-2xl" />
            ) : (
              <div className="absolute inset-10 flex items-center justify-center rounded-[2.5rem] border border-white/20 bg-white/5">
                <svg viewBox="0 0 24 24" fill="none" className="h-24 w-24 text-white/80">
                  <path
                    d="M8.5 12.5 11 15l4.5-4.5M5 8l3-3 3 2 3-2 5 5-3 3M5 8l4 12 3-2 3 2 4-12"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
