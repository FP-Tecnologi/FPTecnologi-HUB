'use client';

import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function CarritoPage() {
  const { items, count, subtotal, envio, igv, total, setQty, removeItem } = useCart();
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
                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setQty(item.sku, item.qty - 1)}
                        aria-label="Restar"
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-ink/70 transition-colors hover:bg-black/10"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                          <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-ink">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(item.sku, item.qty + 1)}
                        aria-label="Sumar"
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-ink/70 transition-colors hover:bg-black/10"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-ink">{format(item.qty * item.price)}</p>
                  <button type="button" onClick={() => removeItem(item.sku)} aria-label={`Quitar ${item.name}`} className="shrink-0 text-ink/30 hover:text-red-500">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
                      <path
                        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 rounded-xl border border-black/5 bg-white px-6 py-5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink/55">Subtotal</span>
                <span className="font-medium text-ink">{format(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/55">Envío</span>
                <span className="font-medium text-ink">{envio === 0 ? 'Gratis' : format(envio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/55">IGV (18%)</span>
                <span className="font-medium text-ink">{format(igv)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-3">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-display text-2xl font-bold text-ink">{format(total)}</span>
              </div>
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
