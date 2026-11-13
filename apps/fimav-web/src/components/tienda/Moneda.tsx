'use client';
/*
 * Moneda de la tienda: los precios vienen en dólares (USD, sin IGV) y aquí se muestran en dólares o en soles con el tipo de cambio
 * vigente. La elección se recuerda en el navegador. El selector vive en la cabecera.
 */
import { Forma } from '@/components/hex/BotonHex';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Moneda = 'USD' | 'PEN';
type Valor = { moneda: Moneda; setMoneda: (m: Moneda) => void; tipoCambio: number; formato: (usd: number) => string };
const CLAVE = 'fimav-moneda';
const Ctx = createContext<Valor>({ moneda: 'USD', setMoneda: () => {}, tipoCambio: 3.75, formato: (n) => `US$ ${n}` });

export function MonedaProvider({ tipoCambio, children }: { tipoCambio: number; children: ReactNode }) {
  const [moneda, setM] = useState<Moneda>('USD');
  useEffect(() => {
    try { const g = localStorage.getItem(CLAVE); if (g === 'USD' || g === 'PEN') setM(g); } catch { /* sin almacenamiento: queda en dólares */ }
  }, []);
  const setMoneda = useCallback((m: Moneda) => {
    setM(m);
    try { localStorage.setItem(CLAVE, m); } catch { /* no interrumpe */ }
  }, []);
  const valor = useMemo<Valor>(() => ({
    moneda, setMoneda, tipoCambio,
    formato: (usd) => (moneda === 'USD'
      ? `US$ ${usd.toLocaleString('es-PE', { maximumFractionDigits: 2 })}`
      : `S/ ${(usd * tipoCambio).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
  }), [moneda, setMoneda, tipoCambio]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export const useMoneda = () => useContext(Ctx);

/** Un monto (en USD) en la moneda elegida. */
export function Precio({ usd }: { usd: number }) {
  return <>{useMoneda().formato(usd)}</>;
}

/** Selector S/ | US$ de la cabecera, con el mismo lenguaje hexagonal de los botones de la web (contorno rojo, opción activa en rojo). */
export function MonedaSelector() {
  const { moneda, setMoneda, tipoCambio } = useMoneda();
  const op = (m: Moneda, texto: string, nombre: string) => {
    const activa = moneda === m;
    return (
      <button type="button" aria-pressed={activa} aria-label={nombre} onClick={() => setMoneda(m)}
        className={`group/hex relative isolate flex min-h-8 min-w-9 items-center justify-center px-2 font-display text-sm sm:min-w-12 sm:px-3 sm:text-base font-bold uppercase tracking-wider transition-colors focus-visible:outline-hidden ${activa ? 'text-white' : 'text-rojo-hondo hover:text-boton'}`}>
        {activa && <Forma className="inset-0 text-boton" />}
        <Forma className="-inset-[3px] text-tinta opacity-0 group-focus-visible/hex:opacity-100" />
        {texto}
      </button>
    );
  };
  return (
    <div role="group" aria-label="Moneda" title={`Tipo de cambio: S/ ${tipoCambio.toFixed(2)} por dólar`} className="relative isolate flex min-h-10 shrink-0 items-center gap-0 px-3 sm:gap-0.5 sm:px-4">
      <Forma className="inset-0 text-rojo-hondo" />
      <Forma className="inset-[2px] text-white" />
      {op('PEN', 'S/', 'Soles')}
      {op('USD', 'US$', 'Dólares')}
    </div>
  );
}
