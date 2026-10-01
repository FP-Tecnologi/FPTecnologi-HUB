'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { COTIZADOR_URL, HERO_SLIDES } from '@/lib/content';
import { HeroTabs } from '@/components/site/HeroTabs';

export function Hero3() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[active];

  return (
    <section id="inicio" className="relative overflow-hidden bg-paper py-20 lg:py-28">
      <div
        className="absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full opacity-90 blur-2xl"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-teal-light))' }}
        aria-hidden
      />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden>
        <defs>
          <pattern id="diag" width="26" height="26" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="26" stroke="black" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag)" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-6">
        <HeroTabs active={active} onChange={setActive} tone="light" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pt-8 lg:grid-cols-2 lg:items-center">
        <div key={active} className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-primary">
            {slide.eyebrow}
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[1.1] text-ink sm:text-5xl">{slide.title}</h1>
          <p className="mt-6 max-w-lg text-base text-ink/60 sm:text-lg">{slide.text}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href={slide.cta.href} className="btn-sweep rounded-full bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white before:bg-brand-dark">
              {slide.cta.label}
            </a>
            <a href={COTIZADOR_URL} target="_blank" rel="noreferrer" className="btn-sweep rounded-full border border-ink/15 px-7 py-3.5 text-sm font-semibold text-ink before:bg-ink hover:text-white">
              Cotizar ahora
            </a>
          </div>
        </div>

        <div key={`visual-${active}`} className="animate-fade-up relative">
          <div className="animate-float-slow relative mx-auto aspect-square w-full max-w-md rounded-[2rem] bg-white p-10 shadow-2xl shadow-brand-primary/10 ring-1 ring-black/5">
            {slide.kind === 'photo' ? (
              <Image src={slide.image!} alt={slide.imageAlt} fill sizes="400px" className="object-contain p-6" priority={active === 0} />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="h-24 w-24 text-brand-primary/70">
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
