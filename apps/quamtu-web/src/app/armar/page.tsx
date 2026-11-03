import { Suspense } from 'react';
import { ArmarConParams } from '@/components/ParamsPaginas';
import { meta } from '@/lib/seo';

export const metadata = meta('Arma tu PC a medida en 3D — Quamtu', 'Configura tu PC o workstation pieza por pieza en 3D: gabinete, procesador, placa, RAM, video, SSD, cooler y fuente, con verificación de compatibilidad.', '/armar');

export default function Armar() {
  return <Suspense><ArmarConParams /></Suspense>;
}
