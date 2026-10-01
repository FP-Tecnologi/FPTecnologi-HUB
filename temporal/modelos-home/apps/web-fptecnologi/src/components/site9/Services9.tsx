import Image from 'next/image';
import { SOLUTIONS } from '@/lib/content';

export function Services9() {
  return (
    <section id="servicios" className="bg-[#f0f0f0] px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">
        <span className="text-sm text-[rgba(30,50,90,0.7)]">Servicios TI</span>
        <h2 className="mt-1 text-3xl font-normal tracking-tight text-[#3d4452] sm:text-4xl">Soluciones para cada tipo de negocio</h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOLUTIONS.slice(0, 8).map((s) => (
            <a
              key={s.slug}
              href={`/servicios/${s.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/40"
            >
              <Image src={s.image} alt={s.title} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(30,50,90,0.75)] via-[rgba(30,50,90,0.15)] to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[11px] uppercase tracking-wide text-white/70">{s.tag}</p>
                <h3 className="mt-0.5 text-sm font-medium text-white">{s.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
