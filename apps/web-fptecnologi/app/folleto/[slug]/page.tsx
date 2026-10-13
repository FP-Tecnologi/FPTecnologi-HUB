import { notFound } from 'next/navigation';
import { FlipCatalogo } from '@/components/site/FlipCatalogo';
import { urlArchivo } from '@/lib/paginasContenido';

export const dynamic = 'force-dynamic';

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

async function cargar(slug: string): Promise<{ titulo: string; archivo: string } | null> {
  if (!MARCA_ID || !/^[a-z0-9-]{3,80}$/.test(slug)) return null;
  try {
    const res = await fetch(`${API_URL}/public/folletos/${slug}?marcaId=${encodeURIComponent(MARCA_ID)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}

// El folleto es para compartir por enlace, no para aparecer en Google.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const f = await cargar((await params).slug);
  return { title: f ? f.titulo : 'Folleto', robots: { index: false, follow: false } };
}

export default async function FolletoPage({ params }: { params: Promise<{ slug: string }> }) {
  const f = await cargar((await params).slug);
  if (!f) notFound();
  return <FlipCatalogo inmersivo src={urlArchivo(f.archivo)} titulo={f.titulo} />;
}
