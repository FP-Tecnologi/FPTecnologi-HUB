import { notFound } from 'next/navigation';
import { TarjetaVista, type DatosTarjeta } from '@/components/site/TarjetaVista';
import { buscarPorMarca } from '@/lib/publicoPorMarca';

export const dynamic = 'force-dynamic';

async function cargar(slug: string): Promise<DatosTarjeta | null> {
  if (!/^[a-z0-9-]{3,60}$/.test(slug)) return null;
  const res = await buscarPorMarca(`/public/tarjetas/${slug}`);
  return res ? ((await res.json())?.data ?? null) : null;
}

// La tarjeta es para compartir por QR o enlace, no para aparecer en Google.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = await cargar((await params).slug);
  const descripcion = t ? [t.cargo, 'FPTecnologi & System'].filter(Boolean).join(' · ') : 'Tarjeta digital de FPTecnologi & System.';
  return { title: t ? t.nombre : 'Tarjeta digital', description: descripcion, robots: { index: false, follow: false } };
}

export default async function TarjetaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await cargar(slug);
  if (!t) notFound();
  return <TarjetaVista t={t} />;
}
