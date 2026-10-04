'use client';

import { useCurrency } from '@/context/CurrencyContext';

/*
 * Selector de moneda tipo interruptor compacto: USD a la izquierda y PEN a la
 * derecha; la perilla se desliza hasta la moneda activa y lleva su código.
 * Siempre en el color de la marca (la perilla es blanca sobre el encabezado
 * azul/oscuro, y azul primaria con `tone="light"` sobre fondos claros); ya no
 * cambia a ámbar con soles.
 */
export function CurrencyToggle({ tone = 'dark', className = 'h-10' }: { tone?: 'light' | 'dark'; className?: string }) {
  const { currency, toggleCurrency } = useCurrency();
  const isUsd = currency === 'USD';
  const light = tone === 'light';

  const label = (activo: boolean) =>
    `relative z-10 flex flex-1 items-center justify-center text-xs font-extrabold tracking-wide transition-colors duration-300 ${
      activo ? (light ? 'text-white' : 'text-brand-700') : light ? 'text-ink/65' : 'text-white/85'
    }`;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isUsd}
      onClick={toggleCurrency}
      aria-label={`Moneda: ${isUsd ? 'dólares' : 'soles'}. Cambiar a ${isUsd ? 'soles' : 'dólares'}`}
      title="Cambiar moneda (USD / PEN)"
      className={`relative flex w-[5.5rem] shrink-0 items-stretch rounded-full border p-1 transition-colors ${className} ${
        light ? 'border-brand-200 bg-brand-50 hover:border-brand-primary' : 'border-white/40 bg-white/10 hover:bg-white/20'
      }`}
    >
      {/* Perilla que se desliza hasta la moneda activa. */}
      <span
        aria-hidden
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full shadow-md transition-transform duration-300 ease-out ${
          isUsd ? 'translate-x-0' : 'translate-x-full'
        } ${light ? 'bg-brand-primary shadow-brand-950/25' : 'bg-white shadow-black/25'}`}
      />
      <span className={label(isUsd)}>USD</span>
      <span className={label(!isUsd)}>PEN</span>
    </button>
  );
}
