'use client';
import Link from 'next/link';
import { FileText, Trash2 } from 'lucide-react';
import BotonHex from '@/components/hex/BotonHex';
import { cambiarCantidad, quitar, totalPrecio, totalUnidades, useCarrito, vaciar } from '@/lib/carrito';
import { usd } from '@/lib/tienda';

export default function CarritoVista() {
  const items = useCarrito();
  if (!items.length)
    return (
      <div className="rounded-2xl bg-gris p-8 text-center">
        <p className="text-lg text-carbon/80">Tu carrito está vacío.</p>
        <BotonHex href="/tienda" className="mt-5">Ver la tienda</BotonHex>
      </div>
    );
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-carbon/15 rounded-2xl border border-carbon/15 bg-white">
        {items.map((i) => (
          <li key={i.sku} className="flex flex-wrap items-center gap-4 p-4">
            <div className="size-20 shrink-0 rounded-lg border border-carbon/10 bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {i.imagen && <img src={i.imagen} alt="" loading="lazy" className="size-full object-contain" />}
            </div>
            <div className="min-w-48 flex-1">
              <Link href={`/tienda/${i.slug}`} className="font-semibold text-carbon hover:text-rojo-hondo hover:underline">{i.nombre}</Link>
              <p className="text-sm text-carbon/70">Código: {i.sku} · {usd(i.precio)} c/u</p>
            </div>
            <label className="text-sm text-carbon">
              <span className="sr-only">Cantidad de {i.nombre}</span>
              <input type="number" inputMode="numeric" min={1} max={999} value={i.cantidad} onChange={(e) => cambiarCantidad(i.sku, Number(e.target.value))} className="min-h-11 w-20 rounded-lg border border-carbon/60 bg-white px-3 text-base text-tinta" />
            </label>
            <p className="w-28 text-right font-display text-lg font-bold text-carbon">{usd(i.precio * i.cantidad)}</p>
            <button type="button" onClick={() => quitar(i.sku)} aria-label={`Quitar ${i.nombre}`} className="flex size-11 items-center justify-center rounded-lg text-carbon hover:bg-gris hover:text-rojo-hondo"><Trash2 aria-hidden="true" size={18} /></button>
          </li>
        ))}
      </ul>
      <aside className="rounded-2xl bg-gris p-6">
        <h2 className="titulo-menor text-xl text-carbon">Resumen</h2>
        <p className="mt-4 flex justify-between text-carbon"><span>Equipos</span><span>{totalUnidades(items)}</span></p>
        <p className="mt-2 flex justify-between font-display text-xl font-bold text-carbon"><span>Total referencial</span><span>{usd(totalPrecio(items))}</span></p>
        <p className="mt-2 text-sm text-carbon/70">Precios en dólares, sin IGV. Confirmamos precio, stock y envío en tu cotización; no se cobra nada en esta web.</p>
        <BotonHex href="/cotizar?carrito=1" size="lg" icono={FileText} className="mt-5">Solicitar cotización</BotonHex>
        <button type="button" onClick={vaciar} className="mt-4 min-h-11 text-sm font-semibold text-carbon underline hover:text-rojo-hondo">Vaciar carrito</button>
      </aside>
    </div>
  );
}
