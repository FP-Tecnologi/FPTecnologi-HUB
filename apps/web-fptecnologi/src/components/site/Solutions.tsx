import Image from 'next/image';
import { SOLUTIONS } from '@/lib/content';
import { Icon } from './Icon';

export function Solutions() {
  return (
    <section id="servicios" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-700">Servicios destacados</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Tecnología para cada tipo de negocio
          </h2>
        </div>
        <p className="max-w-md text-sm text-ink/60">
          Explora nuestro catálogo especializado para infraestructura corporativa. Stock local y distribución
          autorizada de las principales marcas internacionales.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS.map((item, i) => (
          <a
            key={item.title}
            href="#contacto"
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-fade-up group relative aspect-4/5 overflow-hidden rounded-2xl text-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/30"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/55 to-brand-dark/10" />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-teal-light/0 via-transparent to-brand-primary/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex h-full flex-col justify-end p-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm transition-colors duration-300 group-hover:bg-brand-teal-light/25 group-hover:ring-brand-teal-light/40">
                <Icon name={item.icon} className="icon-hop h-7 w-7 text-brand-teal-light" />
              </span>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-white/70">{item.tag}</p>
              <h3 className="mt-1 text-lg font-semibold leading-snug">{item.title}</h3>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
                Consultar
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
