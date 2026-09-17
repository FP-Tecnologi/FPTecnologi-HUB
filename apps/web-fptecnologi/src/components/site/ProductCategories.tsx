import Image from 'next/image';
import { TIENDA_CATEGORIES } from '@/lib/content';

/* "Categorías de productos" de la estructura final -- las 4 categorías
   reales de la Tienda (TIENDA_CATEGORIES), estilo modelo 1. */
export function ProductCategories() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Tienda</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Categorías del catálogo</h2>
        </div>
        <a href="/tienda" className="btn-sweep rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-ink before:bg-brand-primary hover:text-white">
          Ver tienda completa
        </a>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TIENDA_CATEGORIES.map((c) => (
          <a
            key={c.slug}
            href={`/tienda/${c.slug}`}
            className="group relative block aspect-4/5 overflow-hidden rounded-2xl border border-black/5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/25"
          >
            <Image
              src={c.image}
              alt={c.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className={`${c.imageFit === 'contain' ? 'object-contain bg-white p-6' : 'object-cover'} transition-transform duration-500 group-hover:scale-110`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
              <h3 className="text-lg font-semibold text-white">{c.title}</h3>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-dark transition-all duration-300 group-hover:-rotate-45 group-hover:bg-brand-teal-light group-hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
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
