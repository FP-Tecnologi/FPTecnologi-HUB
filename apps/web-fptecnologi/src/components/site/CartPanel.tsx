'use client';

import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

const MinusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path
      d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Panel de carrito final -- portado de guia-estilos/MiniCartPreview.tsx
 * (sección 11.2) al `CartContext` real: stepper +/- de cantidad, ícono de
 * tacho para eliminar, y desglose Subtotal/Envío/IGV(18%)/Total en vez del
 * dropdown anterior (solo subtotal, sin stepper). Se usa tanto en el
 * dropdown del header (CartButton) como en la página /carrito.
 */
export function CartPanel({ onNavigate }: { onNavigate?: () => void }) {
  const { items, subtotal, envio, igv, total, setQty, removeItem } = useCart();
  const { format } = useCurrency();

  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-ink/65">Todavía no agregaste productos.</p>;
  }

  return (
    <div>
      <div className="flex max-h-72 flex-col gap-4 overflow-y-auto">
        {items.map((item) => (
          <div key={item.sku} className="flex gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-producto">
              <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{item.name}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQty(item.sku, item.qty - 1)}
                    aria-label="Restar"
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-paper text-ink/70 transition-colors hover:bg-black/10"
                  >
                    <MinusIcon />
                  </button>
                  <span className="w-5 text-center text-sm font-medium text-ink">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(item.sku, item.qty + 1)}
                    aria-label="Sumar"
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-paper text-ink/70 transition-colors hover:bg-black/10"
                  >
                    <PlusIcon />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink">{format(item.price * item.qty)}</span>
                  <button type="button" onClick={() => removeItem(item.sku)} aria-label={`Quitar ${item.name}`} className="text-ink/65 transition-colors hover:text-red-500">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 border-t border-black/5 pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-ink/65">Subtotal</span>
          <span className="font-medium text-ink">{format(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink/65">Envío</span>
          <span className="font-medium text-ink">{envio === 0 ? 'Gratis' : format(envio)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink/65">IGV (18%)</span>
          <span className="font-medium text-ink">{format(igv)}</span>
        </div>
        <div className="mt-1.5 flex justify-between border-t border-black/5 pt-2">
          <span className="font-bold text-ink">Total</span>
          <span className="text-base font-bold text-brand-700">{format(total)}</span>
        </div>
      </div>

      <a href="/carrito" onClick={onNavigate} className="btn-glow mt-4 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-center text-sm font-semibold text-white">
        Ver carrito
      </a>
    </div>
  );
}
