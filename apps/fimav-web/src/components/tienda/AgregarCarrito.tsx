'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ShoppingCart } from 'lucide-react';
import BotonHex from '@/components/hex/BotonHex';
import CampoHex from './CampoHex';
import { agregar } from '@/lib/carrito';
import type { ProductoTienda } from '@/lib/tienda';

const datos = (p: ProductoTienda) => ({ sku: p.sku, slug: p.slug, nombre: p.nombre, imagen: p.imagenes[0] ?? '', precio: p.precio });

/** Botón "Agregar" de la tarjeta (compacto, por encima del enlace que cubre la tarjeta). */
export function AgregarRapido({ p }: { p: ProductoTienda }) {
  const [ok, setOk] = useState(false);
  useEffect(() => { if (!ok) return; const t = setTimeout(() => setOk(false), 1800); return () => clearTimeout(t); }, [ok]);
  return (
    <>
      <BotonHex onClick={() => { agregar(datos(p)); setOk(true); }} size="sm" variante="contorno" icono={ok ? Check : ShoppingCart} className="relative z-20">
        {ok ? 'Agregado' : 'Agregar'}
      </BotonHex>
      <span role="status" className="sr-only">{ok ? `${p.nombre} agregado al carrito` : ''}</span>
    </>
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
          <CampoHex className="mt-1 w-28"><input type="number" inputMode="numeric" min={1} max={999} value={cant} onChange={(e) => setCant(Math.min(999, Math.max(1, Math.floor(Number(e.target.value)) || 1)))} className="min-h-10 w-full min-w-0 bg-transparent text-base text-tinta outline-none" /></CampoHex>
        </label>
        <BotonHex onClick={() => { agregar(datos(p), cant); setOk(true); }} variante="carbon" icono={ShoppingCart}>Agregar al carrito</BotonHex>
      </div>
      <p role="status" className="mt-2 min-h-6 text-sm text-carbon">
        {ok && <>Agregado. <Link href="/carrito" className="font-semibold text-rojo-hondo underline">Ver carrito</Link></>}
      </p>
    </div>
  );
}
