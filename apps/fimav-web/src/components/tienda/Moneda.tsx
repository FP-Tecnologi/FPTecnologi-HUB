'use client';
/*
 * Moneda de la tienda: los precios vienen en dólares (USD, sin IGV) y aquí se muestran en dólares o en soles con el tipo de cambio
 * vigente. La elección se recuerda en el navegador. El selector vive en la cabecera.
 */
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

/** Selector S/ | US$ de la cabecera. */
export function MonedaSelector() {
  const { moneda, setMoneda, tipoCambio } = useMoneda();
  const op = (m: Moneda, texto: string, nombre: string) => (
    <button type="button" aria-pressed={moneda === m} aria-label={nombre} onClick={() => setMoneda(m)}
      className={`min-h-9 rounded-full px-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rojo-hondo ${moneda === m ? 'bg-boton text-white' : 'text-carbon hover:text-rojo-hondo'}`}>{texto}</button>
  );
  return (
    <div role="group" aria-label="Moneda" title={`Tipo de cambio: S/ ${tipoCambio.toFixed(2)} por dólar`} className="cabecera-moneda flex shrink-0 items-center gap-0.5 rounded-full border-2 border-rojo-hondo bg-white p-0.5">
      {op('PEN', 'S/', 'Soles')}
      {op('USD', 'US$', 'Dólares')}
    </div>
  );
}
