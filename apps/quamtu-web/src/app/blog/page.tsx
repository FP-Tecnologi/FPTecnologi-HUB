import ArticuloCard from '@/components/ArticuloCard';
import JsonLd from '@/components/JsonLd';
import { getArticulos } from '@/lib/blog';
import { meta, migas } from '@/lib/seo';

export const metadata = meta('Blog — Quamtu', 'Guías y novedades de Quamtu sobre computadoras, workstations y cómo elegir el equipo ideal para tu empresa.', '/blog');

export default async function BlogPage() {
  const articulos = await getArticulos();
  return (
    <main id="contenido" className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-5 sm:pt-28">
      <JsonLd datos={migas([{ nombre: 'Blog', ruta: '/blog' }])} />
      <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">Blog <span className="titulo-neon">Quamtu</span></h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-300">Guías, novedades y consejos para elegir y sacar el máximo provecho de tus equipos.</p>
      {articulos.length ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articulos.map((a) => <li key={a.id} className="flex"><ArticuloCard a={a} /></li>)}
        </ul>
      ) : (
        <p className="glass mt-10 rounded-2xl p-8 text-center text-slate-300">Pronto publicaremos nuestros primeros artículos.</p>
      )}
    </main>
  );
}
