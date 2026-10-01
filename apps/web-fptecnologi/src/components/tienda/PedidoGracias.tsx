'use client';

import { CheckCircle2, Copy, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { whatsappHref } from '@/lib/chatActions';

/* Confirmación del pedido: número, total y el siguiente paso (WhatsApp). */
export function PedidoGracias({ numero, total }: { numero: string; total: number }) {
  const { format } = useCurrency();
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-ink/5 bg-white p-8 text-center shadow-xl shadow-brand-dark/10 sm:p-12" role="status">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp-dark">
        <CheckCircle2 className="h-11 w-11" strokeWidth={1.8} />
      </span>
      <h2 className="mt-6 font-display text-3xl font-bold text-ink">¡Recibimos tu pedido!</h2>
      <p className="mt-2 text-ink/60">Un asesor te escribirá por WhatsApp para confirmar el pago y coordinar la entrega.</p>

      <div className="mt-8 rounded-2xl bg-paper p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/50">Número de pedido</p>
        <p className="mt-1 flex items-center justify-center gap-3 font-mono text-2xl font-bold tracking-wider text-brand-primary">
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
            <Copy className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </p>
        {copiado && <p className="text-xs font-semibold text-whatsapp-dark">¡Copiado!</p>}
        {total > 0 && (
          <p className="mt-4 text-sm text-ink/60">
            Total (con IGV): <span className="font-display text-lg font-bold text-ink">{format(total)}</span>
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href={whatsappHref(`Hola, acabo de hacer el pedido ${numero} en la web de FPTecnologi y quiero coordinar el pago y la entrega.`)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-whatsapp px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-whatsapp-dark"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={2} /> Escribir por WhatsApp
        </a>
        <a href="/tienda" className="inline-flex h-12 items-center rounded-xl border border-ink/15 px-6 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-white">
          Seguir comprando
        </a>
      </div>
      <p className="mt-6 text-xs text-ink/45">Guarda tu número de pedido: lo necesitarás para cualquier consulta.</p>
    </div>
  );
}
