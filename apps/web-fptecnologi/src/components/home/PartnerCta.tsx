'use client';

import { PARTNER_STEPS } from '@/lib/content';
import { useRiteflowStagger } from '@/hooks/useRiteflowStagger';

/* "Sé partner" de la estructura final -- los 3 pasos reales de PARTNER_STEPS
   (content.ts) más un CTA. No hay backend de registro de partners todavía,
   así que el CTA va por el mismo canal real que ya usa el sitio para
   consultas comerciales (WhatsApp), no un formulario de alta que no existe. */
export function PartnerCta() {
  useRiteflowStagger();

  return (
    <section id="partners" className="border-b border-[#2d3a57] bg-[#0e1422] py-14 md:py-20 lg:py-24 xl:py-[100px]">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center">
          <div>
            <span className="mb-5 inline-block rounded-[10px] border-[1.5px] border-[#2181af] bg-[#1c2a38] px-3 py-1.5 text-sm font-medium text-[#2181af]">
              Programa de Partners
            </span>
            <h2
              className="text-4xl font-semibold !leading-[1.2] sm:text-5xl"
              style={{
                background: 'linear-gradient(180deg, #f8f8f8 62.71%, #2181af 90.4%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Sumate como integrador o revendedor
            </h2>
            <p className="mt-4 text-[#fbfbfb]/80">
              Precios y beneficios especiales para partners, con soporte comercial dedicado y cotización directa.
            </p>
            <a
              href="https://wa.me/51908856286?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20el%20programa%20de%20Partners%20de%20FPTecnologi"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-[10px] px-[22px] py-3 text-sm font-medium text-white transition-[background-position] duration-500"
              style={{
                background: 'linear-gradient(to bottom, #18778b 0%, #155382 51%, #18778b 100%)',
                backgroundSize: 'auto 200%',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundPosition = 'bottom right'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundPosition = 'top left'; }}
            >
              Sumarme como partner
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3" data-sttr-wrapper>
            {PARTNER_STEPS.map((s) => (
              <div
                key={s.step}
                data-sttr-card
                className="h-full rounded-2xl border border-[#2d3a57]/70 bg-gradient-to-b from-[#18778b]/10 to-[#155382]/10 p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-[#2181af] text-sm font-semibold text-[#2181af]">
                  {s.step}
                </span>
                <h3 className="mt-4 text-base font-medium leading-snug text-[#fbfbfb]">{s.title}</h3>
                <p className="mt-2 text-sm text-[#fbfbfb]/60">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
