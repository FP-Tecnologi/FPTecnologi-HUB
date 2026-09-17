'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Currency = 'USD' | 'PEN';

/*
 * Tipo de cambio de referencia (no hay integración con una API de tasas en
 * vivo todavía -- ver docs/estructura-home.md). Un solo número acá para
 * actualizarlo cuando haga falta, en vez de tenerlo repetido en cada lugar
 * que muestra un monto.
 */
const USD_TO_PEN = 3.75;

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  /** Formatea un monto que está en USD (la moneda base de todos los precios reales) a la moneda activa. */
  format: (usdAmount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE_KEY = 'fpt-currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');

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
      currency === 'USD' ? `$${usdAmount.toFixed(2)}` : `S/ ${(usdAmount * USD_TO_PEN).toFixed(2)}`;
    return { currency, setCurrency, toggleCurrency, format };
  }, [currency, setCurrency, toggleCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency debe usarse dentro de <CurrencyProvider>');
  return ctx;
}
