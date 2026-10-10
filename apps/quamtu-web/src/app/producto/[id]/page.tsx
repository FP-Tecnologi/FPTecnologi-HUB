import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import AgregarPieza from '@/components/AgregarPieza';
import ImgPieza from '@/components/ImgPieza';
import { CATS, OPCIONES, porId } from '@/lib/piezas';

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const o = porId((await params).id);
  return { title: o ? `${o.nombre} — Quamtu` : 'Producto — Quamtu' };
}

export default async function Producto({ params }: { params: Promise<{ id: string }> }) {
  const o = porId((await params).id);
  if (!o) notFound();
  const cat = CATS.find((c) => c.id === o.cat)!;
  const relacionados = OPCIONES.filter((p) => p.cat === o.cat && p.id !== o.id).slice(0, 4);
  const datos: [string, string][] = [
    ['Categoría', cat.titulo],
    ...(o.socket ? ([['Socket', o.socket]] as [string, string][]) : []),
    ...(o.watts ? ([[o.cat === 'fuente' ? 'Potencia' : 'Consumo', `${o.watts} W`]] as [string, string][]) : []),
    ...o.spec.split(' · ').map((t, i): [string, string] => [i === 0 ? 'Característica' : '', t]),
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-28">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/tienda" className="hover:text-claro">Tienda</Link><ChevronRight size={14} />
        <Link href={`/tienda?cat=${o.cat}`} className="hover:text-claro">{cat.titulo}</Link><ChevronRight size={14} />
        <span className="text-slate-300">{o.nombre}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <ImgPieza id={o.id} cat={o.cat} color={o.color} ajuste="contain" className="hud h-80 w-full lg:h-[480px]" />
        <div>
          <span className="font-display text-xs tracking-[0.25em] text-claro">{cat.titulo.toUpperCase()}</span>
          <h1 className="mt-2 font-display text-3xl font-bold normal-case md:text-4xl">{o.nombre}</h1>
          <p className="mt-3 text-lg text-slate-300">{o.spec}</p>
          <p className="mt-6 font-display text-4xl font-bold text-claro">{soles(o.precio)}</p>
          <p className="mt-1 text-sm text-slate-500">Precio referencial · IGV incluido</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <AgregarPieza id={o.id} precio={o.precio} />
            <Link href={`/armar?pieza=${o.id}`} className="btn-borde rounded-full px-8 py-4 font-display text-sm">VER EN EL ARMADOR 3D</Link>
            <Link href={`/cotizar?pieza=${o.id}`} className="btn-borde rounded-full px-8 py-4 font-display text-sm">COTIZAR ESTE PRODUCTO</Link>
          </div>

          <h2 className="mt-10 font-display text-lg font-bold">Especificaciones</h2>
          <dl className="mt-3 divide-y divide-line border-y border-line">
            {datos.map(([k, v], i) => (
              <div key={i} className="grid grid-cols-[9rem_1fr] gap-3 py-2.5 text-sm">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-slate-200">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {!!relacionados.length && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold">Más en {cat.titulo.toLowerCase()}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relacionados.map((p) => (
              <Link key={p.id} href={`/producto/${p.id}`} className="hud p-5 transition hover:-translate-y-1">
                <h3 className="font-display font-bold normal-case text-white">{p.nombre}</h3>
                <p className="mt-1 text-sm text-slate-400">{p.spec}</p>
                <p className="mt-3 font-display text-lg font-bold text-claro">{soles(p.precio)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
