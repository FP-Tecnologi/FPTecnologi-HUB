'use client';

import { useState, type MouseEvent, type ReactNode } from 'react';

/** Ondas al clic (propuesta — no está aplicado en ningún modelo todavía):
 * un círculo nace en el punto exacto donde se hizo clic y crece
 * desvaneciéndose, tipo "ripple" de Material Design. `className` trae todo
 * el estilo visual; `rippleClassName` el color de la onda (clara sobre
 * fondos de color, oscura/de marca sobre fondos blancos). */
export function RippleClickButton({
  children,
  className = 'btn-glow rounded-full px-6 py-3 text-sm font-semibold text-white',
  rippleClassName = 'bg-white/50',
}: {
  children: ReactNode;
  className?: string;
  rippleClassName?: string;
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  }

  return (
    <button type="button" onClick={handleClick} className={`relative flex w-fit items-center gap-2 overflow-hidden ${className}`}>
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className={`animate-ripple pointer-events-none absolute h-3 w-3 -ml-1.5 -mt-1.5 rounded-full ${rippleClassName}`}
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </button>
  );
}
