import Builder from '@/components/Builder';
import { BUILDS, porId } from '@/lib/piezas';
import { meta } from '@/lib/seo';

export const metadata = meta('Arma tu PC a medida en 3D — Quamtu', 'Configura tu PC o workstation pieza por pieza en 3D: gabinete, procesador, placa, RAM, video, SSD, cooler y fuente, con verificación de compatibilidad.', '/armar');

export default async function Armar({ searchParams }: { searchParams: Promise<{ build?: string; pieza?: string }> }) {
  const { build, pieza } = await searchParams;
  // ?build=N carga una configuración lista; ?pieza=id parte desde una pieza de la tienda.
  const inicial = BUILDS[Number(build)]?.ids ?? (pieza && porId(pieza) ? [pieza] : undefined);
  return <Builder inicial={inicial} />;
}
