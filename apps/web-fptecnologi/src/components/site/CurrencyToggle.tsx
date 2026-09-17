'use client';

import { useState } from 'react';

type Tone = 'light' | 'dark';

const TONE = {
  light: 'border-black/10 text-ink hover:border-brand-primary hover:text-brand-primary',
  dark: 'border-white/25 text-white hover:border-white hover:bg-white/5',
} as const;

/*
 * Selector de moneda del header -- todavía sin tasa de cambio real conectada
 * (ver docs/estructura-home.md, "qué quedó fuera a propósito"). Por ahora
 * solo cambia la etiqueta visible; no recalcula ningún precio del sitio,
 * para no simular una conversión que no existe.
 */
export function CurrencyToggle({ tone = 'light' }: { tone?: Tone }) {
  const [currency, setCurrency] = useState<'USD' | 'PEN'>('USD');

  return (
    <button
      type="button"
      onClick={() => setCurrency((c) => (c === 'USD' ? 'PEN' : 'USD'))}
      aria-label="Cambiar moneda"
      title="Cambiar moneda (próximamente afecta precios)"
      className={`flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${TONE[tone]}`}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] leading-none">
        {currency === 'USD' ? '$' : 'S/'}
      </span>
      {currency}
    </button>
  );
}
