import Image from 'next/image';
import { FEATURED_PRODUCTS } from '@/lib/content';

export function Featured7() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-white">
      <div className="brand-mesh pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-teal-light">Nuestros más pedidos</span>
        <h2 className="mt-2 font-display text-3xl font-bold uppercase sm:text-4xl">Productos destacados</h2>

        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {FEATURED_PRODUCTS.map((p) => (
            <div key={p.sku} className="group rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10 transition-colors hover:bg-white/10">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
                <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-contain p-6 transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute left-2 top-2 rounded-full bg-brand-teal-light px-2 py-0.5 text-[10px] font-bold text-brand-dark">
                  -{Math.round((1 - p.price / p.priceBefore) * 100)}%
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-teal-light">{p.brand}</p>
              <h3 className="mt-1 text-sm font-semibold leading-snug">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-sm font-bold">${p.price}</span>
                <span className="text-xs text-white/40 line-through">${p.priceBefore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
