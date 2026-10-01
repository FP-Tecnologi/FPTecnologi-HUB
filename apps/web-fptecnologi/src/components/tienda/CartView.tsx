'use client';

import { Banknote, Headset, Landmark, Lock, Minus, Plus, ShieldCheck, ShoppingBag, Smartphone, Trash2, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { PasosCompra } from './PasosCompra';

const GARANTIAS = [
  { Icon: ShieldCheck, titulo: 'Garantía oficial', texto: 'Equipos nuevos con garantía del fabricante.' },
  { Icon: Truck, titulo: 'Envío a todo el Perú', texto: 'Recojo en tienda o por Shalom.' },
  { Icon: Headset, titulo: 'Soporte local', texto: 'Asesores que te acompañan antes y después.' },
] as const;

/* Carrito: lista de productos con cantidades + resumen del pedido (mismo lenguaje del checkout). */
export function CartView() {
  const { items, count, subtotal, igv, total, setQty, removeItem, clear } = useCart();
  const { format } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-ink/5 bg-white p-10 text-center shadow-xl shadow-brand-dark/10 sm:p-14">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
          <ShoppingBag className="h-10 w-10" strokeWidth={1.6} />
        </span>
        <h2 className="mt-6 font-display text-2xl font-bold text-ink">Tu carrito está vacío</h2>
        <p className="mt-2 text-ink/60">Explora la tienda y agrega los equipos que necesitas. También puedes pedirnos una cotización a medida.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MoreInfoButton href="/tienda" label="Ir a la tienda" />
          <a href="/cotizador" className="inline-flex h-11 items-center rounded-xl border border-ink/15 px-6 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-white">
            Cotizar
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <PasosCompra actual={1} />
      <div className="grid gap-8 pb-24 lg:grid-cols-[1fr_24rem] lg:items-start lg:pb-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink/70">
              {count} {count === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
            <button
              type="button"
              onClick={() => window.confirm('¿Vaciar el carrito?') && clear()}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50 transition-colors hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.9} />
              Vaciar carrito
            </button>
          </div>

          <ul className="space-y-4">
            {items.map((item, i) => (
              <ScrollReveal key={item.sku} direction="up" delayMs={Math.min(i, 4) * 60}>
                <li className="group flex gap-4 rounded-3xl border border-ink/5 bg-white p-4 shadow-lg shadow-brand-dark/10 transition-shadow hover:shadow-xl hover:shadow-brand-dark/15 sm:gap-6 sm:p-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sky-50 sm:h-28 sm:w-28">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" className="h-full w-full object-contain p-2 mix-blend-multiply" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-display text-base font-bold leading-snug text-ink">{item.name}</p>
                        <p className="mt-1 text-xs text-ink/45">SKU {item.sku} · {format(item.price)} c/u</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.sku)}
                        aria-label={`Quitar ${item.name}`}
                        title="Quitar"
                        className="shrink-0 rounded-lg p-2 text-ink/35 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                      <div className="inline-flex items-center rounded-xl border border-ink/10 bg-paper" role="group" aria-label={`Cantidad de ${item.name}`}>
                        <button type="button" onClick={() => setQty(item.sku, item.qty - 1)} aria-label="Restar una unidad" className="flex h-9 w-9 items-center justify-center rounded-l-xl text-ink/60 transition-colors hover:bg-brand-dark hover:text-white">
                          <Minus className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                        <span className="w-9 text-center text-sm font-bold text-ink" aria-live="polite">{item.qty}</span>
                        <button type="button" onClick={() => setQty(item.sku, item.qty + 1)} aria-label="Sumar una unidad" className="flex h-9 w-9 items-center justify-center rounded-r-xl text-ink/60 transition-colors hover:bg-brand-dark hover:text-white">
                          <Plus className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                      </div>
                      <p className="font-mono text-lg font-bold text-ink">{format(item.qty * item.price)}</p>
                    </div>
                  </div>
                </li>
              </ScrollReveal>
            ))}
          </ul>

          <div className="grid gap-4 sm:grid-cols-3">
            {GARANTIAS.map(({ Icon, titulo, texto }) => (
              <div key={titulo} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-md shadow-brand-dark/10">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{titulo}</span>
                  <span className="block text-xs leading-relaxed text-ink/55">{texto}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-2xl shadow-brand-dark/30">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-teal/25 blur-3xl" />
            <h2 className="relative font-display text-lg font-bold">Resumen del pedido</h2>
            <dl className="relative mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-white/60">Subtotal</dt><dd>{format(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-white/60">IGV (18%)</dt><dd>{format(igv)}</dd></div>
              <div className="flex justify-between"><dt className="text-white/60">Envío</dt><dd className="text-white/60">Se calcula al elegir la entrega</dd></div>
              <div className="flex items-baseline justify-between border-t border-white/10 pt-4">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-3xl font-bold">{format(total)}</dd>
              </div>
            </dl>
            <a href="/checkout" className="relative mt-6 flex h-14 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold uppercase tracking-wide text-brand-dark transition-colors hover:bg-brand-dark hover:text-white">
              Finalizar compra
            </a>
            <a href="/tienda" className="relative mt-3 block text-center text-sm font-semibold text-white/70 transition-colors hover:text-white">
              ← Seguir comprando
            </a>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md shadow-brand-dark/10">
            <p className="flex items-start gap-2 text-sm text-ink/65">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" strokeWidth={2} />
              No se cobra nada en línea: un asesor confirma el pago y la entrega contigo por WhatsApp.
            </p>
            <p className="mt-3 flex items-center gap-3 text-xs font-semibold text-ink/50">
              <span className="inline-flex items-center gap-1"><Landmark className="h-4 w-4" strokeWidth={1.8} /> Transferencia</span>
              <span className="inline-flex items-center gap-1"><Smartphone className="h-4 w-4" strokeWidth={1.8} /> Yape / Plin</span>
              <span className="inline-flex items-center gap-1"><Banknote className="h-4 w-4" strokeWidth={1.8} /> Efectivo</span>
            </p>
          </div>

          <a href="/cotizador" className="block rounded-2xl border border-brand-dark/20 bg-brand-primary/5 p-4 text-center text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white">
            ¿Compras en volumen? Cotiza este pedido
          </a>
        </aside>
      </div>

      {/* Barra fija en móvil con el total y el paso siguiente */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(33,129,175,0.35)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 pr-16">
          <div>
            <p className="text-xs text-ink/50">Total con IGV</p>
            <p className="font-display text-xl font-bold text-ink">{format(total)}</p>
          </div>
          <a href="/checkout" className="inline-flex h-12 items-center rounded-xl bg-brand-dark px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-primary">
            Finalizar compra
          </a>
        </div>
      </div>
    </>
  );
}
