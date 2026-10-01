'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { NAV_LINKS, buildNavLinks, type NavLinks } from '@/lib/nav';

/*
 * Servicios de la base de datos disponibles para los componentes de cliente
 * (el menú). El layout raíz (servidor) los lee con getServicios() y los pasa
 * acá; sin provider se usa el menú de respaldo.
 */
type Item = { title: string; slug: string };
const Ctx = createContext<readonly Item[] | null>(null);

export function ServiciosProvider({ servicios, children }: { servicios: readonly Item[]; children: ReactNode }) {
  return <Ctx.Provider value={servicios}>{children}</Ctx.Provider>;
}

export function useNavLinks(): NavLinks {
  const servicios = useContext(Ctx);
  return useMemo(() => (servicios ? buildNavLinks(servicios) : NAV_LINKS), [servicios]);
}
