'use client';

import { useCurrency } from '@/context/CurrencyContext';

/*
 * Selector de moneda final -- versión "sólido con color por moneda"
 * (guia-estilos/CurrencyToggleVariants.tsx, CurrencyToggleSolid): USD en
 * azul de marca, PEN en ámbar (alusión al sol/moneda de oro), en vez del
 * outline neutro que había antes. Es un botón con relleno, así que se ve
 * bien igual en header claro u oscuro -- la prop `tone` se mantiene por
 * compatibilidad con los headers que ya la pasan, pero no cambia el color.
 */
export function CurrencyToggle({ tone: _tone = 'light', className = 'h-10' }: { tone?: 'light' | 'dark'; className?: string }) {
  const { currency, toggleCurrency } = useCurrency();
  const isUsd = currency === 'USD';

  return (
    <button
      type="button"
      onClick={toggleCurrency}
      aria-label="Cambiar moneda"
      title="Cambiar moneda (USD / PEN)"
      className={`flex items-center gap-1.5 rounded-xl px-4 ${className} text-sm font-bold text-white shadow-sm transition-colors ${
        isUsd ? 'bg-brand-primary shadow-brand-primary/30' : 'bg-amber-500 shadow-amber-500/30'
      }`}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[10px] leading-none">
        {isUsd ? '$' : 'S/'}
      </span>
      {currency}
    </button>
  );
}
