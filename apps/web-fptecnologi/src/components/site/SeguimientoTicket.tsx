'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, MessageSquareText, Search, Send } from 'lucide-react';

type Estado = 'NUEVO' | 'EN_REVISION' | 'ESPERANDO_CLIENTE' | 'RESUELTO' | 'CERRADO';
type Seguimiento = {
  numero: string;
  tipo: 'RECLAMO' | 'VERIFICACION' | 'SOPORTE';
  estado: Estado;
  producto: string | null;
  descripcion: string;
  createdAt: string;
  mensajes: { id: string; autor: 'CLIENTE' | 'EQUIPO' | 'SISTEMA'; autorNombre: string | null; texto: string; createdAt: string }[];
};

const ESTADO: Record<Estado, { label: string; clase: string; ayuda: string }> = {
  NUEVO: { label: 'Recibido', clase: 'bg-sky-100 text-sky-800', ayuda: 'Tu ticket llegó a nuestro equipo y será revisado pronto.' },
  EN_REVISION: { label: 'En revisión', clase: 'bg-amber-100 text-amber-800', ayuda: 'Un asesor está trabajando en tu caso.' },
  ESPERANDO_CLIENTE: { label: 'Esperando tu respuesta', clase: 'bg-brand-primary/10 text-brand-700', ayuda: 'Necesitamos que respondas para poder continuar.' },
  RESUELTO: { label: 'Resuelto', clase: 'bg-emerald-100 text-emerald-800', ayuda: 'Marcamos tu caso como resuelto. Si no es así, respóndenos y lo reabrimos.' },
  CERRADO: { label: 'Cerrado', clase: 'bg-slate-200 text-slate-700', ayuda: 'Este ticket está cerrado. Abre uno nuevo si necesitas más ayuda.' },
};
const TIPO = { RECLAMO: 'Reclamo', VERIFICACION: 'Verificación de producto', SOPORTE: 'Soporte técnico' } as const;
const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const campo = 'mt-1.5 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/55 focus:border-brand-primary';

/* Seguimiento de un ticket: número + correo con el que se abrió. Muestra el estado, la conversación con el equipo
   (sin notas internas) y permite responder. */
export function SeguimientoTicket({ numeroInicial = '' }: { numeroInicial?: string }) {
  const [numero, setNumero] = useState(numeroInicial);
  const [email, setEmail] = useState('');
  const [t, setT] = useState<Seguimiento | null>(null);
  const [texto, setTexto] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function llamar<T>(accion: 'seguimiento' | 'responder', body: object): Promise<T | null> {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/tickets/${accion}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No pudimos completar la solicitud.');
        return null;
      }
      return data.data as T;
    } catch {
      setError('Error de conexión. Inténtalo más tarde.');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function buscar(e?: React.FormEvent) {
    e?.preventDefault();
    if (numero.trim().length < 6 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Ingresa el número de ticket y el correo con el que lo abriste.');
    const r = await llamar<Seguimiento>('seguimiento', { numero: numero.trim(), email: email.trim() });
    if (r) setT(r);
  }

  async function responder(e: React.FormEvent) {
    e.preventDefault();
    if (texto.trim().length < 2) return;
    const r = await llamar('responder', { numero: numero.trim(), email: email.trim(), texto: texto.trim() });
    if (r !== null) {
      setTexto('');
      await buscar();
    }
  }

  if (!t) {
    return (
      <form onSubmit={buscar} noValidate className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-lg shadow-brand-950/10">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark text-white shadow-lg shadow-brand-dark/25"><Search className="h-7 w-7" strokeWidth={1.8} /></span>
        <h2 className="mt-5 font-display text-2xl font-bold text-ink">Consulta tu ticket</h2>
        <p className="mt-1.5 text-sm text-ink/60">Ingresa el número que te enviamos (empieza con TCK) y el correo con el que lo abriste.</p>
        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="sg-num" className="text-sm font-semibold text-ink/80">Número de ticket <span className="text-red-600">*</span></label>
            <input id="sg-num" className={campo} value={numero} onChange={(e) => setNumero(e.target.value.toUpperCase())} placeholder="TCK-2026-ABC123" maxLength={30} />
          </div>
          <div>
            <label htmlFor="sg-mail" className="text-sm font-semibold text-ink/80">Correo <span className="text-red-600">*</span></label>
            <input id="sg-mail" type="email" className={campo} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@empresa.com" maxLength={120} />
          </div>
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60">{busy ? 'Buscando…' : 'Ver estado'}</button>
        </div>
      </form>
    );
  }

  const est = ESTADO[t.estado];
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-lg shadow-brand-950/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{TIPO[t.tipo]}</p>
            <h2 className="font-display text-2xl font-bold text-ink">{t.numero}</h2>
            <p className="text-sm text-ink/60">Abierto el {fecha(t.createdAt)}{t.producto ? ` · ${t.producto}` : ''}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold ${est.clase}`}>
            {t.estado === 'RESUELTO' || t.estado === 'CERRADO' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            {est.label}
          </span>
        </div>
        <p className="mt-3 text-sm text-ink/70">{est.ayuda}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-lg shadow-brand-950/10">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink"><MessageSquareText className="h-5 w-5 text-brand-primary" />Conversación</h3>
        <ol className="mt-4 space-y-3">
          <li className="rounded-xl bg-paper p-4 text-sm"><b>Tú</b> <span className="text-ink/55">· {fecha(t.createdAt)} · caso inicial</span><p className="mt-1 whitespace-pre-wrap text-ink/80">{t.descripcion}</p></li>
          {t.mensajes.map((m) =>
            m.autor === 'SISTEMA' ? null : (
              <li key={m.id} className={`rounded-xl p-4 text-sm ${m.autor === 'EQUIPO' ? 'bg-brand-100 sm:ml-8' : 'bg-paper'}`}>
                <b>{m.autor === 'EQUIPO' ? 'FP Tecnologi' : 'Tú'}</b> <span className="text-ink/55">· {fecha(m.createdAt)}</span>
                <p className="mt-1 whitespace-pre-wrap text-ink/80">{m.texto}</p>
              </li>
            ),
          )}
        </ol>

        {t.estado !== 'CERRADO' ? (
          <form onSubmit={responder} className="mt-5">
            <label htmlFor="sg-resp" className="text-sm font-semibold text-ink/80">Tu respuesta</label>
            <textarea id="sg-resp" rows={4} maxLength={4000} value={texto} onChange={(e) => setTexto(e.target.value)} className={campo} placeholder="Escribe aquí…" />
            {error && <p role="alert" className="mt-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
            <div className="mt-3 flex items-center justify-between gap-3">
              <button type="button" onClick={() => { setT(null); setEmail(''); }} className="text-sm font-semibold text-brand-700 hover:underline">Consultar otro</button>
              <button type="submit" disabled={busy || texto.trim().length < 2} className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"><Send className="h-4 w-4" />Responder</button>
            </div>
          </form>
        ) : (
          <a href="/tickets" className="mt-5 inline-flex rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700">Abrir ticket</a>
        )}
      </div>
    </div>
  );
}
