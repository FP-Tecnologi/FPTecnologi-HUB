import { notFound } from 'next/navigation';
import { CalendarDays, Clock, UserRound } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { ArticuloCard } from '@/components/site/BlogListado';
import { CompartirArticulo } from '@/components/site/CompartirArticulo';
import { SectionBadge } from '@/components/home/SectionBadge';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { fechaLarga, getArticulo, getArticulos, PORTADA_DEFECTO } from '@/lib/blog';
import { markdownToHtml, minutosLectura } from '@/lib/markdown';

export const dynamic = 'force-dynamic';

const SITE = process.env.SITE_URL ?? 'https://fptecnologi.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticulo(slug);
  if (!a) return { title: 'Blog' };
  const url = `${SITE}/blog/${a.slug}`;
  const imagen = a.portadaUrl || PORTADA_DEFECTO;
  return {
    title: a.titulo,
    description: a.resumen,
    alternates: { canonical: url },
    openGraph: { type: 'article', title: a.titulo, description: a.resumen, url, images: [imagen], publishedTime: a.publicadoEn ?? undefined },
    twitter: { card: 'summary_large_image', title: a.titulo, description: a.resumen, images: [imagen] },
  };
}

export default async function ArticuloPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticulo(slug);
  if (!a) notFound();
  const otros = (await getArticulos()).filter((x) => x.slug !== a.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.titulo,
    description: a.resumen,
    image: a.portadaUrl || PORTADA_DEFECTO,
    datePublished: a.publicadoEn ?? undefined,
    author: { '@type': 'Person', name: a.autorNombre },
    publisher: { '@type': 'Organization', name: 'FPTecnologi' },
    mainEntityOfPage: `${SITE}/blog/${a.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: a.categoria, href: `/blog/${a.slug}` },
        ]}
        titulo={a.titulo}
        descripcion={a.resumen}
        imagen={a.portadaUrl || PORTADA_DEFECTO}
      />

      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-2xl bg-white p-7 shadow-lg shadow-brand-dark/10 sm:p-10">
            <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-brand-dark/10 pb-6 text-sm text-ink/55">
              <span className="flex items-center gap-1.5">
                <UserRound className="h-4 w-4 text-brand-primary" strokeWidth={2} />
                {a.autorNombre}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-brand-primary" strokeWidth={2} />
                {fechaLarga(a.publicadoEn)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand-primary" strokeWidth={2} />
                {minutosLectura(a.contenido)} min de lectura
              </span>
            </div>
            {/* El HTML sale de markdownToHtml, que escapa todo lo que escribe el autor. */}
            <div className="blog-prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(a.contenido) }} />
            {a.etiquetas.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-brand-dark/10 pt-6">
                {a.etiquetas.map((t) => (
                  <span key={t} className="rounded-md bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold text-brand-primary">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <CompartirArticulo titulo={a.titulo} />
            <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl shadow-brand-dark/25">
              <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-dark" />
              <div className="relative">
                <p className="font-display text-xl font-bold leading-snug">¿Te ayudamos a implementarlo?</p>
                <p className="mt-2 text-sm text-white/75">Visita técnica sin costo y una propuesta a medida de tu empresa.</p>
                <div className="mt-5">
                  <MoreInfoButton tone="dark" href="/cotizador" label="Cotizar" />
                </div>
              </div>
            </div>
          </aside>
        </section>

        {otros.length > 0 && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
                <div>
                  <SectionBadge>Blog</SectionBadge>
                  <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                    <span className="text-ink">Sigue</span> <span className="title-shimmer-light">leyendo</span>
                  </h2>
                </div>
                <MoreInfoButton href="/blog" label="Ver todos" />
              </div>
              <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                {otros.map((o) => (
                  <ArticuloCard key={o.id} a={o} />
                ))}
              </div>
            </div>
          </section>
        )}

        <Contact />
      </main>
      <Footer />
    </>
  );
}
