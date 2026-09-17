'use client';

import { useEffect, useState } from 'react';

/**
 * Lightbox real de galería de producto -- adaptado de
 * guia-estilos/ProductGalleryDemo.tsx (sección 4.4), pero como modal (no
 * tarjeta fija) y sin repetir la misma foto 3 veces cuando el producto solo
 * tiene 1 imagen: las miniaturas solo se muestran si hay más de 1 imagen de
 * verdad.
 */
export function ProductGalleryModal({
  name,
  images,
  onClose,
}: {
  name: string;
  images: string[];
  onClose: () => void;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % images.length);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar galería"
          className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
          <img src={images[active]} alt={name} className="h-full w-full object-contain p-10" />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
                aria-label="Anterior"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setActive((i) => (i + 1) % images.length)}
                aria-label="Siguiente"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver imagen ${i + 1}`}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors ${active === i ? 'border-brand-teal-light' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="h-full w-full object-contain p-1.5" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
