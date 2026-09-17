import Image from 'next/image';
import { TIENDA_CATEGORIES } from '@/lib/content';

export function Categories7() {
  return (
    <section id="categorias" className="mx-auto max-w-7xl px-6 py-20">
      <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Explora nuestro rango</span>
      <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Categorías de producto</h2>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TIENDA_CATEGORIES.map((c) => (
          <a
            key={c.slug}
            href={`/tienda/${c.slug}`}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-ink/5"
          >
            <Image
              src={c.image}
              alt={c.title}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className={`transition-transform duration-500 group-hover:scale-110 ${c.imageFit === 'contain' ? 'object-contain p-6' : 'object-cover'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">{c.title}</span>
            <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink shadow-sm transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
