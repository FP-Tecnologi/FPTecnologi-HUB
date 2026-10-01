import Image from 'next/image';
import { FEATURED_PRODUCTS } from '@/lib/content';

export function Featured8() {
  return (
    <section id="catalogo" className="border-t border-white/10 px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <span className="text-sm text-white/50">Nuestros más pedidos</span>
        <h2 className="mt-2 text-3xl font-medium tracking-[-0.03em] text-white sm:text-4xl">Productos destacados</h2>

        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {FEATURED_PRODUCTS.map((p) => (
            <div key={p.sku} className="rounded-[10px] border border-white/15 bg-white/[0.03] p-4 transition-colors duration-300 hover:border-white/35">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
                <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-contain p-6" />
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-white/45">{p.brand}</p>
              <h3 className="mt-1 text-sm font-medium leading-snug text-white">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-sm font-semibold text-white">${p.price}</span>
                <span className="text-xs text-white/35 line-through">${p.priceBefore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
