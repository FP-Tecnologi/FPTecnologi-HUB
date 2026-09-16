'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { HERO_SLIDES } from '@/lib/content';

export function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[active];

  return (
    <section id="inicio" className="brand-mesh relative overflow-hidden text-white">
      <div className="absolute inset-0 opacity-[0.15]" aria-hidden>
        <svg className="h-full w-full" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="800" height="800" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-10 sm:pt-14">
        {/* Pestañas SIEMPRE visibles y con nombre — no puntos ciegos: cada
            audiencia se identifica al instante, sin esperar a que rote. */}
        <div role="tablist" aria-label="Elegí qué buscás" className="inline-flex gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                i === active ? 'bg-white text-brand-dark' : 'text-white/70 hover:text-white'
              }`}
            >
              {s.tabLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-2 lg:items-center lg:pb-28 lg:pt-12">
        <div key={active} className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white ring-1 ring-white/25">
            {slide.eyebrow}
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] sm:text-5xl">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/75 sm:text-lg">{slide.text}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={slide.cta.href}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-dark shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
            >
              {slide.cta.label}
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#nosotros"
              className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M12 8v5m0 3h.01M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Conocer más
            </a>
          </div>
        </div>

        <div key={`visual-${active}`} className="animate-fade-up relative hidden lg:block">
          <div className="animate-float-slow relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-8 rounded-full bg-brand-teal-light/25 blur-3xl" aria-hidden />

            {slide.kind === 'photo' ? (
              <div className="absolute inset-6">
                <Image src={slide.image!} alt={slide.imageAlt} fill sizes="400px" className="object-contain drop-shadow-2xl" priority={active === 0} />
              </div>
            ) : (
              <div className="absolute inset-6 flex items-center justify-center rounded-[2.5rem] border border-white/20 bg-white/5">
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

            <div className="absolute -left-6 top-6 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-brand-dark shadow-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold">{slide.key === 'tienda' ? 'Stock disponible' : slide.key === 'servicios' ? 'Soporte especializado' : 'Cupos abiertos'}</span>
            </div>
            <div className="absolute -right-4 bottom-10 rounded-xl bg-white px-4 py-3 text-brand-dark shadow-xl">
              <p className="text-lg font-bold leading-none">+13</p>
              <p className="text-[11px] text-ink/60">marcas aliadas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
