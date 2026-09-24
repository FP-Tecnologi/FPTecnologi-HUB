'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/* Producto guardado como favorito: copia de los datos que muestra la lista
   (no solo el SKU), así el widget no depende de que el producto esté en la
   página actual. */
export type FavoriteItem = {
  sku: string;
  name: string;
  brand: string;
  price: number;
  priceBefore?: number | null;
  image: string;
};

type FavoritesContextValue = {
  items: FavoriteItem[];
  isFavorite: (sku: string) => boolean;
  toggle: (item: FavoriteItem) => void;
  remove: (sku: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const STORAGE_KEY = 'fpt-favorites';

// Mismo patrón que CartContext: localStorage por navegador, hidratado en effect.
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* localStorage no disponible — arranca sin favoritos */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento lleno o bloqueado */
    }
  }, [items, hydrated]);

  const toggle = useCallback((item: FavoriteItem) => {
    setItems((prev) => (prev.some((i) => i.sku === item.sku) ? prev.filter((i) => i.sku !== item.sku) : [...prev, item]));
  }, []);

  const remove = useCallback((sku: string) => {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({ items, isFavorite: (sku) => items.some((i) => i.sku === sku), toggle, remove }),
    [items, toggle, remove],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  return ctx;
}
