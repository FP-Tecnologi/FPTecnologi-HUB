'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { NAV_LINKS, buildNavLinks, type NavLinks } from '@/lib/nav';

/*
 * Servicios de la base de datos disponibles para los componentes de cliente
 * (el menú). El layout raíz (servidor) los lee con getServicios() y los pasa
 * acá; sin provider se usa el menú de respaldo.
 */
type Item = { title: string; slug: string };
const Ctx = createContext<{ servicios: readonly Item[]; categorias: readonly Item[] } | null>(null);

export function ServiciosProvider({ servicios, categorias = [], children }: { servicios: readonly Item[]; categorias?: readonly Item[]; children: ReactNode }) {
  const valor = useMemo(() => ({ servicios, categorias }), [servicios, categorias]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useNavLinks(): NavLinks {
  const datos = useContext(Ctx);
  return useMemo(() => (datos ? buildNavLinks(datos.servicios, datos.categorias.length ? datos.categorias : undefined) : NAV_LINKS), [datos]);
}
