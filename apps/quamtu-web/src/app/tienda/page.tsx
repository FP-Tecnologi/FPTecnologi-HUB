import Link from 'next/link';
import { ArrowRight, Box, CircuitBoard, Cpu, Fan, HardDrive, MemoryStick, MessageCircle, PlugZap, Search, X, Zap } from 'lucide-react';
import TarjetaProducto from '@/components/TarjetaProducto';
import { waUrl } from '@/lib/contacto';
import { CATS, OPCIONES, type Cat } from '@/lib/piezas';

export const metadata = { title: 'Tienda de componentes — Quamtu' };

const ICONOS: Record<Cat, typeof Cpu> = { gabinete: Box, cpu: Cpu, placa: CircuitBoard, ram: MemoryStick, gpu: Zap, ssd: HardDrive, cooler: Fan, fuente: PlugZap };
const ORDENES = [
  ['relevancia', 'Orden del catálogo'],
  ['precio-asc', 'Precio: menor a mayor'],
  ['precio-desc', 'Precio: mayor a menor'],
  ['nombre', 'Nombre (A a Z)'],
] as const;

export default async function Tienda({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string; orden?: string }> }) {
  const { cat, q, orden = 'relevancia' } = await searchParams;
  const texto = q?.toLowerCase().trim();
  const lista = OPCIONES.filter((o) => (!cat || o.cat === cat) && (!texto || `${o.nombre} ${o.spec}`.toLowerCase().includes(texto)));
  if (orden === 'precio-asc') lista.sort((a, b) => a.precio - b.precio);
  if (orden === 'precio-desc') lista.sort((a, b) => b.precio - a.precio);
  if (orden === 'nombre') lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const catActiva = CATS.find((c) => c.id === cat);
  const href = (c?: string) => (c ? `/tienda?cat=${c}${q ? `&q=${encodeURIComponent(q)}` : ''}${orden !== 'relevancia' ? `&orden=${orden}` : ''}` : '/tienda');

  return (
    <main>
      {/* Banner */}
      <section className="zona-oscura relative isolate overflow-hidden pb-14 pt-28">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-50" style={{ backgroundImage: 'url(/brand/fondo-red.jpg)' }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/75 to-bg/30" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h1 style={{ ["--i" as string]: 0 }} className="entra font-display text-4xl font-bold leading-[1.05] text-white md:text-6xl">
              Tienda de <span className="titulo-neon">componentes</span>
            </h1>
            <p style={{ ["--i" as string]: 1 }} className="entra mt-5 max-w-xl text-lg text-slate-300">
              Procesadores, memoria, video, almacenamiento, refrigeración, fuentes y gabinetes para armar o repotenciar tu equipo. Precios referenciales; confirmamos stock y entrega con un especialista.
            </p>
            <div style={{ ["--i" as string]: 2 }} className="entra mt-8 flex flex-wrap gap-3">
              <Link href="/armar" className="btn-neon inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-display text-sm">ARMA TU PC EN 3D <ArrowRight size={17} /></Link>
              <a href={waUrl('Hola Quamtu, necesito ayuda para elegir componentes.')} target="_blank" rel="noreferrer" className="btn-borde inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-display text-sm"><MessageCircle size={17} /> ASESORÍA</a>
            </div>
          </div>
          <div style={{ ["--i" as string]: 3 }} className="entra relative mx-auto hidden w-full max-w-md lg:block" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/productos/g2.jpg" alt="" width={480} height={480} className="w-[62%] rounded-sm border border-line shadow-[0_18px_40px_rgba(0,0,0,.5)]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/productos/v3.jpg" alt="" width={480} height={480} className="absolute -bottom-6 right-0 w-[52%] rounded-sm border border-line shadow-[0_18px_40px_rgba(0,0,0,.5)]" />
          </div>
        </div>

        {/* Categorías */}
        <nav aria-label="Categorías" className="mx-auto mt-12 max-w-7xl px-5">
          <ul className="sin-barra flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-8 lg:overflow-visible">
            {CATS.map((c) => {
              const Icono = ICONOS[c.id];
              const activa = cat === c.id;
              const n = OPCIONES.filter((o) => o.cat === c.id).length;
              return (
                <li key={c.id} className="shrink-0">
                  <Link
                    href={href(activa ? undefined : c.id)}
                    aria-current={activa ? 'true' : undefined}
                    className={`flex w-28 flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition lg:w-auto ${
                      activa ? 'border-claro bg-cyan/20 text-white' : 'border-line bg-panel/60 text-slate-300 hover:-translate-y-0.5 hover:border-claro/60 hover:text-white'
                    }`}
                  >
                    <Icono size={24} className="text-claro" />
                    <span className="font-display text-xs font-bold leading-tight">{c.titulo}</span>
                    <span className="text-xs text-slate-400">{n} productos</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </section>

      {/* Herramientas y resultados */}
      <section className="mx-auto max-w-7xl px-5 py-12">
        <form className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-60 flex-1 sm:max-w-md">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="q" defaultValue={q} placeholder="Buscar componente…" className="glass w-full rounded-full py-2.5 pl-11 pr-5 text-base outline-none focus:border-cyan" />
          </div>
          {cat && <input type="hidden" name="cat" value={cat} />}
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <span className="hidden sm:inline">Ordenar</span>
            <select name="orden" defaultValue={orden} className="glass rounded-full px-4 py-2.5 text-sm text-white outline-none focus:border-cyan">
              {ORDENES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>
          <button className="btn-neon rounded-full px-6 py-2.5 font-display text-xs">APLICAR</button>
        </form>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span><b className="text-white">{lista.length}</b> {lista.length === 1 ? 'producto' : 'productos'}</span>
          {catActiva && (
            <Link href={href()} className="flex items-center gap-1.5 rounded-full border border-claro/50 px-3 py-1 text-claro hover:bg-cyan/10">
              {catActiva.titulo} <X size={13} />
            </Link>
          )}
          {q && (
            <Link href={cat ? href(cat).replace(/&q=[^&]*/, '') : '/tienda'} className="flex items-center gap-1.5 rounded-full border border-claro/50 px-3 py-1 text-claro hover:bg-cyan/10">
              “{q}” <X size={13} />
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {lista.map((o) => <TarjetaProducto key={o.id} o={o} />)}
        </div>
        {!lista.length && (
          <div className="hud mt-8 p-10 text-center">
            <p className="text-lg text-slate-300">No encontramos componentes para esa búsqueda.</p>
            <Link href="/tienda" className="btn-borde mt-5 inline-flex rounded-full px-6 py-3 font-display text-xs">VER TODO EL CATÁLOGO</Link>
          </div>
        )}

        {/* Banda de ayuda */}
        <div className="hud mt-16 grid items-center gap-6 p-8 md:grid-cols-[1fr_auto] md:p-10">
          <div>
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">¿No sabes qué <span className="titulo-neon">elegir?</span></h2>
            <p className="mt-2 max-w-xl text-slate-300">Arma tu equipo en 3D y validamos la compatibilidad por ti, o escríbenos y un especialista te recomienda las piezas.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/armar" className="btn-neon inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-display text-sm">ARMADOR 3D <ArrowRight size={17} /></Link>
            <Link href="/cotizar" className="btn-borde inline-flex items-center rounded-full px-7 py-3.5 font-display text-sm">COTIZAR</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
