'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CartItem = {
  sku: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  envio: number;
  igv: number;
  total: number;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
  justAddedSku: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'fpt-cart';
const IGV_RATE = 0.18;
/* Precios del catálogo (FEATURED_PRODUCTS) son SIN IGV -- el 18% se calcula
   acá encima del subtotal, para el carrito y el checkout. Envío gratis por
   ahora (no hay reglas de costo de envío todavía). */
const ENVIO = 0;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [justAddedSku, setJustAddedSku] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* localStorage no disponible — el carrito arranca vacío */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento lleno o bloqueado — no interrumpe la sesión */
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, 'qty'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.sku === item.sku);
      if (existing) return prev.map((i) => (i.sku === item.sku ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...item, qty: 1 }];
    });
    setJustAddedSku(item.sku);
    window.setTimeout(() => setJustAddedSku((cur) => (cur === item.sku ? null : cur)), 2000);
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const setQty = useCallback((sku: string, qty: number) => {
    if (qty < 1) {
      setItems((prev) => prev.filter((i) => i.sku !== sku));
      return;
    }
    setItems((prev) => prev.map((i) => (i.sku === sku ? { ...i, qty } : i)));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
    const envio = items.length === 0 ? 0 : ENVIO;
    const igv = subtotal * IGV_RATE;
    const total = subtotal + envio + igv;
    return { items, count, subtotal, envio, igv, total, addItem, removeItem, setQty, clear, justAddedSku };
  }, [items, addItem, removeItem, setQty, clear, justAddedSku]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
