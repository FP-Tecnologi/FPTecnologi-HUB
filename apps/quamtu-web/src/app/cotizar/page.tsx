import Cotizador from '@/components/Cotizador';
import { BUILDS, porId } from '@/lib/piezas';
import { meta } from '@/lib/seo';

export const metadata = meta('Cotizador — Quamtu', 'Arma tu cotización con equipos y componentes y recíbela de nuestros especialistas.', '/cotizar');

export default async function Cotizar({ searchParams }: { searchParams: Promise<{ pieza?: string; build?: string }> }) {
  const { pieza, build } = await searchParams;
  // ?pieza=id o ?build=N parten con ese producto ya añadido.
  const inicial = BUILDS[Number(build)] ? { tipo: 'build' as const, id: String(Number(build)) } : pieza && porId(pieza) ? { tipo: 'pieza' as const, id: pieza } : undefined;
  return <Cotizador inicial={inicial} />;
}
