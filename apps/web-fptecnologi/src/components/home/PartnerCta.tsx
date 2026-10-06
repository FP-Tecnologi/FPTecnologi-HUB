'use client';
import { HOME_DEFAULTS, type Encabezado, type ItemTexto } from '@/lib/homeContenido';

import { MoreInfoButton } from './MoreInfoButton';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

/*
 * "Sé partner" -- los 3 pasos reales de PARTNER_STEPS + CTA por WhatsApp (no
 * hay backend de alta de partners). Mismo lenguaje que el resto de la home:
 * SectionBadge, título en una línea con brillo, botón sweep y tarjetas con
 * hover. Fondo blanco con retícula/nodos "TI" y resplandores azules suaves: se
 * separa de Clientes por el efecto (no por un celeste plano) y deja a Contacto
 * como único bloque azul oscuro antes del footer.
 */
export function PartnerCta({ c = HOME_DEFAULTS.partners }: { c?: Encabezado & { pasos: ItemTexto[] } }) {
  return (
    <section id="partners" className="relative overflow-hidden border-y border-brand-100 bg-white py-20 text-ink">
      {/* Efecto "TI" claro: retícula de circuito que se desvanece hacia los
          bordes + dos resplandores azules suaves y unos nodos conectados. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(16_122_204/0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgb(16_122_204/0.09)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_75%_70%_at_60%_45%,black,transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />
      <svg aria-hidden className="pointer-events-none absolute right-6 top-8 hidden h-40 w-72 text-brand-500/40 lg:block" viewBox="0 0 288 160" fill="none">
        <path d="M8 130 L70 92 L132 108 L196 40 L280 62" stroke="currentColor" strokeWidth="1" />
        <path d="M70 92 L96 24 L196 40" stroke="currentColor" strokeWidth="1" />
        {[[8, 130], [70, 92], [132, 108], [196, 40], [280, 62], [96, 24]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="currentColor" />
        ))}
      </svg>
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center">
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
              label={c.botonTexto || 'Ser partner'}
              href="/socios/registro"
            />
          </div>
        </ScrollReveal>

        <div className="grid gap-5 sm:grid-cols-3">
          {c.pasos.map((s, i) => ({ ...s, step: String(i + 1) })).map((s, i) => (
            <ScrollReveal key={s.step} direction="up" delayMs={i * 120} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-200 bg-white/90 p-6 shadow-md shadow-brand-950/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-950/15">
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
