import Link from 'next/link';
import { FileText } from 'lucide-react';
import { usd, type ProductoTienda } from '@/lib/tienda';

/** Tarjeta de producto de la tienda: foto sobre blanco, marca, nombre, precio referencial y enlace a la ficha. */
export default function ProductoCard({ p }: { p: ProductoTienda }) {
  const descuento = p.precioAntes ? Math.round(((p.precioAntes - p.precio) / p.precioAntes) * 100) : 0;
  return (
    <article className="group/card relative flex w-full flex-col overflow-hidden rounded-2xl border border-carbon/15 bg-white transition-shadow focus-within:shadow-lg hover:shadow-lg">
      {descuento > 0 && <span className="absolute left-3 top-3 z-10 rounded-full bg-boton px-2.5 py-1 text-xs font-bold text-white">-{descuento}%</span>}
      <div className="aspect-square bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.imagenes[0] ?? '/brand/og.jpg'} alt="" loading="lazy" decoding="async" className="size-full object-contain transition-transform duration-500 motion-safe:group-hover/card:scale-105" />
      </div>
      <div className="flex flex-1 flex-col border-t border-carbon/10 bg-gris p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-rojo-hondo">{p.marca || p.categoria.nombre}</p>
        <h3 className="mt-1 line-clamp-3 flex-1 text-base font-semibold leading-snug text-carbon">
          <Link href={`/tienda/${p.slug}`} className="after:absolute after:inset-0">{p.nombre}</Link>
        </h3>
        <p className="mt-3 flex items-baseline gap-2 text-carbon">
          <span className="font-display text-xl font-bold">{usd(p.precio)}</span>
          {p.precioAntes && <s className="text-sm text-carbon/60">{usd(p.precioAntes)}</s>}
        </p>
        <p className="mt-1 text-xs text-carbon/70">Precio referencial, sin IGV</p>
        <span className="mt-3 inline-flex min-h-11 items-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-rojo-hondo"><FileText aria-hidden="true" size={16} /> Ver y cotizar</span>
      </div>
    </article>
  );
}
