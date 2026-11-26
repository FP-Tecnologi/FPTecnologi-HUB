import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Clock, UserRound } from 'lucide-react';
import ArticuloCard from '@/components/ArticuloCard';
import JsonLd from '@/components/JsonLd';
import { fechaLarga, getArticulo, getArticulos } from '@/lib/blog';
import { markdownToHtml, minutosLectura } from '@/lib/markdown';
import { meta, migas, SITIO } from '@/lib/seo';

// Web estática: cada artículo publicado al compilar es una página; lo que no existe da 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const todos = await getArticulos();
  // Sin artículos, Next exige al menos una ruta: se genera una página que luego da 404.
  return todos.length ? todos.map((a) => ({ slug: a.slug })) : [{ slug: '_' }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticulo((await params).slug);
  return a ? meta(`${a.titulo} — Quamtu`, a.resumen, `/blog/${a.slug}`) : { title: 'Blog — Quamtu' };
}

export default async function ArticuloPage({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticulo((await params).slug);
  if (!a) notFound();
  const todos = await getArticulos();
  const puntaje = (x: (typeof todos)[number]) => (x.categoria === a.categoria ? 2 : 0) + x.etiquetas.filter((t) => a.etiquetas.includes(t)).length;
  const relacionados = todos.filter((x) => x.slug !== a.slug).sort((x, y) => puntaje(y) - puntaje(x)).slice(0, 3);
  const articuloLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: a.titulo, description: a.resumen,
    ...(a.portadaUrl ? { image: a.portadaUrl.startsWith('http') ? a.portadaUrl : `${SITIO}${a.portadaUrl}` } : {}),
    datePublished: a.publicadoEn ?? undefined, keywords: a.etiquetas.join(', '),
    author: { '@type': 'Person', name: a.autorNombre }, publisher: { '@id': `${SITIO}/#organizacion` },
    mainEntityOfPage: `${SITIO}/blog/${a.slug}`, inLanguage: 'es-PE',
  };
  return (
    <main id="contenido" className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-5 sm:pt-28">
      <JsonLd datos={[articuloLd, migas([{ nombre: 'Blog', ruta: '/blog' }, { nombre: a.titulo, ruta: `/blog/${a.slug}` }])]} />
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm font-semibold text-claro hover:underline">← Volver al blog</Link>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{a.titulo}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line pb-6 text-sm text-slate-300">
          <span className="rounded-md bg-boton px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">{a.categoria}</span>
          <span className="flex items-center gap-1.5"><UserRound aria-hidden="true" size={16} />{a.autorNombre}</span>
          <span className="flex items-center gap-1.5"><CalendarDays aria-hidden="true" size={16} />{fechaLarga(a.publicadoEn)}</span>
          <span className="flex items-center gap-1.5"><Clock aria-hidden="true" size={16} />{minutosLectura(a.contenido)} min de lectura</span>
        </div>
        {a.portadaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.portadaUrl} alt="" className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />
        )}
        {/* El HTML sale de markdownToHtml, que escapa todo lo que escribe el autor. */}
        <div className="blog-prose mt-8" dangerouslySetInnerHTML={{ __html: markdownToHtml(a.contenido) }} />
        {a.etiquetas.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
            {a.etiquetas.map((t) => <li key={t} className="glass rounded-md px-2.5 py-1 text-xs font-semibold text-slate-200">#{t}</li>)}
          </ul>
        )}
        <div className="glass mt-10 rounded-2xl p-6 sm:p-8">
          <p className="font-display text-xl font-bold text-white">¿Necesitas equipos para tu empresa?</p>
          <p className="mt-2 text-slate-300">Arma tu cotización y te respondemos con una propuesta a medida.</p>
          <Link href="/cotizar" className="btn-neon mt-5 inline-flex min-h-11 items-center rounded-full px-6 py-2.5 font-display text-sm">COTIZAR</Link>
        </div>
      </article>
      {relacionados.length > 0 && (
        <section aria-labelledby="mas" className="mt-16">
          <h2 id="mas" className="font-display text-2xl font-bold">Sigue leyendo</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{relacionados.map((r) => <li key={r.id} className="flex"><ArticuloCard a={r} /></li>)}</ul>
        </section>
      )}
    </main>
  );
}
