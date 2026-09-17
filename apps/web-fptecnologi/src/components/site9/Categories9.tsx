import Image from 'next/image';
import { TIENDA_CATEGORIES } from '@/lib/content';

/* Mismo lenguaje visual del Hero9: tarjetas de vidrio (blur + borde sutil)
   sobre el fondo claro #f0f0f0, acento navy rgba(30,50,90,X). */
export function Categories9() {
  return (
    <section id="categorias" className="bg-[#f0f0f0] px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">
        <span className="text-sm text-[rgba(30,50,90,0.7)]">Explora nuestra colección</span>
        <h2 className="mt-1 text-3xl font-normal tracking-tight text-[#3d4452] sm:text-4xl">Categorías de producto</h2>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TIENDA_CATEGORIES.map((c) => (
            <a
              key={c.slug}
              href={`/tienda/${c.slug}`}
              className="group relative aspect-square overflow-hidden rounded-[1.75rem] border border-white/40 bg-white/30 backdrop-blur-md"
            >
              <Image
                src={c.image}
                alt={c.title}
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className={`transition-transform duration-500 group-hover:scale-105 ${c.imageFit === 'contain' ? 'object-contain p-6' : 'object-cover'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(30,50,90,0.55)] via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 text-sm font-medium text-white">{c.title}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
