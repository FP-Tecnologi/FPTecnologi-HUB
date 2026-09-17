'use client';

import { useEffect, useState } from 'react';

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M5 20c1.2-3.5 4-5.2 7-5.2s5.8 1.7 7 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const PLACEHOLDERS = [
  { avatarBg: 'bg-brand-primary/12 text-brand-primary' },
  { avatarBg: 'bg-brand-teal/12 text-brand-teal' },
  { avatarBg: 'bg-amber-500/12 text-amber-600' },
  { avatarBg: 'bg-brand-dark/12 text-brand-dark' },
  { avatarBg: 'bg-brand-teal-light/15 text-brand-teal-light' },
] as const;

const N = PLACEHOLDERS.length;

/*
 * Otra variante del carrusel dinámico (13.3), pedida aparte: modo
 * "centrado" -- SIEMPRE 4 tarjetas a la vista, las 2 del medio a tamaño
 * completo y opacas, la de cada costado desvanecida. No usa el
 * centeredSlides de Swiper (con slidesPerView par no centra un par de
 * forma prolija, el "activo" terminaba pegado a un borde) -- acá se arma
 * a mano con un índice de inicio y 4 posiciones fijas, así el par del
 * medio siempre queda ahí.
 */
export function TestimonialCarouselCenteredDemo() {
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setStart((s) => (s + 1) % N), 2800);
    return () => window.clearInterval(id);
  }, [paused]);

  const prev = () => setStart((s) => (s - 1 + N) % N);
  const next = () => setStart((s) => (s + 1) % N);

  const visible = [0, 1, 2, 3].map((offset) => PLACEHOLDERS[(start + offset) % N]);

  return (
    <div className="relative px-12 sm:px-14" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <button
        type="button"
        onClick={prev}
        className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-ink/60 shadow-sm transition-colors hover:border-brand-primary hover:text-brand-primary"
        aria-label="Anterior"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-ink/60 shadow-sm transition-colors hover:border-brand-primary hover:text-brand-primary"
        aria-label="Siguiente"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      <div className="grid grid-cols-2 gap-4 overflow-hidden sm:grid-cols-4">
        {visible.map((t, i) => {
          const isCenterPair = i === 1 || i === 2;
          return (
            <div
              key={`${start}-${i}`}
              className={`flex flex-col rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all duration-300 ${
                isCenterPair ? 'opacity-100' : 'hidden opacity-35 sm:flex'
              }`}
            >
              <p className="flex-1 text-sm text-ink/70">
                Texto real de la reseña, tal cual quedó publicada en Google — sin editar el contenido.
              </p>
              <div className="my-4 h-px w-full bg-black/5" />
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.avatarBg}`}>
                  <UserIcon />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">Nombre del cliente</p>
                  <p className="truncate text-xs text-ink/45">Cargo / empresa</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        {PLACEHOLDERS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStart(i)}
            aria-label={`Ir a la reseña ${i + 1}`}
            className={`h-2 cursor-pointer rounded-full transition-all ${i === start ? 'w-5 bg-brand-primary' : 'w-2 bg-black/15'}`}
          />
        ))}
      </div>
    </div>
  );
}
