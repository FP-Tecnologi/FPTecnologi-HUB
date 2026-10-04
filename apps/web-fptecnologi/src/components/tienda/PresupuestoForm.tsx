'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, MapPin, Phone, User, FileText } from 'lucide-react';
import { MIN_MAYORISTA, useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { ArrowUpRightIcon } from '@/components/site/icons';

const celularLimpio = (v: string) => v.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');

const campo =
  'mt-1.5 w-full rounded-xl border border-brand-200 bg-white py-3 pl-12 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/55 focus:border-brand-primary';
const icono = 'pointer-events-none absolute left-4 h-5 w-5 text-brand-primary/70';

/* Presupuesto mayorista: datos del cliente + resumen del carrito. Al enviar se
   registra en la API (que recalcula precios de mayorista, IGV y total) y lleva
   a la página del presupuesto (/presupuesto/[id]). Solo con perfil mayorista y
   mínimo MIN_MAYORISTA unidades por producto. */
export function PresupuestoForm() {
  const router = useRouter();
  const { items, perfil, mayoristaOk, unitPrice, subtotal, igv, total, clear } = useCart();
  const { format } = useCurrency();
  const [v, setV] = useState({ nombre: '', documento: '', email: '', celular: '', direccion: '', notas: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof v, val: string) => setV((x) => ({ ...x, [k]: val }));

  if (items.length === 0 || perfil !== 'mayorista' || !mayoristaOk) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-ink/5 bg-white p-10 text-center shadow-xl shadow-brand-dark/10">
        <h2 className="font-display text-2xl font-bold text-ink">Presupuesto mayorista</h2>
        <p className="mt-2 text-ink/65">
          {items.length === 0
            ? 'Agrega productos al carrito para armar tu presupuesto.'
            : `Elige el perfil Mayorista en el carrito y lleva al menos ${MIN_MAYORISTA} unidades de cada producto.`}
        </p>
        <a href={items.length === 0 ? '/tienda' : '/carrito'} className="mt-6 inline-flex h-12 items-center rounded-xl bg-brand-primary px-7 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#0b68b8]">
          {items.length === 0 ? 'Ver tienda' : 'Ir al carrito'}
        </a>
      </div>
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (v.nombre.trim().length < 2) return setError('Ingresa tu nombre o el de tu empresa.');
    if (!/^(\d{8}|(10|15|16|17|20)\d{9})$/.test(v.documento)) return setError('Ingresa un DNI (8 dígitos) o un RUC (11 dígitos).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) return setError('Ingresa un correo válido.');
    if (!/^9\d{8}$/.test(celularLimpio(v.celular))) return setError('Ingresa un celular de 9 dígitos (empieza con 9).');
    setEnviando(true);
    try {
      const res = await fetch('/api/presupuestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNombre: v.nombre.trim(),
          clienteDocumento: v.documento,
          clienteEmail: v.email.trim(),
          clienteTelefono: celularLimpio(v.celular),
          clienteDireccion: v.direccion.trim() || undefined,
          notas: v.notas.trim() || undefined,
          items: items.map((i) => ({ sku: i.sku, cantidad: i.qty })),
          origen: '/presupuesto',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.id) {
        clear();
        router.push(`/presupuesto/${data.id}`);
      } else setError(data.error || 'No pudimos registrar tu presupuesto. Inténtalo nuevamente.');
    } catch {
      setError('Error de conexión. Inténtalo más tarde.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <form onSubmit={enviar} noValidate className="group/form relative overflow-hidden rounded-2xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-950/10 sm:p-8">
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-primary via-brand-500 to-brand-700 transition-transform duration-500 ease-out group-focus-within/form:scale-x-100" />
        <p className="font-display text-xl font-bold text-ink">Datos para tu presupuesto</p>
        <p className="mb-5 mt-1 text-sm text-ink/65">Aparecerán en el documento junto con los productos, cantidades y precios de mayorista.</p>
        <div className="space-y-4">
          {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-center text-sm font-medium text-red-700">{error}</div>}
          <div>
            <label htmlFor="pr-nombre" className="text-sm font-medium text-ink/80">Nombres o empresa<span className="text-red-500"> *</span></label>
            <div className="relative flex items-center"><User className={icono} strokeWidth={1.8} /><input id="pr-nombre" autoComplete="organization" value={v.nombre} onChange={(e) => set('nombre', e.target.value)} className={campo} placeholder="Tu nombre o el de tu empresa" /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pr-doc" className="text-sm font-medium text-ink/80">RUC o DNI<span className="text-red-500"> *</span></label>
              <div className="relative flex items-center"><FileText className={icono} strokeWidth={1.8} /><input id="pr-doc" inputMode="numeric" maxLength={11} value={v.documento} onChange={(e) => set('documento', e.target.value.replace(/\D/g, ''))} className={campo} placeholder="20123456789" /></div>
            </div>
            <div>
              <label htmlFor="pr-cel" className="text-sm font-medium text-ink/80">Celular / WhatsApp<span className="text-red-500"> *</span></label>
              <div className="relative flex items-center"><Phone className={icono} strokeWidth={1.8} /><input id="pr-cel" type="tel" autoComplete="tel" value={v.celular} onChange={(e) => set('celular', e.target.value)} className={campo} placeholder="+51 987 654 321" /></div>
            </div>
          </div>
          <div>
            <label htmlFor="pr-email" className="text-sm font-medium text-ink/80">Correo electrónico<span className="text-red-500"> *</span></label>
            <div className="relative flex items-center"><Mail className={icono} strokeWidth={1.8} /><input id="pr-email" type="email" autoComplete="email" value={v.email} onChange={(e) => set('email', e.target.value)} className={campo} placeholder="correo@empresa.com" /></div>
          </div>
          <div>
            <label htmlFor="pr-dir" className="text-sm font-medium text-ink/80">Dirección</label>
            <div className="relative flex items-center"><MapPin className={icono} strokeWidth={1.8} /><input id="pr-dir" autoComplete="street-address" value={v.direccion} onChange={(e) => set('direccion', e.target.value)} className={campo} placeholder="Dirección fiscal o de entrega" /></div>
          </div>
          <div>
            <label htmlFor="pr-notas" className="text-sm font-medium text-ink/80">Notas</label>
            <textarea id="pr-notas" rows={3} maxLength={1000} value={v.notas} onChange={(e) => set('notas', e.target.value)} className="mt-1.5 w-full resize-none rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/55 focus:border-brand-primary" placeholder="Plazos, forma de pago u otros detalles" />
          </div>
          <button type="submit" disabled={enviando} className="group/btn flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-brand-primary text-sm font-semibold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-[#0b68b8] disabled:opacity-50">
            <span className="flex items-center justify-center rounded-lg bg-white/20 p-1">
              <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-45" />
            </span>
            {enviando ? 'Generando...' : 'Generar presupuesto'}
          </button>
        </div>
      </form>

      <aside className="rounded-2xl border border-brand-100 bg-white p-6 shadow-lg shadow-brand-950/10 lg:sticky lg:top-28">
        <p className="font-display text-lg font-bold text-ink">Tus productos</p>
        <ul className="mt-4 divide-y divide-brand-100">
          {items.map((i) => (
            <li key={i.sku} className="flex items-start justify-between gap-3 py-3 text-sm">
              <span className="min-w-0">
                <span className="line-clamp-2 font-medium text-ink">{i.name}</span>
                <span className="text-xs text-ink/65">{i.qty} u. × {format(unitPrice(i))}</span>
              </span>
              <span className="shrink-0 font-mono font-bold text-ink">{format(i.qty * unitPrice(i))}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-2 border-t border-brand-100 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink/65">Subtotal</dt><dd className="font-medium text-ink">{format(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink/65">IGV (18%)</dt><dd className="font-medium text-ink">{format(igv)}</dd></div>
          <div className="flex items-baseline justify-between border-t border-brand-100 pt-3"><dt className="font-bold text-ink">Total</dt><dd className="font-display text-2xl font-bold text-brand-700">{format(total)}</dd></div>
        </dl>
        <a href="/carrito" className="mt-4 block text-center text-sm font-semibold text-brand-700 hover:underline">Editar carrito</a>
      </aside>
    </div>
  );
}
