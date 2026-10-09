import Builder from '@/components/Builder';
import { BUILDS } from '@/lib/piezas';

export const metadata = { title: 'Arma tu PC — Quamtu' };

export default async function Armar({ searchParams }: { searchParams: Promise<{ build?: string }> }) {
  const { build } = await searchParams;
  return <Builder inicial={BUILDS[Number(build)]?.ids} />;
}
