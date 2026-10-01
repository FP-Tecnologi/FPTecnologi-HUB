'use client';

import { CheckCircle2, Copy, Headset, Mail, MapPin, MessageCircle, PackageCheck, Phone, ReceiptText, Check } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { whatsappHref } from '@/lib/chatActions';
import { CONTACT_INFO } from '@/lib/content';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { PasosCompra } from './PasosCompra';

const SIGUIENTES = [
  { Icon: MessageCircle, titulo: 'Te escribimos por WhatsApp', texto: 'Un asesor confirma tu pedido y los datos de pago.' },
  { Icon: ReceiptText, titulo: 'Confirmas el pago', texto: 'Transferencia, Yape / Plin o efectivo en tienda. Luego emitimos tu comprobante.' },
  { Icon: PackageCheck, titulo: 'Recibes tu pedido', texto: 'Recojo en tienda o envío por Shalom con código de seguimiento.' },
] as const;

/* Confirmación del pedido: número, total, qué pasa ahora y cómo contactarnos. */
export function PedidoGracias({ numero, total }: { numero: string; total: number }) {
  const { format } = useCurrency();
  const [copiado, setCopiado] = useState(false);
  const mensaje = `Hola, acabo de hacer el pedido ${numero} en la web de FPTecnologi y quiero coordinar el pago y la entrega.`;

  return (
    <div role="status">
      <PasosCompra actual={3} />
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-ink/5 bg-white p-8 shadow-xl shadow-brand-dark/10 sm:p-10">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-whatsapp/15 blur-3xl" />
            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-whatsapp/15 text-whatsapp-dark">
                <CheckCircle2 className="h-11 w-11" strokeWidth={1.7} />
              </span>
              <div>
                <h2 className="font-display text-3xl font-bold leading-tight text-ink">¡Recibimos tu pedido!</h2>
                <p className="mt-1.5 text-ink/60">Gracias por comprar en FPTecnologi. Te enviamos la confirmación a tu correo y un asesor te escribirá en breve.</p>
              </div>
            </div>

            <div className="relative mt-8 grid gap-4 rounded-2xl bg-paper p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/50">Número de pedido</p>
                <p className="mt-1 flex items-center gap-2 font-mono text-xl font-bold tracking-wider text-brand-primary">
                  {numero}
                  <button
                    type="button"
                    aria-label="Copiar número de pedido"
                    onClick={() => {
                      navigator.clipboard?.writeText(numero).then(() => {
                        setCopiado(true);
                        window.setTimeout(() => setCopiado(false), 1800);
                      });
                    }}
                    className="rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-white hover:text-brand-primary"
                  >
                    {copiado ? <Check className="h-5 w-5 text-whatsapp-dark" strokeWidth={2.4} /> : <Copy className="h-5 w-5" strokeWidth={1.8} />}
                  </button>
                </p>
                <p className="text-xs text-ink/45">Guárdalo: lo necesitarás para cualquier consulta.</p>
              </div>
              {total > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/50">Total (con IGV)</p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink">{format(total)}</p>
                  <p className="text-xs text-ink/45">Pago por confirmar con tu asesor.</p>
                </div>
              )}
            </div>

            <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref(mensaje)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-whatsapp/25 transition-colors hover:bg-whatsapp-dark"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={2} /> Escribir por WhatsApp
              </a>
              <MoreInfoButton href="/tienda" label="Seguir comprando" />
            </div>
          </section>

          <section className="rounded-3xl border border-ink/5 bg-white p-8 shadow-xl shadow-brand-dark/10">
            <h3 className="font-display text-xl font-bold text-ink">¿Qué sigue?</h3>
            <ol className="mt-6 space-y-6">
              {SIGUIENTES.map(({ Icon, titulo, texto }, i) => (
                <li key={titulo} className="relative flex gap-4">
                  {i < SIGUIENTES.length - 1 && <span aria-hidden className="absolute left-5 top-11 h-[calc(100%-1rem)] w-0.5 bg-brand-dark/15" />}
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-dark text-white shadow-md shadow-brand-dark/25">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span>
                    <span className="block font-bold text-ink">{titulo}</span>
                    <span className="block text-sm leading-relaxed text-ink/60">{texto}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-2xl shadow-brand-dark/30">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-teal/25 blur-3xl" />
            <p className="relative flex items-center gap-2 font-display text-lg font-bold"><Headset className="h-5 w-5" strokeWidth={1.9} /> ¿Necesitas ayuda?</p>
            <ul className="relative mt-4 space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal-light" strokeWidth={2} />{CONTACT_INFO.phoneVentasWeb}</li>
              <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal-light" strokeWidth={2} /><span className="break-all">{CONTACT_INFO.email}</span></li>
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal-light" strokeWidth={2} />{CONTACT_INFO.address}</li>
            </ul>
          </div>
          <a href="/cotizador" className="block rounded-2xl border border-brand-dark/20 bg-brand-primary/5 p-4 text-center text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white">
            ¿Necesitas más equipos? Pide una cotización
          </a>
        </aside>
      </div>
    </div>
  );
}
