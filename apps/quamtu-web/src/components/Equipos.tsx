'use client';
import { useMemo, useState } from 'react';
import { BadgeCheck, Check, Copy, FileText, MessageCircle, Search } from 'lucide-react';
import { waUrl } from '@/lib/contacto';
import { CDN_PC, EQUIPOS, type Equipo } from '@/lib/equipos';

const TIPOS = ['Todos', ...Array.from(new Set(EQUIPOS.map((e) => e.tipo)))];
const PAGINA = 24;

function Tarjeta({ e }: { e: Equipo }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = () => {
    navigator.clipboard?.writeText(e.codigo).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    }).catch(() => {});
  };
  const datos = [e.cpu, e.ram, e.almacenamiento, ...(e.pantalla ? [e.pantalla] : [])];
  return (
    <article className="hud flex flex-col overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={CDN_PC + e.imagen} alt={`${e.modelo} ${e.codigo}`} loading="lazy" width={480} height={360} className="h-44 w-full bg-white/5 object-contain p-3" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-display text-xs tracking-[0.2em] text-claro">{e.tipo.toUpperCase()}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-claro/50 bg-cyan/10 px-2.5 py-0.5 text-[11px] font-bold text-claro">
            <BadgeCheck size={12} aria-hidden="true" /> Perú Compras
          </span>
        </div>
        <h2 className="mt-1 font-display text-base font-bold normal-case leading-snug text-white">{e.modelo}</h2>

        <div className="mt-3 rounded-lg border border-claro/40 bg-panel px-3 py-2">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Nro. Parte / Código Único de Identificación</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <code className="break-all font-mono text-sm font-bold text-white">{e.codigo}</code>
            <button type="button" onClick={copiar} aria-label={`Copiar código ${e.codigo}`} className="shrink-0 rounded-md border border-line p-1.5 text-claro transition hover:border-claro">
              {copiado ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {datos.map((d) => <li key={d} className="rounded-md border border-line bg-panel px-2 py-0.5 text-xs text-slate-300">{d}</li>)}
          <li className="rounded-md border border-line bg-panel px-2 py-0.5 text-xs text-slate-300">{e.so}</li>
        </ul>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <a href={waUrl(`Hola Quamtu, quiero cotizar el equipo ${e.modelo}, Nro. de Parte ${e.codigo}.`)} target="_blank" rel="noreferrer" className="btn-neon inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 font-display text-xs">
            <MessageCircle size={15} /> COTIZAR
          </a>
          <a href={CDN_PC + e.ficha} target="_blank" rel="noreferrer" className="btn-borde inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-display text-xs">
            <FileText size={15} /> FICHA TÉCNICA
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Equipos() {
  const [tipo, setTipo] = useState('Todos');
  const [q, setQ] = useState('');
  const [n, setN] = useState(PAGINA);
  const lista = useMemo(() => {
    const t = q.toLowerCase().trim();
    return EQUIPOS.filter((e) => (tipo === 'Todos' || e.tipo === tipo) && (!t || `${e.codigo} ${e.modelo} ${e.cpu} ${e.ram} ${e.almacenamiento}`.toLowerCase().includes(t)));
  }, [tipo, q]);

  return (
    <main id="contenido" className="mx-auto max-w-7xl px-5 pb-24 pt-28">
      <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Equipos <span className="titulo-neon">Quamtu</span></h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-300">
        Computadoras y estaciones de trabajo con su Nro. de Parte o Código Único de Identificación, tal como están ofertadas en Perú Compras. Sin precio en línea: cotiza por WhatsApp con el código.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-md">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(ev) => { setQ(ev.target.value); setN(PAGINA); }} aria-label="Buscar por código, procesador o memoria" placeholder="Buscar por código, procesador…" className="glass w-full rounded-full py-2.5 pl-11 pr-5 text-base outline-none focus:border-cyan" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de equipo">
          {TIPOS.map((t) => (
            <button key={t} type="button" aria-pressed={tipo === t} onClick={() => { setTipo(t); setN(PAGINA); }}
              className={`min-h-11 rounded-full border px-4 text-sm transition ${tipo === t ? 'border-claro bg-cyan/20 text-white' : 'border-line text-slate-300 hover:border-claro/60'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 text-sm text-slate-400"><b className="text-white">{lista.length}</b> {lista.length === 1 ? 'equipo' : 'equipos'}</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lista.slice(0, n).map((e) => <Tarjeta key={e.codigo} e={e} />)}
      </div>
      {!lista.length && <p className="hud mt-8 p-10 text-center text-lg text-slate-300">No encontramos equipos para esa búsqueda.</p>}
      {n < lista.length && (
        <div className="mt-10 text-center">
          <button type="button" onClick={() => setN(n + PAGINA)} className="btn-borde rounded-full px-8 py-3.5 font-display text-sm">VER MÁS EQUIPOS</button>
        </div>
      )}
    </main>
  );
}
