import Image from 'next/image';
import { SOLUTIONS } from '@/lib/content';

export function Services8() {
  return (
    <section id="servicios" className="border-t border-white/10 px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <span className="text-sm text-white/50">Servicios TI</span>
        <h2 className="mt-2 text-3xl font-medium tracking-[-0.03em] text-white sm:text-4xl">Soluciones para cada tipo de negocio</h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOLUTIONS.slice(0, 8).map((s) => (
            <a
              key={s.slug}
              href={`/servicios/${s.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-[10px] border border-white/20 transition-colors duration-300 hover:border-white/50"
            >
              <Image src={s.image} alt={s.title} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[11px] uppercase tracking-wide text-white/50">{s.tag}</p>
                <h3 className="mt-0.5 text-sm font-medium text-white">{s.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
