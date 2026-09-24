'use client';

import { Check, X } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { discountOf, type ShopProduct } from '@/lib/catalog';

type Product = ShopProduct;

/**
 * Tabla de comparación final -- promovida de guia-estilos/page.tsx (sección
 * 12.2, "tabla horizontal"), con imagen del producto en el encabezado.
 * Se usa en el panel de comparar pegado abajo (FeaturedProducts): `slots`
 * rellena columnas vacías ("Libre") hasta el máximo, y `onRemove` agrega una
 * X por producto para quitarlo desde la misma tabla.
 */
export function ProductComparisonTable({
  products,
  slots = products.length,
  onRemove,
}: {
  products: Product[];
  slots?: number;
  onRemove?: (sku: string) => void;
}) {
  const { format } = useCurrency();
  const empty = Math.max(0, slots - products.length);
  const emptyCells = (row: string) =>
    Array.from({ length: empty }).map((_, i) => <td key={`${row}-empty-${i}`} className="text-ink/20">—</td>);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr>
            <th className="w-28" />
            {products.map((p) => (
              <th key={p.sku} className="p-3 text-center">
                <div className="relative mx-auto mb-2 h-16 w-16 rounded-lg bg-paper">
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-contain p-2 mix-blend-multiply" />
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(p.sku)}
                      aria-label={`Quitar ${p.name} de comparar`}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-md bg-red-500 text-white"
                    >
                      <X className="h-3 w-3" strokeWidth={3} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-semibold uppercase text-brand-primary">{p.brand}</p>
                <p className="mx-auto mt-0.5 line-clamp-2 max-w-[11rem] text-xs font-medium text-ink">{p.name}</p>
              </th>
            ))}
            {Array.from({ length: empty }).map((_, i) => (
              <th key={`empty-${i}`} className="p-3 text-center">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-brand-primary/30 text-[11px] font-medium text-brand-primary/50">
                  Libre
                </div>
                <p className="text-xs text-ink/35">Elige otro producto</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-center [&_td]:py-2.5 [&_th]:py-2.5">
          <tr className="border-t border-black/5">
            <th className="pl-4 text-left text-xs font-medium text-ink/45">SKU</th>
            {products.map((p) => (
              <td key={p.sku} className="font-mono text-xs text-ink/70">
                {p.sku}
              </td>
            ))}
            {emptyCells('sku')}
          </tr>
          <tr className="border-t border-black/5">
            <th className="pl-4 text-left text-xs font-medium text-ink/45">Precio</th>
            {products.map((p) => (
              <td key={p.sku} className="font-mono text-sm font-bold text-ink">
                {format(p.price)}
              </td>
            ))}
            {emptyCells('precio')}
          </tr>
          <tr className="border-t border-black/5">
            <th className="pl-4 text-left text-xs font-medium text-ink/45">Descuento</th>
            {products.map((p) => (
              <td key={p.sku} className="font-mono text-xs font-semibold text-brand-primary">
                {discountOf(p) ? `-${discountOf(p)}%` : '—'}
              </td>
            ))}
            {emptyCells('desc')}
          </tr>
          <tr className="border-t border-black/5">
            <th className="pl-4 text-left text-xs font-medium text-ink/45">Stock local</th>
            {products.map((p) => (
              <td key={p.sku}>
                <Check className="mx-auto h-4 w-4 text-emerald-500" strokeWidth={2.4} />
              </td>
            ))}
            {emptyCells('stock')}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
