'use client';

import { FEATURED_PRODUCTS } from '@/lib/content';
import { useCart } from '@/context/CartContext';

/* Grid oscuro con corazón de favoritos (decorativo, no hay wishlist real) y
   "Añadir al carrito" real (CartContext). Sin paginación falsa -- el
   catálogo real tiene 4 productos, cabe en una sola página; la referencia
   mostraba 2 páginas para más productos de los que tenemos de verdad. */
export function Featured11() {
  const { addItem, justAddedSku } = useCart();

  return (
    <section id="catalogo" className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="text-2xl font-bold text-white">Productos destacados</h2>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {FEATURED_PRODUCTS.map((p) => {
          const justAdded = justAddedSku === p.sku;
          return (
            <div key={p.sku} className="group relative rounded-2xl border border-white/10 bg-[#151225] p-4 transition-colors hover:border-violet-500/50">
              <button type="button" aria-label="Agregar a favoritos" className="absolute right-4 top-4 z-10 text-white/30 transition-colors hover:text-violet-400">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M12 20s-7-4.35-9.5-8.5C.5 8 2.5 4.5 6 4.5c2 0 3.5 1 6 3.5 2.5-2.5 4-3.5 6-3.5 3.5 0 5.5 3.5 3.5 7C19 15.65 12 20 12 20Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
              </button>

              <div className="flex h-32 items-center justify-center rounded-xl bg-black/20 p-3">
                <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
              </div>

              <p className="mt-3 text-sm font-semibold text-white">{p.brand}</p>
              <p className="text-sm font-bold text-violet-400">${p.price.toFixed(2)}</p>

              <button
                type="button"
                onClick={() => addItem({ sku: p.sku, name: p.name, price: p.price, image: p.image })}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${justAdded ? 'bg-emerald-500' : 'bg-white/10 hover:bg-violet-600'}`}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M3 4h2l.4 2M7 14h10l3-8H5.4M7 14 5.4 6M7 14l-1.5 4h12M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {justAdded ? 'Agregado' : 'Añadir al carrito'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <a href="/tienda" className="inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-violet-500 hover:text-violet-400">
          Ver catálogo completo
        </a>
      </div>
    </section>
  );
}
