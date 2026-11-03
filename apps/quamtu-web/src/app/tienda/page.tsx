import { Suspense } from 'react';
import Tienda from '@/components/Tienda';
import { meta } from '@/lib/seo';

export const metadata = meta('Tienda de componentes para PC — Quamtu', 'Gabinetes, procesadores, placas, memoria RAM, tarjetas de video, SSD, coolers y fuentes para armar tu equipo. Cotiza por WhatsApp.', '/tienda');

export default function Page() {
  return <Suspense><Tienda /></Suspense>;
}
