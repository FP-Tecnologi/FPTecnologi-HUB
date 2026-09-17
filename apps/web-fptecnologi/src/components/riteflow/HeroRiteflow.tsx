'use client';

import Image from 'next/image';
import { Instrument_Serif } from 'next/font/google';
import { useEffect, useState } from 'react';
import { COTIZADOR_URL, HERO_SLIDES } from '@/lib/content';
import { useRiteflowReveal } from '@/hooks/useRiteflowReveal';

const accentFont = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic' });

/*
 * Hero portado de HomeV2Banner.tsx (plantilla Riteflow) -- misma estructura
 * y animación de entrada (GSAP timeline, ver useRiteflowReveal). A partir de
 * la estructura final acordada, es "hero de 3": rota entre los 3 HERO_SLIDES
 * reales de content.ts (Servicios/Tienda/Partners), mismo estilo visual del
 * template, sin video de fondo (el original era el demo de su producto IA).
 * El GSAP timeline solo corre una vez al montar (revela el marco del hero);
 * el cambio de slide es un fade CSS simple (`animate-fade-up` + `key`), igual
 * al patrón ya usado en site/Hero.tsx para el mismo HERO_SLIDES.
 */
export function HeroRiteflow() {
  const [active, setActive] = useState(0);

  useRiteflowReveal('[data-container="riteflow-hero"]', [
    '[data-tabs]',
    '[data-subtitle]',
    '[data-title]',
    '[data-excerpt]',
    '[data-button]',
    '[data-list] li',
    '[data-thumbnail]',
  ]);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[active];

  return (
    <section
      className="relative overflow-hidden border-b border-[#2d3a57] bg-[#0e1422] py-16 sm:py-20 lg:py-[110px]"
      data-container="riteflow-hero"
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <div data-tabs role="tablist" aria-label="Elegí qué buscás" className="mb-8 inline-flex w-fit gap-1 rounded-full border-[1.5px] border-[#2181af]/40 bg-[#1c2a38] p-1">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                i === active ? 'bg-[#2181af] text-[#0e1422]' : 'text-[#fbfbfb]/60 hover:text-[#fbfbfb]'
              }`}
            >
              {s.tabLabel}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
          <div key={active} className="animate-fade-up w-full md:max-w-[450px] lg:max-w-[570px]">
            <span
              data-subtitle
              className="inline-block rounded-[10px] border-[1.5px] border-[#2181af] bg-[#1c2a38] px-3 py-1.5 text-sm font-medium tracking-[-0.1px] text-[#2181af]"
            >
              {slide.eyebrow}
            </span>

            <h1
              data-title
              className="mt-5 text-[40px] font-semibold leading-[1.1] tracking-tight text-[#fbfbfb] sm:text-5xl lg:text-6xl xl:text-7xl"
              style={{
                background: 'linear-gradient(180deg, #f8f8f8 62.71%, #2181af 90.4%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {slide.title}
            </h1>

            <p data-excerpt className="mt-2 text-base leading-normal text-[#fbfbfb]/80 sm:mt-5 sm:text-lg lg:text-xl">
              {slide.text}
            </p>

            <div data-button className="mt-5 flex flex-wrap gap-3 sm:mt-8 sm:gap-4 lg:mt-12">
              <a
                href={slide.cta.href}
                className="inline-flex items-center justify-center rounded-[10px] px-[22px] py-3 text-sm font-medium text-white transition-[background-position] duration-500"
                style={{
                  background: 'linear-gradient(to bottom, #18778b 0%, #155382 51%, #18778b 100%)',
                  backgroundSize: 'auto 200%',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundPosition = 'bottom right'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundPosition = 'top left'; }}
              >
                {slide.cta.label}
              </a>
              <a
                href={COTIZADOR_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-[10px] border-[1.5px] border-[#2181af] bg-[#1c2a38] px-[22px] py-3 text-sm font-medium text-[#2181af] transition-colors hover:bg-[#1c2a38]/70"
              >
                Cotizar ahora
              </a>
            </div>
          </div>

          <div key={`visual-${active}`} className="animate-fade-up w-full max-w-[500px] md:max-w-[608px]" data-thumbnail>
            {slide.kind === 'photo' ? (
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src={slide.image!}
                  alt={slide.imageAlt}
                  width={608}
                  height={500}
                  priority={active === 0}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[608/500] w-full items-center justify-center rounded-2xl border border-[#2d3a57] bg-gradient-to-b from-[#18778b]/15 to-[#155382]/15">
                <svg viewBox="0 0 24 24" fill="none" className="h-24 w-24 text-[#2181af]">
                  <path
                    d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm11 18v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"
                    stroke="currentColor"
                    strokeWidth="1.4"
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

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2181af]/20 text-[#2181af]">
      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}
