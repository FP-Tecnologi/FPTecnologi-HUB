'use client';
/*
 * FPTecnologi-HUB — Asistente virtual del dashboard (/asistente).
 * Chat con la IA sobre la marca activa: métricas, resúmenes y búsquedas (pedidos, cotizaciones, leads, tickets,
 * reclamos, productos…). La API (`POST /asistente/consultar`) consulta la base con los permisos del rol; aquí se
 * muestran tal cual las métricas y tablas que devolvió (no el texto del modelo) y botones para ir al módulo, que se
 * validan contra el manifiesto del menú y el rol antes de mostrarse. El historial vive solo en sessionStorage.
 */
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { Icon } from '../../components/ui/Icon';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { hrefForSlug, manifest, visibleForRole } from '../../lib/manifest';

interface Metrica { etiqueta: string; valor: number; formato: 'numero' | 'moneda'; moneda?: string; modulo?: string; detalle?: string }
interface Tabla { titulo: string; modulo: string; columnas: string[]; filas: (string | number | null)[][]; total?: number }
interface Respuesta { texto: string; modulos: string[]; tablas: Tabla[]; metricas: Metrica[]; sugerencias: string[] }
type Mensaje = { role: 'user'; content: string } | ({ role: 'assistant'; content: string } & Partial<Omit<Respuesta, 'texto'>>);

const MAX_HISTORIAL = 40;
const claveDe = (marcaId: string) => `ax:asistente:${marcaId}`;

const SUGERENCIAS: Record<string, string[]> = {
  admin: ['¿Cómo vamos este mes?', '¿Qué está pendiente de atender?', 'Ventas de la última semana vs la anterior', 'Reclamos por vencer'],
  ventas: ['¿Cuánto vendimos este mes?', 'Pedidos pendientes de pago', 'Productos con stock bajo', 'Top productos del mes'],
  comercial: ['Leads sin contactar', 'Cotizaciones por atender', 'Tickets abiertos', 'Reclamos por vencer'],
  marketing: ['Resumen de la marca', '¿Qué dice nuestra política de devoluciones?', '¿Dónde edito la página de inicio?'],
  asesores: ['Chats con asesor abiertos', 'Conversaciones de hoy', '¿Qué documentos tiene el asistente?'],
};

function cargar(marcaId: string): Mensaje[] {
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(claveDe(marcaId)) ?? '[]');
    return Array.isArray(raw) ? raw.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string') : [];
  } catch {
    return [];
  }
}

function guardar(marcaId: string, mensajes: Mensaje[]) {
  try {
    window.sessionStorage.setItem(claveDe(marcaId), JSON.stringify(mensajes.slice(-MAX_HISTORIAL)));
  } catch {
    /* almacenamiento lleno o bloqueado: el chat sigue sin memoria */
  }
}

function valor(m: Metrica) {
  if (m.formato === 'moneda') {
    try {
      return new Intl.NumberFormat('es-PE', { style: 'currency', currency: m.moneda || 'USD', maximumFractionDigits: 2 }).format(m.valor);
    } catch {
      return `${m.moneda ?? ''} ${m.valor.toLocaleString('es-PE')}`;
    }
  }
  return m.valor.toLocaleString('es-PE');
}

const celda = (v: string | number | null) => (v === null || v === '' ? '—' : typeof v === 'number' ? v.toLocaleString('es-PE') : v);

export function AsistenteVirtual() {
  const { activeMarcaId, marcas, adminMode } = useAuth();
  const asignacion = marcas.find((m) => m.marcaId === activeMarcaId);
  const rol = asignacion?.rol.nombre ?? null;
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [borrador, setBorrador] = useState('');
  const [pensando, setPensando] = useState(false);
  const [error, setError] = useState('');
  const hiloRef = useRef<HTMLDivElement>(null);
  const entradaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeMarcaId) setMensajes(cargar(activeMarcaId));
    setError('');
  }, [activeMarcaId]);

  useEffect(() => {
    hiloRef.current?.scrollTo({ top: hiloRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes, pensando]);

  /** Botón «Ir a…» solo para módulos que existen en el menú y que el rol ve. */
  const modulo = useMemo(() => (id: string) => {
    const nodo = manifest.byId.get(id);
    return nodo && visibleForRole(nodo, rol) ? { titulo: nodo.title, href: hrefForSlug(nodo.slug) } : null;
  }, [rol]);

  async function preguntar(texto: string) {
    const pregunta = texto.trim().slice(0, 2000);
    if (!pregunta || pensando || !activeMarcaId) return;
    const marcaId = activeMarcaId;
    const nuevos: Mensaje[] = [...mensajes, { role: 'user', content: pregunta }];
    setMensajes(nuevos);
    guardar(marcaId, nuevos);
    setBorrador('');
    setError('');
    setPensando(true);
    try {
      const r = await api.post<Respuesta>('/asistente/consultar', {
        mensajes: nuevos.slice(-12).map((m) => ({ role: m.role, content: m.content.slice(0, 2000) })),
      });
      const conRespuesta: Mensaje[] = [...nuevos, { role: 'assistant', content: r.texto, modulos: r.modulos, tablas: r.tablas, metricas: r.metricas, sugerencias: r.sugerencias }];
      setMensajes(conRespuesta);
      guardar(marcaId, conRespuesta);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo consultar al asistente. Intenta de nuevo.');
    } finally {
      setPensando(false);
      entradaRef.current?.focus();
    }
  }

  function nueva() {
    setMensajes([]);
    setError('');
    if (activeMarcaId) guardar(activeMarcaId, []);
    entradaRef.current?.focus();
  }

  if (adminMode || !activeMarcaId) {
    return (
      <>
        <PageHead title="Asistente virtual" subtitle="Consulta datos, resúmenes y métricas de una marca." />
        <div className="ax-card"><div className="ax-card__body"><p>Elige una marca en el selector del menú para usar el asistente: trabaja con los datos de la marca activa.</p></div></div>
      </>
    );
  }

  const sugeridas = SUGERENCIAS[rol ?? ''] ?? SUGERENCIAS.marketing;
  const ultimo = mensajes[mensajes.length - 1];

  return (
    <>
      <PageHead
        title="Asistente virtual"
        subtitle={`Pregunta por métricas, pendientes o cualquier dato de ${asignacion?.marca.nombre ?? 'la marca'}. Responde con los datos reales y te lleva al módulo.`}
        actions={
          mensajes.length > 0 ? (
            <button type="button" className="ax-btn ax-btn--secondary" onClick={nueva}>
              <span className="ax-btn__label">Nueva conversación</span>
            </button>
          ) : undefined
        }
      />

      <section className="ax-card" aria-label="Conversación con el asistente" style={{ display: 'flex', flexDirection: 'column', minHeight: 'min(70vh, 720px)' }}>
        <div
          ref={hiloRef}
          className="ax-card__body"
          role="log"
          aria-live="polite"
          aria-busy={pensando}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)', flex: '1 1 auto', overflowY: 'auto', maxHeight: '68vh', background: 'var(--ax-surface-subtle)' }}
        >
          {mensajes.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 560, padding: 'var(--ax-space-6) 0' }}>
              <span style={{ display: 'inline-flex', width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, background: 'var(--ax-accent-wash)', color: 'var(--ax-accent)' }}>
                <Icon name="sparkles" />
              </span>
              <h2 style={{ margin: 'var(--ax-space-3) 0 var(--ax-space-1)', fontSize: 'var(--ax-text-lg)' }}>¿Qué necesitas saber hoy?</h2>
              <p style={{ color: 'var(--ax-text-muted)', margin: 0 }}>
                Solo ve los datos que tu rol puede ver en {asignacion?.marca.nombre}. Las cifras y tablas salen directo de la base de datos.
              </p>
              <div className="ax-cluster" style={{ justifyContent: 'center', gap: 'var(--ax-space-2)', marginTop: 'var(--ax-space-4)', flexWrap: 'wrap' }}>
                {sugeridas.map((s) => (
                  <button key={s} type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => preguntar(s)}>
                    <span className="ax-btn__label">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensajes.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '75%', padding: 'var(--ax-space-2) var(--ax-space-3)', borderRadius: '14px 14px 4px 14px', background: 'var(--ax-accent)', color: '#fff', whiteSpace: 'pre-wrap' }}>
                {m.content}
              </div>
            ) : (
              <div key={i} style={{ alignSelf: 'stretch', display: 'flex', gap: 'var(--ax-space-2)', alignItems: 'flex-start' }}>
                <span aria-hidden style={{ flex: '0 0 auto', display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'var(--ax-accent-wash)', color: 'var(--ax-accent)' }}>
                  <Icon name="sparkles" />
                </span>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: 'var(--ax-space-2) var(--ax-space-3)', borderRadius: '14px 14px 14px 4px', background: 'var(--ax-surface)', border: '1px solid var(--ax-border)', whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </div>

                  {!!m.metricas?.length && (
                    <div className="ax-statgroup" style={{ background: 'var(--ax-surface)', borderRadius: 12, border: '1px solid var(--ax-border)' }}>
                      {m.metricas.map((x) => {
                        const ir = x.modulo ? modulo(x.modulo) : null;
                        return (
                          <div key={x.etiqueta} className="ax-statgroup__cell">
                            <span className="ax-statgroup__text">
                              <span className="ax-statgroup__label">{x.etiqueta}</span>
                              <span className="ax-statgroup__value ax-num">{valor(x)}</span>
                              {x.detalle && <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>{x.detalle}</span>}
                              {ir && <Link href={ir.href} style={{ fontSize: 'var(--ax-text-xs)' }}>Ver en {ir.titulo}</Link>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {m.tablas?.map((t, k) => {
                    const ir = modulo(t.modulo);
                    return (
                      <div key={k} style={{ background: 'var(--ax-surface)', borderRadius: 12, border: '1px solid var(--ax-border)', overflow: 'hidden' }}>
                        <div className="ax-cluster" style={{ justifyContent: 'space-between', padding: 'var(--ax-space-2) var(--ax-space-3)', borderBottom: '1px solid var(--ax-border)', gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                          <strong>{t.titulo}</strong>
                          <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>
                            {t.total !== undefined && t.total > t.filas.length ? `Mostrando ${t.filas.length} de ${t.total}` : `${t.filas.length} resultado${t.filas.length === 1 ? '' : 's'}`}
                            {ir && <> · <Link href={ir.href}>Abrir {ir.titulo}</Link></>}
                          </span>
                        </div>
                        <div className="ax-table-wrap" style={{ maxHeight: 360, overflow: 'auto' }}>
                          <table className="ax-table">
                            <thead className="ax-table__head">
                              <tr>{t.columnas.map((c) => <th key={c} className="ax-table__th" scope="col">{c}</th>)}</tr>
                            </thead>
                            <tbody>
                              {t.filas.map((f, r) => (
                                <tr key={r} className="ax-table__row">
                                  {f.map((v, c) => <td key={c} className={`ax-table__td${typeof v === 'number' ? ' ax-num' : ''}`}>{celda(v)}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}

                  {!!m.modulos?.length && (
                    <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                      {m.modulos.map((id) => {
                        const ir = modulo(id);
                        return ir ? (
                          <Link key={id} href={ir.href} className="ax-btn ax-btn--secondary ax-btn--sm">
                            <span className="ax-btn__label">Ir a {ir.titulo} →</span>
                          </Link>
                        ) : null;
                      })}
                    </div>
                  )}

                  {m === ultimo && !pensando && !!m.sugerencias?.length && (
                    <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                      {m.sugerencias.map((s) => (
                        <button key={s} type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => preguntar(s)}>
                          <span className="ax-btn__label">{s}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}

          {pensando && (
            <div role="status" style={{ display: 'flex', gap: 'var(--ax-space-2)', alignItems: 'center', color: 'var(--ax-text-muted)' }}>
              <span aria-hidden style={{ display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'var(--ax-accent-wash)', color: 'var(--ax-accent)' }}>
                <Icon name="sparkles" />
              </span>
              Consultando los datos…
            </div>
          )}
        </div>

        {error && (
          <div role="alert" className="ax-alert ax-alert--danger" style={{ margin: 'var(--ax-space-3) var(--ax-space-4) 0', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
            <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
          </div>
        )}

        <form
          className="ax-card__body"
          style={{ display: 'flex', gap: 'var(--ax-space-2)', alignItems: 'flex-end', borderTop: '1px solid var(--ax-border)' }}
          onSubmit={(e) => { e.preventDefault(); preguntar(borrador); }}
        >
          <label htmlFor="asistente-pregunta" className="ax-visually-hidden">Tu pregunta</label>
          <textarea
            id="asistente-pregunta"
            ref={entradaRef}
            className="ax-textarea"
            rows={2}
            maxLength={2000}
            value={borrador}
            onChange={(e) => setBorrador(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); preguntar(borrador); } }}
            placeholder="Ej.: ¿Cuántas cotizaciones llegaron esta semana y cuáles siguen pendientes?"
            style={{ flex: 1, resize: 'vertical' }}
          />
          <button type="submit" className="ax-btn ax-btn--primary" disabled={!borrador.trim() || pensando} aria-label="Enviar pregunta">
            <Icon name="send" />
            <span className="ax-btn__label">Preguntar</span>
          </button>
        </form>
      </section>
    </>
  );
}

export default AsistenteVirtual;
