'use client';

import { useState } from 'react';
import { ArrowLeft, KeyRound, Loader2, Mail, ShieldCheck } from 'lucide-react';

const input =
  'mt-1.5 w-full rounded-xl border border-ink/15 bg-white py-3 pl-12 pr-4 text-base text-ink outline-none transition-all placeholder:text-ink/65 hover:border-brand-dark/40 focus:border-brand-dark focus:ring-4 focus:ring-brand-dark/10 aria-[invalid=true]:border-rose-400';

/*
 * Acceso a Mi cuenta sin contraseña: 1) correo → 2) código de 6 dígitos que llega a ese correo. Solo sale un
 * código si ese correo tiene pedidos o cotizaciones; la respuesta es siempre la misma para no revelar quién compró.
 */
export function LoginCuenta({ socio = false }: { socio?: boolean }) {
  const [paso, setPaso] = useState<'correo' | 'codigo'>('correo');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [trampa, setTrampa] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pedir(e?: React.FormEvent) {
    e?.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Ingresa un correo válido.');
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/cuenta/codigo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), website: trampa }) });
      if (res.ok) { setPaso('codigo'); setCodigo(''); }
      else setError(((await res.json().catch(() => ({}))) as { message?: string }).message || 'No pudimos enviar el código. Intenta de nuevo.');
    } catch { setError('No pudimos conectarnos. Intenta de nuevo.'); }
    setBusy(false);
  }

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(codigo)) return setError('El código tiene 6 dígitos.');
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/cuenta/verificar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), codigo }) });
      if (res.ok) { window.location.reload(); return; }
      const msg = ((await res.json().catch(() => ({}))) as { message?: string | string[] }).message;
      setError((Array.isArray(msg) ? msg[0] : msg) || 'Código inválido o vencido.');
    } catch { setError('No pudimos conectarnos. Intenta de nuevo.'); }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-ink/5 bg-white p-8 shadow-xl shadow-brand-dark/10 sm:p-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark text-white shadow-lg shadow-brand-dark/25">
        <ShieldCheck className="h-7 w-7" strokeWidth={1.8} />
      </span>
      <h2 className="mt-5 font-display text-2xl font-bold text-ink">{socio ? 'Acceso para socios' : 'Ingresa a tu cuenta'}</h2>
      <p className="mt-1.5 text-sm text-ink/60">{socio ? 'Sin contraseña: te enviamos un código al correo autorizado como socio de FP Tecnologi.' : 'Sin contraseña: te enviamos un código al correo con el que compraste o pediste una cotización.'}</p>

      {paso === 'correo' ? (
        <form onSubmit={pedir} noValidate className="mt-6 space-y-4">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trampa} onChange={(e) => setTrampa(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <div>
            <label htmlFor="cu-email" className="text-sm font-semibold text-ink/80">Correo electrónico</label>
            <div className="relative flex items-center"><Mail className="pointer-events-none absolute left-4 h-5 w-5 text-ink/65" strokeWidth={1.8} /><input id="cu-email" type="email" autoComplete="email" autoFocus maxLength={120} value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} aria-invalid={!!error} className={input} placeholder="correo@empresa.com" /></div>
          </div>
          {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}
          <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/25 transition-all hover:-translate-y-0.5 hover:bg-brand-primary disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Enviarme el código
          </button>
        </form>
      ) : (
        <form onSubmit={verificar} noValidate className="mt-6 space-y-4">
          <p className="rounded-xl bg-paper p-4 text-sm text-ink/70">Si <b>{email.trim()}</b> {socio ? 'es un correo de socio' : 'tiene compras o cotizaciones'}, te enviamos un código (vence en 10 minutos). Revisa también la carpeta de spam.</p>
          <div>
            <label htmlFor="cu-codigo" className="text-sm font-semibold text-ink/80">Código de 6 dígitos</label>
            <div className="relative flex items-center"><KeyRound className="pointer-events-none absolute left-4 h-5 w-5 text-ink/65" strokeWidth={1.8} /><input id="cu-codigo" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} value={codigo} onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, '')); setError(''); }} aria-invalid={!!error} className={`${input} font-mono text-xl tracking-[0.4em]`} placeholder="••••••" /></div>
          </div>
          {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}
          <button type="submit" disabled={busy || codigo.length !== 6} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/25 transition-all hover:-translate-y-0.5 hover:bg-brand-primary disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Entrar
          </button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => { setPaso('correo'); setError(''); }} className="inline-flex items-center gap-1.5 font-semibold text-ink/65 hover:text-brand-700"><ArrowLeft className="h-4 w-4" strokeWidth={2} /> Cambiar correo</button>
            <button type="button" disabled={busy} onClick={() => pedir()} className="font-semibold text-brand-700 hover:underline">Reenviar código</button>
          </div>
        </form>
      )}
    </div>
  );
}
