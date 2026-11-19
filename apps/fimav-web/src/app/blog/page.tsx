import Link from 'next/link';
import BannerPagina from '@/components/BannerPagina';
import ArticuloCard from '@/components/blog/ArticuloCard';
import Reveal from '@/components/motion/Reveal';
import { getArticulos } from '@/lib/blog';
import { meta } from '@/lib/seo';

export const metadata = meta('Blog: tecnología para empresas y Estado', 'Artículos y guías de Fimav Perú sobre equipos de cómputo, impresión, networking, infraestructura y compras públicas.', '/blog');

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const todos = await getArticulos();
  const categorias = [...new Set(todos.map((a) => a.categoria))];
  const activa = categoria && categorias.includes(categoria) ? categoria : undefined;
  const articulos = activa ? todos.filter((a) => a.categoria === activa) : todos;
  const chip = (on: boolean) => `inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-bold uppercase tracking-wider transition-colors ${on ? 'border-boton bg-boton text-white' : 'border-carbon/20 text-carbon hover:border-rojo hover:text-rojo-hondo'}`;
  return (
    <main id="contenido">
      <BannerPagina eyebrow="Blog" titulo="Ideas y guías de" resaltado="tecnología" imagen="/fotos/networking-2.jpg" />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        {categorias.length > 1 && (
          <nav aria-label="Categorías" className="mb-8 flex flex-wrap gap-2">
            <Link href="/blog" className={chip(!activa)} aria-current={!activa ? 'page' : undefined}>Todas</Link>
            {categorias.map((c) => <Link key={c} href={`/blog?categoria=${encodeURIComponent(c)}`} className={chip(c === activa)} aria-current={c === activa ? 'page' : undefined}>{c}</Link>)}
          </nav>
        )}
        {articulos.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articulos.map((a, i) => <Reveal as="li" key={a.id} retraso={(i % 3) * 90} className="flex"><ArticuloCard a={a} /></Reveal>)}
          </ul>
        ) : (
          <p className="rounded-2xl bg-gris p-8 text-center text-carbon/80">Pronto publicaremos nuestros primeros artículos.</p>
        )}
      </section>
    </main>
  );
}
