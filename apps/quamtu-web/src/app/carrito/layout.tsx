import type { ReactNode } from 'react';
import { sinIndexar } from '@/lib/seo';

export const metadata = { title: 'Carrito — Quamtu', ...sinIndexar };

export default function CarritoLayout({ children }: { children: ReactNode }) {
  return children;
}
