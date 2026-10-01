'use client';

import { SOLUTIONS } from '@/lib/content';
import { Icon } from '@/components/site/Icon';
import { useRiteflowStagger } from '@/hooks/useRiteflowStagger';

/* "Servicios" de la estructura final -- las 8 soluciones reales de
   SOLUTIONS (content.ts), en tarjetas ícono + texto con el lenguaje visual
   de Riteflow (mismo badge/heading que FeaturesRiteflow, tarjeta angosta en
   vez de bento porque acá son 8 ítems, no 4). */
export function ServicesRiteflowSection() {
  useRiteflowStagger();

  return (
    <section id="servicios" className="border-b border-[#2d3a57] bg-[#0e1422] py-14 md:py-20 lg:py-24 xl:py-[100px]">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <div className="mx-auto mb-10 max-w-[600px] text-center sm:mb-16">
          <span className="mb-5 inline-block rounded-[10px] border-[1.5px] border-[#2181af] bg-[#1c2a38] px-3 py-1.5 text-sm font-medium text-[#2181af]">
            Servicios
          </span>
          <h2
            className="text-4xl font-semibold !leading-[1.2] sm:text-[40px] md:text-5xl lg:text-[52px]"
            style={{
              background: 'linear-gradient(180deg, #f8f8f8 62.71%, #2181af 90.4%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            8 soluciones TI, a medida de tu empresa
          </h2>
          <p className="mt-4 text-[#fbfbfb]/80 md:mt-5">
            Del diagnóstico a la implementación — cada solución se cotiza sin compromiso según el rubro y tamaño de
            tu operación.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-sttr-wrapper>
          {SOLUTIONS.map((s) => (
            <a
              key={s.slug}
              href="#contacto"
              data-sttr-card
              className="group flex h-full flex-col rounded-2xl border border-[#2d3a57]/70 bg-gradient-to-b from-[#18778b]/10 to-[#155382]/10 p-5 transition-colors hover:border-[#2181af]/70"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[10px] border-[1.5px] border-[#2181af] bg-[#1c2a38] text-[#2181af]">
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[#fbfbfb]/40">{s.tag}</p>
              <h3 className="mt-1 text-lg font-medium leading-snug text-[#fbfbfb]">{s.title}</h3>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#2181af]">
                Cotizar
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
