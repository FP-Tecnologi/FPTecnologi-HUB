'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, ShoppingBag, X } from 'lucide-react';
import { leerCarrito, subtotal, totalCarrito, unidades, whatsappCarrito, type ItemCarrito } from '@/lib/carrito';
import { porId } from '@/lib/piezas';

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

// Icono de carrito con contador + panel lateral de vista previa. Se abre al pulsarlo o al añadir algo.
export default function CarritoMini() {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  useEffect(() => {
    const leer = () => setItems(leerCarrito());
    const abrir = () => {
      leer();
      setAbierto(true);
    };
    leer();
    window.addEventListener('quamtu-carrito', leer);
    window.addEventListener('quamtu-carrito-abrir', abrir);
    return () => {
      window.removeEventListener('quamtu-carrito', leer);
      window.removeEventListener('quamtu-carrito-abrir', abrir);
    };
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const n = unidades(items);
  return (
    <>
      <button onClick={() => setAbierto(true)} className="relative" aria-label={`Abrir carrito (${n})`}>
        <ShoppingBag size={21} />
        {n > 0 && <b className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-boton px-1 text-xs font-bold text-white">{n}</b>}
      </button>

      {montado && createPortal(<>
      <div
        onClick={() => setAbierto(false)}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity ${abierto ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        aria-hidden={!abierto}
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-line bg-bg shadow-2xl transition-transform duration-300 ${abierto ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-lg font-bold">Tu carrito <span className="text-slate-400">({n})</span></h2>
          <button onClick={() => setAbierto(false)} aria-label="Cerrar"><X size={20} /></button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {!items.length && (
            <div className="grid h-full place-items-center text-center text-slate-400">
              <div>
                <ShoppingBag size={44} className="mx-auto text-line" strokeWidth={1.2} />
                <p className="mt-4">Tu carrito está vacío.</p>
                <Link href="/armar" onClick={() => setAbierto(false)} className="btn-neon mt-5 inline-block rounded-full px-6 py-3 font-display text-xs">ARMA TU PC</Link>
              </div>
            </div>
          )}
          {items.map((it, i) => (
            <div key={i} className="hud p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-display text-xs tracking-[0.2em] text-claro">
                    {it.tipo === 'build' ? (it.modo === 'repuestos' ? 'COMPONENTES' : 'PC ARMADA') : `COMPONENTE × ${it.cantidad ?? 1}`}
                  </span>
                  {it.ids.slice(0, 4).map((id) => (
                    <p key={id} className="truncate text-sm text-slate-200">{porId(id)?.nombre}</p>
                  ))}
                  {it.ids.length > 4 && <p className="text-xs text-slate-400">+ {it.ids.length - 4} piezas más</p>}
                </div>
                <b className="shrink-0 font-display text-claro">{soles(subtotal(it))}</b>
              </div>
            </div>
          ))}
        </div>

        {!!items.length && (
          <div className="space-y-3 border-t border-line p-6">
            <div className="flex items-end justify-between">
              <span className="text-xs tracking-widest text-slate-400">TOTAL REFERENCIAL</span>
              <span className="titulo-neon font-display text-2xl font-bold">{soles(totalCarrito(items))}</span>
            </div>
            <a href={whatsappCarrito(items)} target="_blank" rel="noreferrer" className="btn-neon flex items-center justify-center gap-2 rounded-full py-3.5 font-display text-sm">
              <MessageCircle size={17} /> COMPRAR POR WHATSAPP
            </a>
            <Link href="/carrito" onClick={() => setAbierto(false)} className="btn-borde block rounded-full py-3.5 text-center font-display text-sm">VER CARRITO COMPLETO</Link>
          </div>
        )}
      </aside>
      </>, document.body)}
    </>
  );
}
