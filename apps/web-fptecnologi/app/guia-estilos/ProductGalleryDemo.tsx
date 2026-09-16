'use client';

import { useState } from 'react';

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} className="h-4.5 w-4.5">
    <path d="M12 21s-7-4.4-9.5-8.8C.7 8.4 2.4 5 6 5c2 0 3.3 1 6 3.5C14.7 6 16 5 18 5c3.6 0 5.3 3.4 3.5 7.2C19 16.6 12 21 12 21Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
    <circle cx="18" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="18" cy="19" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8.2 10.7 15.8 6.3M8.2 13.3l7.6 4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const ChevronIcon = ({ dir = 'left' }: { dir?: 'left' | 'right' }) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path d={dir === 'left' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Propuesta de tarjeta de producto tipo galería — adaptada del ejemplo del
 * usuario (ProductGalleryCard): imagen grande + tira de miniaturas + flechas
 * + acciones flotantes (favorito/compartir) + badges. El catálogo real hoy
 * solo tiene 1 foto por producto (no fotografía por ángulos) — acá se repite
 * esa misma imagen en las miniaturas solo para mostrar el mecanismo; no hay
 * reseñas/calificaciones reales todavía, así que no se agregó esa fila. */
export function ProductGalleryDemo({ name, brand, image, price, priceBefore, discount }: { name: string; brand: string; image: string; price: number; priceBefore: number; discount: number }) {
  const images = [image, image, image];
  const [active, setActive] = useState(0);
  const [fav, setFav] = useState(false);

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg shadow-black/5">
      <div className="relative aspect-square bg-brand-primary/6">
        <img src={images[active]} alt={name} className="h-full w-full object-contain p-8" />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span className="rounded-full bg-brand-primary px-2.5 py-1 text-[10px] font-bold text-white">-{discount}%</span>
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setFav((f) => !f)}
            aria-label="Favorito"
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-colors ${fav ? 'text-red-500' : 'text-ink/60 hover:text-ink'}`}
          >
            <HeartIcon filled={fav} />
          </button>
          <button type="button" aria-label="Compartir" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink/60 shadow-sm hover:text-ink">
            <ShareIcon />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
          aria-label="Anterior"
          className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white"
        >
          <ChevronIcon dir="left" />
        </button>
        <button
          type="button"
          onClick={() => setActive((i) => (i + 1) % images.length)}
          aria-label="Siguiente"
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white"
        >
          <ChevronIcon dir="right" />
        </button>
      </div>

      <div className="flex gap-2 border-b border-black/5 p-3">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 bg-brand-primary/6 transition-colors ${active === i ? 'border-brand-primary' : 'border-transparent'}`}
          >
            <img src={img} alt="" className="h-full w-full object-contain p-1" />
          </button>
        ))}
      </div>

      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">{brand}</p>
        <h3 className="mt-1 text-base font-semibold text-ink">{name}</h3>
        <div className="mt-2 flex items-baseline gap-2 font-mono">
          <span className="text-xl font-bold text-ink">${price.toFixed(2)}</span>
          <span className="text-sm text-ink/40 line-through">${priceBefore.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
