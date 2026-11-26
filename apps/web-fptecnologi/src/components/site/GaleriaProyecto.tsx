'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

/*
 * Galería del detalle de proyecto: mosaico (la primera foto ocupa doble) y
 * visor a pantalla completa con flechas, teclado (← → Esc) y contador.
 */
export function GaleriaProyecto({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const n = fotos.length;
  const mover = useCallback((d: number) => setAbierta((i) => (i === null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (abierta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierta(null);
      if (e.key === 'ArrowRight') mover(1);
      if (e.key === 'ArrowLeft') mover(-1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [abierta, mover]);

  if (n === 0) return null;
  return (
    <>
      <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4">
        {fotos.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setAbierta(i)}
            className={`group relative overflow-hidden rounded-xl bg-brand-950/5 ${i === 0 && n > 2 ? 'col-span-2 row-span-2' : ''}`}
            aria-label={`Ampliar foto ${i + 1} de ${n}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${titulo} — foto ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 flex items-center justify-center bg-brand-950/0 transition-colors group-hover:bg-brand-950/35">
              <Expand className="h-7 w-7 text-white opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={2} />
            </span>
          </button>
        ))}
      </div>

      {abierta !== null && (
        <div role="dialog" aria-modal="true" aria-label={`Galería de ${titulo}`} className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-950/95 p-4" onClick={() => setAbierta(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotos[abierta]} alt={`${titulo} — foto ${abierta + 1}`} className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button type="button" onClick={() => setAbierta(null)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20" aria-label="Cerrar">
            <X className="h-6 w-6" />
          </button>
          {n > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); mover(-1); }} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Foto anterior">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); mover(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Foto siguiente">
                <ChevronRight className="h-6 w-6" />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold tabular-nums text-white">
                {abierta + 1} / {n}
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
}
