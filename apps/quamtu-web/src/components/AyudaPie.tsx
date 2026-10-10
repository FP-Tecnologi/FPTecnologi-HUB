'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

// En la home el cierre de la página ya ofrece WhatsApp y cotizador: el pie no los repite.
export default function AyudaPie({ children }: { children: ReactNode }) {
  return usePathname() === '/' ? null : <>{children}</>;
}
