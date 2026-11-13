import Link from 'next/link';
import BannerPagina from '@/components/BannerPagina';
import BotonHex from '@/components/hex/BotonHex';
import FiltrosTienda from '@/components/tienda/FiltrosTienda';
import ProductoCard from '@/components/tienda/ProductoCard';
import Reveal from '@/components/motion/Reveal';
import { getProductosTienda } from '@/lib/tienda';
import { meta } from '@/lib/seo';

export const metadata = meta('Tienda de equipos tecnológicos', 'Tienda de Fimav Perú: monitores, laptops, servidores, pantallas interactivas y más equipos de marcas como Dell, HP, Lenovo y LG. Cotiza con un asesor.', '/tienda');

type Params = { categoria?: string; q?: string; marca?: string; orden?: string };
const ORDENES = { nuevos: 'Más recientes', precio_asc: 'Menor precio', precio_desc: 'Mayor precio', nombre: 'Nombre (A-Z)' } as const;

export default async function TiendaPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { categoria, q = '', marca, orden = 'nuevos' } = await searchParams;
  const todos = await getProductosTienda();

  if (!todos?.length)
    return (
      <main id="contenido">
        <BannerPagina eyebrow="Tienda" titulo="Equipos y" resaltado="soluciones" />
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <p className="text-lg text-carbon/80">La tienda no está disponible en este momento. Cuéntanos qué necesitas y te enviamos una cotización.</p>
          <BotonHex href="/cotizar" className="mt-6">Solicitar cotización</BotonHex>
        </section>
      </main>
    );

  const categorias = [...new Map(todos.map((p) => [p.categoria.slug, p.categoria.nombre])).entries()].map(([slug, nombre]) => ({ slug, nombre, n: todos.filter((p) => p.categoria.slug === slug).length }));
  const marcas = [...new Set(todos.map((p) => p.marca).filter(Boolean))].sort();
  const t = q.trim().toLowerCase();
  const lista = todos
    .filter((p) => (!categoria || p.categoria.slug === categoria) && (!marca || p.marca === marca) && (!t || `${p.nombre} ${p.sku} ${p.marca}`.toLowerCase().includes(t)))
    .sort((a, b) => (orden === 'precio_asc' ? a.precio - b.precio : orden === 'precio_desc' ? b.precio - a.precio : orden === 'nombre' ? a.nombre.localeCompare(b.nombre) : 0));

  return (
    <main id="contenido">
      <BannerPagina eyebrow="Tienda" titulo="Equipos y" resaltado="soluciones" imagen="/fotos/escritorios-2.jpg" />
      <Reveal className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
        <div className="rounded-2xl bg-gris p-4 sm:p-5">
          <FiltrosTienda
            categorias={categorias.map((c) => ({ valor: c.slug, texto: `${c.nombre} (${c.n})` }))}
            marcas={marcas}
            ordenes={Object.entries(ORDENES).map(([valor, texto]) => ({ valor, texto }))}
            inicial={{ categoria: categoria ?? '', q, marca: marca ?? '', orden }}
          />
        </div>

        <p className="mt-6 text-sm text-carbon/80" role="status">{lista.length} {lista.length === 1 ? 'producto' : 'productos'}</p>
        {lista.length ? (
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lista.map((p) => <li key={p.id} className="flex"><ProductoCard p={p} /></li>)}
          </ul>
        ) : (
          <p className="mt-6 rounded-2xl border border-carbon/20 bg-gris p-6 text-carbon/80">No encontramos productos con ese filtro. <Link href="/tienda" className="font-semibold text-rojo-hondo underline">Ver toda la tienda</Link> o <Link href="/cotizar" className="font-semibold text-rojo-hondo underline">pídenos una cotización</Link>.</p>
        )}
      </Reveal>
    </main>
  );
}
