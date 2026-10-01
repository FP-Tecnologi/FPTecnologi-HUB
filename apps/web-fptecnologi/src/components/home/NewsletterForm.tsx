'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Mail, Send } from 'lucide-react';

/* Suscripción al boletín (pie de página). Envía a /api/hub/boletin → API
   central → dashboard Boletín → Suscriptores. */
export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [trampa, setTrampa] = useState('');
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok'>('idle');
  const [error, setError] = useState('');

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('Ingresa un correo válido.');
      return;
    }
    setError('');
    setEstado('enviando');
    try {
      const res = await fetch('/api/hub/boletin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), origen: window.location.pathname, website: trampa }),
      });
      if (res.ok) {
        setEstado('ok');
        return;
      }
      const cuerpo = (await res.json().catch(() => ({}))) as { message?: string | string[] };
      const msg = Array.isArray(cuerpo.message) ? cuerpo.message[0] : cuerpo.message;
      setError(msg || 'No pudimos registrar tu correo. Intenta de nuevo.');
    } catch {
      setError('No pudimos conectarnos. Intenta de nuevo.');
    }
    setEstado('idle');
  }

  if (estado === 'ok') {
    return (
      <div role="status" className="flex w-full items-center gap-3 rounded-xl border border-whatsapp/30 bg-whatsapp/10 px-5 py-4 text-sm font-medium text-white lg:max-w-md">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-whatsapp" strokeWidth={1.8} />
        ¡Listo! Te avisaremos de nuestras ofertas y novedades.
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="w-full lg:max-w-md">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trampa} onChange={(e) => setTrampa(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="news-email" className="sr-only">Correo electrónico</label>
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" strokeWidth={1.8} />
          <input
            id="news-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={120}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            aria-invalid={!!error}
            placeholder="tucorreo@empresa.com"
            className="h-12 w-full rounded-xl border border-white/15 bg-white/5 pl-12 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-brand-teal-light focus:bg-white/10 aria-[invalid=true]:border-rose-400"
          />
        </div>
        <button
          type="submit"
          disabled={estado === 'enviando'}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold uppercase tracking-wide text-brand-dark transition-colors hover:bg-brand-primary hover:text-white disabled:opacity-60"
        >
          {estado === 'enviando' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={2.2} />}
          Suscribirme
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-rose-400">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-white/40">Solo te escribiremos con ofertas y novedades relevantes.</p>
      )}
    </form>
  );
}
