'use client';
/* Seguimiento de un ticket de Imaninki: número + correo con el que se abrió. Estado, conversación con el equipo (sin
   notas internas) y respuesta del cliente. Va a /api/hub/tickets/{seguimiento|responder}. */
import { useState } from 'react';
import { CheckCircle2, Clock, Loader2, MessageSquareText, Search, Send } from 'lucide-react';

type Estado = 'NUEVO' | 'EN_REVISION' | 'ESPERANDO_CLIENTE' | 'RESUELTO' | 'CERRADO';
type Seguimiento = {
  numero: string; tipo: 'RECLAMO' | 'VERIFICACION' | 'SOPORTE'; estado: Estado; producto: string | null; descripcion: string; createdAt: string;
  mensajes: { id: string; autor: 'CLIENTE' | 'EQUIPO' | 'SISTEMA'; texto: string; createdAt: string }[];
};
const ESTADO: Record<Estado, { label: string; ayuda: string }> = {
  NUEVO: { label: 'Recibido', ayuda: 'Tu ticket llegó a nuestro equipo y será revisado pronto.' },
  EN_REVISION: { label: 'En revisión', ayuda: 'Un especialista está trabajando en tu caso.' },
  ESPERANDO_CLIENTE: { label: 'Esperando tu respuesta', ayuda: 'Necesitamos que respondas para poder continuar.' },
  RESUELTO: { label: 'Resuelto', ayuda: 'Marcamos tu caso como resuelto. Si no es así, respóndenos y lo reabrimos.' },
  CERRADO: { label: 'Cerrado', ayuda: 'Este ticket está cerrado. Abre uno nuevo si necesitas más ayuda.' },
};
const TIPO = { RECLAMO: 'Reclamo', VERIFICACION: 'Verificación de equipo', SOPORTE: 'Soporte técnico' } as const;
const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const campo = 'mt-1 block min-h-11 w-full rounded-lg border border-carbon/40 bg-white px-4 py-2.5 text-base text-tinta transition focus:border-rojo-hondo';
const etiqueta = 'text-sm font-medium text-carbon';

export default function SeguimientoTicket({ numeroInicial = '' }: { numeroInicial?: string }) {
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
      const res = await fetch(`/api/hub/tickets/${accion}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || 'No pudimos completar la solicitud.'); return null; }
      return (data.data ?? {}) as T;
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
    if (r !== null) { setTexto(''); await buscar(); }
  }

  if (!t) {
    return (
      <form onSubmit={buscar} noValidate className="border border-carbon/15 bg-niebla mx-auto max-w-lg rounded-md p-6 sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-rojo-hondo text-white"><Search aria-hidden="true" size={24} /></span>
        <h2 className="mt-4 font-titulo text-2xl font-bold text-tinta">Consulta tu ticket</h2>
        <p className="mt-1.5 text-sm text-carbon">Ingresa el número que te enviamos (empieza con TCK) y el correo con el que lo abriste.</p>
        <div className="mt-5 space-y-4">
          <div><label htmlFor="sg-num" className={etiqueta}>Número de ticket *</label>
            <input id="sg-num" className={campo} value={numero} onChange={(e) => setNumero(e.target.value.toUpperCase())} placeholder="TCK-2026-ABC123" maxLength={30} /></div>
          <div><label htmlFor="sg-mail" className={etiqueta}>Correo *</label>
            <input id="sg-mail" type="email" autoComplete="email" className={campo} value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} /></div>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="btn-neon flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-8 font-titulo text-sm disabled:opacity-60">
            {busy ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <Search aria-hidden="true" size={18} />}VER ESTADO
          </button>
        </div>
      </form>
    );
  }

  const est = ESTADO[t.estado];
  const cerrado = t.estado === 'RESUELTO' || t.estado === 'CERRADO';
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="border border-carbon/15 bg-niebla rounded-md p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rojo-hondo">{TIPO[t.tipo]}</p>
            <h2 className="font-titulo text-2xl font-bold text-tinta">{t.numero}</h2>
            <p className="text-sm text-carbon">Abierto el {fecha(t.createdAt)}{t.producto ? ` · ${t.producto}` : ''}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rojo-hondo/60 bg-rojo/10 px-3 py-1.5 text-sm font-bold text-tinta">
            {cerrado ? <CheckCircle2 aria-hidden="true" size={16} /> : <Clock aria-hidden="true" size={16} />}{est.label}
          </span>
        </div>
        <p className="mt-3 text-sm text-carbon">{est.ayuda}</p>
      </div>

      <div className="border border-carbon/15 bg-niebla rounded-md p-6">
        <h3 className="flex items-center gap-2 font-titulo text-lg font-bold text-tinta"><MessageSquareText aria-hidden="true" size={20} className="text-rojo-hondo" />Conversación</h3>
        <ol className="mt-4 space-y-3">
          <li className="rounded-md bg-white p-4 text-sm"><b className="text-tinta">Tú</b> <span className="text-carbon/70">· {fecha(t.createdAt)} · caso inicial</span><p className="mt-1 whitespace-pre-wrap text-carbon">{t.descripcion}</p></li>
          {t.mensajes.filter((m) => m.autor !== 'SISTEMA').map((m) => (
            <li key={m.id} className={`rounded-md p-4 text-sm ${m.autor === 'EQUIPO' ? 'bg-rojo/10 sm:ml-8' : 'bg-white'}`}>
              <b className="text-tinta">{m.autor === 'EQUIPO' ? 'Imaninki' : 'Tú'}</b> <span className="text-carbon/70">· {fecha(m.createdAt)}</span>
              <p className="mt-1 whitespace-pre-wrap text-carbon">{m.texto}</p>
            </li>
          ))}
        </ol>
        {t.estado !== 'CERRADO' ? (
          <form onSubmit={responder} className="mt-5">
            <label htmlFor="sg-resp" className={etiqueta}>Tu respuesta</label>
            <textarea id="sg-resp" rows={4} maxLength={4000} value={texto} onChange={(e) => setTexto(e.target.value)} className={campo} />
            {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => { setT(null); setEmail(''); }} className="text-sm font-semibold text-rojo-hondo hover:underline">Consultar otro</button>
              <button type="submit" disabled={busy || texto.trim().length < 2} className="btn-neon inline-flex min-h-11 items-center gap-2 rounded-full px-6 font-titulo text-sm disabled:opacity-60"><Send aria-hidden="true" size={16} />RESPONDER</button>
            </div>
          </form>
        ) : (
          <a href="/tickets" className="btn-neon mt-5 inline-flex min-h-11 items-center rounded-full px-6 font-titulo text-sm">ABRIR TICKET</a>
        )}
      </div>
    </div>
  );
}
