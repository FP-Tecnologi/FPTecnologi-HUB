'use client';

import { PARTNER_STEPS } from '@/lib/content';
import { whatsappHref } from '@/lib/chatActions';
import { MoreInfoButton } from './MoreInfoButton';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

/*
 * "Sé partner" -- los 3 pasos reales de PARTNER_STEPS + CTA por WhatsApp (no
 * hay backend de alta de partners). Mismo lenguaje que el resto de la home:
 * SectionBadge, título en una línea con brillo, botón sweep y tarjetas con
 * hover. Fondo azul oscuro de marca (el que tenía "Hablemos"); Contacto pasa
 * al color del footer.
 */
export function PartnerCta() {
  return (
    <section id="partners" className="bg-brand-dark py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center">
        <ScrollReveal direction="left">
          <SectionBadge tone="dark">Programa de Partners</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-white">Súmate como integrador</span> <span className="title-shimmer-dark">o revendedor</span>
          </h2>
          <p className="mt-4 text-white/70">
            Precios y beneficios especiales para partners, con soporte comercial dedicado y cotización directa.
          </p>
          <div className="mt-8">
            <MoreInfoButton
              tone="dark"
              label="Sumarme como partner"
              onClick={() => window.open(whatsappHref('Hola, quiero saber más sobre el programa de Partners de FPTecnologi'), '_blank', 'noreferrer')}
            />
          </div>
        </ScrollReveal>

        <div className="grid gap-5 sm:grid-cols-3">
          {PARTNER_STEPS.map((s, i) => (
            <ScrollReveal key={s.step} direction="up" delayMs={i * 120} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/15 hover:shadow-2xl hover:shadow-ink/40">
                <span className="spin-border" aria-hidden />
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-display text-base font-bold text-brand-dark shadow-lg shadow-ink/30 transition-colors duration-300 group-hover:bg-brand-primary group-hover:text-white">
                  {s.step}
                </span>
                <h3 className="mt-5 text-base font-semibold leading-snug text-white">{s.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/65">{s.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
