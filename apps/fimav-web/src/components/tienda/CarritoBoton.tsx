'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { totalUnidades, useCarrito } from '@/lib/carrito';

/** Ícono del carrito en la cabecera, con la cantidad de unidades. */
export default function CarritoBoton() {
  const n = totalUnidades(useCarrito());
  return (
    <Link href="/carrito" aria-label={n ? `Carrito, ${n} unidades` : 'Carrito'} className="cabecera-link relative flex size-10 shrink-0 sm:size-11 items-center justify-center rounded-full text-carbon hover:text-rojo-hondo">
      <ShoppingCart aria-hidden="true" size={24} />
      {n > 0 && <span aria-hidden="true" className="absolute right-0 top-0 min-w-5 rounded-full bg-boton px-1 text-center text-xs font-bold leading-5 text-white">{n > 99 ? '99+' : n}</span>}
    </Link>
  );
}
