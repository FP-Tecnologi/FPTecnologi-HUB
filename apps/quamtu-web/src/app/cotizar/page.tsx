import { Suspense } from 'react';
import { CotizarConParams } from '@/components/ParamsPaginas';
import { meta } from '@/lib/seo';

export const metadata = meta('Cotizador de equipos — Quamtu', 'Elige equipos y workstations, indica cantidades y recibe la cotización de nuestros especialistas.', '/cotizar');

export default function Cotizar() {
  return <Suspense><CotizarConParams /></Suspense>;
}
