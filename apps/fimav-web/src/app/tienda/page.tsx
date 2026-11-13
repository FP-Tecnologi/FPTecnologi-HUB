import Link from 'next/link';
import { Search } from 'lucide-react';
import BannerPagina from '@/components/BannerPagina';
import BotonHex from '@/components/hex/BotonHex';
import CampoHex from '@/components/tienda/CampoHex';
import ProductoCard from '@/components/tienda/ProductoCard';
import Reveal from '@/components/motion/Reveal';
import { getProductosTienda } from '@/lib/tienda';
import { meta } from '@/lib/seo';

export const metadata = meta('Tienda de equipos tecnológicos', 'Tienda de Fimav Perú: monitores, laptops, servidores, pantallas interactivas y más equipos de marcas como Dell, HP, Lenovo y LG. Cotiza con un asesor.', '/tienda');

type Params = { categoria?: string; q?: string; marca?: string; orden?: string };
const ORDENES = { nuevos: 'Más recientes', precio_asc: 'Menor precio', precio_desc: 'Mayor precio', nombre: 'Nombre (A-Z)' } as const;
const campo = 'min-h-10 w-full min-w-0 bg-transparent text-base text-tinta outline-none placeholder:text-carbon/60';

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
          <form action="/tienda" className="flex flex-wrap items-end gap-x-3 gap-y-4">
            <label className="grow text-sm font-medium text-carbon sm:min-w-64">Buscar
              <CampoHex className="mt-1"><input name="q" defaultValue={q} placeholder="Nombre, marca o código" className={campo} /></CampoHex>
            </label>
            <label className="text-sm font-medium text-carbon">Categoría
              <CampoHex className="mt-1">
                <select name="categoria" defaultValue={categoria ?? ''} className={campo}>
                  <option value="">Todo ({todos.length})</option>
                  {categorias.map((c) => <option key={c.slug} value={c.slug}>{c.nombre} ({c.n})</option>)}
                </select>
              </CampoHex>
            </label>
            <label className="text-sm font-medium text-carbon">Marca
              <CampoHex className="mt-1">
                <select name="marca" defaultValue={marca ?? ''} className={campo}>
                  <option value="">Todas</option>
                  {marcas.map((m) => <option key={m}>{m}</option>)}
                </select>
              </CampoHex>
            </label>
            <label className="text-sm font-medium text-carbon">Ordenar por
              <CampoHex className="mt-1">
                <select name="orden" defaultValue={orden} className={campo}>
                  {Object.entries(ORDENES).map(([v, tx]) => <option key={v} value={v}>{tx}</option>)}
                </select>
              </CampoHex>
            </label>
            <BotonHex type="submit" variante="carbon" icono={Search}>Filtrar</BotonHex>
          </form>
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
