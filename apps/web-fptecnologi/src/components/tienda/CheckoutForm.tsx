'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Banknote, Building2, Check, Landmark, Loader2, Lock, Mail, MapPin, Phone, Smartphone, Store, Truck, User, FileText } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useSitio } from '@/context/SitioContext';
import { ShalomAgencias, type TarifaEnvio } from './ShalomAgencias';
import { guardarResumenPedido } from '@/lib/pedidoWhatsapp';

type Comprobante = 'BOLETA' | 'FACTURA';
type Entrega = 'RECOJO' | 'ENVIO' | 'SHALOM';
type Tarifa = TarifaEnvio;
type Pago = 'TRANSFERENCIA' | 'YAPE_PLIN' | 'EFECTIVO';
type V = {
  nombre: string; email: string; celular: string; comprobante: Comprobante; documento: string; razonSocial: string;
  entrega: Entrega; direccion: string; distrito: string; envioDepartamento: string; envioSede: string; pago: Pago; notas: string; acepto: boolean;
};
type E = Partial<Record<keyof V, string>>;

const INICIAL: V = {
  nombre: '', email: '', celular: '', comprobante: 'BOLETA', documento: '', razonSocial: '',
  entrega: 'RECOJO', direccion: '', distrito: '', envioDepartamento: '', envioSede: '', pago: 'TRANSFERENCIA', notas: '', acepto: false,
};

const celularLimpio = (v: string) => v.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');

function validar(v: V, tarifa?: Tarifa): E {
  const e: E = {};
  if (v.nombre.trim().length < 2) e.nombre = 'Ingresa tu nombre completo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Ingresa un correo válido.';
  if (!/^9\d{8}$/.test(celularLimpio(v.celular))) e.celular = 'Ingresa un celular de 9 dígitos (empieza con 9).';
  if (v.comprobante === 'FACTURA') {
    if (!/^(10|15|16|17|20)\d{9}$/.test(v.documento)) e.documento = 'El RUC debe tener 11 dígitos (empieza con 10 o 20).';
    if (v.razonSocial.trim().length < 2) e.razonSocial = 'Indica la razón social.';
  } else if (!/^\d{8}$/.test(v.documento)) e.documento = 'El DNI debe tener 8 dígitos.';
  if (v.entrega === 'ENVIO') {
    if (v.direccion.trim().length < 5) e.direccion = 'Indica la dirección de entrega.';
    if (v.distrito.trim().length < 2) e.distrito = 'Indica el distrito.';
  }
  if (v.entrega === 'SHALOM') {
    if (!tarifa) e.envioDepartamento = 'Elige el departamento de destino.';
    else if (!v.envioSede) e.envioSede = 'Elige la agencia Shalom donde recogerás tu pedido (o usa tu ubicación).';
  }
  if (!v.acepto) e.acepto = 'Debes aceptar los términos para continuar.';
  return e;
}

const input =
  'mt-1.5 w-full rounded-xl border border-ink/15 bg-white py-3 pl-12 pr-4 text-base text-ink outline-none transition-all placeholder:text-ink/65 focus:border-brand-dark focus:ring-4 focus:ring-brand-dark/10 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-rose-100';
const iconCls = 'pointer-events-none absolute left-4 h-5 w-5 text-ink/65';

function Campo({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink/80">{label.endsWith(' *') ? <>{label.slice(0, -2)}<span className="text-red-500"> *</span></> : label}</label>
      {children}
      {error && <p role="alert" className="mt-1.5 text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function Opcion({ activo, onClick, icon: Icon, titulo, texto }: { activo: boolean; onClick: () => void; icon: typeof User; titulo: string; texto?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={activo}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
        activo ? 'border-brand-dark bg-brand-primary/[0.06] shadow-lg shadow-brand-dark/10' : 'border-ink/10 bg-white hover:border-brand-dark/40'
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${activo ? 'bg-brand-primary text-white' : 'bg-ink/5 text-ink/65'}`}>
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink">{titulo}</span>
        {texto && <span className="block text-xs text-ink/65">{texto}</span>}
      </span>
    </button>
  );
}

function Seccion({ n, titulo, sub, children }: { n: number; titulo: string; sub?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-ink/5 bg-white p-6 shadow-xl shadow-brand-dark/10 sm:p-8">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark font-display text-lg font-bold text-white shadow-lg shadow-brand-dark/25">{n}</span>
        <div>
          <h2 className="font-display text-xl font-bold leading-tight text-ink">{titulo}</h2>
          {sub && <p className="text-sm text-ink/65">{sub}</p>}
        </div>
      </div>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

/*
 * Checkout invitado (fase 1, sin pasarela): datos del comprador, comprobante,
 * entrega y forma de pago. El pedido queda PENDIENTE / pago POR_CONFIRMAR y el
 * equipo coordina el pago y la entrega por WhatsApp. Los totales los calcula la
 * API en el servidor; lo que se muestra acá es solo una referencia.
 */
export function CheckoutForm() {
  const { contact: CONTACT_INFO } = useSitio();
  const { items, subtotal, igv, total, clear, perfil, setPerfil } = useCart();
  const { format } = useCurrency();
  const [v, setV] = useState<V>(INICIAL);
  const [errores, setErrores] = useState<E>({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [trampa, setTrampa] = useState('');
  const [agenciaTexto, setAgenciaTexto] = useState('');

  const set = <K extends keyof V>(k: K, val: V[K]) => {
    setV((p) => ({ ...p, [k]: val }));
    if (errores[k]) setErrores((p) => ({ ...p, [k]: undefined }));
  };
  const factura = v.comprobante === 'FACTURA';

  // Tarifario de envío por courier (lo carga el equipo en el dashboard).
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  useEffect(() => {
    fetch('/api/hub/envios').then((r) => r.json()).then((j: { data?: Tarifa[] }) => setTarifas(j.data ?? [])).catch(() => setTarifas([]));
  }, []);
  const tarifa = v.entrega === 'SHALOM' ? tarifas.find((t) => t.departamento === v.envioDepartamento) : undefined;
  const envioCosto = tarifa?.costo ?? 0;
  const totalConEnvio = total + envioCosto;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-ink/5 bg-white p-10 text-center shadow-xl shadow-brand-dark/10">
        <h2 className="font-display text-2xl font-bold text-ink">Tu carrito está vacío</h2>
        <p className="mt-2 text-ink/60">Agrega productos desde la tienda para continuar con tu compra.</p>
        <a href="/tienda" className="mt-6 inline-flex h-12 items-center rounded-xl bg-brand-primary px-7 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-primary">
          Ir a la tienda
        </a>
      </div>
    );
  }

  // El checkout es solo para cliente final: el mayorista pide presupuesto.
  if (perfil === 'mayorista') {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-ink/5 bg-white p-10 text-center shadow-xl shadow-brand-dark/10">
        <h2 className="font-display text-2xl font-bold text-ink">Compra mayorista</h2>
        <p className="mt-2 text-ink/60">Tu carrito está en modo mayorista: en vez de pagar, te preparamos un presupuesto con precios de mayorista.</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="/presupuesto" className="inline-flex h-12 items-center rounded-xl bg-brand-primary px-7 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#0b68b8]">
            Pedir presupuesto
          </a>
          <button type="button" onClick={() => setPerfil('minorista')} className="inline-flex h-12 items-center rounded-xl border border-brand-200 px-7 text-sm font-semibold uppercase tracking-wide text-brand-700 transition-colors hover:bg-brand-primary hover:text-white">
            Soy cliente final
          </button>
        </div>
      </div>
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const err = validar(v, tarifa);
    setErrores(err);
    if (Object.keys(err).length) {
      document.getElementById(`co-${Object.keys(err)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setEnviando(true);
    setErrorGeneral('');
    try {
      const res = await fetch('/api/hub/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: v.nombre.trim(),
          email: v.email.trim(),
          celular: celularLimpio(v.celular),
          documento: v.documento,
          comprobante: v.comprobante,
          razonSocial: factura ? v.razonSocial.trim() : undefined,
          entrega: v.entrega,
          direccion: v.direccion.trim(),
          distrito: v.distrito.trim(),
          envioDepartamento: v.envioDepartamento,
          envioSede: v.envioSede,
          metodoPago: v.pago,
          notas: v.notas,
          items: items.map((i) => ({ sku: i.sku, cantidad: i.qty })),
          website: trampa,
        }),
      });
      const cuerpo = (await res.json().catch(() => ({}))) as { message?: string | string[]; data?: { numeroPedido?: string | null; total?: number } };
      if (res.ok && cuerpo.data?.numeroPedido) {
        // Resumen completo para armar el mensaje de WhatsApp en la página de gracias.
        const entregaTexto =
          v.entrega === 'SHALOM'
            ? `Envío por Shalom a ${v.envioDepartamento}${agenciaTexto ? ` — recoge en ${agenciaTexto}` : ''}`
            : v.entrega === 'ENVIO'
              ? `Envío a domicilio: ${v.direccion.trim()}, ${v.distrito.trim()} (costo a coordinar)`
              : 'Recojo en tienda';
        guardarResumenPedido({
          numero: cuerpo.data.numeroPedido,
          nombre: v.nombre.trim(),
          email: v.email.trim(),
          celular: celularLimpio(v.celular),
          comprobante: factura ? 'Factura' : 'Boleta',
          documento: v.documento,
          razonSocial: factura ? v.razonSocial.trim() : undefined,
          entrega: entregaTexto,
          pago: v.pago === 'TRANSFERENCIA' ? 'Transferencia' : v.pago === 'YAPE_PLIN' ? 'Yape / Plin' : 'Efectivo en tienda',
          notas: v.notas.trim() || undefined,
          items: items.map((i) => ({ sku: i.sku, nombre: i.name, qty: i.qty, subtotal: format(i.price * i.qty) })),
          subtotal: format(subtotal),
          igv: format(igv),
          envio: tarifa ? format(envioCosto) : v.entrega === 'RECOJO' ? 'Gratis' : 'A coordinar',
          total: format(cuerpo.data.total ?? totalConEnvio),
        });
        clear();
        // El estado del carrito se guarda en un efecto; como se redirige enseguida, se borra también acá.
        try {
          window.localStorage.removeItem('fpt-cart');
        } catch {
          /* sin localStorage no hay nada que borrar */
        }
        window.location.href = `/checkout/gracias?pedido=${encodeURIComponent(cuerpo.data.numeroPedido)}&total=${cuerpo.data.total ?? 0}`;
        return;
      }
      if (res.ok) {
        // Respuesta del honeypot (sin número): no debería pasar con una persona real.
        setErrorGeneral('No pudimos registrar tu pedido. Intenta de nuevo.');
      } else {
        const msg = Array.isArray(cuerpo.message) ? cuerpo.message[0] : cuerpo.message;
        setErrorGeneral(msg || 'No pudimos registrar tu pedido. Intenta de nuevo.');
      }
    } catch {
      setErrorGeneral('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trampa} onChange={(e) => setTrampa(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <div className="space-y-6">
        <Seccion n={1} titulo="Tus datos" sub="Para contactarte y enviarte la confirmación.">
          <Campo id="co-nombre" label="Nombre completo *" error={errores.nombre}>
            <div className="relative flex items-center">
              <User className={iconCls} strokeWidth={1.8} />
              <input id="co-nombre" autoComplete="name" maxLength={80} value={v.nombre} onChange={(e) => set('nombre', e.target.value)} aria-invalid={!!errores.nombre} className={input} placeholder="Nombres y apellidos" />
            </div>
          </Campo>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo id="co-email" label="Correo electrónico *" error={errores.email}>
              <div className="relative flex items-center">
                <Mail className={iconCls} strokeWidth={1.8} />
                <input id="co-email" type="email" autoComplete="email" maxLength={120} value={v.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errores.email} className={input} placeholder="correo@empresa.com" />
              </div>
            </Campo>
            <Campo id="co-celular" label="Celular / WhatsApp *" error={errores.celular}>
              <div className="relative flex items-center">
                <Phone className={iconCls} strokeWidth={1.8} />
                <input id="co-celular" type="tel" autoComplete="tel" maxLength={16} value={v.celular} onChange={(e) => set('celular', e.target.value)} aria-invalid={!!errores.celular} className={input} placeholder="987 654 321" />
              </div>
            </Campo>
          </div>
        </Seccion>

        <Seccion n={2} titulo="Comprobante de pago" sub="Boleta con DNI o factura con RUC.">
          <div role="radiogroup" aria-label="Tipo de comprobante" className="grid gap-3 sm:grid-cols-2">
            <Opcion activo={!factura} onClick={() => { setV((p) => ({ ...p, comprobante: 'BOLETA', documento: '' })); setErrores({}); }} icon={FileText} titulo="Boleta" texto="Con DNI" />
            <Opcion activo={factura} onClick={() => { setV((p) => ({ ...p, comprobante: 'FACTURA', documento: '' })); setErrores({}); }} icon={Building2} titulo="Factura" texto="Con RUC" />
          </div>
          <Campo id="co-documento" label={factura ? 'RUC *' : 'DNI *'} error={errores.documento}>
            <div className="relative flex items-center">
              <FileText className={iconCls} strokeWidth={1.8} />
              <input id="co-documento" inputMode="numeric" autoComplete="off" value={v.documento} onChange={(e) => set('documento', e.target.value.replace(/\D/g, '').slice(0, factura ? 11 : 8))} aria-invalid={!!errores.documento} className={`${input} font-mono tracking-wider`} placeholder={factura ? '20123456789' : '12345678'} />
            </div>
          </Campo>
          {factura && (
            <Campo id="co-razonSocial" label="Razón social *" error={errores.razonSocial}>
              <div className="relative flex items-center">
                <Building2 className={iconCls} strokeWidth={1.8} />
                <input id="co-razonSocial" autoComplete="organization" maxLength={120} value={v.razonSocial} onChange={(e) => set('razonSocial', e.target.value)} aria-invalid={!!errores.razonSocial} className={input} placeholder="Nombre de la empresa" />
              </div>
            </Campo>
          )}
        </Seccion>

        <Seccion n={3} titulo="Entrega" sub="Recoge en tienda o recibe en una agencia Shalom cerca de ti.">
          <div role="radiogroup" aria-label="Forma de entrega" className={`grid gap-3 ${tarifas.length > 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            <Opcion activo={v.entrega === 'RECOJO'} onClick={() => set('entrega', 'RECOJO')} icon={Store} titulo="Recojo en tienda" texto="Breña, Lima" />
            {tarifas.length > 0 && <Opcion activo={v.entrega === 'SHALOM'} onClick={() => set('entrega', 'SHALOM')} icon={Truck} titulo="Envío por Shalom" texto="Recoges en agencia" />}
            <Opcion activo={v.entrega === 'ENVIO'} onClick={() => set('entrega', 'ENVIO')} icon={Truck} titulo="Envío a domicilio" texto="Costo a coordinar" />
          </div>
          {v.entrega === 'RECOJO' ? (
            <p className="flex items-start gap-2 rounded-xl bg-paper p-4 text-sm text-ink/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" strokeWidth={2} />
              {CONTACT_INFO.address}. Te avisaremos cuando tu pedido esté listo.
            </p>
          ) : v.entrega === 'SHALOM' ? (
            <>
              <ShalomAgencias
                tarifas={tarifas}
                departamento={v.envioDepartamento}
                agenciaId={v.envioSede}
                errorDepartamento={errores.envioDepartamento}
                errorAgencia={errores.envioSede}
                onDepartamento={(d) => setV((p) => ({ ...p, envioDepartamento: d }))}
                onAgencia={(id) => set('envioSede', id)}
                onEtiqueta={setAgenciaTexto}
              />
              {tarifa && (
                <p className="rounded-xl bg-paper p-4 text-sm text-ink/70">
                  Envío por {tarifa.proveedor === 'SHALOM' ? 'Shalom' : tarifa.proveedor}: <b>{format(tarifa.costo)}</b>{tarifa.plazoDias ? ` · llega en ${tarifa.plazoDias}` : ''}. Te avisaremos con el código de seguimiento.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
                <Campo id="co-direccion" label="Dirección *" error={errores.direccion}>
                  <div className="relative flex items-center">
                    <MapPin className={iconCls} strokeWidth={1.8} />
                    <input id="co-direccion" autoComplete="street-address" maxLength={200} value={v.direccion} onChange={(e) => set('direccion', e.target.value)} aria-invalid={!!errores.direccion} className={input} placeholder="Calle, número, referencia" />
                  </div>
                </Campo>
                <Campo id="co-distrito" label="Distrito *" error={errores.distrito}>
                  <div className="relative flex items-center">
                    <MapPin className={iconCls} strokeWidth={1.8} />
                    <input id="co-distrito" maxLength={80} value={v.distrito} onChange={(e) => set('distrito', e.target.value)} aria-invalid={!!errores.distrito} className={input} placeholder="Distrito" />
                  </div>
                </Campo>
              </div>
              <p className="text-xs text-ink/65">El costo de envío no está incluido en el total: lo coordinamos contigo por WhatsApp según tu distrito.</p>
            </>
          )}
        </Seccion>

        <Seccion n={4} titulo="Forma de pago" sub="El pago se confirma con un asesor, no se cobra en línea.">
          <div role="radiogroup" aria-label="Forma de pago" className="grid gap-3 sm:grid-cols-3">
            <Opcion activo={v.pago === 'TRANSFERENCIA'} onClick={() => set('pago', 'TRANSFERENCIA')} icon={Landmark} titulo="Transferencia" />
            <Opcion activo={v.pago === 'YAPE_PLIN'} onClick={() => set('pago', 'YAPE_PLIN')} icon={Smartphone} titulo="Yape / Plin" />
            <Opcion activo={v.pago === 'EFECTIVO'} onClick={() => set('pago', 'EFECTIVO')} icon={Banknote} titulo="Efectivo" texto="En tienda" />
          </div>
          <p className="flex items-start gap-2 text-sm text-ink/60">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" strokeWidth={2} />
            No se cobra nada en línea: un asesor te escribirá por WhatsApp para confirmar el pago y la entrega.
          </p>
          <Campo id="co-notas" label="Notas del pedido">
            <textarea id="co-notas" rows={3} maxLength={300} value={v.notas} onChange={(e) => set('notas', e.target.value)} className="mt-1.5 w-full resize-none rounded-xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition-all placeholder:text-ink/65 focus:border-brand-dark focus:ring-4 focus:ring-brand-dark/10" placeholder="Horario de contacto, indicaciones…" />
          </Campo>
        </Seccion>
      </div>

      {/* Resumen */}
      <aside className="space-y-4 lg:sticky lg:top-28">
        <div className="relative overflow-hidden rounded-3xl bg-brand-primary p-6 text-white shadow-2xl shadow-brand-dark/30">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-teal/25 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Resumen del pedido</h2>
            <a href="/carrito" className="text-xs font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline">Editar carrito</a>
          </div>
          <ul className="relative mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {items.map((i) => (
              <li key={i.sku} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain p-1" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-medium leading-snug">{i.name}</span>
                  <span className="text-xs text-white/80">{i.qty} × {format(i.price)}</span>
                </span>
                <span className="text-sm font-semibold">{format(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="relative mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-white/80">Subtotal</dt><dd>{format(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-white/80">IGV (18%)</dt><dd>{format(igv)}</dd></div>
            <div className="flex justify-between"><dt className="text-white/80">Envío</dt><dd className={tarifa ? '' : 'text-white/80'}>{tarifa ? format(envioCosto) : v.entrega === 'RECOJO' ? 'Gratis' : 'A coordinar'}</dd></div>
            <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-2xl font-bold">{format(totalConEnvio)}</dd>
            </div>
          </dl>
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/70">
          <input id="co-acepto" type="checkbox" checked={v.acepto} onChange={(e) => set('acepto', e.target.checked)} className="peer sr-only" />
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink/25 bg-white text-transparent transition-colors peer-checked:border-brand-primary peer-checked:bg-brand-primary peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand-dark/20">
            <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
          </span>
          <span>
            Acepto los <a href="/legal/terminos" target="_blank" rel="noreferrer" className="font-semibold text-brand-700 underline">términos y condiciones</a> y la <a href="/legal/privacidad" target="_blank" rel="noreferrer" className="font-semibold text-brand-700 underline">política de privacidad</a>.
          </span>
        </label>
        {errores.acepto && <p role="alert" className="text-sm font-medium text-rose-600">{errores.acepto}</p>}

        {errorGeneral && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errorGeneral}</p>
        )}

        <button type="submit" disabled={enviando} className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/25 transition-colors hover:bg-brand-primary disabled:opacity-60">
          {enviando ? (<><Loader2 className="h-4 w-4 animate-spin" /> Registrando…</>) : 'Confirmar pedido'}
        </button>
        <p className="text-center text-xs text-ink/65">Precios en dólares sin IGV; el IGV se suma al total. El pedido queda registrado y un asesor te contacta.</p>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(33,129,175,0.35)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 pr-16">
          <div>
            <p className="text-xs text-ink/65">Total</p>
            <p className="font-display text-xl font-bold text-ink">{format(totalConEnvio)}</p>
          </div>
          <button type="submit" disabled={enviando} className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-primary px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-primary disabled:opacity-60">
            {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirmar pedido
          </button>
        </div>
      </div>
    </form>
  );
}
