'use client';
import { HOME_DEFAULTS, type Encabezado, type ItemTexto } from '@/lib/homeContenido';

import { whatsappHref } from '@/lib/chatActions';
import { MoreInfoButton } from './MoreInfoButton';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

/*
 * "Sé partner" -- los 3 pasos reales de PARTNER_STEPS + CTA por WhatsApp (no
 * hay backend de alta de partners). Mismo lenguaje que el resto de la home:
 * SectionBadge, título en una línea con brillo, botón sweep y tarjetas con
 * hover. Fondo celeste claro: rompe el tablero blanco/paper y deja a Contacto
 * como único bloque azul oscuro antes del footer.
 */
export function PartnerCta({ c = HOME_DEFAULTS.partners }: { c?: Encabezado & { pasos: ItemTexto[] } }) {
  return (
    <section id="partners" className="bg-brand-100 py-20 text-ink">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center">
        <ScrollReveal direction="left">
          <SectionBadge tone="light">{c.badge}</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">{c.titulo}</span> <span className="title-shimmer-light">{c.destacado}</span>
          </h2>
          <p className="mt-4 text-ink/70">
            {c.descripcion}
          </p>
          <div className="mt-8">
            <MoreInfoButton
              tone="light"
              label={c.botonTexto || 'Sumarme como partner'}
              onClick={() => window.open(whatsappHref('Hola, quiero saber más sobre el programa de Partners de FPTecnologi'), '_blank', 'noreferrer')}
            />
          </div>
        </ScrollReveal>

        <div className="grid gap-5 sm:grid-cols-3">
          {c.pasos.map((s, i) => ({ ...s, step: String(i + 1) })).map((s, i) => (
            <ScrollReveal key={s.step} direction="up" delayMs={i * 120} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-200 bg-white p-6 shadow-sm shadow-brand-950/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-950/15">
                <span className="spin-border" aria-hidden />
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-700 font-display text-base font-bold text-white transition-colors duration-300 group-hover:bg-brand-primary">
                  {s.step}
                </span>
                <h3 className="mt-5 text-base font-semibold leading-snug text-ink">{s.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/70">{s.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
