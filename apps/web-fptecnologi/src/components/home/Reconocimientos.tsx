import Image from 'next/image';
import { Award } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

// Premios y reconocimientos de fabricantes y mayoristas. Para sumar uno se
// agrega a esta lista y su foto en /public/images/premios.
export const PREMIOS = [
  { titulo: 'Premio Dell Technologies', otorga: 'Dell Technologies', foto: '/images/premios/dell.webp' },
  { titulo: 'Premios HP', otorga: 'HP', foto: '/images/premios/hp.webp' },
  { titulo: 'Trofeo Huawei', otorga: 'Huawei', foto: '/images/premios/huawei.webp' },
  { titulo: 'Reconocimiento corporativo', otorga: 'LG', foto: '/images/premios/lg.webp' },
  { titulo: 'Trofeo 25 años', otorga: 'Nexsys', foto: '/images/premios/nexsys.webp' },
  { titulo: 'Trofeo corporativo', otorga: 'Samsung y Deltron', foto: '/images/premios/samsung-deltron.webp' },
];

/* Reconocimientos -- grilla de fotos de premios (sección clara, mismo
   lenguaje que el resto: badge + título en dos tonos, tarjetas con sombra
   azul de marca y zoom suave de la foto al hover). */
export function Reconocimientos() {
  return (
    <section id="reconocimientos" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          <SectionBadge>Reconocimientos</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">Premios que respaldan</span> <span className="title-shimmer-light">nuestro trabajo</span>
          </h2>
          <p className="mt-3 text-ink/60">Los fabricantes y mayoristas con los que trabajamos reconocen nuestros resultados.</p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PREMIOS.map((p, i) => (
            <ScrollReveal key={p.foto} direction="up" delayMs={(i % 3) * 100} className="h-full">
              <figure className="group relative h-full overflow-hidden rounded-2xl bg-white shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/25">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={p.foto}
                    alt={`${p.titulo} otorgado por ${p.otorga} a FPTecnologi`}
                    fill
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <figcaption className="flex items-center gap-3 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-dark/30">
                    <Award className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span>
                    <span className="block font-display font-bold text-ink">{p.titulo}</span>
                    <span className="block text-sm text-ink/60">{p.otorga}</span>
                  </span>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
