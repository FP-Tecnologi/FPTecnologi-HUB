'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { fijarSitio } from '@/lib/chatActions';
import type { Sitio } from '@/lib/sitio';

const Ctx = createContext<Sitio | null>(null);

export function SitioProvider({ sitio, children }: { sitio: Sitio; children: ReactNode }) {
  fijarSitio(sitio); // antes de pintar los hijos, que llaman whatsappHref()
  return <Ctx.Provider value={sitio}>{children}</Ctx.Provider>;
}

export function useSitio(): Sitio {
  const s = useContext(Ctx);
  if (!s) throw new Error('useSitio fuera de SitioProvider');
  return s;
}
