import Image from 'next/image';
import { TIENDA_CATEGORIES } from '@/lib/content';

/* Mismo lenguaje "metal líquido" del Header8/Hero8: borde plateado sutil,
   degradé oscuro, sin color de marca -- todo en escala de grises + blanco. */
export function Categories8() {
  return (
    <section id="categorias" className="px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <span className="text-sm text-white/50">Explora nuestro rango</span>
        <h2 className="mt-2 text-3xl font-medium tracking-[-0.03em] text-white sm:text-4xl">Categorías de producto</h2>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TIENDA_CATEGORIES.map((c) => (
            <a
              key={c.slug}
              href={`/tienda/${c.slug}`}
              className="group relative aspect-square overflow-hidden rounded-[10px] border border-white/20 transition-colors duration-300 hover:border-white/50"
            >
              <Image
                src={c.image}
                alt={c.title}
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className={`opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 ${c.imageFit === 'contain' ? 'object-contain p-6' : 'object-cover'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <span className="absolute bottom-4 left-4 text-sm font-medium text-white">{c.title}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
