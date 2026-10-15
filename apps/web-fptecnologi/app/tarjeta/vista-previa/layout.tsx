import type { ReactNode } from 'react';

export const metadata = { title: 'Vista previa de tarjeta', robots: { index: false, follow: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
