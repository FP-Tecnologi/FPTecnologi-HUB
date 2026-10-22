'use client';

import { useState } from 'react';
import { CheckCircle2, FileText, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSitio } from '@/context/SitioContext';
import { WhatsAppIcon } from './icons';
import type { CotizacionChat } from '@/lib/chatCotizacion';

/*
 * Tarjeta de cotización del asistente virtual. Los montos vienen calculados por el servidor (lib/chatCotizacion.ts)
 * con el catálogo real; aquí solo se muestran. Nada se registra sin que la persona pulse «Enviar solicitud», que usa
 * los mismos proxies que los formularios de la web (/api/presupuestos y /api/hub/cotizaciones).
 */
export type EnvioCotizacion = { tipo: 'presupuesto'; id: string; numero: string | null } | { tipo: 'servicio'; numero: string | null };

const usd = (n: number) => `USD ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const celular = (t?: string) => {
  const d = (t ?? '').replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');
  return /^9\d{8}$/.test(d) ? d : undefined;
};

/** Texto de la cotización para WhatsApp (lo que la persona ya vio en la tarjeta). */
export function resumenCotizacion(c: CotizacionChat): string {
  if (c.tipo === 'servicio') return `Hola, quiero cotizar el servicio ${c.servicio.title}.${c.detalle ? ` ${c.detalle}` : ''}`;
  const lineas = c.lineas.map((l) => `${l.cantidad} x ${l.nombre} (SKU ${l.sku})`).join('; ');
  return `Hola, quiero cotizar: ${lineas}. Total referencial ${usd(c.total)} con IGV.`;
}

export function ChatCotizacion({ cotizacion: c, enviada, onEnviada }: { cotizacion: CotizacionChat; enviada?: EnvioCotizacion; onEnviada: (e: EnvioCotizacion) => void }) {
  const { addItem, setQty } = useCart();
  const { whatsapp } = useSitio();
  const [estado, setEstado] = useState<'idle' | 'enviando'>('idle');
  const [error, setError] = useState('');
  const [enCarrito, setEnCarrito] = useState(false);

  const puedeEnviar = c.tipo === 'servicio' || c.destino === 'presupuesto';

  function agregarAlCarrito() {
    if (c.tipo !== 'productos') return;
    for (const l of c.lineas) {
      addItem({ sku: l.sku, name: l.nombre, price: l.precioLista, priceMayor: l.precioMayor, image: l.imagen });
      setQty(l.sku, l.cantidad);
    }
    setEnCarrito(true);
  }

  async function enviar() {
    if (!c.contacto || estado === 'enviando') return;
    setEstado('enviando');
    setError('');
    const k = c.contacto;
    try {
      if (c.tipo === 'productos') {
        const res = await fetch('/api/presupuestos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clienteNombre: k.empresa ? `${k.nombre} (${k.empresa})`.slice(0, 120) : k.nombre,
            clienteEmail: k.email,
            clienteDocumento: k.documento,
            clienteTelefono: celular(k.telefono),
            items: c.lineas.map((l) => ({ sku: l.sku, cantidad: l.cantidad })),
            origen: 'asistente-virtual',
          }),
        });
        const j = (await res.json().catch(() => ({}))) as { id?: string | null; numero?: string | null; error?: string };
        if (!res.ok || !j.id) throw new Error(j.error || 'No pudimos registrar el presupuesto.');
        onEnviada({ tipo: 'presupuesto', id: j.id, numero: j.numero ?? null });
      } else {
        const res = await fetch('/api/hub/cotizaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            servicioSlug: c.servicio.slug,
            clienteNombre: k.nombre,
            clienteEmail: k.email,
            clienteTelefono: celular(k.telefono),
            clienteEmpresa: k.empresa,
            mensaje: c.detalle || undefined,
            origen: 'asistente-virtual',
          }),
        });
        const j = (await res.json().catch(() => ({}))) as { message?: string | string[]; data?: { numero?: string | null } };
        if (!res.ok) throw new Error((Array.isArray(j.message) ? j.message[0] : j.message) || 'No pudimos enviar la solicitud.');
        onEnviada({ tipo: 'servicio', numero: j.data?.numero ?? null });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos conectarnos. Intenta de nuevo.');
    }
    setEstado('idle');
  }

  const boton = 'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors';
  const primario = `${boton} border-brand-700 bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50`;
  const secundario = `${boton} border-brand-200 bg-white text-brand-700 hover:border-brand-700 hover:bg-brand-700 hover:text-white`;

  return (
    <div className="animate-pop-in ml-9 w-[calc(100%-2.25rem)] max-w-sm overflow-hidden rounded-2xl border border-brand-100 bg-white text-ink shadow-sm shadow-brand-950/5">
      <div className="flex items-center gap-2 border-b border-brand-100 bg-brand-50 px-3.5 py-2">
        <FileText className="h-4 w-4 text-brand-700" strokeWidth={2} />
        <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
          {c.tipo === 'servicio' ? 'Solicitud de cotización' : c.destino === 'presupuesto' ? 'Presupuesto mayorista' : 'Cotización referencial'}
        </p>
      </div>

      <div className="px-3.5 py-3 text-xs">
        {c.tipo === 'servicio' ? (
          <>
            <p className="text-sm font-semibold">{c.servicio.title}</p>
            {c.detalle && <p className="mt-1 text-ink/70">{c.detalle}</p>}
            <p className="mt-2 text-ink/60">Se cotiza por proyecto: un especialista prepara la propuesta y te la envía.</p>
          </>
        ) : (
          <>
            <ul className="space-y-2">
              {c.lineas.map((l) => (
                <li key={l.sku} className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <a href={l.href} className="line-clamp-2 font-semibold text-ink hover:text-brand-700">{l.nombre}</a>
                    <p className="text-ink/60">
                      {l.cantidad} × {usd(l.precioUnitario)}
                      {l.mayorista && <span className="ml-1 rounded bg-brand-50 px-1 font-semibold text-brand-700">mayorista</span>}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold">{usd(l.subtotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-0.5 border-t border-brand-100 pt-2">
              <div className="flex justify-between text-ink/70"><dt>Subtotal</dt><dd>{usd(c.subtotal)}</dd></div>
              <div className="flex justify-between text-ink/70"><dt>IGV 18 %</dt><dd>{usd(c.igv)}</dd></div>
              <div className="flex justify-between text-sm font-bold"><dt>Total</dt><dd>{usd(c.total)}</dd></div>
            </dl>
            <p className="mt-2 text-ink/60">
              Precios referenciales. El stock, el envío y el precio final los confirma un asesor.
              {c.destino === 'carrito' && ' Desde 6 unidades por producto aplica precio mayorista.'}
            </p>
          </>
        )}

        {enviada ? (
          <p role="status" className="mt-3 flex items-start gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-2 font-semibold text-emerald-800">
            <CheckCircle2 className="mt-px h-4 w-4 shrink-0" strokeWidth={2} />
            <span>
              {enviada.tipo === 'presupuesto' ? 'Presupuesto registrado' : 'Solicitud enviada'}
              {enviada.numero ? ` (N.° ${enviada.numero})` : ''}. Te escribiremos al correo indicado.
              {enviada.tipo === 'presupuesto' && (
                <a href={`/presupuesto/${enviada.id}`} className="ml-1 underline">Ver presupuesto</a>
              )}
            </span>
          </p>
        ) : (
          puedeEnviar && (
            <p className="mt-3 text-ink/70">
              {c.contacto
                ? `Se enviará a nombre de ${c.contacto.nombre} (${c.contacto.email}).`
                : 'Para enviarla, escribe en el chat tu nombre y correo.'}
            </p>
          )
        )}
        {error && <p role="alert" className="mt-2 rounded-lg bg-rose-50 px-2.5 py-2 font-medium text-rose-700">{error}</p>}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {!enviada && puedeEnviar && c.contacto && (
            <button type="button" onClick={enviar} disabled={estado === 'enviando'} className={primario}>
              {estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          )}
          {c.tipo === 'productos' &&
            (enCarrito ? (
              <a href="/carrito" className={secundario}><ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />Ver carrito</a>
            ) : (
              <button type="button" onClick={agregarAlCarrito} className={secundario}>
                <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />Agregar al carrito
              </button>
            ))}
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(resumenCotizacion(c))}`}
            target="_blank"
            rel="noreferrer"
            className={`${boton} border-whatsapp-dark/30 bg-whatsapp/10 text-whatsapp-dark hover:border-whatsapp-dark hover:bg-whatsapp-dark hover:text-white`}
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
