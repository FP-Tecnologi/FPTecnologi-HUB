'use client';
/*
 * FPTecnologi-HUB — Conversaciones del chat de la web (GET /chat/conversaciones).
 * Bandeja a la izquierda (filtro por estado) y la conversación elegida a la
 * derecha: el asesor la lee, la toma ("Retomar"), responde (su mensaje
 * aparece en el widget del visitante) y la cierra o la devuelve al
 * asistente. Mientras hay una conversación abierta se refresca cada 5 s
 * para ver lo que escribe el cliente. Aviso de conversación nueva: correo +
 * notificación del sistema (lo hace la API, ver chat.service.ts).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Estado = 'BOT' | 'ASESOR' | 'CERRADA';
type Autor = 'CLIENTE' | 'BOT' | 'ASESOR';
interface Mensaje { id: string; autor: Autor; texto: string; createdAt: string }
interface AsesorRef { id: string; nombre: string | null; email: string }
interface ConversacionResumen {
  id: string;
  titulo: string | null;
  estado: Estado;
  paginaOrigen: string | null;
  updatedAt: string;
  createdAt: string;
  asesor: AsesorRef | null;
  ultimoMensaje: Mensaje | null;
  totalMensajes: number;
}
interface Conversacion extends Omit<ConversacionResumen, 'ultimoMensaje' | 'totalMensajes'> { mensajes: Mensaje[] }

// ASESOR = "Seguimiento": conversaciones que un asesor tomó y está atendiendo.
const ESTADO_LABEL: Record<Estado, string> = { BOT: 'Asistente IA', ASESOR: 'Seguimiento', CERRADA: 'Finalizada' };
const FILTROS: { id: '' | Estado; label: string }[] = [
  { id: '', label: 'Todas' },
  { id: 'BOT', label: 'Asistente IA' },
  { id: 'ASESOR', label: 'Seguimiento' },
  { id: 'CERRADA', label: 'Finalizadas' },
];
const ESTADO_BADGE: Record<Estado, string> = { BOT: 'ax-badge--info', ASESOR: 'ax-badge--success', CERRADA: 'ax-badge--neutral' };
const AUTOR_LABEL: Record<Autor, string> = { CLIENTE: 'Cliente', BOT: 'Asistente virtual', ASESOR: 'Asesor' };
const REFRESH_MS = 5000;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const SVG = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, width: 16, height: 16, 'aria-hidden': true };

/** Avatar de quien escribió: cliente (persona), asistente (robot) o asesor (iniciales). */
function Avatar({ autor, nombre, size = 32 }: { autor: Autor; nombre: string | null; size?: number }) {
  const base = { flexShrink: 0, width: size, height: size } as const;
  if (autor === 'ASESOR') {
    const ini = (nombre ?? 'A').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return (
      <span className="ax-avatar ax-avatar--sm" title={nombre ?? 'Asesor'} style={{ ...base, background: 'var(--ax-accent)', color: '#fff' }}>
        <span className="ax-avatar__initials">{ini}</span>
      </span>
    );
  }
  if (autor === 'BOT') {
    return (
      <span className="ax-avatar ax-avatar--sm" title="Asistente virtual" style={{ ...base, background: 'color-mix(in oklab, var(--ax-accent) 18%, transparent)', color: 'var(--ax-accent)' }}>
        <svg {...SVG}><path d="M6 6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -4" /><path d="M12 2v2" /><path d="M9 12v9" /><path d="M15 12v9" /><path d="M5 16l4 -2" /><path d="M15 14l4 2" /><path d="M9 18h6" /><path d="M10 8v.01" /><path d="M14 8v.01" /></svg>
      </span>
    );
  }
  return (
    <span className="ax-avatar ax-avatar--sm" title="Cliente" style={{ ...base, background: 'var(--ax-surface)', color: 'var(--ax-text-muted)', border: '1px solid var(--ax-border)' }}>
      <svg {...SVG}><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /></svg>
    </span>
  );
}

const ICON = { className: 'ax-btn__icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
const I_TOMAR = <svg {...ICON}><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M16 19h6" /><path d="M19 16v6" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4" /></svg>;
const I_BOT = <svg {...ICON}><path d="M6 6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -4" /><path d="M12 2v2" /><path d="M9 12v9" /><path d="M15 12v9" /><path d="M10 8v.01" /><path d="M14 8v.01" /></svg>;
const I_FIN = <svg {...ICON}><path d="M5 12l5 5l10 -10" /></svg>;
const I_REABRIR = <svg {...ICON}><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>;
const I_LOCK = <svg {...ICON}><path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6" /><path d="M8 11v-4a4 4 0 1 1 8 0v4" /></svg>;
const I_SEND = <svg {...ICON}><path d="M10 14l11 -11" /><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" /></svg>;

export function ChatInbox() {
  const { activeMarcaId, user } = useAuth();
  const [filtro, setFiltro] = useState<'' | Estado>('');
  const [lista, setLista] = useState<ConversacionResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [conv, setConv] = useState<Conversacion | null>(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const hiloRef = useRef<HTMLDivElement>(null);

  // ?id=... (link del correo de aviso) abre esa conversación directo.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) setSelId(id);
  }, []);

  const cargarLista = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      const q = filtro ? `?estado=${filtro}` : '';
      setLista(await api.get<ConversacionResumen[]>(`/chat/conversaciones${q}`));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las conversaciones.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId, filtro]);

  const cargarConv = useCallback(async (id: string) => {
    try {
      setConv(await api.get<Conversacion>(`/chat/conversaciones/${id}`));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo abrir la conversación.');
    }
  }, []);

  useEffect(() => {
    cargarLista();
  }, [cargarLista]);

  // Conversación abierta: refresco periódico (cliente escribiendo) + lista.
  useEffect(() => {
    if (!selId) return;
    cargarConv(selId);
    const t = window.setInterval(() => {
      cargarConv(selId);
      cargarLista();
    }, REFRESH_MS);
    return () => window.clearInterval(t);
  }, [selId, cargarConv, cargarLista]);

  useEffect(() => {
    const el = hiloRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conv?.mensajes.length]);

  async function accion(fn: () => Promise<unknown>) {
    if (!conv) return;
    try {
      await fn();
      await Promise.all([cargarConv(conv.id), cargarLista()]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo completar la acción.');
    }
  }

  async function responder(ev: React.FormEvent) {
    ev.preventDefault();
    if (!conv || !texto.trim() || enviando) return;
    setEnviando(true);
    await accion(() => api.post(`/chat/conversaciones/${conv.id}/mensajes`, { texto: texto.trim() }));
    setTexto('');
    setEnviando(false);
  }

  const esMia = conv?.asesor?.id === user?.id;
  // Solo se escribe después de "Retomar conversación" (y si es de uno).
  const puedeEscribir = conv?.estado === 'ASESOR' && esMia;

  return (
    <>
      <PageHead
        title="Conversaciones"
        subtitle="Chats del asistente virtual de la web. Léelos, retómalos como asesor y responde al cliente en el mismo widget."
      />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <div className="ax-dash-grid">
        {/* Bandeja */}
        <section className="ax-card ax-col--4" role="region" aria-label="Bandeja de conversaciones">
          <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Filtrar por estado">
              {FILTROS.map((f) => (
                <button
                  key={f.id || 'todas'}
                  type="button"
                  role="radio"
                  aria-checked={filtro === f.id}
                  className={`ax-btn ax-btn--sm${filtro === f.id ? ' is-selected' : ''}`}
                  onClick={() => setFiltro(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {cargando ? (
              <p style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)' }}>Cargando…</p>
            ) : lista.length === 0 ? (
              <p style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)', textAlign: 'center', paddingBlock: 'var(--ax-space-6)' }}>
                Todavía no hay conversaciones{filtro ? ' con este estado' : ''}.
              </p>
            ) : (
              <ul className="ax-list" style={{ maxHeight: 'max(520px, calc(100vh - 260px))', overflowY: 'auto', margin: 0, padding: 0 }}>
                {lista.map((c) => (
                  <li
                    key={c.id}
                    className="ax-list__row"
                    onClick={() => setSelId(c.id)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 'var(--ax-radius-md, 8px)',
                      background: c.id === selId ? 'var(--ax-surface-subtle)' : undefined,
                      paddingInline: 'var(--ax-space-2)',
                      display: 'flex',
                      gap: 'var(--ax-space-3)',
                      alignItems: 'center',
                    }}
                  >
                    <span className="ax-list__leading">
                      <Avatar autor={c.estado === 'ASESOR' ? 'ASESOR' : c.estado === 'BOT' ? 'BOT' : 'CLIENTE'} nombre={c.asesor?.nombre ?? c.asesor?.email ?? null} size={36} />
                    </span>
                    <div className="ax-list__content" style={{ minWidth: 0, flex: 1 }}>
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                        <span className="ax-list__title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.titulo ?? 'Sin mensajes todavía'}
                        </span>
                        <span className={`ax-badge ax-badge--soft ax-badge--sm ${ESTADO_BADGE[c.estado]}`}>{ESTADO_LABEL[c.estado]}</span>
                      </div>
                      {c.ultimoMensaje && (
                        <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                          {AUTOR_LABEL[c.ultimoMensaje.autor]}: {c.ultimoMensaje.texto}
                        </div>
                      )}
                      <div className="ax-list__meta" style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                        {fmt(c.updatedAt)} · {c.totalMensajes} mensajes{c.asesor ? ` · ${c.asesor.nombre ?? c.asesor.email}` : ''}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Conversación */}
        <section className="ax-card ax-col--8" role="region" aria-label="Conversación">
          {!conv ? (
            <div className="ax-card__body" style={{ textAlign: 'center', paddingBlock: 'var(--ax-space-10, 64px)', color: 'var(--ax-text-muted)' }}>
              Elige una conversación de la bandeja para leerla.
            </div>
          ) : (
            <>
              <div className="ax-card__header">
                <div className="ax-card__titles">
                  <h2 className="ax-card__title">{conv.titulo ?? 'Conversación'}</h2>
                  <p className="ax-card__subtitle">
                    Iniciada {fmt(conv.createdAt)}
                    {conv.paginaOrigen ? ` desde ${conv.paginaOrigen}` : ''} ·{' '}
                    <span className={`ax-badge ax-badge--soft ax-badge--sm ${ESTADO_BADGE[conv.estado]}`}>{ESTADO_LABEL[conv.estado]}</span>
                    {conv.asesor ? ` · Atiende ${esMia ? 'tú' : (conv.asesor.nombre ?? conv.asesor.email)}` : ''}
                  </p>
                </div>
                {/* Acciones en orden de flujo: retomar -> devolver a la IA -> finalizar. */}
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {conv.estado === 'CERRADA' ? (
                    <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => accion(() => api.patch(`/chat/conversaciones/${conv.id}/estado`, { estado: 'BOT' }))}>
                      {I_REABRIR}<span className="ax-btn__label">Reabrir</span>
                    </button>
                  ) : (
                    <>
                      {!puedeEscribir && (
                        <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" onClick={() => accion(() => api.post(`/chat/conversaciones/${conv.id}/tomar`, {}))}>
                          {I_TOMAR}<span className="ax-btn__label">Retomar conversación</span>
                        </button>
                      )}
                      {conv.estado === 'ASESOR' && (
                        <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => accion(() => api.patch(`/chat/conversaciones/${conv.id}/estado`, { estado: 'BOT' }))}>
                          {I_BOT}<span className="ax-btn__label">Devolver al asistente IA</span>
                        </button>
                      )}
                      <button type="button" className="ax-btn ax-btn--soft-success ax-btn--sm" onClick={() => accion(() => api.patch(`/chat/conversaciones/${conv.id}/estado`, { estado: 'CERRADA' }))}>
                        {I_FIN}<span className="ax-btn__label">Finalizar</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div
                ref={hiloRef}
                className="ax-card__body"
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)', height: 'max(440px, calc(100vh - 380px))', overflowY: 'auto', background: 'var(--ax-surface-subtle)' }}
              >
                {conv.mensajes.map((m) => {
                  const derecha = m.autor !== 'CLIENTE';
                  const nombre = m.autor === 'ASESOR' ? `${conv.asesor?.nombre ?? conv.asesor?.email ?? 'Asesor'} · Asesor` : AUTOR_LABEL[m.autor];
                  return (
                    <div key={m.id} style={{ display: 'flex', gap: 'var(--ax-space-2)', alignItems: 'flex-end', flexDirection: derecha ? 'row-reverse' : 'row' }}>
                      <Avatar autor={m.autor} nombre={conv.asesor?.nombre ?? conv.asesor?.email ?? null} />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: derecha ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                        <span style={{ fontSize: 'var(--ax-text-xs)', fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-muted)', marginBottom: 4 }}>{nombre}</span>
                        <div
                          style={{
                            padding: 'var(--ax-space-2) var(--ax-space-3)',
                            borderRadius: derecha ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            whiteSpace: 'pre-wrap',
                            fontSize: 'var(--ax-text-sm)',
                            lineHeight: 1.55,
                            background: m.autor === 'CLIENTE' ? 'var(--ax-surface)' : m.autor === 'BOT' ? 'color-mix(in oklab, var(--ax-accent) 14%, var(--ax-surface))' : 'var(--ax-accent)',
                            color: m.autor === 'ASESOR' ? '#fff' : 'var(--ax-text)',
                            border: m.autor === 'CLIENTE' ? '1px solid var(--ax-border)' : 'none',
                            boxShadow: '0 1px 2px rgba(0,0,0,.06)',
                          }}
                        >
                          {m.texto}
                        </div>
                        <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', marginTop: 4 }}>{fmt(m.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Caja de respuesta: solo activa si tú tomaste la conversación. */}
              {puedeEscribir ? (
                <form onSubmit={responder} className="ax-card__body" style={{ display: 'flex', gap: 'var(--ax-space-3)', alignItems: 'flex-end', borderTop: '1px solid var(--ax-border)' }}>
                  <Avatar autor="ASESOR" nombre={user?.nombre || user?.email || null} size={36} />
                  <div className="ax-field" style={{ flex: '1 1 auto' }}>
                    <label className="ax-label" htmlFor="chat-resp">Respondiendo como {user?.nombre || user?.email}</label>
                    <textarea
                      id="chat-resp"
                      className="ax-textarea"
                      rows={2}
                      maxLength={2000}
                      placeholder="Escribe al cliente… (Ctrl + Enter para enviar)"
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) responder(e);
                      }}
                    />
                  </div>
                  <button type="submit" className={`ax-btn ax-btn--primary${enviando ? ' is-loading' : ''}`} disabled={!texto.trim() || enviando}>
                    <span className="ax-btn__spinner" aria-hidden="true"></span>
                    {I_SEND}<span className="ax-btn__label">Enviar</span>
                  </button>
                </form>
              ) : (
                <div className="ax-card__body" style={{ display: 'flex', gap: 'var(--ax-space-3)', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--ax-border)', color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)' }}>
                  <span className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', width: 18 }}>{I_LOCK}</span>
                    {conv.estado === 'CERRADA'
                      ? 'Conversación finalizada. Reábrela para volver a escribir.'
                      : conv.estado === 'ASESOR'
                        ? `La atiende ${conv.asesor?.nombre ?? conv.asesor?.email ?? 'otro asesor'}. Retómala para escribir.`
                        : 'La atiende el asistente IA. Retómala para escribirle al cliente.'}
                  </span>
                  {conv.estado !== 'CERRADA' && (
                    <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" onClick={() => accion(() => api.post(`/chat/conversaciones/${conv.id}/tomar`, {}))}>
                      {I_TOMAR}<span className="ax-btn__label">Retomar</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default ChatInbox;
