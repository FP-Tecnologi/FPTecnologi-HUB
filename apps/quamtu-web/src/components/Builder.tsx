'use client';
import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, AlertTriangle, ShoppingCart, X } from 'lucide-react';
import PcEscena from './PcEscena';
import { CARRITO_KEY } from './Header';
import { CATS, avisoFuente, incompatible, porCat, seleccionDe, total, type Opcion, type Seleccion } from '@/lib/piezas';

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

export default function Builder({ inicial = [] }: { inicial?: string[] }) {
  const [sel, setSel] = useState<Seleccion>(() => seleccionDe(inicial));
  const [paso, setPaso] = useState(0);
  const [agregado, setAgregado] = useState(false);

  const cat = CATS[paso];
  const completo = CATS.every((c) => sel[c.id]);
  const aviso = avisoFuente(sel);

  const elegir = (o: Opcion) => {
    setAgregado(false);
    setSel((s) => (s[o.cat]?.id === o.id ? { ...s, [o.cat]: undefined } : { ...s, [o.cat]: o }));
    // Salta solo al siguiente paso la primera vez que se elige algo.
    if (!sel[o.cat] && paso < CATS.length - 1) setTimeout(() => setPaso((p) => Math.min(p + 1, CATS.length - 1)), 650);
  };

  const alCarrito = () => {
    try {
      const actual = JSON.parse(localStorage.getItem(CARRITO_KEY) ?? '[]');
      actual.push({ ids: Object.values(sel).map((o) => o!.id), total: total(sel) });
      localStorage.setItem(CARRITO_KEY, JSON.stringify(actual));
      window.dispatchEvent(new Event('quamtu-carrito'));
      setAgregado(true);
    } catch {
      /* sin almacenamiento: no hay carrito */
    }
  };

  return (
    <main className="min-h-screen pt-16">
      <div className="mx-auto grid max-w-[1500px] gap-0 lg:grid-cols-[1.15fr_1fr]">
        {/* Visor 3D */}
        <section className="relative lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">
          <div className="rejilla absolute inset-0 -z-10" />
          <div className="absolute left-1/2 top-1/3 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-violet/20 blur-[120px]" />
          <PcEscena sel={sel} className="h-[46vh] lg:h-full" />
          <div className="pointer-events-none absolute bottom-4 left-5 hidden text-xs tracking-widest text-slate-500 lg:block">
            ARRASTRA PARA GIRAR
          </div>
          {/* Resumen flotante de piezas elegidas */}
          <div className="absolute left-4 top-4 flex max-w-[60%] flex-wrap gap-2">
            {CATS.map((c) =>
              sel[c.id] ? (
                <span key={c.id} className="glass rounded-full px-3 py-1 text-[11px]" style={{ borderColor: sel[c.id]!.color + '88' }}>
                  {sel[c.id]!.nombre}
                </span>
              ) : null,
            )}
          </div>
        </section>

        {/* Panel de selección */}
        <section className="flex flex-col border-l border-line bg-panel/40 p-5 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <div className="flex gap-1.5 overflow-x-auto pb-3 [scrollbar-width:none]">
            {CATS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setPaso(i)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${
                  i === paso ? 'border-cyan bg-cyan/10 text-cyan' : sel[c.id] ? 'border-violet/50 text-slate-200' : 'border-line text-slate-500'
                }`}
              >
                {sel[c.id] ? <Check size={13} /> : <span className="font-display text-[10px]">{c.paso}</span>}
                {c.titulo}
              </button>
            ))}
          </div>

          <h1 className="mt-4 font-display text-2xl font-bold md:text-3xl">
            <span className="text-slate-600">{cat.paso}</span> {cat.titulo}
          </h1>

          <div className="mt-5 grid gap-3">
            {porCat(cat.id).map((o) => {
              const activo = sel[o.cat]?.id === o.id;
              const bloqueo = incompatible(o, sel);
              return (
                <button
                  key={o.id}
                  disabled={!!bloqueo}
                  onClick={() => elegir(o)}
                  className={`group relative flex items-center gap-4 rounded-xl border p-4 text-left transition ${
                    activo ? 'bg-white/5' : 'border-line hover:border-slate-500'
                  } ${bloqueo ? 'cursor-not-allowed opacity-40' : ''}`}
                  style={activo ? { borderColor: o.color, boxShadow: `0 0 24px ${o.color}44` } : undefined}
                >
                  <span className="h-10 w-1.5 rounded-full" style={{ background: o.color }} />
                  <span className="flex-1">
                    <b className="block">{o.nombre}</b>
                    <span className="text-sm text-slate-400">{bloqueo ?? o.spec}</span>
                  </span>
                  <span className="font-display font-bold text-cyan">{soles(o.precio)}</span>
                  {activo && <Check size={18} className="text-cyan" />}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex justify-between">
            <button disabled={paso === 0} onClick={() => setPaso(paso - 1)} className="flex items-center gap-1 text-sm text-slate-400 disabled:opacity-30">
              <ChevronLeft size={16} /> Anterior
            </button>
            <button disabled={paso === CATS.length - 1} onClick={() => setPaso(paso + 1)} className="flex items-center gap-1 text-sm text-slate-400 disabled:opacity-30">
              Siguiente <ChevronRight size={16} />
            </button>
          </div>

          {/* Total */}
          <div className="glass mt-auto rounded-2xl p-5 pt-5 lg:mt-8">
            {aviso && (
              <p className="mb-3 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-300">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {aviso}
              </p>
            )}
            <div className="flex items-end justify-between">
              <span className="text-xs tracking-widest text-slate-500">TOTAL</span>
              <span className="titulo-neon font-display text-3xl font-bold">{soles(total(sel))}</span>
            </div>
            <button
              disabled={!completo || !!aviso}
              onClick={alCarrito}
              className="btn-neon mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm disabled:opacity-40 disabled:shadow-none"
            >
              <ShoppingCart size={16} /> {agregado ? 'AÑADIDO AL CARRITO' : 'AÑADIR AL CARRITO'}
            </button>
            {!completo && <p className="mt-2 text-center text-xs text-slate-500">Elige las {CATS.length} piezas para continuar ({Object.values(sel).filter(Boolean).length}/{CATS.length}).</p>}
            {Object.values(sel).some(Boolean) && (
              <button onClick={() => { setSel({}); setPaso(0); setAgregado(false); }} className="mx-auto mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-red-400">
                <X size={12} /> Empezar de nuevo
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
