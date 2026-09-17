'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Phase = 'idle' | 'sweeping' | 'done';

const SWEEP_MS = 900;
const DONE_MS = 1400;

/**
 * Botón final de "click con efecto sweep" -- promovido desde
 * guia-estilos/ClickConfirmButton.tsx (sección 2.3), elegido como el efecto
 * de clic para primario/secundario/texto en todo el sitio: el ícono viaja de
 * un lado al otro mientras el texto se borra (clip-path), y recién ahí el
 * botón pasa al estado final ("Agregado" / etc.). Generaliza el patrón real
 * que ya usaba "Agregar al carrito" (site2/FeaturedProducts.tsx). El botón
 * mantiene siempre su ancho natural medido al montar, nunca cambia de tamaño.
 */
export function ClickConfirmButton({
  icon,
  label,
  doneIcon,
  doneLabel,
  className = 'btn-glow rounded-full px-6 py-3 text-sm font-semibold text-white',
  doneClassName = 'bg-emerald-500 shadow-lg shadow-emerald-500/40 rounded-full px-6 py-3 text-sm font-semibold text-white',
  onConfirm,
}: {
  icon: ReactNode;
  label: string;
  doneIcon: ReactNode;
  doneLabel: string;
  className?: string;
  doneClassName?: string;
  onConfirm?: () => void;
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
    setIconTravel(btnRect.width - paddingRight - iconRect.width - (iconRect.left - btnRect.left));
  }, []);

  function handleClick() {
    if (phase !== 'idle') return;
    onConfirm?.();
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
