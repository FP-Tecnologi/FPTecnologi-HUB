'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

const MONEDAS = [
  { id: 'USD', simbolo: '$', nombre: 'Dólares' },
  { id: 'PEN', simbolo: 'S/', nombre: 'Soles' },
] as const;

/*
 * Selector de moneda desplegable y compacto: el botón muestra la moneda activa con su símbolo ($ / S/) y,
 * al hacer clic, se abre debajo la otra opción; al elegirla cambia la moneda. Siempre en el color de la
 * marca (botón blanco translúcido sobre el encabezado azul/oscuro, azul claro con `tone="light"`).
 */
export function CurrencyToggle({ tone = 'dark', className = 'h-10' }: { tone?: 'light' | 'dark'; className?: string }) {
  const { currency, toggleCurrency } = useCurrency();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const light = tone === 'light';
  const actual = MONEDAS.find((m) => m.id === currency) ?? MONEDAS[0];

  useEffect(() => {
    function fuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') setAbierto(false);
    }
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', esc);
    };
  }, []);

  function elegir(id: 'USD' | 'PEN') {
    if (id !== currency) toggleCurrency();
    setAbierto(false);
  }

  const simbolo = (txt: string, activo: boolean) => (
    <span
      aria-hidden
      className={`flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1 text-[12px] font-extrabold leading-none ${
        activo ? (light ? 'bg-brand-primary text-white' : 'bg-white text-brand-700') : 'bg-brand-50 text-brand-700'
      }`}
    >
      {txt}
    </span>
  );

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        aria-label={`Moneda: ${actual.nombre.toLowerCase()}. Cambiar moneda`}
        title="Cambiar moneda"
        className={`flex items-center gap-1.5 rounded-xl border px-2 text-xs font-extrabold tracking-wide transition-colors ${className} ${
          light ? 'border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-primary' : 'border-white/40 bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        {simbolo(actual.simbolo, true)}
        {actual.id}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </button>

      {abierto && (
        <ul role="listbox" aria-label="Moneda" className="absolute right-0 top-full z-50 mt-2 min-w-[9rem] overflow-hidden rounded-xl border border-brand-100 bg-white p-1 shadow-xl shadow-brand-950/25">
          {MONEDAS.map((m) => {
            const activa = m.id === currency;
            return (
              <li key={m.id} role="option" aria-selected={activa}>
                <button
                  type="button"
                  onClick={() => elegir(m.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition-colors ${
                    activa ? 'bg-brand-50 text-brand-700' : 'text-ink hover:bg-brand-primary hover:text-white'
                  }`}
                >
                  {simbolo(m.simbolo, activa)}
                  <span className="flex-1">{m.id}</span>
                  {activa && <Check className="h-4 w-4 text-brand-primary" strokeWidth={2.5} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
