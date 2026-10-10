'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Info, Minus, MessageCircle, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { guardarCarrito, leerCarrito, subtotal, totalCarrito, unidades, whatsappCarrito, type ItemCarrito } from '@/lib/carrito';
import { porId } from '@/lib/piezas';

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

export default function Carrito() {
  const [items, setItems] = useState<ItemCarrito[] | null>(null);
  useEffect(() => setItems(leerCarrito()), []);

  const cambiar = (nuevos: ItemCarrito[]) => {
    setItems(nuevos);
    guardarCarrito(nuevos);
  };
  const quitar = (i: number) => cambiar((items ?? []).filter((_, j) => j !== i));
  const cantidad = (i: number, d: number) =>
    cambiar((items ?? []).map((it, j) => (j === i ? { ...it, cantidad: Math.max(1, (it.cantidad ?? 1) + d) } : it)));

  if (!items) return <main className="min-h-screen pt-28" />;

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-28">
      <h1 className="font-display text-4xl font-bold">Tu <span className="titulo-neon">carrito</span></h1>

      {!items.length ? (
        <div className="hud mt-10 p-12 text-center">
          <ShoppingBag size={48} className="mx-auto text-line" strokeWidth={1.2} />
          <p className="mt-4 text-lg text-slate-300">Tu carrito está vacío.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/armar" className="btn-neon rounded-full px-8 py-4 font-display text-sm">ARMA TU PC</Link>
            <Link href="/tienda" className="btn-borde rounded-full px-8 py-4 font-display text-sm">VER LA TIENDA</Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.map((it, i) => (
              <article key={i} className="hud p-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-xs tracking-[0.25em] text-claro">
                    {it.tipo === 'build' ? (it.modo === 'repuestos' ? 'COMPONENTES SELECCIONADOS' : 'PC ARMADA A MEDIDA') : 'COMPONENTE'}
                  </span>
                  <button onClick={() => quitar(i)} aria-label="Quitar del carrito" className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
                <ul className="mt-3 divide-y divide-line/60">
                  {it.ids.map((id) => {
                    const o = porId(id);
                    return o ? (
                      <li key={id} className="flex items-center justify-between gap-3 py-2 text-slate-200">
                        <Link href={`/producto/${id}`} className="min-w-0 truncate hover:text-claro">{o.nombre}</Link>
                        <span className="shrink-0 text-sm text-slate-400">{soles(o.precio)}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
                <div className="mt-4 flex items-center justify-between">
                  {it.tipo === 'pieza' ? (
                    <div className="flex items-center gap-1 rounded-full border border-line">
                      <button onClick={() => cantidad(i, -1)} aria-label="Menos" className="p-2 text-slate-400 hover:text-claro"><Minus size={14} /></button>
                      <span className="w-6 text-center text-sm">{it.cantidad ?? 1}</span>
                      <button onClick={() => cantidad(i, 1)} aria-label="Más" className="p-2 text-slate-400 hover:text-claro"><Plus size={14} /></button>
                    </div>
                  ) : (
                    <Link href="/armar" className="text-sm text-slate-400 underline hover:text-claro">Armar otra</Link>
                  )}
                  <b className="font-display text-xl text-claro">{soles(subtotal(it))}</b>
                </div>
              </article>
            ))}
          </div>

          <aside className="glass sticky top-24 rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold">Resumen</h2>
            <dl className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between"><dt>Artículos</dt><dd>{unidades(items)}</dd></div>
              <div className="flex justify-between"><dt>Envío</dt><dd className="text-slate-500">A coordinar</dd></div>
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-line pt-5">
              <span className="text-xs tracking-widest text-slate-500">TOTAL</span>
              <span className="titulo-neon font-display text-3xl font-bold">{soles(totalCarrito(items))}</span>
            </div>
            <a href={whatsappCarrito(items)} target="_blank" rel="noreferrer" className="btn-neon mt-6 flex items-center justify-center gap-2 rounded-full py-4 font-display text-sm">
              <MessageCircle size={18} /> COMPRAR POR WHATSAPP
            </a>
            <a
              href={whatsappCarrito(items, 'Hola Quamtu, necesito una cotización para mi empresa con lo siguiente:')}
              target="_blank"
              rel="noreferrer"
              className="btn-borde mt-3 block rounded-full py-3.5 text-center font-display text-sm"
            >
              COTIZAR PARA MI EMPRESA
            </a>
            <p className="mt-5 flex gap-2 text-xs text-slate-500">
              <Info size={14} className="mt-0.5 shrink-0" /> Precios referenciales. Confirmamos stock, precio final y entrega por WhatsApp. El pago en línea estará disponible pronto.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
