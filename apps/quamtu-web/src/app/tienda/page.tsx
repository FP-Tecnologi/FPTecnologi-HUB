import Link from 'next/link';
import ImgPieza from '@/components/ImgPieza';
import { CATS, OPCIONES } from '@/lib/piezas';

export const metadata = { title: 'Tienda de componentes — Quamtu' };

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

export default async function Tienda({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string }> }) {
  const { cat, q } = await searchParams;
  const texto = q?.toLowerCase().trim();
  const lista = OPCIONES.filter((o) => (!cat || o.cat === cat) && (!texto || `${o.nombre} ${o.spec}`.toLowerCase().includes(texto)));
  const chip = (activo: boolean) =>
    `rounded-full border px-4 py-2 font-display text-xs transition ${activo ? 'border-cyan bg-cyan/15 text-claro' : 'border-line text-slate-400 hover:border-slate-500'}`;

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-28">
      <h1 className="font-display text-4xl font-bold md:text-5xl">
        Tienda de <span className="titulo-neon">componentes</span>
      </h1>
      <p className="mt-3 max-w-xl text-slate-400">
        Compra piezas sueltas o <Link href="/armar" className="text-claro underline">arma tu equipo completo en 3D</Link>. Precios referenciales.
      </p>

      <form className="mt-8 flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar componente…" className="glass min-w-60 rounded-full px-5 py-2 text-sm outline-none focus:border-cyan" />
        {cat && <input type="hidden" name="cat" value={cat} />}
        <button className="btn-neon rounded-full px-5 py-2 font-display text-xs">BUSCAR</button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/tienda" className={chip(!cat)}>Todo</Link>
        {CATS.map((c) => (
          <Link key={c.id} href={`/tienda?cat=${c.id}`} className={chip(cat === c.id)}>{c.titulo}</Link>
        ))}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {lista.map((o) => (
          <Link key={o.id} href={`/producto/${o.id}`} className="hud group flex flex-col overflow-hidden transition hover:-translate-y-1">
            <ImgPieza id={o.id} cat={o.cat} color={o.color} className="h-44 w-full bg-gradient-to-br from-panel to-bg" />
            <div className="flex flex-1 flex-col p-5">
              <span className="font-display text-[10px] tracking-[0.25em] text-claro">{CATS.find((c) => c.id === o.cat)?.titulo.toUpperCase()}</span>
              <h2 className="mt-1 font-display text-base font-bold text-white">{o.nombre}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-400">{o.spec}</p>
              <p className="mt-4 font-display text-xl font-bold text-claro">{soles(o.precio)}</p>
            </div>
          </Link>
        ))}
        {!lista.length && <p className="col-span-full text-slate-400">No hay componentes para esa búsqueda.</p>}
      </div>
    </main>
  );
}
