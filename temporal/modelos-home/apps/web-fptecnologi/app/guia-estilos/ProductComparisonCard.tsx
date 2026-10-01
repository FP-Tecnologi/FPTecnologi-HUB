const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 text-emerald-500">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const DashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 text-ink/20">
    <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

type Product = { name: string; brand: string; sku: string; image: string; price: number; priceBefore: number };

/** Propuesta de comparación de productos — adaptada del ejemplo que pasó el
 * usuario (ProductComparisonCard). Con una diferencia deliberada: el
 * original compara "features" (specs técnicas tipo USB-C, panel IPS) que
 * inventaría datos falsos sobre productos reales de marca (ASUS/Dell) que
 * no tenemos cargados — acá se compara con datos reales del catálogo
 * (marca, SKU, precio, % de descuento), no specs técnicos. */
export function ProductComparisonCard({ a, b }: { a: Product; b: Product }) {
  const discountA = Math.round(((a.priceBefore - a.price) / a.priceBefore) * 100);
  const discountB = Math.round(((b.priceBefore - b.price) / b.priceBefore) * 100);

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg shadow-black/5">
      <div className="p-6">
        <h3 className="mb-5 font-display text-lg font-bold text-ink">Comparar productos</h3>

        <div className="mb-6 grid grid-cols-2 gap-4">
          {[a, b].map((p) => (
            <div key={p.sku} className="text-center">
              <div className="mb-2 aspect-square w-full overflow-hidden rounded-xl bg-brand-primary/6">
                <img src={p.image} alt={p.name} className="h-full w-full object-contain p-4" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">{p.brand}</p>
              <h4 className="mt-0.5 line-clamp-2 min-h-[2.2rem] text-sm font-semibold text-ink">{p.name}</h4>
              <p className="mt-1 font-mono text-lg font-bold text-ink">${p.price.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wide text-ink/40">Datos del catálogo</p>
        <div className="flex flex-col divide-y divide-black/5 text-sm">
          <div className="grid grid-cols-3 items-center gap-2 py-2.5">
            <span className="text-center font-mono text-xs text-ink/70">{a.sku}</span>
            <span className="text-center text-xs text-ink/45">SKU</span>
            <span className="text-center font-mono text-xs text-ink/70">{b.sku}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-2 py-2.5">
            <span className="text-center font-mono text-xs text-ink/70">${a.priceBefore.toFixed(2)}</span>
            <span className="text-center text-xs text-ink/45">Precio antes</span>
            <span className="text-center font-mono text-xs text-ink/70">${b.priceBefore.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-2 py-2.5">
            <span className="text-center font-mono text-xs font-semibold text-brand-primary">-{discountA}%</span>
            <span className="text-center text-xs text-ink/45">Descuento</span>
            <span className="text-center font-mono text-xs font-semibold text-brand-primary">-{discountB}%</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-2 py-2.5">
            <span className="flex justify-center">
              <CheckIcon />
            </span>
            <span className="text-center text-xs text-ink/45">Stock local</span>
            <span className="flex justify-center">
              <CheckIcon />
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-2 py-2.5">
            <span className="flex justify-center">{a.price >= 300 ? <CheckIcon /> : <DashIcon />}</span>
            <span className="text-center text-xs text-ink/45">Envío gratis solo</span>
            <span className="flex justify-center">{b.price >= 300 ? <CheckIcon /> : <DashIcon />}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
