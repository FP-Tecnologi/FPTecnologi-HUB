'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Phase = 'idle' | 'sweeping' | 'done';

const SWEEP_MS = 900;
const DONE_MS = 1400;

/** Efecto de clic (no hover), en 2 pasos, con el botón SIEMPRE del mismo
 * tamaño (se mide su ancho natural al montar y se fija, nunca se agranda ni
 * se encoge): primero el ícono avanza de un lado al otro mientras el texto
 * se va borrando de verdad de izquierda a derecha (clip-path, no un fade
 * parejo) — luego, recién cuando terminó de borrarse, el botón pasa al
 * estado final ("Agregado"). Generaliza el patrón real de "Agregar al
 * carrito" (FeaturedProducts.tsx). `className`/`doneClassName` traen TODO el
 * estilo visual (relleno, borde, color) para poder reusarlo en botones
 * primario/secundario/texto, no solo el glow. */
export function ClickConfirmButton({
  icon,
  label,
  doneIcon,
  doneLabel,
  className = 'btn-glow rounded-full px-6 py-3 text-sm font-semibold text-white',
  doneClassName = 'bg-emerald-500 shadow-lg shadow-emerald-500/40 rounded-full px-6 py-3 text-sm font-semibold text-white',
}: {
  icon: ReactNode;
  label: string;
  doneIcon: ReactNode;
  doneLabel: string;
  className?: string;
  doneClassName?: string;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [width, setWidth] = useState<number>();
  const [iconTravel, setIconTravel] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!btnRef.current || !iconRef.current) return;
    const btnRect = btnRef.current.getBoundingClientRect();
    const iconRect = iconRef.current.getBoundingClientRect();
    const cs = getComputedStyle(btnRef.current);
    const paddingRight = parseFloat(cs.paddingRight) || 0;
    setWidth(btnRect.width);
    // El ícono debe terminar pegado al padding derecho, no salirse — se mide
    // su posición y ancho reales en vez de asumir un padding fijo (rompía en
    // botones angostos como "Ver más" o sin padding como el de solo texto).
    setIconTravel(btnRect.width - paddingRight - iconRect.width - (iconRect.left - btnRect.left));
  }, []);

  function handleClick() {
    if (phase !== 'idle') return;
    setPhase('sweeping');
    window.setTimeout(() => setPhase('done'), SWEEP_MS);
    window.setTimeout(() => setPhase('idle'), SWEEP_MS + DONE_MS);
  }

  const sweeping = phase === 'sweeping';
  const done = phase === 'done';

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      style={width ? { width } : undefined}
      className={`relative flex w-fit items-center overflow-hidden transition-colors duration-300 ${done ? doneClassName : className}`}
    >
      {done ? (
        <span className="flex items-center gap-2">
          {doneIcon}
          {doneLabel}
        </span>
      ) : (
        <span className="relative flex w-full items-center">
          <span
            ref={iconRef}
            className="flex shrink-0 items-center ease-out"
            style={{ transform: sweeping ? `translateX(${iconTravel}px)` : 'translateX(0)', transition: `transform ${SWEEP_MS}ms ease-out` }}
          >
            {icon}
          </span>
          <span
            className="ml-2 overflow-hidden whitespace-nowrap ease-out"
            style={{ clipPath: sweeping ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0%)', transition: `clip-path ${SWEEP_MS}ms ease-out` }}
          >
            {label}
          </span>
        </span>
      )}
    </button>
  );
}
