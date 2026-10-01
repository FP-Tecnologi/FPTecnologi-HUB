'use client';
import { HOME_DEFAULTS, type Encabezado } from '@/lib/homeContenido';

import { useState } from 'react';
import { Building2, GraduationCap, Landmark, type LucideIcon } from 'lucide-react';
import { CLIENT_SECTORS, type ClientSector } from '@/lib/clients';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

const SECTOR_ICONS: Record<ClientSector['key'], LucideIcon> = {
  gobierno: Landmark,
  educacion: GraduationCap,
  privado: Building2,
};

/*
 * "Nuestros clientes" -- clientes por sector (referencia: tactical-it.pe),
 * en 3 cajas: Sector gobierno arriba a lo ancho y, debajo, Educación y
 * Sector privado lado a lado. Sección blanca, cajas azul oscuro de marca, y
 * dentro de cada caja los logos se desplazan en bucle (marquesina, se pausa
 * al pasar el cursor). Clientes de ejemplo en lib/clients.ts.
 */
export function NuestrosClientes({ c = HOME_DEFAULTS.clientes, sectors = CLIENT_SECTORS }: { c?: Encabezado; sectors?: ClientSector[] }) {
  const [gobierno, ...resto] = sectors;
  if (!gobierno) return null;

  return (
    <section id="clientes" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up" className="mx-auto mb-14 flex max-w-2xl flex-col items-center text-center">
          <SectionBadge>{c.badge}</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">{c.titulo}</span> <span className="title-shimmer-light">{c.destacado}</span>
          </h2>
          <p className="mt-3 text-ink/60">
            {c.descripcion}
          </p>
        </ScrollReveal>

        <div className="space-y-10">
          <ScrollReveal direction="up">
            <SectorBox sector={gobierno} />
          </ScrollReveal>
          <div className="grid gap-10 lg:grid-cols-2">
            {resto.map((s, i) => (
              <ScrollReveal key={s.key} direction="up" delayMs={i * 120}>
                <SectorBox sector={s} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectorBox({ sector }: { sector: ClientSector }) {
  const Icon = SECTOR_ICONS[sector.key];
  // Pausa con estado (mouseenter/leave), igual que BrandMarquee: el selector
  // CSS de hover no pausaba de forma confiable.
  const [paused, setPaused] = useState(false);
  // 3 copias: la animación .animate-marquee recorre un tercio (-33.33%), así
  // el bucle empalma sin salto.
  const track = [...sector.clients, ...sector.clients, ...sector.clients];

  return (
    <div>
      {/* Etiqueta del sector + línea. */}
      <div className="mb-4 flex items-center gap-3 text-brand-dark">
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
        <p className="text-sm font-bold uppercase tracking-[0.2em]">{sector.label}</p>
        <span className="h-px flex-1 bg-brand-dark/15" />
      </div>

      <div className="group/box relative overflow-hidden rounded-2xl bg-brand-dark py-7 shadow-xl shadow-brand-dark/25">
        {/* Degradé en los bordes para que los logos entren/salgan suave. */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-brand-dark to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-brand-dark to-transparent" />

        <div
          className="animate-marquee flex w-max gap-4"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {track.map((c, i) => (
            <div key={`${c.name}-${i}`} aria-hidden={i >= sector.clients.length} className="group flex w-32 shrink-0 flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md shadow-black/20 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                {c.logo ? (
                  <img src={c.logo} alt={c.name} className="h-full w-full object-contain p-2" />
                ) : (
                  // Logo provisional: ícono del sector + iniciales.
                  <span className="flex flex-col items-center leading-none text-brand-dark">
                    <Icon className="mb-1 h-4 w-4 text-brand-primary" strokeWidth={2} />
                    <span className="font-display text-sm font-bold">{c.short}</span>
                  </span>
                )}
              </div>
              <p className="line-clamp-2 px-1 text-xs font-semibold uppercase tracking-wide text-white/80">{c.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
