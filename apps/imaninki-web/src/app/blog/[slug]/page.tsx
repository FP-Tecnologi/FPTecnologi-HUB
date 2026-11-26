import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Clock, UserRound } from 'lucide-react';
import Banner from '@/components/Banner';
import ArticuloCard from '@/components/ArticuloCard';
import JsonLd from '@/components/JsonLd';
import { fechaLarga, getArticulo, getArticulos, PORTADA_DEFECTO } from '@/lib/blog';
import { markdownToHtml, minutosLectura } from '@/lib/markdown';
import { meta, migas, SITIO } from '@/lib/seo';

export const dynamic = 'force-dynamic';

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
      <Banner miga="Blog" titulo={a.titulo} foto={portada} />
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-carbon/10 pb-6 text-sm text-carbon/80">
          <Link href={`/blog?categoria=${encodeURIComponent(a.categoria)}`} className="rounded-md bg-rojo/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-rojo-hondo hover:bg-rojo hover:text-white">{a.categoria}</Link>
          <span className="flex items-center gap-1.5"><UserRound aria-hidden="true" size={16} />{a.autorNombre}</span>
          <span className="flex items-center gap-1.5"><CalendarDays aria-hidden="true" size={16} />{fechaLarga(a.publicadoEn)}</span>
          <span className="flex items-center gap-1.5"><Clock aria-hidden="true" size={16} />{minutosLectura(a.contenido)} min de lectura</span>
        </div>
        {/* El HTML sale de markdownToHtml, que escapa todo lo que escribe el autor. */}
        <div className="blog-prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(a.contenido) }} />
        {a.etiquetas.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-2 border-t border-carbon/10 pt-6">
            {a.etiquetas.map((t) => <li key={t} className="rounded-md bg-niebla px-2.5 py-1 text-xs font-semibold text-carbon">#{t}</li>)}
          </ul>
        )}
        <div className="mt-10 rounded-2xl bg-tinta p-6 text-white sm:p-8">
          <p className="text-xl font-extrabold text-white">¿Quieres cotizar para tu proyecto?</p>
          <p className="mt-2 text-white/85">Escríbenos y te respondemos con una propuesta a medida.</p>
          <Link href="/contacto" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-rojo px-6 font-bold text-white hover:bg-rojo-hondo">Contactar</Link>
        </div>
      </article>
      {relacionados.length > 0 && (
        <section aria-labelledby="mas" className="bg-niebla py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 id="mas" className="text-2xl font-extrabold">Sigue leyendo</h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{relacionados.map((r) => <li key={r.id} className="flex"><ArticuloCard a={r} /></li>)}</ul>
          </div>
        </section>
      )}
    </main>
  );
}
