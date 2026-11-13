'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ShoppingCart } from 'lucide-react';
import { agregar } from '@/lib/carrito';
import type { ProductoTienda } from '@/lib/tienda';

const datos = (p: ProductoTienda) => ({ sku: p.sku, slug: p.slug, nombre: p.nombre, imagen: p.imagenes[0] ?? '', precio: p.precio });

/** Botón "Agregar" de la tarjeta (compacto, por encima del enlace que cubre la tarjeta). */
export function AgregarRapido({ p }: { p: ProductoTienda }) {
  const [ok, setOk] = useState(false);
  useEffect(() => { if (!ok) return; const t = setTimeout(() => setOk(false), 1800); return () => clearTimeout(t); }, [ok]);
  return (
    <button type="button" onClick={() => { agregar(datos(p)); setOk(true); }} className="relative z-20 inline-flex min-h-11 items-center gap-2 rounded-lg border border-carbon/50 bg-white px-3 text-sm font-bold text-carbon hover:border-rojo-hondo hover:text-rojo-hondo">
      {ok ? <Check aria-hidden="true" size={16} /> : <ShoppingCart aria-hidden="true" size={16} />}
      {ok ? 'Agregado' : 'Agregar'}
      <span role="status" className="sr-only">{ok ? `${p.nombre} agregado al carrito` : ''}</span>
    </button>
  );
}

/** Cantidad + "Agregar al carrito" de la ficha del producto. */
export default function AgregarCarrito({ p }: { p: ProductoTienda }) {
  const [cant, setCant] = useState(1);
  const [ok, setOk] = useState(false);
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-carbon">Cantidad
          <input type="number" inputMode="numeric" min={1} max={999} value={cant} onChange={(e) => setCant(Math.min(999, Math.max(1, Math.floor(Number(e.target.value)) || 1)))} className="mt-1 block min-h-11 w-24 rounded-lg border border-carbon/60 bg-white px-3 text-base text-tinta" />
        </label>
        <button type="button" onClick={() => { agregar(datos(p), cant); setOk(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-carbon px-5 font-bold text-white hover:bg-tinta">
          <ShoppingCart aria-hidden="true" size={18} /> Agregar al carrito
        </button>
      </div>
      <p role="status" className="mt-2 min-h-6 text-sm text-carbon">
        {ok && <>Agregado. <Link href="/carrito" className="font-semibold text-rojo-hondo underline">Ver carrito</Link></>}
      </p>
    </div>
  );
}
