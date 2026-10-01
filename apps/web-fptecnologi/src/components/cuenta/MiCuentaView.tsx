'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, ClipboardList, Clock, FileText, LogOut, MapPin, MessageCircle, Package, Phone, ShoppingBag, Truck, User } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { whatsappHref } from '@/lib/chatActions';
import type { CotizacionCuenta, PedidoCuenta, ResumenCuenta } from '@/lib/cuenta';

const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

/* Etapas visibles del pedido para el cliente (CANCELADO se muestra aparte). */
const ETAPAS: { v: PedidoCuenta['estado']; label: string; Icon: typeof Package }[] = [
  { v: 'PENDIENTE', label: 'Recibido', Icon: ClipboardList },
  { v: 'PAGADO', label: 'Pago confirmado', Icon: CheckCircle2 },
  { v: 'ENVIADO', label: 'Enviado', Icon: Truck },
  { v: 'ENTREGADO', label: 'Entregado', Icon: Package },
];
const ESTADO_COT: Record<CotizacionCuenta['estado'], { label: string; clase: string }> = {
  PENDIENTE: { label: 'Recibida', clase: 'bg-amber-100 text-amber-800' },
  EN_REVISION: { label: 'En revisión', clase: 'bg-sky-100 text-sky-800' },
  ENVIADA: { label: 'Propuesta enviada', clase: 'bg-brand-primary/10 text-brand-primary' },
  ACEPTADA: { label: 'Aceptada', clase: 'bg-emerald-100 text-emerald-800' },
  RECHAZADA: { label: 'Rechazada', clase: 'bg-rose-100 text-rose-800' },
};
const PAGO: Record<string, string> = { PENDIENTE: 'Pago pendiente', POR_CONFIRMAR: 'Pago por confirmar', PAGADO: 'Pagado' };
const METODO: Record<string, string> = { TRANSFERENCIA: 'Transferencia', YAPE_PLIN: 'Yape / Plin', EFECTIVO: 'Efectivo en tienda' };

function Linea({ estado }: { estado: PedidoCuenta['estado'] }) {
  if (estado === 'CANCELADO') return <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">Este pedido fue cancelado.</p>;
  const actual = ETAPAS.findIndex((e) => e.v === estado);
  return (
    <ol className="flex items-center" aria-label="Estado del pedido">
      {ETAPAS.map((e, i) => (
        <li key={e.v} className={`flex items-center ${i < ETAPAS.length - 1 ? 'flex-1' : ''}`} aria-current={i === actual ? 'step' : undefined}>
          <span className="flex flex-col items-center gap-1.5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 ${i <= actual ? 'border-brand-dark bg-brand-dark text-white' : 'border-ink/10 bg-white text-ink/30'}`}><e.Icon className="h-4 w-4" strokeWidth={2} /></span>
            <span className={`text-[11px] font-semibold ${i <= actual ? 'text-brand-primary' : 'text-ink/35'}`}>{e.label}</span>
          </span>
          {i < ETAPAS.length - 1 && <span aria-hidden className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${i < actual ? 'bg-brand-dark' : 'bg-ink/10'}`} />}
        </li>
      ))}
    </ol>
  );
}

function PedidoCard({ p }: { p: PedidoCuenta }) {
  const { format } = useCurrency();
  const [abierto, setAbierto] = useState(false);
  const total = Number(p.total);
  const wa = whatsappHref(`Hola, consulto por mi pedido ${p.numeroPedido ?? ''} de la web de FPTecnologi.`);
  return (
    <article className="hover-lift rounded-3xl border border-ink/5 bg-white p-6 shadow-lg shadow-brand-dark/10 hover:shadow-xl hover:shadow-brand-dark/15">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-lg font-bold tracking-wider text-brand-primary">{p.numeroPedido ?? p.id.slice(0, 8)}</p>
          <p className="text-sm text-ink/55">{fecha(p.createdAt)} · {p.items.reduce((s, i) => s + i.cantidad, 0)} producto(s)</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold text-ink">{format(total)}</p>
          <p className="text-xs font-semibold text-ink/50">{PAGO[p.estadoPago] ?? p.estadoPago}{p.metodoPago ? ` · ${METODO[p.metodoPago] ?? p.metodoPago}` : ''}</p>
        </div>
      </div>
      <div className="mt-5"><Linea estado={p.estado} /></div>

      {p.trackingCodigo && (
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-brand-primary/5 px-4 py-3 text-sm text-ink/75">
          <Truck className="h-4 w-4 shrink-0 text-brand-primary" strokeWidth={2} />
          Código de seguimiento {p.envioProveedor === 'SHALOM' ? 'Shalom' : p.envioProveedor ?? ''}: <b className="font-mono tracking-wide text-ink">{p.trackingCodigo}</b>
        </p>
      )}

      <button type="button" onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="mt-5 flex w-full items-center justify-between text-sm font-semibold text-brand-primary">
        {abierto ? 'Ocultar detalle' : 'Ver detalle del pedido'} <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${abierto ? 'rotate-180' : ''}`} strokeWidth={2.2} />
      </button>
      {abierto && (
        <div className="cot-step mt-4 space-y-4 border-t border-ink/10 pt-4">
          <ul className="space-y-2">
            {p.items.map((i, k) => (
              <li key={k} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-ink/80">{i.cantidad} × {i.nombreSnapshot}<span className="block text-xs text-ink/40">SKU {i.skuSnapshot}</span></span>
                <span className="shrink-0 font-semibold text-ink">{format(Number(i.subtotal))}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink/55">Subtotal</dt><dd>{format(Number(p.subtotal))}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/55">IGV (18%)</dt><dd>{format(Number(p.igv))}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/55">Envío</dt><dd>{Number(p.envio) > 0 ? format(Number(p.envio)) : p.envioProveedor ? 'Incluido' : 'Gratis / a coordinar'}</dd></div>
            <div className="flex justify-between border-t border-ink/10 pt-2 font-bold"><dt>Total</dt><dd>{format(total)}</dd></div>
          </dl>
          <div className="flex items-start gap-2 rounded-xl bg-paper p-4 text-sm text-ink/70">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" strokeWidth={2} />
            <span>
              {p.envioProveedor
                ? <>Envío por {p.envioProveedor === 'SHALOM' ? 'Shalom' : p.envioProveedor} a {p.envioDepartamento}{p.envioSede ? <> — recoges en <b>{p.envioSede}</b></> : null}{p.envioPlazo ? ` (${p.envioPlazo})` : ''}</>
                : p.direccion ? <>Envío a domicilio: {p.direccion}{p.distrito ? `, ${p.distrito}` : ''}</> : 'Recojo en tienda (Breña, Lima)'}
            </span>
          </div>
          <a href={wa} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-whatsapp px-4 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-whatsapp-dark"><MessageCircle className="h-4 w-4" strokeWidth={2} /> Consultar este pedido</a>
        </div>
      )}
    </article>
  );
}

function CotizacionCard({ c }: { c: CotizacionCuenta }) {
  const e = ESTADO_COT[c.estado];
  const [abierto, setAbierto] = useState(c.estado === 'ENVIADA');
  const tienePropuesta = !!c.propuesta || c.monto != null;
  const wa = whatsappHref(`Hola, consulto por mi cotización ${c.numero ?? ''} (${c.servicio.nombre}) de la web de FPTecnologi.`);
  return (
    <article className="hover-lift rounded-3xl border border-ink/5 bg-white p-6 shadow-lg shadow-brand-dark/10 hover:shadow-xl hover:shadow-brand-dark/15">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold text-ink">{c.servicio.nombre}</p>
          <p className="text-sm text-ink/55"><span className="font-mono">{c.numero ?? ''}</span> · solicitada el {fecha(c.createdAt)}</p>
        </div>
        <span className={`rounded-lg px-3 py-1 text-xs font-bold ${e.clase}`}>{e.label}</span>
      </div>
      {c.mensaje && <p className="mt-4 rounded-xl bg-paper p-4 text-sm text-ink/70"><span className="font-semibold text-ink/80">Lo que pediste: </span>{c.mensaje}</p>}
      {!tienePropuesta ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink/60"><Clock className="h-4 w-4 text-brand-primary" strokeWidth={2} /> Un especialista está preparando tu propuesta. Te la enviaremos por correo o WhatsApp y también la verás aquí.</p>
      ) : (
        <>
          <button type="button" onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="mt-4 flex w-full items-center justify-between text-sm font-semibold text-brand-primary">
            {abierto ? 'Ocultar propuesta' : 'Ver propuesta'} <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${abierto ? 'rotate-180' : ''}`} strokeWidth={2.2} />
          </button>
          {abierto && (
            <div className="cot-step mt-3 space-y-3 border-t border-ink/10 pt-4">
              {c.propuesta && <p className="whitespace-pre-wrap rounded-xl bg-brand-primary/5 p-4 text-sm leading-relaxed text-ink/80">{c.propuesta}</p>}
              <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                {c.monto != null && <div className="flex justify-between"><dt className="text-ink/55">Inversión</dt><dd className="font-display text-lg font-bold">{c.moneda} {Number(c.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })}</dd></div>}
                {c.validezHasta && <div className="flex justify-between"><dt className="text-ink/55">Válida hasta</dt><dd>{fecha(c.validezHasta)}</dd></div>}
                {c.enviadaAt && <div className="flex justify-between"><dt className="text-ink/55">Enviada el</dt><dd>{fecha(c.enviadaAt)}</dd></div>}
              </dl>
            </div>
          )}
        </>
      )}
      <a href={wa} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-whatsapp px-4 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-whatsapp-dark"><MessageCircle className="h-4 w-4" strokeWidth={2} /> {tienePropuesta ? 'Quiero avanzar / ajustar' : 'Consultar'}</a>
    </article>
  );
}

/* Mi cuenta: perfil resumido, pedidos con su avance y cotizaciones con su propuesta. */
export function MiCuentaView({ cuenta }: { cuenta: ResumenCuenta }) {
  const [tab, setTab] = useState<'pedidos' | 'cotizaciones'>(cuenta.pedidos.length === 0 && cuenta.cotizaciones.length > 0 ? 'cotizaciones' : 'pedidos');
  const [saliendo, setSaliendo] = useState(false);
  const activos = cuenta.pedidos.filter((p) => p.estado !== 'ENTREGADO' && p.estado !== 'CANCELADO').length;

  async function salir() {
    setSaliendo(true);
    await fetch('/api/cuenta/salir', { method: 'POST' }).catch(() => undefined);
    window.location.href = '/cuenta';
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_1fr] lg:items-start">
      <aside className="space-y-4 lg:sticky lg:top-28">
        <div className="relative overflow-hidden rounded-3xl bg-brand-primary p-6 text-white shadow-2xl shadow-brand-dark/30">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-teal/25 blur-3xl" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 font-display text-2xl font-bold">{(cuenta.nombre ?? cuenta.email).trim().charAt(0).toUpperCase()}</span>
          <p className="relative mt-4 font-display text-xl font-bold leading-tight">{cuenta.nombre ?? 'Mi cuenta'}</p>
          <ul className="relative mt-3 space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2"><User className="h-4 w-4 text-brand-teal-light" strokeWidth={2} /><span className="break-all">{cuenta.email}</span></li>
            {cuenta.celular && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-teal-light" strokeWidth={2} />{cuenta.celular}</li>}
          </ul>
          <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
            {[[cuenta.pedidos.length, 'Pedidos'], [activos, 'En curso'], [cuenta.cotizaciones.length, 'Cotiz.']].map(([n, l]) => (
              <div key={l as string} className="rounded-xl bg-white/10 px-2 py-2.5"><p className="font-display text-xl font-bold">{n}</p><p className="text-[11px] text-white/60">{l}</p></div>
            ))}
          </div>
        </div>
        <a href="/tienda" className="hover-lift flex items-center justify-center gap-2 rounded-2xl border border-brand-dark/20 bg-brand-primary/5 p-4 text-sm font-semibold text-brand-primary hover:bg-brand-primary hover:text-white"><ShoppingBag className="h-4 w-4" strokeWidth={2} /> Seguir comprando</a>
        <button type="button" onClick={salir} disabled={saliendo} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white p-3 text-sm font-semibold text-ink/60 transition-colors hover:text-rose-600"><LogOut className="h-4 w-4" strokeWidth={2} /> {saliendo ? 'Saliendo…' : 'Cerrar sesión'}</button>
      </aside>

      <section>
        <div className="mb-6 inline-flex rounded-2xl bg-white p-1.5 shadow-md shadow-brand-dark/10" role="tablist" aria-label="Mi cuenta">
          {([['pedidos', `Mis pedidos (${cuenta.pedidos.length})`, ShoppingBag], ['cotizaciones', `Mis cotizaciones (${cuenta.cotizaciones.length})`, FileText]] as const).map(([id, label, Icon]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${tab === id ? 'bg-brand-dark text-white shadow-md shadow-brand-dark/25' : 'text-ink/60 hover:text-brand-primary'}`}>
              <Icon className="h-4 w-4" strokeWidth={2} /> {label}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {tab === 'pedidos' && (cuenta.pedidos.length === 0
            ? <Vacio titulo="Aún no tienes pedidos" texto="Cuando compres en la tienda, los verás aquí con su avance y su código de seguimiento." href="/tienda" accion="Ir a la tienda" />
            : cuenta.pedidos.map((p) => <PedidoCard key={p.id} p={p} />))}
          {tab === 'cotizaciones' && (cuenta.cotizaciones.length === 0
            ? <Vacio titulo="Aún no tienes cotizaciones" texto="Pide una cotización desde el detalle de cualquier servicio y la seguirás desde aquí." href="/servicios" accion="Ver servicios" />
            : cuenta.cotizaciones.map((c) => <CotizacionCard key={c.id} c={c} />))}
        </div>
      </section>
    </div>
  );
}

function Vacio({ titulo, texto, href, accion }: { titulo: string; texto: string; href: string; accion: string }) {
  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-10 text-center shadow-lg shadow-brand-dark/10">
      <h3 className="font-display text-xl font-bold text-ink">{titulo}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">{texto}</p>
      <a href={href} className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-dark px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-primary">{accion}</a>
    </div>
  );
}
