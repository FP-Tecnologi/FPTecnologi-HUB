'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { COTIZADOR_URL, HERO_SLIDES } from '@/lib/content';
import { HeroTabs } from '@/components/site/HeroTabs';

export function Hero5() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[active];

  return (
    <section id="inicio" className="relative overflow-hidden bg-ink pb-32 pt-16 text-white lg:pt-24">
      <div className="absolute -right-32 top-10 h-[420px] w-[420px] rounded-full bg-brand-primary/25 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6">
        <HeroTabs active={active} onChange={setActive} tone="dark" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pt-6 lg:grid-cols-2 lg:items-center">
        <div key={active} className="animate-fade-up">
          <p className="font-mono text-sm font-semibold text-brand-teal-light">// {slide.eyebrow.toUpperCase()}</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[1.1] sm:text-5xl">{slide.title}</h1>
          <p className="mt-6 max-w-md text-white/70">{slide.text}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={slide.cta.href} className="btn-sweep rounded-full bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white before:bg-brand-dark">
              {slide.cta.label}
            </a>
            <a href={COTIZADOR_URL} target="_blank" rel="noreferrer" className="btn-sweep rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white before:bg-white/10">
              Cotizar servicio
            </a>
          </div>
        </div>

        <div key={`visual-${active}`} className="animate-fade-up animate-float-slow relative mx-auto aspect-square w-full max-w-md">
          {slide.kind === 'photo' ? (
            <Image src={slide.image!} alt={slide.imageAlt} fill sizes="400px" className="object-contain drop-shadow-2xl" priority={active === 0} />
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
