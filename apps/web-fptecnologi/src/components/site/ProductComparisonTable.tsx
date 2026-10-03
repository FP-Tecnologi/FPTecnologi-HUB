import type { FEATURED_PRODUCTS } from '@/lib/content';

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="mx-auto h-4 w-4 text-emerald-500">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Tabla de comparación final -- promovida de guia-estilos/page.tsx (sección
 * 12.2, "tabla horizontal"), ya con imagen del producto en el encabezado.
 * Permite comparar más de 2 productos a la vez (a diferencia de la tarjeta
 * 1 a 1 de la sección 12.1).
 */
export function ProductComparisonTable({ products }: { products: (typeof FEATURED_PRODUCTS)[number][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr>
            <th className="w-28" />
            {products.map((p) => (
              <th key={p.sku} className="p-4 text-center">
                <div className="mx-auto mb-2 h-16 w-16 overflow-hidden rounded-lg bg-producto">
                  <img src={p.image} alt={p.name} className="h-full w-full object-contain p-2" />
                </div>
                <p className="text-[10px] font-semibold uppercase text-brand-700">{p.brand}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-center [&_td]:py-3 [&_th]:py-3">
          <tr className="border-t border-black/5">
            <th className="pl-4 text-left text-xs font-medium text-ink/45">SKU</th>
            {products.map((p) => (
              <td key={p.sku} className="font-mono text-xs text-ink/70">
                {p.sku}
              </td>
            ))}
          </tr>
          <tr className="border-t border-black/5">
            <th className="pl-4 text-left text-xs font-medium text-ink/45">Precio</th>
            {products.map((p) => (
              <td key={p.sku} className="font-mono text-sm font-bold text-ink">
                ${p.price.toFixed(2)}
              </td>
            ))}
          </tr>
          <tr className="border-t border-black/5">
            <th className="pl-4 text-left text-xs font-medium text-ink/45">Descuento</th>
            {products.map((p) => (
              <td key={p.sku} className="font-mono text-xs font-semibold text-brand-700">
                -{Math.round(((p.priceBefore - p.price) / p.priceBefore) * 100)}%
              </td>
            ))}
          </tr>
          <tr className="border-t border-black/5">
            <th className="pl-4 text-left text-xs font-medium text-ink/45">Stock local</th>
            {products.map((p) => (
              <td key={p.sku}>
                <CheckIcon />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
