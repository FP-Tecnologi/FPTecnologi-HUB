'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { ProductGalleryModal } from './ProductGalleryModal';
import type { FEATURED_PRODUCTS } from '@/lib/content';

type Product = (typeof FEATURED_PRODUCTS)[number];

/**
 * Tarjeta de producto final -- base "4.2 estilo Vireo" de guia-estilos
 * (imagen cuadrada + badge de stock + botón de carrito solo-ícono), más 3
 * agregados pedidos: zoom de imagen al hover, checkbox de "comparar" (misma
 * lógica que ya usaba site2/FeaturedProducts.tsx) y botón de galería que abre
 * el lightbox de ProductGalleryModal. El catálogo real solo tiene 1 foto por
 * producto -- el botón de galería sigue sirviendo (zoom a pantalla completa)
 * aunque no haya varias fotos para pasar.
 */
export function ProductCardFinal({
  product,
  compared,
  onToggleCompare,
}: {
  product: Product;
  compared: boolean;
  onToggleCompare: (sku: string) => void;
}) {
  const { addItem, justAddedSku } = useCart();
  const { format } = useCurrency();
  const [galleryOpen, setGalleryOpen] = useState(false);

  const discount = Math.round(((product.priceBefore - product.price) / product.priceBefore) * 100);
  const justAdded = justAddedSku === product.sku;

  return (
    <>
      <div className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
        <div className="relative aspect-square overflow-hidden bg-producto">
          <span className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">-{discount}%</span>

          <button
            type="button"
            onClick={() => onToggleCompare(product.sku)}
            aria-pressed={compared}
            aria-label={compared ? 'Quitar de comparar' : 'Agregar a comparar'}
            className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-colors ${
              compared ? 'bg-brand-primary text-white' : 'bg-white text-ink/50 hover:text-ink'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M8 4v16M16 4v16M4 9h4M16 9h4M4 15h4M16 15h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>

          <button type="button" onClick={() => setGalleryOpen(true)} aria-label="Ver galería" className="block h-full w-full cursor-zoom-in">
            <img src={product.image} alt={product.name} className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-110" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">{product.brand}</p>
          <h3 className="line-clamp-2 min-h-[2.2rem] text-sm font-semibold text-ink">{product.name}</h3>
          <div className="mt-0.5 flex items-baseline gap-2 font-mono">
            <span className="text-base font-bold text-ink">{format(product.price)}</span>
            <span className="text-xs text-ink/40 line-through">{format(product.priceBefore)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">En stock</span>
            <button
              type="button"
              onClick={() => addItem({ sku: product.sku, name: product.name, price: product.price, image: product.image })}
              aria-label="Agregar al carrito"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-all ${justAdded ? 'bg-emerald-500' : 'btn-glow'}`}
            >
              {justAdded ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path
                    d="M3 4h2l.4 2M7 14h10l3-8H5.4M7 14 5.4 6M7 14l-1.5 4h12M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {galleryOpen && <ProductGalleryModal name={product.name} images={[product.image]} onClose={() => setGalleryOpen(false)} />}
    </>
  );
}
