'use client';

import { ChevronRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import type { ProductoChat } from '@/lib/chatCotizacion';

const STOCK = {
  si: { texto: 'En stock', punto: 'bg-emerald-500', tono: 'text-emerald-700' },
  no: { texto: 'A pedido', punto: 'bg-amber-500', tono: 'text-amber-700' },
  consultar: { texto: 'Consultar stock', punto: 'bg-ink/30', tono: 'text-ink/60' },
} as const;

/*
 * Productos que mencionó el asistente: foto pequeña, título, precio (en la moneda elegida, sin IGV) y disponibilidad,
 * con los datos reales del catálogo (los arma el servidor en app/api/chat). Toda la tarjeta lleva a la ficha.
 */
export function ChatProductos({ productos }: { productos: ProductoChat[] }) {
  const { format } = useCurrency();
  return (
    <ul className="animate-pop-in ml-9 flex w-[calc(100%-2.25rem)] max-w-sm flex-col gap-1.5" aria-label="Productos sugeridos">
      {productos.map((p) => {
        const s = STOCK[p.stock];
        return (
          <li key={p.sku}>
            <a
              href={p.href}
              className="group flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-2 pr-2.5 shadow-sm shadow-brand-950/5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <span className="bg-producto flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-brand-50">
                {p.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imagen} alt="" loading="lazy" className="h-full w-full object-contain p-1" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-xs font-semibold leading-snug text-ink group-hover:text-brand-700">{p.nombre}</span>
                <span className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-xs">
                  <span className="font-bold text-ink">{format(p.precio)}</span>
                  {p.precioAntes && p.precioAntes > p.precio && <span className="text-[11px] text-ink/50 line-through">{format(p.precioAntes)}</span>}
                  <span className="text-[10px] text-ink/55">+ IGV</span>
                </span>
                <span className={`mt-0.5 flex items-center gap-1 text-[11px] font-medium ${s.tono}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${s.punto}`} />
                  {s.texto} · {p.marca}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink/40 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" strokeWidth={2} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
