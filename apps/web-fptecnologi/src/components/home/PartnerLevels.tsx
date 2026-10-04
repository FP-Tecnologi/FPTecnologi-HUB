'use client';

import Image from 'next/image';
import { useState } from 'react';

// Insignias de partner con el nombre y el nivel (Gold, Elite, Platinum...)
// escritos debajo. Para sumar/quitar una marca se edita esta
// lista y su archivo en /public/images/partners.
const PARTNERS = [
  { name: 'Axis Communications', logo: '/images/partners/axis.png', level: 'Gold' },
  { name: 'Dell', logo: '/images/partners/dell.png', level: 'Gold' },
  { name: 'Genetec', logo: '/images/partners/genetec.png', level: 'Elite' },
  { name: 'Hanwha', logo: '/images/partners/hanwha.png', level: 'Platinum' },
  { name: 'Hikvision', logo: '/images/partners/hikvision.png', level: '' },
  { name: 'Milestone Systems', logo: '/images/partners/milestone.png', level: 'Premier' },
  { name: 'Vertiv', logo: '/images/partners/vertiv.png', level: 'Platinum' },
];

/* Franja de partners debajo del hero: sin título, sobre el mismo fondo del
   marco del hero (bg-paper), en carrusel infinito (.animate-marquee, 3
   copias) que se pausa al pasar el cursor. En reposo sin tarjeta ni bordes
   (`mix-blend-multiply` funde el fondo blanco de las insignias); al hover
   se levanta como una tarjeta blanca con sombra en el azul primario. */
export function PartnerLevels() {
  const [paused, setPaused] = useState(false);
  const track = [...PARTNERS, ...PARTNERS, ...PARTNERS];
  return (
    <section id="alianzas" className="bg-paper py-6">
      <div className="relative overflow-hidden py-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper to-transparent sm:w-36" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper to-transparent sm:w-36" />
        <div
          className="animate-marquee flex w-max items-center gap-6"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {track.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="group flex w-52 shrink-0 flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1.5 hover:bg-white hover:shadow-[0_18px_36px_-10px_rgba(16,122,204,0.5)] hover:ring-1 hover:ring-brand-primary/20"
            >
              <div className="relative h-20 w-full">
                <Image src={p.logo} alt={`${p.name}${p.level ? ` — ${p.level} Partner` : ''}`} fill sizes="208px" className="object-contain mix-blend-multiply" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/70">{p.name}</p>
              <p className="h-4 text-xs font-extrabold uppercase tracking-widest text-brand-700">{p.level}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
