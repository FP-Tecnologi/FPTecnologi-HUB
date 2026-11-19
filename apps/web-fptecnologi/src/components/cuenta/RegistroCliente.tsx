'use client';

import { useState } from 'react';
import { ArrowLeft, KeyRound, Loader2, Mail, Phone, UserRound } from 'lucide-react';

const input =
  'mt-1.5 w-full rounded-xl border border-ink/15 bg-white py-3 pl-12 pr-4 text-base text-ink outline-none transition-all placeholder:text-ink/65 hover:border-brand-dark/40 focus:border-brand-dark focus:ring-4 focus:ring-brand-dark/10 aria-[invalid=true]:border-rose-400';
const boton =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/25 transition-all hover:-translate-y-0.5 disabled:opacity-60';

/* Registro de cliente: 1) nombre, correo y teléfono → 2) código de 6 dígitos que llega al correo → entra a Mi cuenta. */
export function RegistroCliente() {
  const [paso, setPaso] = useState<'datos' | 'codigo'>('datos');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [codigo, setCodigo] = useState('');
  const [trampa, setTrampa] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const mensaje = async (res: Response, otro: string) => {
    const m = ((await res.json().catch(() => ({}))) as { message?: string | string[] }).message;
    return (Array.isArray(m) ? m[0] : m) || otro;
  };

  async function registrar(e?: React.FormEvent) {
    e?.preventDefault();
    if (nombre.trim().length < 2) return setError('Escribe tu nombre o el de tu empresa.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Ingresa un correo válido.');
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/cuenta/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), email: email.trim(), telefono: telefono.trim() || undefined, website: trampa }),
      });
      if (res.ok) { setPaso('codigo'); setCodigo(''); }
      else setError(await mensaje(res, 'No pudimos crear tu cuenta. Intenta de nuevo.'));
    } catch { setError('No pudimos conectarnos. Intenta de nuevo.'); }
    setBusy(false);
  }

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(codigo)) return setError('El código tiene 6 dígitos.');
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/cuenta/verificar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), codigo }) });
      if (res.ok) { window.location.href = '/cuenta'; return; }
      setError(await mensaje(res, 'Código inválido o vencido.'));
    } catch { setError('No pudimos conectarnos. Intenta de nuevo.'); }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-ink/5 bg-white p-8 shadow-xl shadow-brand-dark/10 sm:p-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark text-white shadow-lg shadow-brand-dark/25">
        <UserRound className="h-7 w-7" strokeWidth={1.8} />
      </span>
      <h2 className="mt-5 font-display text-2xl font-bold text-ink">Crea tu cuenta de cliente</h2>
      <p className="mt-1.5 text-sm text-ink/60">Sin contraseña: te enviamos un código al correo para confirmar y entrar.</p>

      {paso === 'datos' ? (
        <form onSubmit={registrar} noValidate className="mt-6 space-y-4">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trampa} onChange={(e) => setTrampa(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <div>
            <label htmlFor="rc-nombre" className="text-sm font-semibold text-ink/80">Nombres o empresa</label>
            <div className="relative flex items-center"><UserRound className="pointer-events-none absolute left-4 h-5 w-5 text-ink/65" strokeWidth={1.8} /><input id="rc-nombre" autoComplete="name" autoFocus maxLength={120} value={nombre} onChange={(e) => { setNombre(e.target.value); setError(''); }} className={input} placeholder="Tu nombre o razón social" /></div>
          </div>
          <div>
            <label htmlFor="rc-email" className="text-sm font-semibold text-ink/80">Correo electrónico</label>
            <div className="relative flex items-center"><Mail className="pointer-events-none absolute left-4 h-5 w-5 text-ink/65" strokeWidth={1.8} /><input id="rc-email" type="email" autoComplete="email" maxLength={120} value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} className={input} placeholder="correo@empresa.com" /></div>
          </div>
          <div>
            <label htmlFor="rc-tel" className="text-sm font-semibold text-ink/80">Teléfono / WhatsApp <span className="font-normal text-ink/50">(opcional)</span></label>
            <div className="relative flex items-center"><Phone className="pointer-events-none absolute left-4 h-5 w-5 text-ink/65" strokeWidth={1.8} /><input id="rc-tel" type="tel" autoComplete="tel" maxLength={30} value={telefono} onChange={(e) => setTelefono(e.target.value)} className={input} placeholder="999 999 999" /></div>
          </div>
          {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}
          <button type="submit" disabled={busy} className={boton}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Crear cuenta</button>
          <p className="text-center text-sm text-ink/60">¿Ya tienes cuenta? <a href="/cuenta" className="font-semibold text-brand-700 hover:underline">Inicia sesión</a></p>
        </form>
      ) : (
        <form onSubmit={verificar} noValidate className="mt-6 space-y-4">
          <p className="rounded-xl bg-paper p-4 text-sm text-ink/70">Enviamos un código a <b>{email.trim()}</b> (vence en 10 minutos). Revisa también la carpeta de spam.</p>
          <div>
            <label htmlFor="rc-codigo" className="text-sm font-semibold text-ink/80">Código de 6 dígitos</label>
            <div className="relative flex items-center"><KeyRound className="pointer-events-none absolute left-4 h-5 w-5 text-ink/65" strokeWidth={1.8} /><input id="rc-codigo" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} value={codigo} onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, '')); setError(''); }} aria-invalid={!!error} className={`${input} font-mono text-xl tracking-[0.4em]`} placeholder="••••••" /></div>
          </div>
          {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}
          <button type="submit" disabled={busy || codigo.length !== 6} className={boton}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Confirmar y entrar</button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => { setPaso('datos'); setError(''); }} className="inline-flex items-center gap-1.5 font-semibold text-ink/65 hover:text-brand-700"><ArrowLeft className="h-4 w-4" strokeWidth={2} /> Cambiar datos</button>
            <button type="button" disabled={busy} onClick={() => registrar()} className="font-semibold text-brand-700 hover:underline">Reenviar código</button>
          </div>
        </form>
      )}
    </div>
  );
}
