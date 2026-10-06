'use client';

import { useState } from 'react';
import { CheckCircle2, Handshake } from 'lucide-react';

const campo = 'mt-1.5 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/55 focus:border-brand-primary';
const celularLimpio = (v: string) => v.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');

/* Solicitud para ser socio: empresa con RUC. Queda pendiente hasta que el equipo la apruebe en el dashboard. */
export function RegistroSocio() {
  const [f, setF] = useState({ empresa: '', ruc: '', nombre: '', cargo: '', email: '', celular: '', mensaje: '', acepto: false, website: '' });
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (f.empresa.trim().length < 2) return setError('Ingresa la razón social de tu empresa.');
    if (!/^(10|15|16|17|20)\d{9}$/.test(f.ruc)) return setError('El RUC debe tener 11 dígitos (empieza con 10 o 20).');
    if (f.nombre.trim().length < 2) return setError('Ingresa el nombre de la persona de contacto.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return setError('Ingresa un correo válido.');
    if (f.celular.trim() && !/^9\d{8}$/.test(celularLimpio(f.celular))) return setError('El celular debe tener 9 dígitos (empieza con 9).');
    if (!f.acepto) return setError('Debes aceptar la política de privacidad.');
    setBusy(true);
    try {
      const res = await fetch('/api/socios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa: f.empresa.trim(), ruc: f.ruc, nombre: f.nombre.trim(), cargo: f.cargo.trim() || undefined, email: f.email.trim(), celular: f.celular.trim() ? celularLimpio(f.celular) : undefined, mensaje: f.mensaje.trim() || undefined, website: f.website || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) setOk(true);
      else setError(data.error || 'No pudimos registrar tu solicitud. Inténtalo nuevamente.');
    } catch {
      setError('Error de conexión. Inténtalo más tarde.');
    } finally {
      setBusy(false);
    }
  }

  if (ok) {
    return (
      <div role="status" className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg shadow-brand-950/10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" strokeWidth={1.6} />
        <h2 className="mt-4 font-display text-2xl font-bold text-ink">Solicitud enviada</h2>
        <p className="mt-2 text-sm text-ink/65">Revisaremos los datos de tu empresa y te avisaremos por correo cuando tengas acceso a la intranet de socios.</p>
        <a href="/" className="mt-5 inline-flex rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700">Ir al inicio</a>
      </div>
    );
  }

  const req = <span className="text-red-600"> *</span>;
  return (
    <form onSubmit={enviar} noValidate className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg shadow-brand-950/10">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark text-white shadow-lg shadow-brand-dark/25"><Handshake className="h-7 w-7" strokeWidth={1.8} /></span>
      <h2 className="mt-5 font-display text-2xl font-bold text-ink">Pide tu acceso como socio</h2>
      <p className="mt-1.5 text-sm text-ink/60">Cuéntanos de tu empresa. Al aprobarte tendrás material de marcas, soporte y precios para socios en la intranet.</p>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="rs-emp" className="text-sm font-semibold text-ink/80">Razón social{req}</label><input id="rs-emp" className={campo} value={f.empresa} onChange={set('empresa')} maxLength={160} autoComplete="organization" /></div>
        <div><label htmlFor="rs-ruc" className="text-sm font-semibold text-ink/80">RUC{req}</label><input id="rs-ruc" inputMode="numeric" className={campo} value={f.ruc} onChange={(e) => setF((x) => ({ ...x, ruc: e.target.value.replace(/\D/g, '').slice(0, 11) }))} maxLength={11} /></div>
        <div><label htmlFor="rs-nom" className="text-sm font-semibold text-ink/80">Nombre de contacto{req}</label><input id="rs-nom" className={campo} value={f.nombre} onChange={set('nombre')} maxLength={120} autoComplete="name" /></div>
        <div><label htmlFor="rs-car" className="text-sm font-semibold text-ink/80">Cargo</label><input id="rs-car" className={campo} value={f.cargo} onChange={set('cargo')} maxLength={80} /></div>
        <div><label htmlFor="rs-mail" className="text-sm font-semibold text-ink/80">Correo{req}</label><input id="rs-mail" type="email" className={campo} value={f.email} onChange={set('email')} maxLength={120} autoComplete="email" /><p className="mt-1 text-xs text-ink/55">Con este correo entrarás a la intranet.</p></div>
        <div><label htmlFor="rs-cel" className="text-sm font-semibold text-ink/80">Celular</label><input id="rs-cel" type="tel" className={campo} value={f.celular} onChange={set('celular')} maxLength={20} autoComplete="tel" /></div>
      </div>
      <div className="mt-4"><label htmlFor="rs-msg" className="text-sm font-semibold text-ink/80">¿Qué marcas o productos te interesan?</label><textarea id="rs-msg" rows={3} maxLength={1000} className={campo} value={f.mensaje} onChange={set('mensaje')} /></div>
      <label className="mt-4 flex items-start gap-2 text-sm text-ink/70"><input type="checkbox" checked={f.acepto} onChange={set('acepto')} className="mt-1" /><span>Acepto la <a href="/legal/privacidad" target="_blank" className="font-semibold text-brand-700 underline">política de privacidad</a> y que me contacten.{req}</span></label>
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      <button type="submit" disabled={busy} className="mt-5 w-full rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60">{busy ? 'Enviando…' : 'Enviar solicitud'}</button>
    </form>
  );
}
