'use client';
import { createContext, useContext } from 'react';
import type { Contacto } from '@/lib/cms';

const Ctx = createContext<Contacto | null>(null);

/** Entrega a los componentes de cliente los datos de contacto vigentes (Ajustes del dashboard), leídos en el servidor. */
export function ContactoProvider({ contacto, children }: { contacto: Contacto; children: React.ReactNode }) {
  return <Ctx value={contacto}>{children}</Ctx>;
}

export function useContacto() {
  const contacto = useContext(Ctx);
  if (!contacto) throw new Error('useContacto debe usarse dentro de <ContactoProvider>');
  return { contacto, waUrl: (texto: string) => `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(texto)}` };
}
