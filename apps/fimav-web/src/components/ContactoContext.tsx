'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { contacto as respaldo } from '@/lib/contacto';
import type { Contacto } from '@/lib/cms';

/* Datos de contacto vigentes (Administrador → Web Fimav → Ajustes) para los componentes de cliente; el layout los
   lee del CMS una vez por visita. Sin proveedor (o si la API no respondió) quedan los de lib/contacto.ts. */
const Ctx = createContext<Contacto>(respaldo);

export function ContactoProvider({ valor, children }: { valor: Contacto; children: ReactNode }) {
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export const useContacto = () => useContext(Ctx);
export const waUrl = (numero: string, texto: string) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
