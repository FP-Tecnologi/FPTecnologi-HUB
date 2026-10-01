import { notFound } from 'next/navigation';
import { LandingView } from '@/components/landing/LandingView';
import { getLanding, imagenLanding } from '@/lib/landings';

// Lo que se publica o edita en el dashboard se ve al instante.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> };

export async function generateMetadata({ params, searchParams }: Props) {
  const [{ slug }, { preview }] = await Promise.all([params, searchParams]);
  const l = await getLanding(slug, preview);
  if (!l) return { title: 'Página no encontrada', robots: { index: false } };
  const c = l.contenido;
  const titulo = [c.titulo, c.destacado].filter(Boolean).join(' ');
  return {
    title: titulo || l.nombre,
    description: c.descripcion || undefined,
    // Los borradores (vista previa) nunca se indexan.
    robots: l.estado === 'PUBLICADA' ? undefined : { index: false, follow: false },
    openGraph: { title: titulo || l.nombre, description: c.descripcion || undefined, images: c.imagenUrl ? [imagenLanding(c.imagenUrl)] : undefined },
  };
}

export default async function LandingPage({ params, searchParams }: Props) {
  const [{ slug }, { preview }] = await Promise.all([params, searchParams]);
  const landing = await getLanding(slug, preview);
  if (!landing) notFound();
  return <LandingView landing={landing} vistaPrevia={landing.estado !== 'PUBLICADA'} />;
}
