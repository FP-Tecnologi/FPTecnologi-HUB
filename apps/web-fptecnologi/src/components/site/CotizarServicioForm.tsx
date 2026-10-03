'use client';

import { useState } from 'react';
import { Building2, CheckCircle2, Loader2, Mail, MessageSquareText, Phone, Send, User } from 'lucide-react';

const campo =
  'mt-1.5 w-full rounded-xl border border-ink/15 bg-white py-3 pl-12 pr-4 text-base text-ink outline-none transition-all placeholder:text-ink/35 focus:border-brand-dark focus:ring-4 focus:ring-brand-dark/10 aria-[invalid=true]:border-rose-400';
const icono = 'pointer-events-none absolute left-4 h-5 w-5 text-ink/40';

/*
 * Solicitud de cotización de UN servicio (detalle de cada servicio). Va a Soluciones → Cotizaciones del
 * dashboard (relacionada al servicio); el equipo responde por correo o WhatsApp. Distinta del cotizador
 * general (/cotizador), que captura leads sin servicio concreto.
 */
export function CotizarServicioForm({ servicioSlug, servicioTitulo }: { servicioSlug: string; servicioTitulo: string }) {
  const [v, setV] = useState({ nombre: '', email: '', telefono: '', empresa: '', mensaje: '' });
  const [trampa, setTrampa] = useState('');
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok'>('idle');
  const [numero, setNumero] = useState('');
  const [error, setError] = useState('');
  const set = (k: keyof typeof v, val: string) => setV((p) => ({ ...p, [k]: val }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (v.nombre.trim().length < 2) return setError('Ingresa tu nombre.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) return setError('Ingresa un correo válido.');
    if (v.telefono.trim() && !/^9\d{8}$/.test(v.telefono.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, ''))) {
      return setError('El celular debe tener 9 dígitos (empieza con 9).');
    }
    setError('');
    setEstado('enviando');
    try {
      const res = await fetch('/api/hub/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicioSlug,
          clienteNombre: v.nombre.trim(),
          clienteEmail: v.email.trim(),
          clienteTelefono: v.telefono.trim() || undefined,
          clienteEmpresa: v.empresa.trim() || undefined,
          mensaje: v.mensaje.trim() || undefined,
          origen: window.location.pathname,
          website: trampa,
        }),
      });
      const cuerpo = (await res.json().catch(() => ({}))) as { message?: string | string[]; data?: { numero?: string | null } };
      if (res.ok) {
        setNumero(cuerpo.data?.numero ?? '');
        setEstado('ok');
        return;
      }
      const msg = Array.isArray(cuerpo.message) ? cuerpo.message[0] : cuerpo.message;
      setError(msg || 'No pudimos enviar tu solicitud. Intenta de nuevo.');
    } catch {
      setError('No pudimos conectarnos. Intenta de nuevo.');
    }
    setEstado('idle');
  }

  if (estado === 'ok') {
    return (
      <div role="status" className="rounded-3xl bg-white p-8 text-center shadow-xl shadow-brand-dark/10 sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-whatsapp/15 text-whatsapp-dark">
          <CheckCircle2 className="h-9 w-9" strokeWidth={1.7} />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold text-ink">¡Recibimos tu solicitud!</h3>
        <p className="mt-2 text-ink/60">Un especialista revisará lo que necesitas y te enviará la cotización de {servicioTitulo} por correo o WhatsApp.</p>
        {numero && <p className="mt-4 font-mono text-lg font-bold tracking-wider text-brand-primary">{numero}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="rounded-3xl bg-white p-6 shadow-xl shadow-brand-dark/10 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trampa} onChange={(e) => setTrampa(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cs-nombre" className="text-sm font-semibold text-ink/80">Nombre completo</label>
          <div className="relative flex items-center"><User className={icono} strokeWidth={1.8} /><input id="cs-nombre" autoComplete="name" maxLength={80} value={v.nombre} onChange={(e) => set('nombre', e.target.value)} className={campo} placeholder="Nombres y apellidos" /></div>
        </div>
        <div>
          <label htmlFor="cs-empresa" className="text-sm font-semibold text-ink/80">Empresa o institución (opcional)</label>
          <div className="relative flex items-center"><Building2 className={icono} strokeWidth={1.8} /><input id="cs-empresa" autoComplete="organization" maxLength={120} value={v.empresa} onChange={(e) => set('empresa', e.target.value)} className={campo} placeholder="Nombre de tu organización" /></div>
        </div>
        <div>
          <label htmlFor="cs-email" className="text-sm font-semibold text-ink/80">Correo electrónico</label>
          <div className="relative flex items-center"><Mail className={icono} strokeWidth={1.8} /><input id="cs-email" type="email" autoComplete="email" maxLength={120} value={v.email} onChange={(e) => set('email', e.target.value)} className={campo} placeholder="correo@empresa.com" /></div>
        </div>
        <div>
          <label htmlFor="cs-tel" className="text-sm font-semibold text-ink/80">Celular / WhatsApp (opcional)</label>
          <div className="relative flex items-center"><Phone className={icono} strokeWidth={1.8} /><input id="cs-tel" type="tel" autoComplete="tel" maxLength={16} value={v.telefono} onChange={(e) => set('telefono', e.target.value)} className={campo} placeholder="987 654 321" /></div>
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="cs-msg" className="text-sm font-semibold text-ink/80">Cuéntanos qué necesitas</label>
        <div className="relative">
          <MessageSquareText className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-ink/40" strokeWidth={1.8} />
          <textarea id="cs-msg" rows={4} maxLength={1000} value={v.mensaje} onChange={(e) => set('mensaje', e.target.value)} className={`${campo} resize-none`} placeholder={`Ubicación, cantidad de equipos o sedes, plazos… para cotizar ${servicioTitulo}`} />
        </div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      <button type="submit" disabled={estado === 'enviando'} className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-primary px-7 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/25 transition-colors hover:bg-brand-primary disabled:opacity-60">
        {estado === 'enviando' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={2.2} />}
        Solicitar cotización
      </button>
      <p className="mt-3 text-xs text-ink/45">Sin compromiso. Usamos tus datos solo para responder tu solicitud.</p>
    </form>
  );
}
