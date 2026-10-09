import Image from 'next/image';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

// Certificaciones de gestión. Para sumar/quitar una se edita esta lista y su
// logo en /public/images/certificaciones.
const CERTIFICACIONES = [
  { codigo: 'ISO 9001', nombre: 'Gestión de Calidad', logo: '/images/certificaciones/iso9001.png' },
  { codigo: 'ISO 14001', nombre: 'Gestión Ambiental', logo: '/images/certificaciones/iso14001.png' },
  { codigo: 'ISO 45001', nombre: 'Seguridad y Salud en el Trabajo', logo: '/images/certificaciones/iso45001.png' },
  { codigo: 'ISO 37001', nombre: 'Gestión de Antisoborno', logo: '/images/certificaciones/iso37001.png' },
  { codigo: 'SA 8000', nombre: 'Responsabilidad Social', logo: '/images/certificaciones/sa8000.png' },
];

/* "Certificaciones": sistemas de gestión, en tarjetas blancas con el logo de
   la norma, su código y el nombre. Entran en cascada con el scroll; al hover
   la tarjeta sube con sombra en el azul primario y el logo hace zoom. */
export function CertificacionesISO() {
  return (
    <section id="certificaciones" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          <SectionBadge>Certificaciones</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">Sistemas integrales</span> <span className="title-shimmer-light">de gestión</span>
          </h2>
          <p className="mt-3 text-ink/65">Comprometidos con los más altos estándares de calidad y seguridad a nivel global.</p>
        </ScrollReveal>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
          {CERTIFICACIONES.map((c, i) => (
            <ScrollReveal key={c.codigo} direction="up" delayMs={i * 90} className="h-full">
              <div className="group flex h-full flex-col items-center rounded-2xl border border-brand-100 bg-white p-5 text-center shadow-sm shadow-brand-950/5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-[0_18px_36px_-10px_rgba(40,152,238,0.45)]">
                <div className="relative h-28 w-full">
                  <Image src={c.logo} alt={c.codigo} fill sizes="200px" className="object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-110" />
                </div>
                <span aria-hidden className="mt-3 block h-0.5 w-8 rounded-full bg-brand-primary/40 transition-all duration-500 group-hover:w-14 group-hover:bg-brand-primary" />
                <p className="mt-3 font-display text-lg font-bold text-brand-700">{c.codigo}</p>
                <p className="mt-1 text-xs font-medium leading-snug text-ink/70">{c.nombre}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
