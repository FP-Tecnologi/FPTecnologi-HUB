'use client';

import Image from 'next/image';
import { useState } from 'react';
import { SectionBadge } from './SectionBadge';

// Insignias de nivel de partner (logo del fabricante + nivel). Datos aquí a
// propósito: para sumar/quitar una marca solo se edita esta lista y su archivo
// en /public/images/partners.
const PARTNERS = [
  { name: 'Axis Communications', logo: '/images/partners/axis.png', level: 'Gold' },
  { name: 'Dell', logo: '/images/partners/dell.png', level: 'Gold' },
  { name: 'Genetec', logo: '/images/partners/genetec.png', level: 'Elite' },
  { name: 'Hanwha', logo: '/images/partners/hanwha.png', level: 'Platinum' },
  { name: 'Hikvision', logo: '/images/partners/hikvision.png', level: '' },
  { name: 'Milestone Systems', logo: '/images/partners/milestone.png', level: 'Premier' },
  { name: 'Vertiv', logo: '/images/partners/vertiv.png', level: 'Platinum' },
];

/* "Nuestros Partners": franja con las alianzas y su nivel (Gold, Elite...).
   Carrusel infinito en bucle (.animate-marquee, 3 copias) que se pausa al
   pasar el cursor. Tarjetas blancas con borde celeste y el nivel en una
   píldora azul primaria debajo del logo. */
export function PartnerLevels() {
  const [paused, setPaused] = useState(false);
  const track = [...PARTNERS, ...PARTNERS, ...PARTNERS];
  return (
    <section id="alianzas" className="bg-white py-14">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <SectionBadge>Nuestros Partners</SectionBadge>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
          <span className="text-ink">Alianzas con líderes tecnológicos</span>{' '}
          <span className="title-shimmer-light">que impulsan nuestras soluciones</span>
        </h2>
      </div>
      <div className="relative mt-8 overflow-hidden py-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent sm:w-36" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent sm:w-36" />
        <div
          className="animate-marquee flex w-max items-stretch gap-4"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {track.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex w-56 shrink-0 flex-col items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm shadow-brand-950/5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-950/10"
            >
              <div className="relative h-24 w-full">
                <Image src={p.logo} alt={p.name} fill sizes="224px" className="object-contain" />
              </div>
              {p.level ? (
                <span className="rounded-full bg-brand-700 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">{p.level}</span>
              ) : (
                <span className="h-[26px]" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
