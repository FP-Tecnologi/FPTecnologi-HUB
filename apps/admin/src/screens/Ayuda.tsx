'use client';
/*
 * FPTecnologi-HUB — "Centro de ayuda": tickets del usuario a la plataforma
 * (reportar problemas, pedir ayuda). Lista + nuevo ticket contra POST/GET /soporte;
 * los atiende el super admin en Administración → Soporte.
 */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHead } from '../components/shell/PageHead';
import { ApiError, useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

type Estado = 'ABIERTO' | 'EN_REVISION' | 'CERRADO';
interface Ticket {
  id: string;
  asunto: string;
  categoria: string;
  mensaje: string;
  estado: Estado;
  respuesta: string | null;
  respondidoAt: string | null;
  createdAt: string;
  marca: { nombre: string } | null;
}

const CATEGORIAS = ['Problema técnico', 'Acceso y cuenta', 'Pedidos', 'Sugerencia', 'Otro'];

const ESTADOS: Record<Estado, { label: string; color: string }> = {
  ABIERTO: { label: 'Abierto', color: 'var(--ax-accent)' },
  EN_REVISION: { label: 'En revisión', color: 'var(--ax-warning-500)' },
  CERRADO: { label: 'Cerrado', color: 'var(--ax-text-subtle)' },
};

export function Ayuda() {
  const { activeMarcaId } = useAuth();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [asunto, setAsunto] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [mensaje, setMensaje] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const cargar = useCallback(async () => {
    try { setTickets(await api.get<Ticket[]>('/soporte/mios')); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'No se pudieron cargar tus tickets.'); setTickets([]); }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  async function crearTicket(ev: React.FormEvent) {
    ev.preventDefault();
    if (!asunto.trim() || !mensaje.trim() || busy) return;
    setBusy(true); setError(''); setOkMsg('');
    try {
      await api.post(`/soporte${activeMarcaId ? `?marcaId=${encodeURIComponent(activeMarcaId)}` : ''}`, { asunto: asunto.trim(), categoria, mensaje: mensaje.trim() });
      setAsunto(''); setMensaje(''); setCategoria(CATEGORIAS[0]);
      setOkMsg('Ticket enviado. Te avisaremos por correo cuando tenga respuesta.');
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo enviar el ticket.');
    } finally { setBusy(false); }
  }

  return (
    <>
      <PageHead title="Centro de ayuda" subtitle="Reporta un problema de la plataforma o pide ayuda al equipo de soporte." actions={<Link className="ax-btn ax-btn--ghost" href="/soporte">Preguntas frecuentes</Link>} />
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--5" role="region" aria-label="Nuevo ticket">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Nuevo ticket</h2></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {okMsg && (
              <div role="status" className="ax-alert ax-alert--success" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                <div className="ax-alert__content"><p className="ax-alert__message">{okMsg}</p></div>
              </div>
            )}
            {error && (
              <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                <div className="ax-alert__content"><p className="ax-alert__message">{error}</p></div>
              </div>
            )}
            <form onSubmit={crearTicket} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <div className="ax-field">
                <label className="ax-label" htmlFor="ay-asunto">Asunto</label>
                <input id="ay-asunto" type="text" className="ax-input" placeholder="¿En qué te ayudamos?" minLength={3} maxLength={120} value={asunto} onChange={(e) => setAsunto(e.target.value)} required />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="ay-cat">Categoría</label>
                <select id="ay-cat" className="ax-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  {CATEGORIAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="ay-msg">Detalle</label>
                <textarea id="ay-msg" className="ax-input" rows={4} minLength={5} maxLength={4000} placeholder="Cuéntanos qué pasa…" value={mensaje} onChange={(e) => setMensaje(e.target.value)} required />
              </div>
              <div>
                <button type="submit" className="ax-btn ax-btn--primary" disabled={busy}>
                  <span className="ax-btn__label">{busy ? 'Enviando…' : 'Enviar ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="ax-card ax-col--7" role="region" aria-label="Mis tickets">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Mis tickets</h2><p className="ax-card__subtitle">{tickets ? `${tickets.length} en total.` : 'Cargando…'}</p></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {tickets?.length === 0 && (
              <p style={{ color: 'var(--ax-text-muted)', margin: 0 }}>Todavía no tienes tickets.</p>
            )}
            <ul className="ax-list">
              {tickets?.map((t) => (
                <li key={t.id} className="ax-list__row" style={{ paddingInline: 0 }}>
                  <span className="ax-list__content">
                    <span className="ax-list__title">
                      {t.asunto}{' '}
                      <span className="ax-badge ax-badge--soft ax-badge--pill" style={{ color: ESTADOS[t.estado]?.color }}>
                        {ESTADOS[t.estado]?.label ?? t.estado}
                      </span>
                    </span>
                    <span className="ax-list__meta">{t.categoria} · {new Date(t.createdAt).toLocaleDateString('es-PE')}</span>
                    <span className="ax-list__meta">{t.mensaje}</span>
                    {t.respuesta && (
                      <span className="ax-list__meta" style={{ color: 'var(--ax-text-strong)' }}><strong>Respuesta de soporte:</strong> {t.respuesta}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

export default Ayuda;
