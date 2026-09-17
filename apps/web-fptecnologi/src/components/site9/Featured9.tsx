import Image from 'next/image';
import { FEATURED_PRODUCTS } from '@/lib/content';

export function Featured9() {
  return (
    <section id="catalogo" className="bg-white px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">
        <span className="text-sm text-[rgba(30,50,90,0.7)]">Nuestros más pedidos</span>
        <h2 className="mt-1 text-3xl font-normal tracking-tight text-[#3d4452] sm:text-4xl">Productos destacados</h2>

        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {FEATURED_PRODUCTS.map((p) => (
            <div key={p.sku} className="rounded-[1.5rem] border border-black/5 bg-[#f0f0f0] p-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-contain p-6" />
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[rgba(30,50,90,0.6)]">{p.brand}</p>
              <h3 className="mt-1 text-sm font-medium leading-snug text-[#3d4452]">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-sm font-semibold text-[#3d4452]">${p.price}</span>
                <span className="text-xs text-[rgba(30,50,90,0.4)] line-through">${p.priceBefore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
