import Link from 'next/link';
import Banner from '@/components/Banner';
import ArticuloCard from '@/components/ArticuloCard';
import Reveal from '@/components/Reveal';
import JsonLd from '@/components/JsonLd';
import { getArticulos } from '@/lib/blog';
import { meta, migas } from '@/lib/seo';

export const metadata = meta('Blog', 'Artículos y guías de Kelqa sobre productos, construcción e industria.', '/blog');

// Los artículos se leen de la API en cada visita (con caché corta): lo publicado en el dashboard aparece sin recompilar.
export const dynamic = 'force-dynamic';

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const todos = await getArticulos();
  const categorias = [...new Set(todos.map((a) => a.categoria))];
  const activa = categoria && categorias.includes(categoria) ? categoria : undefined;
  const articulos = activa ? todos.filter((a) => a.categoria === activa) : todos;
  const chip = (on: boolean) => `inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-bold transition-colors ${on ? 'border-kelqa bg-kelqa text-white' : 'border-carbon/20 text-carbon hover:border-kelqa hover:text-kelqa-hondo'}`;
  return (
    <main id="contenido">
      <JsonLd datos={migas([{ nombre: 'Blog', ruta: '/blog' }])} />
      <Banner miga="Blog" titulo="Ideas y guías de" acento="Kelqa" texto="Consejos, novedades y buenas prácticas para tus proyectos." foto="/fotos/obra.webp" />
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        {categorias.length > 1 && (
          <nav aria-label="Categorías" className="mb-8 flex flex-wrap gap-2">
            <Link href="/blog" className={chip(!activa)} aria-current={!activa ? 'page' : undefined}>Todas</Link>
            {categorias.map((c) => <Link key={c} href={`/blog?categoria=${encodeURIComponent(c)}`} className={chip(c === activa)} aria-current={c === activa ? 'page' : undefined}>{c}</Link>)}
          </nav>
        )}
        {articulos.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articulos.map((a, i) => <li key={a.id} className="flex"><Reveal retraso={(i % 3) * 90} className="flex w-full"><ArticuloCard a={a} /></Reveal></li>)}
          </ul>
        ) : (
          <p className="rounded-2xl bg-niebla p-8 text-center text-carbon/80">Pronto publicaremos nuestros primeros artículos.</p>
        )}
      </section>
    </main>
  );
}
