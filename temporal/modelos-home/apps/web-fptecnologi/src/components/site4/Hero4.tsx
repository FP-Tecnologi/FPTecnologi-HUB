'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { COTIZADOR_URL, HERO_SLIDES } from '@/lib/content';
import { HeroTabs } from '@/components/site/HeroTabs';

export function Hero4() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[active];

  return (
    <section id="inicio" className="brand-mesh relative flex min-h-[92vh] items-center overflow-hidden text-white">
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
        <defs>
          <pattern id="lines4" width="46" height="46" patternUnits="userSpaceOnUse">
            <circle cx="1.4" cy="1.4" r="1.4" fill="white" />
            <path d="M0 23h46M23 0v46" stroke="white" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lines4)" />
      </svg>

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div key={active} className="animate-fade-up">
          <HeroTabs active={active} onChange={setActive} tone="dark" />
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">{slide.title}</h1>
          <p className="mt-6 max-w-md text-base text-white/75 sm:text-lg">{slide.text}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={slide.cta.href} className="btn-sweep rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-dark before:bg-brand-teal-light before:opacity-30">
              {slide.cta.label}
            </a>
            <a href={COTIZADOR_URL} target="_blank" rel="noreferrer" className="btn-sweep rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white before:bg-white/10">
              Cotizar servicio
            </a>
          </div>
        </div>

        <div key={`visual-${active}`} className="animate-fade-up animate-float-slow relative mx-auto aspect-4/5 w-full max-w-sm">
          {slide.kind === 'photo' ? (
            <Image src={slide.image!} alt={slide.imageAlt} fill sizes="380px" className="object-contain drop-shadow-2xl" priority={active === 0} />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[2.5rem] border border-white/20 bg-white/5">
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
    </section>
  );
}
