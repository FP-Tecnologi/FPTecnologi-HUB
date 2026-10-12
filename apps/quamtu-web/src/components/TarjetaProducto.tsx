'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Check, Eye, ShoppingCart } from 'lucide-react';
import ImgPieza from './ImgPieza';
import { agregarAlCarrito } from '@/lib/carrito';
import { CATS, type Opcion } from '@/lib/piezas';

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

// Tarjeta de la tienda: foto que se acerca al pasar el mouse, datos clave y dos acciones siempre visibles.
export default function TarjetaProducto({ o }: { o: Opcion }) {
  const [ok, setOk] = useState(false);
  const cat = CATS.find((c) => c.id === o.cat)?.titulo ?? '';
  const datos = [...o.spec.split(' · '), ...(o.watts && o.cat !== 'fuente' ? [`~${o.watts} W`] : [])].slice(0, 3);

  return (
    <article className="hud group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:border-claro/70 hover:shadow-[0_18px_40px_rgba(0,0,0,.45)]">
      <Link href={`/producto/${o.id}`} className="relative block overflow-hidden" aria-label={`Ver ${o.nombre}`}>
        <ImgPieza id={o.id} cat={o.cat} color={o.color} className="h-48 w-full bg-gradient-to-br from-panel to-bg transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-bg/80 px-3 py-1 font-display text-xs font-bold tracking-wider text-claro backdrop-blur">{cat.toUpperCase()}</span>
        {/* Al pasar el cursor aparece "Ver producto" sobre la imagen (en pantallas táctiles queda visible) */}
        <span className="absolute inset-0 grid place-items-center bg-bg/55 backdrop-blur-[2px] transition duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
          <span className="btn-borde inline-flex items-center gap-2 rounded-full bg-bg/70 px-5 py-2.5 font-display text-xs font-bold text-white transition duration-300 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:group-hover:translate-y-0">
            <Eye size={16} /> VER PRODUCTO
          </span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-base font-bold normal-case leading-snug text-white">
          <Link href={`/producto/${o.id}`} className="hover:text-claro">{o.nombre}</Link>
        </h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {datos.map((d) => (
            <span key={d} className="rounded-md border border-line bg-panel px-2 py-0.5 text-xs text-slate-300">{d}</span>
          ))}
        </div>
        <p className="mt-auto pt-5 font-display text-2xl font-bold text-claro">{soles(o.precio)}</p>
        <p className="text-xs text-slate-400">Precio referencial · IGV incluido</p>

        <button
          onClick={() => {
            agregarAlCarrito({ tipo: 'pieza', ids: [o.id], total: o.precio });
            setOk(true);
            setTimeout(() => setOk(false), 1800);
          }}
          className="btn-neon mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 font-display text-xs"
        >
          {ok ? <Check size={15} /> : <ShoppingCart size={15} />} {ok ? 'AÑADIDO AL CARRITO' : 'AÑADIR AL CARRITO'}
        </button>
      </div>
    </article>
  );
}
