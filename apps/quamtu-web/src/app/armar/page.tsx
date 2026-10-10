import Builder from '@/components/Builder';
import { BUILDS, porId } from '@/lib/piezas';

export const metadata = { title: 'Arma tu PC — Quamtu' };

export default async function Armar({ searchParams }: { searchParams: Promise<{ build?: string; pieza?: string }> }) {
  const { build, pieza } = await searchParams;
  // ?build=N carga una configuración lista; ?pieza=id parte desde una pieza de la tienda.
  const inicial = BUILDS[Number(build)]?.ids ?? (pieza && porId(pieza) ? [pieza] : undefined);
  return <Builder inicial={inicial} />;
}
