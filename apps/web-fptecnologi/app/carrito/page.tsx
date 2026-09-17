'use client';

import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function CarritoPage() {
  const { items, count, subtotal, removeItem } = useCart();
  const { format } = useCurrency();

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[60vh] max-w-3xl px-6 py-16">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-ink/45">
          <a href="/" className="hover:text-brand-primary">
            Inicio
          </a>
          <span>/</span>
          <span>Carrito</span>
        </nav>

        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Tu carrito {count > 0 && `(${count})`}</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-black/15 bg-white px-6 py-10 text-center">
            <p className="text-ink/60">Todavía no agregaste productos.</p>
            <a href="/tienda" className="btn-sweep mt-5 inline-block rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white before:bg-brand-dark">
              Ir al catálogo
            </a>
          </div>
        ) : (
          <>
            <ul className="mt-8 flex flex-col divide-y divide-black/5 rounded-xl border border-black/5 bg-white">
              {items.map((item) => (
                <li key={item.sku} className="flex items-center gap-4 p-4">
                  <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-lg border border-black/5 object-contain p-1.5" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    <p className="mt-0.5 text-xs text-ink/45">SKU: {item.sku}</p>
                    <p className="mt-1 text-sm text-ink/60">
                      {item.qty} × {format(item.price)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-ink">{format(item.qty * item.price)}</p>
                  <button type="button" onClick={() => removeItem(item.sku)} aria-label={`Quitar ${item.name}`} className="shrink-0 text-ink/30 hover:text-red-500">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
                      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-black/5 bg-white px-6 py-4">
              <span className="text-sm font-medium text-ink/60">Subtotal</span>
              <span className="font-display text-2xl font-bold text-ink">{format(subtotal)}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <a href="/#contacto" className="btn-sweep rounded-full bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white before:bg-brand-dark">
                Cotizar este pedido
              </a>
              <a href="/tienda" className="btn-sweep rounded-full border border-black/15 px-7 py-3.5 text-sm font-semibold text-ink before:bg-ink hover:text-white">
                Seguir comprando
              </a>
            </div>

            <p className="mt-6 text-xs text-ink/40">
              Checkout con pago en línea todavía no está construido — por ahora el carrito se convierte en una
              cotización directa con el equipo de ventas.
            </p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
