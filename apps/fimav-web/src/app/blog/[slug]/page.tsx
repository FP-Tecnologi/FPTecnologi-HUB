import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Clock, UserRound } from 'lucide-react';
import BannerPagina from '@/components/BannerPagina';
import ArticuloCard from '@/components/blog/ArticuloCard';
import BotonHex from '@/components/hex/BotonHex';
import JsonLd from '@/components/JsonLd';
import { fechaLarga, getArticulo, getArticulos, PORTADA_DEFECTO } from '@/lib/blog';
import { markdownToHtml, minutosLectura } from '@/lib/markdown';
import { meta, migas, SITIO } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticulo((await params).slug);
  return a ? meta(a.titulo, a.resumen, `/blog/${a.slug}`) : { title: 'Blog' };
}

export default async function ArticuloPage({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticulo((await params).slug);
  if (!a) notFound();
  const todos = await getArticulos();
  const puntaje = (x: (typeof todos)[number]) => (x.categoria === a.categoria ? 2 : 0) + x.etiquetas.filter((t) => a.etiquetas.includes(t)).length;
  const relacionados = todos.filter((x) => x.slug !== a.slug).sort((x, y) => puntaje(y) - puntaje(x)).slice(0, 3);
  const portada = a.portadaUrl || PORTADA_DEFECTO;
  const articuloLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: a.titulo, description: a.resumen,
    image: portada.startsWith('http') ? portada : `${SITIO}${portada}`,
    datePublished: a.publicadoEn ?? undefined, keywords: a.etiquetas.join(', '),
    author: { '@type': 'Person', name: a.autorNombre }, publisher: { '@id': `${SITIO}/#organizacion` },
    mainEntityOfPage: `${SITIO}/blog/${a.slug}`, inLanguage: 'es-PE',
  };
  return (
    <main id="contenido">
      <JsonLd datos={[articuloLd, migas([{ nombre: 'Blog', ruta: '/blog' }, { nombre: a.titulo, ruta: `/blog/${a.slug}` }])]} />
      <BannerPagina eyebrow="Blog" titulo={a.titulo} miga={a.titulo} migas={[{ texto: 'Blog', href: '/blog' }]} imagen={portada} />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-carbon/10 pb-6 text-sm text-carbon/80">
          <Link href={`/blog?categoria=${encodeURIComponent(a.categoria)}`} className="rounded-md bg-rojo/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-rojo-hondo hover:bg-boton hover:text-white">{a.categoria}</Link>
          <span className="flex items-center gap-1.5"><UserRound aria-hidden="true" size={16} />{a.autorNombre}</span>
          <span className="flex items-center gap-1.5"><CalendarDays aria-hidden="true" size={16} />{fechaLarga(a.publicadoEn)}</span>
          <span className="flex items-center gap-1.5"><Clock aria-hidden="true" size={16} />{minutosLectura(a.contenido)} min de lectura</span>
        </div>
        {/* El HTML sale de markdownToHtml, que escapa todo lo que escribe el autor. */}
        <div className="blog-prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(a.contenido) }} />
        {a.etiquetas.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-2 border-t border-carbon/10 pt-6">
            {a.etiquetas.map((t) => <li key={t} className="rounded-md bg-gris px-2.5 py-1 text-xs font-semibold text-carbon">#{t}</li>)}
          </ul>
        )}
        <div className="mt-10 rounded-2xl bg-carbon p-6 text-white sm:p-8">
          <p className="font-display text-xl font-extrabold uppercase tracking-wide">¿Necesitas equipos o una propuesta?</p>
          <p className="mt-2 text-white/85">Te respondemos con una cotización a medida para tu empresa o entidad.</p>
          <div className="mt-5"><BotonHex href="/cotizar" size="lg">Solicitar cotización</BotonHex></div>
        </div>
      </article>
      {relacionados.length > 0 && (
        <section aria-labelledby="mas" className="bg-gris py-12 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 id="mas" className="titulo-menor text-2xl text-carbon">Sigue leyendo</h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{relacionados.map((r) => <li key={r.id} className="flex"><ArticuloCard a={r} /></li>)}</ul>
          </div>
        </section>
      )}
    </main>
  );
}
