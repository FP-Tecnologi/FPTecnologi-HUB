import { notFound } from 'next/navigation';
import { SOLUTIONS } from '@/lib/content';
import { PlaceholderPage } from '@/components/site/PlaceholderPage';

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = SOLUTIONS.find((s) => s.slug === slug);
  return { title: solution?.title ?? 'Servicio' };
}

export default async function ServicioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = SOLUTIONS.find((s) => s.slug === slug);
  if (!solution) notFound();

  return (
    <PlaceholderPage
      eyebrow={solution.tag}
      title={solution.title}
      crumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Servicios', href: '/servicios' },
        { label: solution.title, href: `/servicios/${solution.slug}` },
      ]}
    />
  );
}
