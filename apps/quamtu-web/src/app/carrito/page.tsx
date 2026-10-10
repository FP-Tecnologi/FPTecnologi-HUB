'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { guardarCarrito, leerCarrito, type ItemCarrito } from '@/lib/carrito';
import { porId } from '@/lib/piezas';

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

export default function Carrito() {
  const [items, setItems] = useState<ItemCarrito[] | null>(null);
  useEffect(() => setItems(leerCarrito()), []);
  const quitar = (i: number) => {
    const n = (items ?? []).filter((_, j) => j !== i);
    setItems(n);
    guardarCarrito(n);
  };
  const total = (items ?? []).reduce((a, i) => a + i.total, 0);

  return (
    <main className="mx-auto max-w-4xl px-5 pb-24 pt-28">
      <h1 className="font-display text-4xl font-bold">Tu <span className="titulo-neon">carrito</span></h1>
      {items && !items.length && (
        <p className="mt-8 text-slate-400">
          Está vacío. <Link href="/tienda" className="text-claro underline">Ir a la tienda</Link> o <Link href="/armar" className="text-claro underline">armar una PC</Link>.
        </p>
      )}
      <div className="mt-8 space-y-4">
        {items?.map((it, i) => (
          <div key={i} className="hud p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-display text-xs tracking-[0.25em] text-claro">{it.tipo === 'build' ? 'PC ARMADA A MEDIDA' : 'COMPONENTE'}</span>
                <ul className="mt-2 space-y-0.5 text-slate-200">
                  {it.ids.map((id) => {
                    const o = porId(id);
                    return o ? <li key={id}>{o.nombre} <span className="text-slate-500">· {soles(o.precio)}</span></li> : null;
                  })}
                </ul>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold text-claro">{soles(it.total)}</p>
                <button onClick={() => quitar(i)} aria-label="Quitar" className="mt-2 text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!!items?.length && (
        <div className="glass mt-8 rounded-2xl p-6">
          <div className="flex items-end justify-between">
            <span className="text-xs tracking-widest text-slate-500">TOTAL</span>
            <span className="titulo-neon font-display text-3xl font-bold">{soles(total)}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button disabled className="btn-neon rounded-full px-8 py-4 font-display text-sm opacity-50">PAGAR (PRÓXIMAMENTE)</button>
            <Link href="/#contacto" className="btn-borde rounded-full px-8 py-4 font-display text-sm">SOLICITAR COTIZACIÓN</Link>
          </div>
        </div>
      )}
    </main>
  );
}
