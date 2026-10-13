'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* Carrusel horizontal de tarjetas: avanza solo cada pocos segundos (se detiene al pasar el cursor o tocar) y tiene flechas. */
export function ServiciosCarrusel({ children }: { children: ReactNode }) {
  const pista = useRef<HTMLDivElement>(null);
  const [pausa, setPausa] = useState(false);

  const mover = (dir: 1 | -1) => {
    const el = pista.current;
    if (!el) return;
    const paso = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 300;
    const fin = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir === 1 && fin) el.scrollTo({ left: 0, behavior: 'smooth' });
    else el.scrollBy({ left: dir * (paso + 24), behavior: 'smooth' });
  };

  useEffect(() => {
    if (pausa || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => mover(1), 3500);
    return () => clearInterval(t);
  }, [pausa]);

  const flecha = 'absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/40 transition hover:scale-110 hover:bg-brand-dark sm:flex';
  return (
    <div className="relative" onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)} onTouchStart={() => setPausa(true)}>
      <button type="button" aria-label="Anterior" onClick={() => mover(-1)} className={`${flecha} -left-3 xl:-left-6`}>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div ref={pista} className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <button type="button" aria-label="Siguiente" onClick={() => mover(1)} className={`${flecha} -right-3 xl:-right-6`}>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
