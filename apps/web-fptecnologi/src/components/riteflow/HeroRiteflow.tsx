'use client';

import Image from 'next/image';
import { Instrument_Serif } from 'next/font/google';
import { STATS } from '@/lib/content';
import { useRiteflowReveal } from '@/hooks/useRiteflowReveal';

const accentFont = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic' });

/*
 * Hero portado de HomeV2Banner.tsx (plantilla Riteflow) -- misma estructura
 * y animación de entrada (GSAP timeline, ver useRiteflowReveal), contenido
 * 100% FPTecnologi. Cambios respecto al original:
 * - Sin video de fondo (era el demo de su producto IA) -- foto real de
 *   escritorio (ya licenciada en el Modelo 7), como "thumbnail" a la derecha.
 * - La lista de features del original eran cifras de revenue/growth
 *   inventadas ("$0 a $500,000 en ingresos") -- acá son 2 datos reales.
 */
export function HeroRiteflow() {
  useRiteflowReveal('[data-container="riteflow-hero"]', [
    '[data-subtitle]',
    '[data-title]',
    '[data-excerpt]',
    '[data-button]',
    '[data-list] li',
    '[data-thumbnail]',
  ]);

  return (
    <section
      className="relative overflow-hidden border-b border-[#2d3a57] bg-[#0e1422] py-16 sm:py-20 lg:py-[110px]"
      data-container="riteflow-hero"
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
          <div className="w-full md:max-w-[450px] lg:max-w-[570px]">
            <span
              data-subtitle
              className="inline-block rounded-[10px] border-[1.5px] border-[#a78bfa] bg-[#222938] px-3 py-1.5 text-sm font-medium tracking-[-0.1px] text-[#a78bfa]"
            >
              Distribución autorizada B2B
            </span>

            <h1
              data-title
              className="mt-5 text-[40px] font-semibold leading-[1.1] tracking-tight text-[#fbfbfb] sm:text-5xl lg:text-6xl xl:text-7xl"
              style={{
                background: 'linear-gradient(180deg, #f8f8f8 62.71%, #7670de 90.4%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Potenciá tu empresa con{' '}
              <em className={`${accentFont.className} italic font-medium`}>tecnología real</em>
            </h1>

            <p data-excerpt className="mt-2 text-base leading-normal text-[#fbfbfb]/80 sm:mt-5 sm:text-lg lg:text-xl">
              Monitores, laptops, servidores y pantallas interactivas con stock local y distribución autorizada —
              cotización sin compromiso para tu empresa.
            </p>

            <div data-button className="mt-5 flex flex-wrap gap-3 sm:mt-8 sm:gap-4 lg:mt-12">
              <a
                href="#catalogo"
                className="inline-flex items-center justify-center rounded-[10px] px-[22px] py-3 text-sm font-medium text-white transition-[background-position] duration-500"
                style={{
                  background: 'linear-gradient(to bottom, #7D76FF 0%, #2F27B1 51%, #7D76FF 100%)',
                  backgroundSize: 'auto 200%',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundPosition = 'bottom right'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundPosition = 'top left'; }}
              >
                Ver catálogo
              </a>
              <a
                href="#nosotros"
                className="inline-flex items-center justify-center rounded-[10px] border-[1.5px] border-[#a78bfa] bg-[#222938] px-[22px] py-3 text-sm font-medium text-[#a78bfa] transition-colors hover:bg-[#222938]/70"
              >
                Cotizar ahora
              </a>
            </div>

            <ul data-list className="mt-5 space-y-2.5 font-medium text-[#fbfbfb]/80 sm:mt-6 lg:mt-7">
              <li className="flex items-center gap-3">
                <CheckIcon />
                <span>{STATS[0].value}{STATS[0].suffix} {STATS[0].label.toLowerCase()}.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon />
                <span>{STATS[1].value} {STATS[1].label.toLowerCase()}, stock local real.</span>
              </li>
            </ul>
          </div>

          <div data-thumbnail className="w-full max-w-[500px] md:max-w-[608px]">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/images/modelo7/hero.jpg"
                alt="Escritorio de trabajo con monitor, laptop y teclado — equipamiento FPTecnologi"
                width={608}
                height={500}
                priority
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#a78bfa]/20 text-[#a78bfa]">
      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}
