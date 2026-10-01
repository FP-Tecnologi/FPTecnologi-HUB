'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Currency = 'USD' | 'PEN';

/*
 * Tipo de cambio de referencia: valor por defecto hasta que /api/config
 * (variable TIPO_CAMBIO_USD_PEN del servidor) responde. Un solo lugar para
 * cambiarlo, en vez de repetirlo en cada monto.
 */
const USD_TO_PEN_DEFECTO = 3.75;

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  /** Tipo de cambio USD→PEN vigente (viene del servidor). */
  rate: number;
  /** Formatea un monto que está en USD (la moneda base de todos los precios reales) a la moneda activa. */
  format: (usdAmount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE_KEY = 'fpt-currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [rate, setRate] = useState(USD_TO_PEN_DEFECTO);

  useEffect(() => {
    let vivo = true;
    fetch('/api/config')
      .then((r) => (r.ok ? r.json() : null))
      .then((c: { tipoCambio?: number } | null) => {
        if (vivo && c && typeof c.tipoCambio === 'number' && c.tipoCambio > 0) setRate(c.tipoCambio);
      })
      .catch(() => {
        /* sin /api/config se queda con el valor por defecto */
      });
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'USD' || stored === 'PEN') setCurrencyState(stored);
    } catch {
      /* localStorage no disponible -- arranca en USD */
    }
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* no interrumpe la sesión */
    }
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency(currency === 'USD' ? 'PEN' : 'USD');
  }, [currency, setCurrency]);

  const value = useMemo<CurrencyContextValue>(() => {
    const format = (usdAmount: number) =>
      currency === 'USD' ? `$${usdAmount.toFixed(2)}` : `S/ ${(usdAmount * rate).toFixed(2)}`;
    return { currency, setCurrency, toggleCurrency, rate, format };
  }, [currency, setCurrency, toggleCurrency, rate]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency debe usarse dentro de <CurrencyProvider>');
  return ctx;
}
