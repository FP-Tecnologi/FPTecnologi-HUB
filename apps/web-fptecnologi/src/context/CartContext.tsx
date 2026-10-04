'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CartItem = {
  sku: string;
  name: string;
  price: number;
  /** Precio de mayorista (si el producto lo tiene); se usa con el perfil mayorista. */
  priceMayor?: number | null;
  image: string;
  qty: number;
};

export type PerfilCompra = 'minorista' | 'mayorista';
/** Unidades mínimas por producto para comprar como mayorista. */
export const MIN_MAYORISTA = 6;

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  envio: number;
  igv: number;
  total: number;
  perfil: PerfilCompra;
  setPerfil: (p: PerfilCompra) => void;
  /** Precio unitario aplicado según el perfil (mayorista o normal). */
  unitPrice: (item: CartItem) => number;
  /** Mayorista: todas las líneas llevan al menos MIN_MAYORISTA unidades. */
  mayoristaOk: boolean;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
  justAddedSku: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'fpt-cart';
const PERFIL_KEY = 'fpt-cart-perfil';
const IGV_RATE = 0.18;
/* Precios del catálogo (FEATURED_PRODUCTS) son SIN IGV -- el 18% se calcula
   acá encima del subtotal, para el carrito y el checkout. Envío gratis por
   ahora (no hay reglas de costo de envío todavía). */
const ENVIO = 0;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [justAddedSku, setJustAddedSku] = useState<string | null>(null);
  const [perfil, setPerfilState] = useState<PerfilCompra>('minorista');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      if (window.localStorage.getItem(PERFIL_KEY) === 'mayorista') setPerfilState('mayorista');
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

  // Al pasar a mayorista, las líneas con menos de MIN_MAYORISTA unidades suben al mínimo.
  const setPerfil = useCallback((p: PerfilCompra) => {
    setPerfilState(p);
    try {
      window.localStorage.setItem(PERFIL_KEY, p);
    } catch {
      /* sin almacenamiento: el perfil vale solo en esta sesión */
    }
    if (p === 'mayorista') setItems((prev) => prev.map((i) => (i.qty < MIN_MAYORISTA ? { ...i, qty: MIN_MAYORISTA } : i)));
  }, []);

  const setQty = useCallback((sku: string, qty: number) => {
    if (qty < 1) {
      setItems((prev) => prev.filter((i) => i.sku !== sku));
      return;
    }
    // Mayorista: no se baja del mínimo (para quitar el producto se usa el tacho).
    if (perfil === 'mayorista' && qty < MIN_MAYORISTA) return;
    setItems((prev) => prev.map((i) => (i.sku === sku ? { ...i, qty } : i)));
  }, [perfil]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const unitPrice = (i: CartItem) => (perfil === 'mayorista' && i.priceMayor != null ? i.priceMayor : i.price);
    const subtotal = items.reduce((sum, i) => sum + i.qty * unitPrice(i), 0);
    const mayoristaOk = items.length > 0 && items.every((i) => i.qty >= MIN_MAYORISTA);
    const envio = items.length === 0 ? 0 : ENVIO;
    const igv = subtotal * IGV_RATE;
    const total = subtotal + envio + igv;
    return { items, count, subtotal, envio, igv, total, perfil, setPerfil, unitPrice, mayoristaOk, addItem, removeItem, setQty, clear, justAddedSku };
  }, [items, perfil, setPerfil, addItem, removeItem, setQty, clear, justAddedSku]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
