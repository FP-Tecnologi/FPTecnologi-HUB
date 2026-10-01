'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { COTIZADOR_URL, HERO_SLIDES } from '@/lib/content';
import { HeroTabs } from '@/components/site/HeroTabs';

export function Hero6() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[active];

  return (
    <section id="inicio" className="relative overflow-hidden bg-paper py-20 lg:py-28">
      <div className="relative mx-auto max-w-7xl px-6">
        <HeroTabs active={active} onChange={setActive} tone="light" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pt-8 lg:grid-cols-2 lg:items-center">
        <div key={active} className="animate-fade-up">
          <span className="text-sm font-bold uppercase tracking-wide text-brand-primary">{slide.eyebrow}</span>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.15] text-ink sm:text-5xl">{slide.title}</h1>
          <p className="mt-6 max-w-md text-base text-ink/60 sm:text-lg">{slide.text}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={slide.cta.href} className="btn-sweep rounded-full bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white before:bg-brand-dark">
              {slide.cta.label}
            </a>
            <a href={COTIZADOR_URL} target="_blank" rel="noreferrer" className="btn-sweep rounded-full border border-ink/15 px-7 py-3.5 text-sm font-semibold text-ink before:bg-ink hover:text-white">
              Cotizar servicio
            </a>
          </div>
        </div>

        <div key={`visual-${active}`} className="animate-fade-up relative mx-auto aspect-square w-full max-w-md">
          <div className="animate-float-slow absolute inset-0 overflow-hidden shadow-2xl" style={{ borderRadius: '62% 38% 34% 66% / 58% 32% 68% 42%' }}>
            <div className="brand-mesh absolute inset-0" />
            {slide.kind === 'photo' ? (
              <Image src={slide.image!} alt={slide.imageAlt} fill sizes="400px" className="object-contain p-10 drop-shadow-2xl" priority={active === 0} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="h-20 w-20 text-white/85">
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
          <div
            className="absolute -inset-3 -z-10 opacity-40"
            style={{
              borderRadius: '62% 38% 34% 66% / 58% 32% 68% 42%',
              background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-teal-light))',
            }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
