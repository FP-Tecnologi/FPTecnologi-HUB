import { Suspense } from 'react';
import { CotizarConParams } from '@/components/ParamsPaginas';
import { meta } from '@/lib/seo';

export const metadata = meta('Cotizador de equipos y componentes — Quamtu', 'Arma tu cotización con equipos y componentes y recíbela de nuestros especialistas.', '/cotizar');

export default function Cotizar() {
  return <Suspense><CotizarConParams /></Suspense>;
}
