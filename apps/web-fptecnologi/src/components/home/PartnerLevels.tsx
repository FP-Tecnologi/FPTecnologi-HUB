'use client';

import Image from 'next/image';
import { useState } from 'react';

// Insignias de partner: cada imagen ya trae el nombre del fabricante y su
// nivel (Gold, Elite, Platinum...). Para sumar/quitar una marca se edita esta
// lista y su archivo en /public/images/partners.
const PARTNERS = [
  { name: 'Axis Communications — Solution Gold Partner', logo: '/images/partners/axis.png' },
  { name: 'Dell Technologies — Gold Partner', logo: '/images/partners/dell.png' },
  { name: 'Genetec — Certified Elite Partner', logo: '/images/partners/genetec.png' },
  { name: 'Hanwha Vision — STEP Platinum Partner', logo: '/images/partners/hanwha.png' },
  { name: 'Hikvision', logo: '/images/partners/hikvision.png' },
  { name: 'Milestone Systems — Premier Partner', logo: '/images/partners/milestone.png' },
  { name: 'Vertiv — Platinum Partner', logo: '/images/partners/vertiv.png' },
];

/* Franja de partners debajo del hero: sin título, sobre el mismo fondo del
   marco del hero (bg-paper), en carrusel infinito (.animate-marquee, 3
   copias) que se pausa al pasar el cursor. Sin tarjetas ni bordes: las
   insignias traen fondo blanco y `mix-blend-multiply` lo funde con el fondo. */
export function PartnerLevels() {
  const [paused, setPaused] = useState(false);
  const track = [...PARTNERS, ...PARTNERS, ...PARTNERS];
  return (
    <section id="alianzas" className="bg-paper py-6">
      <div className="relative overflow-hidden py-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper to-transparent sm:w-36" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper to-transparent sm:w-36" />
        <div
          className="animate-marquee flex w-max items-center gap-10"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {track.map((p, i) => (
            <div key={`${p.name}-${i}`} className="relative h-24 w-44 shrink-0 transition-transform duration-300 hover:scale-110">
              <Image src={p.logo} alt={p.name} fill sizes="176px" className="object-contain mix-blend-multiply" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
