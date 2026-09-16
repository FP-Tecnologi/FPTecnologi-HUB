'use client';

import { useState } from 'react';

/** Propuesta combinada: ícono de bolsa (en vez del carrito con ruedas de
 * siempre) + botón cuadrado chico + su propio feedback al agregar — pulso
 * (mismo patrón real del badge del carrito) y el ícono cambia a un check
 * por 1.2s antes de volver. Todo en un solo botón ícono-only, pensado para
 * la tarjeta de producto horizontal de 4.3. */
export function BagAddButton() {
  const [added, setAdded] = useState(false);

  function handleClick() {
    if (added) return;
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Agregar al carrito"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-all duration-200 ${
        added ? 'scale-110 bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'btn-glow scale-100'
      }`}
    >
      {added ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
