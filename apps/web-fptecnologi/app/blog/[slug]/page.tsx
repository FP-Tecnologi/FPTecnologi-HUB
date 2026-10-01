import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Tag, UserRound } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { ArticuloCard } from '@/components/site/BlogListado';
import { CompartirArticulo } from '@/components/site/CompartirArticulo';
import { IndiceArticulo } from '@/components/site/IndiceArticulo';
import { ProgresoLectura } from '@/components/site/ProgresoLectura';
import { NewsletterForm } from '@/components/home/NewsletterForm';
import { SectionBadge } from '@/components/home/SectionBadge';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { fechaLarga, getArticulo, getArticulos, PORTADA_DEFECTO } from '@/lib/blog';
import { indiceArticulo, markdownToHtml, minutosLectura } from '@/lib/markdown';

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
    keywords: a.etiquetas,
    alternates: { canonical: url },
    openGraph: { type: 'article', title: a.titulo, description: a.resumen, url, images: [imagen], publishedTime: a.publicadoEn ?? undefined, tags: a.etiquetas },
    twitter: { card: 'summary_large_image', title: a.titulo, description: a.resumen, images: [imagen] },
  };
}

const tituloLateral = 'text-xs font-bold uppercase tracking-[0.18em] text-ink';
const barra = <span className="mt-2 block h-0.5 w-8 rounded-full bg-brand-primary" />;

export default async function ArticuloPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticulo(slug);
  if (!a) notFound();

  const todos = await getArticulos(); // más reciente primero
  const idx = todos.findIndex((x) => x.slug === a.slug);
  const anterior = idx >= 0 ? todos[idx + 1] : undefined; // el siguiente en la lista es el más antiguo
  const siguiente = idx > 0 ? todos[idx - 1] : undefined;
  // Relacionados: misma categoría o etiquetas en común primero, luego los más recientes.
  const puntaje = (x: (typeof todos)[number]) =>
    (x.categoria === a.categoria ? 2 : 0) + x.etiquetas.filter((t) => a.etiquetas.includes(t)).length;
  const otros = todos.filter((x) => x.slug !== a.slug);
  const relacionados = [...otros].sort((x, y) => puntaje(y) - puntaje(x)).slice(0, 3);
  const recientes = otros.slice(0, 3);
  const categorias = [...todos.reduce((m, x) => m.set(x.categoria, (m.get(x.categoria) ?? 0) + 1), new Map<string, number>())];
  const etiquetas = [...todos.reduce((m, x) => x.etiquetas.reduce((mm, t) => mm.set(t, (mm.get(t) ?? 0) + 1), m), new Map<string, number>())]
    .sort((x, y) => y[1] - x[1])
    .slice(0, 14);
  const indice = indiceArticulo(a.contenido);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.titulo,
    description: a.resumen,
    image: a.portadaUrl || PORTADA_DEFECTO,
    datePublished: a.publicadoEn ?? undefined,
    keywords: a.etiquetas.join(', '),
    author: { '@type': 'Person', name: a.autorNombre },
    publisher: { '@type': 'Organization', name: 'FPTecnologi' },
    mainEntityOfPage: `${SITE}/blog/${a.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProgresoLectura />
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: a.categoria, href: `/blog?categoria=${encodeURIComponent(a.categoria)}` },
        ]}
        titulo={a.titulo}
        descripcion={a.resumen}
        imagen={a.portadaUrl || PORTADA_DEFECTO}
      />

      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-8">
            <article id="articulo" className="rounded-2xl bg-white p-7 shadow-lg shadow-brand-dark/10 sm:p-10">
              <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-brand-dark/10 pb-6 text-sm text-ink/55">
                <a href={`/blog?categoria=${encodeURIComponent(a.categoria)}`} className="rounded-lg bg-brand-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-primary transition-colors hover:bg-brand-primary hover:text-white">
                  {a.categoria}
                </a>
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
                <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-brand-dark/10 pt-6">
                  <Tag className="h-4 w-4 text-brand-primary" strokeWidth={2} />
                  {a.etiquetas.map((t) => (
                    <a
                      key={t}
                      href={`/blog?etiqueta=${encodeURIComponent(t)}`}
                      className="rounded-md bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                    >
                      #{t}
                    </a>
                  ))}
                </div>
              )}
            </article>

            {/* Autor */}
            <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg shadow-brand-dark/10">
              <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-dark font-display text-xl font-bold text-white">
                {a.autorNombre.trim().charAt(0).toUpperCase() || 'F'}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-primary">Escrito por</p>
                <p className="font-display text-lg font-bold text-ink">{a.autorNombre}</p>
                <p className="text-sm text-ink/55">Equipo de FPTecnologi · soluciones TI para empresas e instituciones del Perú.</p>
              </div>
            </div>

            {/* Anterior / siguiente */}
            {(anterior || siguiente) && (
              <nav aria-label="Más artículos" className="grid gap-4 sm:grid-cols-2">
                {anterior ? (
                  <a href={`/blog/${anterior.slug}`} className="group flex items-center gap-3 rounded-2xl bg-white p-5 shadow-lg shadow-brand-dark/10 transition-all hover:-translate-y-1 hover:shadow-xl">
                    <ArrowLeft className="h-5 w-5 shrink-0 text-brand-primary transition-transform group-hover:-translate-x-1" strokeWidth={2} />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-ink/45">Anterior</span>
                      <span className="line-clamp-2 font-display font-bold leading-snug text-ink group-hover:text-brand-primary">{anterior.titulo}</span>
                    </span>
                  </a>
                ) : <span />}
                {siguiente ? (
                  <a href={`/blog/${siguiente.slug}`} className="group flex items-center justify-end gap-3 rounded-2xl bg-white p-5 text-right shadow-lg shadow-brand-dark/10 transition-all hover:-translate-y-1 hover:shadow-xl">
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-ink/45">Siguiente</span>
                      <span className="line-clamp-2 font-display font-bold leading-snug text-ink group-hover:text-brand-primary">{siguiente.titulo}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-brand-primary transition-transform group-hover:translate-x-1" strokeWidth={2} />
                  </a>
                ) : <span />}
              </nav>
            )}
          </div>

          <aside className="space-y-6 lg:self-start">
            <IndiceArticulo items={indice} />
            <CompartirArticulo titulo={a.titulo} />

            {recientes.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-lg shadow-brand-dark/10">
                <p className={tituloLateral}>Recientes{barra}</p>
                <ul className="mt-4 space-y-4">
                  {recientes.map((r) => (
                    <li key={r.id}>
                      <a href={`/blog/${r.slug}`} className="group flex gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.portadaUrl || PORTADA_DEFECTO} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-brand-primary">{r.titulo}</span>
                          <span className="mt-1 block text-xs text-ink/45">{fechaLarga(r.publicadoEn)}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {categorias.length > 1 && (
              <div className="rounded-2xl bg-white p-6 shadow-lg shadow-brand-dark/10">
                <p className={tituloLateral}>Categorías{barra}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {categorias.map(([c, n]) => (
                    <li key={c}>
                      <a href={`/blog?categoria=${encodeURIComponent(c)}`} className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-paper hover:text-brand-primary ${c === a.categoria ? 'bg-brand-primary/10 font-semibold text-brand-primary' : 'text-ink/70'}`}>
                        {c}
                        <span className="rounded-md bg-ink/5 px-2 py-0.5 text-xs font-semibold text-ink/55">{n}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {etiquetas.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-lg shadow-brand-dark/10">
                <p className={tituloLateral}>Etiquetas{barra}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {etiquetas.map(([t]) => (
                    <a key={t} href={`/blog?etiqueta=${encodeURIComponent(t)}`} className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-brand-primary hover:text-white ${a.etiquetas.includes(t) ? 'bg-brand-primary/15 text-brand-primary' : 'bg-paper text-ink/65'}`}>
                      #{t}
                    </a>
                  ))}
                </div>
              </div>
            )}

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

            <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white shadow-xl shadow-brand-dark/25">
              <p className="font-display text-lg font-bold leading-snug">Recibe nuevas guías en tu correo</p>
              <p className="mb-4 mt-1.5 text-sm text-white/60">Artículos y novedades de tecnología para empresas. Sin spam.</p>
              <NewsletterForm />
            </div>
          </aside>
        </section>

        {relacionados.length > 0 && (
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
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {relacionados.map((o) => (
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
