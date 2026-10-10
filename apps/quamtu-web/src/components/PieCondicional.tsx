'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

// El armador ocupa toda la pantalla (3D + asistente): ahí no se muestra el pie de página.
export default function PieCondicional({ children }: { children: ReactNode }) {
  const ruta = usePathname();
  return ruta.startsWith('/armar') ? null : <>{children}</>;
}
