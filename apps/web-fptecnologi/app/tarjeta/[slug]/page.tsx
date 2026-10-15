import { notFound } from 'next/navigation';
import { TarjetaVista, type DatosTarjeta } from '@/components/site/TarjetaVista';

export const dynamic = 'force-dynamic';

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

async function cargar(slug: string): Promise<DatosTarjeta | null> {
  if (!MARCA_ID || !/^[a-z0-9-]{3,60}$/.test(slug)) return null;
  try {
    const res = await fetch(`${API_URL}/public/tarjetas/${slug}?marcaId=${encodeURIComponent(MARCA_ID)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}

// La tarjeta es para compartir por QR o enlace, no para aparecer en Google.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = await cargar((await params).slug);
  return { title: t ? t.nombre : 'Tarjeta digital', robots: { index: false, follow: false } };
}

export default async function TarjetaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await cargar(slug);
  if (!t) notFound();
  return <TarjetaVista t={t} />;
}
