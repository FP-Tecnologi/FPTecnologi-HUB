'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { HERO_SLIDES } from '@/lib/content';

/* Carrusel con flechas + puntos (referencia: tienda gaming) -- reusa los 3
   HERO_SLIDES reales (Servicios/Tienda/Partners) en vez de banners de
   producto inventados. */
export function Hero11() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[active];
  const go = (dir: 1 | -1) => setActive((v) => (v + dir + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <section id="inicio" className="mx-auto max-w-7xl px-6 pt-6">
      <div className="relative flex min-h-[380px] items-center overflow-hidden rounded-3xl bg-[#151225] text-white sm:min-h-[440px]">
        {slide.kind === 'photo' && (
          <Image key={slide.key} src={slide.image!} alt={slide.imageAlt} fill sizes="100vw" className="object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#151225] via-[#151225]/80 to-transparent" />

        <div key={active} className="relative max-w-lg px-8 sm:px-14">
          <span className="text-xs font-semibold uppercase tracking-wide text-violet-400">Nueva colección {slide.tabLabel}</span>
          <h1 className="mt-3 text-3xl font-bold leading-[1.1] sm:text-4xl">{slide.title}</h1>
          <p className="mt-4 max-w-sm text-sm text-white/60">{slide.text}</p>
          <a href={slide.cta.href} className="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500">
            {slide.cta.label}
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>

        <button type="button" onClick={() => go(-1)} aria-label="Anterior" className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Siguiente" className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={`Ir a ${s.tabLabel}`}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-violet-400' : 'w-2 bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
