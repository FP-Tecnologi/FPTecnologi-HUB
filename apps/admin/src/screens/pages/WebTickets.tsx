'use client';
/*
 * FPTecnologi-HUB — Web informativa → Tickets (GET /tickets). Sistema de tickets de soporte: reclamos, verificaciones
 * y soporte técnico que los clientes abren en /tickets. Cada ticket tiene estado, prioridad, responsable, evidencia
 * (privada), una conversación con el cliente (respuestas por correo), notas internas e historial de cambios.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { abrirArchivoPrivado, api } from '../../lib/api';

type Estado = 'NUEVO' | 'EN_REVISION' | 'ESPERANDO_CLIENTE' | 'RESUELTO' | 'CERRADO';
type Tipo = 'RECLAMO' | 'VERIFICACION' | 'SOPORTE';
type Prioridad = 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';

interface Mensaje {
  id: string;
  autor: 'CLIENTE' | 'EQUIPO' | 'SISTEMA';
  autorNombre: string | null;
  texto: string;
  adjuntos: string[];
  interno: boolean;
  createdAt: string;
}
interface Ticket {
  id: string;
  numero: string;
  tipo: Tipo;
  estado: Estado;
  prioridad: Prioridad;
  asignadoA: string | null;
  esEmpresa: boolean;
  documento: string | null;
  nombre: string;
  email: string;
  celular: string | null;
  numeroCompra: string | null;
  fechaCompra: string | null;
  producto: string | null;
  comprobante: string | null;
  descripcion: string;
  evidencias: string[];
  notas: string | null;
  atendidoPor: string | null;
  createdAt: string;
  _count?: { mensajes: number };
  mensajes?: Mensaje[];
}

const ESTADOS: { v: Estado; label: string; badge: string }[] = [
  { v: 'NUEVO', label: 'Nuevo', badge: 'ax-badge--info' },
  { v: 'EN_REVISION', label: 'En revisión', badge: 'ax-badge--warning' },
  { v: 'ESPERANDO_CLIENTE', label: 'Esperando cliente', badge: 'ax-badge--neutral' },
  { v: 'RESUELTO', label: 'Resuelto', badge: 'ax-badge--success' },
  { v: 'CERRADO', label: 'Cerrado', badge: 'ax-badge--neutral' },
];
const PRIORIDADES: { v: Prioridad; label: string; badge: string }[] = [
  { v: 'BAJA', label: 'Baja', badge: 'ax-badge--neutral' },
  { v: 'NORMAL', label: 'Normal', badge: 'ax-badge--info' },
  { v: 'ALTA', label: 'Alta', badge: 'ax-badge--warning' },
  { v: 'URGENTE', label: 'Urgente', badge: 'ax-badge--danger' },
];
const TIPOS: Record<Tipo, string> = { RECLAMO: 'Reclamo', VERIFICACION: 'Verificación', SOPORTE: 'Soporte técnico' };
const meta = (e: Estado) => ESTADOS.find((x) => x.v === e)!;
const prio = (p: Prioridad) => PRIORIDADES.find((x) => x.v === p)!;
const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function WebTickets() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Ticket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<'' | Estado>('');
  const [tipo, setTipo] = useState<'' | Tipo>('');
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [sel, setSel] = useState<Ticket | null>(null);
  const [notas, setNotas] = useState('');
  const [asignado, setAsignado] = useState('');
  const [texto, setTexto] = useState('');
  const [interno, setInterno] = useState(false);
  const [estadoAlResponder, setEstadoAlResponder] = useState<'' | Estado>('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      setLista(await api.get<Ticket[]>('/tickets'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los tickets.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Abre el ticket de ?id= (viene del aviso por correo/notificación).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) setSelId(id);
  }, []);

  // Detalle con conversación.
  useEffect(() => {
    if (!selId) return setSel(null);
    let vivo = true;
    api
      .get<Ticket>(`/tickets/${selId}`)
      .then((t) => vivo && setSel(t))
      .catch((e) => vivo && setError(e instanceof ApiError ? e.message : 'No se pudo abrir el ticket.'));
    return () => {
      vivo = false;
    };
  }, [selId]);

  useEffect(() => {
    setNotas(sel?.notas ?? '');
    setAsignado(sel?.asignadoA ?? '');
    setTexto('');
    setInterno(false);
    setEstadoAlResponder('');
  }, [sel?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter((x) => (!filtro || x.estado === filtro) && (!tipo || x.tipo === tipo) && (!t || `${x.numero} ${x.nombre} ${x.email} ${x.documento ?? ''} ${x.numeroCompra ?? ''} ${x.producto ?? ''}`.toLowerCase().includes(t)));
  }, [lista, filtro, tipo, q]);

  const cuenta = (e: '' | Estado) => lista.filter((x) => !e || x.estado === e).length;

  /** Reemplaza el ticket abierto y su fila de la lista con lo que devolvió la API. */
  function aplicar(t: Ticket) {
    setSel((s) => (s ? { ...s, ...t, mensajes: t.mensajes ?? s.mensajes } : t));
    setLista((ls) => ls.map((x) => (x.id === t.id ? { ...x, ...t, _count: x._count } : x)));
  }

  async function actualizar(cambios: { estado?: Estado; prioridad?: Prioridad; asignadoA?: string; notas?: string }) {
    if (!sel) return;
    setGuardando(true);
    try {
      await api.patch(`/tickets/${sel.id}`, cambios);
      aplicar(await api.get<Ticket>(`/tickets/${sel.id}`)); // trae también el evento nuevo del historial
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function responder(e: React.FormEvent) {
    e.preventDefault();
    if (!sel || !texto.trim()) return;
    setGuardando(true);
    try {
      aplicar(await api.post<Ticket>(`/tickets/${sel.id}/mensajes`, { texto: texto.trim(), interno, estado: !interno && estadoAlResponder ? estadoAlResponder : undefined }));
      setTexto('');
      setEstadoAlResponder('');
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!sel || !window.confirm(`¿Eliminar el ticket ${sel.numero} y su conversación? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/tickets/${sel.id}`);
      setSelId(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar (solo administradores).');
    }
  }

  async function abrir(clave: string) {
    try {
      await abrirArchivoPrivado(`/tickets/archivo?clave=${encodeURIComponent(clave)}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo abrir el archivo.');
    }
  }

  const fila = (k: string, v: React.ReactNode) => (
    <>
      <dt style={{ color: 'var(--ax-text-muted)' }}>{k}</dt>
      <dd style={{ margin: 0, wordBreak: 'break-word' }}>{v}</dd>
    </>
  );

  return (
    <>
      <PageHead title="Tickets de soporte" subtitle="Reclamos, verificaciones y soporte técnico: conversación con el cliente, prioridad, responsable e historial." />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <div className="ax-dash-grid">
        <section className={`ax-card ${selId ? 'ax-col--5' : 'ax-col--12'}`} role="region" aria-label="Tickets" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body">
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
                <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Filtrar por estado">
                  {([{ v: '' as const, label: 'Todos' }, ...ESTADOS] as { v: '' | Estado; label: string }[]).map((e) => (
                    <button key={e.label} type="button" role="radio" aria-checked={filtro === e.v} className={`ax-btn ax-btn--sm${filtro === e.v ? ' is-selected' : ''}`} onClick={() => setFiltro(e.v)}>
                      {e.label} ({cuenta(e.v)})
                    </button>
                  ))}
                </div>
                <select className="ax-select" aria-label="Filtrar por tipo" value={tipo} onChange={(e) => setTipo(e.target.value as '' | Tipo)}>
                  <option value="">Todos los tipos</option>
                  {(Object.keys(TIPOS) as Tipo[]).map((t) => <option key={t} value={t}>{TIPOS[t]}</option>)}
                </select>
              </div>
              <input type="search" className="ax-input" placeholder="Buscar n.º, nombre, compra…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar tickets" style={{ maxWidth: 260 }} />
            </div>
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col">Ticket</th>
                  <th className="ax-table__th" scope="col">Cliente</th>
                  <th className="ax-table__th" scope="col">Estado</th>
                  {!selId && <th className="ax-table__th" scope="col">Prioridad</th>}
                  {!selId && <th className="ax-table__th" scope="col">Recibido</th>}
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={5}>Cargando…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={5} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay tickets. Aparecerán cuando un cliente use /tickets en la web.' : 'Ningún ticket coincide con el filtro.'}</td></tr>
                ) : (
                  visibles.map((t) => (
                    <tr key={t.id} className="ax-table__row" onClick={() => setSelId(t.id)} style={{ cursor: 'pointer', background: t.id === selId ? 'var(--ax-surface-subtle)' : undefined }}>
                      <td className="ax-table__td">
                        <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{t.numero}</div>
                        <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{TIPOS[t.tipo]}{t.producto ? ` · ${t.producto}` : ''}</div>
                      </td>
                      <td className="ax-table__td">
                        <div>{t.nombre}</div>
                        <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{t.email}</div>
                      </td>
                      <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--sm ${meta(t.estado).badge}`}>{meta(t.estado).label}</span></td>
                      {!selId && <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--sm ${prio(t.prioridad).badge}`}>{prio(t.prioridad).label}</span></td>}
                      {!selId && <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{fecha(t.createdAt)}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selId && (
          <section className="ax-card ax-col--7" role="region" aria-label="Detalle del ticket">
            <div className="ax-card__header">
              <div className="ax-card__titles">
                <h2 className="ax-card__title">{sel?.numero ?? 'Cargando…'}</h2>
                {sel && <p className="ax-card__subtitle">{TIPOS[sel.tipo]} · abierto {fecha(sel.createdAt)}</p>}
              </div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setSelId(null)} aria-label="Cerrar detalle">Cerrar</button>
            </div>
            {sel && (
              <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
                  <div className="ax-field" style={{ minWidth: 150 }}>
                    <label className="ax-label" htmlFor="t-estado">Estado</label>
                    <select id="t-estado" className="ax-select" value={sel.estado} disabled={guardando} onChange={(e) => actualizar({ estado: e.target.value as Estado })}>
                      {ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                    </select>
                  </div>
                  <div className="ax-field" style={{ minWidth: 130 }}>
                    <label className="ax-label" htmlFor="t-prio">Prioridad</label>
                    <select id="t-prio" className="ax-select" value={sel.prioridad} disabled={guardando} onChange={(e) => actualizar({ prioridad: e.target.value as Prioridad })}>
                      {PRIORIDADES.map((p) => <option key={p.v} value={p.v}>{p.label}</option>)}
                    </select>
                  </div>
                  <div className="ax-field" style={{ flex: '1 1 200px' }}>
                    <label className="ax-label" htmlFor="t-asig">Responsable (correo)</label>
                    <input id="t-asig" className="ax-input" type="email" maxLength={120} value={asignado} placeholder="sin asignar" onChange={(e) => setAsignado(e.target.value)} onBlur={() => asignado !== (sel.asignadoA ?? '') && actualizar({ asignadoA: asignado.trim() })} />
                  </div>
                </div>

                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--ax-space-2) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', margin: 0 }}>
                  {fila('Cliente', `${sel.nombre} (${sel.esEmpresa ? 'empresa' : 'persona natural'})`)}
                  {sel.documento && fila(sel.esEmpresa ? 'RUC' : 'DNI', sel.documento)}
                  {fila('Correo', <a href={`mailto:${sel.email}`}>{sel.email}</a>)}
                  {sel.celular && fila('Celular', <a href={`https://wa.me/51${sel.celular}`} target="_blank" rel="noreferrer">{sel.celular} (WhatsApp)</a>)}
                  {sel.numeroCompra && fila('Compra n.º', sel.numeroCompra)}
                  {sel.fechaCompra && fila('Fecha compra', sel.fechaCompra)}
                  {sel.producto && fila('Producto', sel.producto)}
                  {sel.comprobante && fila('Comprobante', sel.comprobante)}
                </dl>

                {sel.evidencias.length > 0 && (
                  <div className="ax-field">
                    <span className="ax-label">Evidencia ({sel.evidencias.length})</span>
                    <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                      {sel.evidencias.map((c, i) => (
                        <button key={c} type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => abrir(c)}>Archivo {i + 1}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="ax-field">
                  <span className="ax-label">Conversación e historial</span>
                  <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
                    <li style={{ padding: 'var(--ax-space-3)', background: 'var(--ax-surface-subtle)', borderRadius: 8, fontSize: 'var(--ax-text-sm)' }}>
                      <strong>{sel.nombre}</strong> <span style={{ color: 'var(--ax-text-subtle)' }}>· {fecha(sel.createdAt)} · caso inicial</span>
                      <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{sel.descripcion}</p>
                    </li>
                    {(sel.mensajes ?? []).map((m) =>
                      m.autor === 'SISTEMA' ? (
                        <li key={m.id} style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', textAlign: 'center' }}>
                          {fecha(m.createdAt)} · {m.texto}{m.autorNombre ? ` (${m.autorNombre})` : ''}
                        </li>
                      ) : (
                        <li key={m.id} style={{ padding: 'var(--ax-space-3)', borderRadius: 8, fontSize: 'var(--ax-text-sm)', background: m.interno ? 'var(--ax-warning-50, #fff8e1)' : m.autor === 'EQUIPO' ? 'var(--ax-primary-50, #e8f3fb)' : 'var(--ax-surface-subtle)', marginInlineStart: m.autor === 'EQUIPO' ? 'var(--ax-space-6)' : 0 }}>
                          <strong>{m.autor === 'EQUIPO' ? m.autorNombre ?? 'Equipo' : m.autorNombre ?? sel.nombre}</strong>{' '}
                          <span style={{ color: 'var(--ax-text-subtle)' }}>· {fecha(m.createdAt)}{m.interno ? ' · nota interna (el cliente no la ve)' : ''}</span>
                          <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{m.texto}</p>
                          {m.adjuntos.length > 0 && (
                            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginBlockStart: 6 }}>
                              {m.adjuntos.map((c, i) => <button key={c} type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrir(c)}>Adjunto {i + 1}</button>)}
                            </div>
                          )}
                        </li>
                      ),
                    )}
                  </ol>
                </div>

                {sel.estado !== 'CERRADO' && (
                  <form onSubmit={responder} className="ax-field">
                    <label className="ax-label" htmlFor="t-resp">{interno ? 'Nota interna' : 'Responder al cliente (se envía por correo)'}</label>
                    <textarea id="t-resp" className="ax-textarea" rows={4} maxLength={4000} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={interno ? 'Solo la ve el equipo…' : 'Escribe tu respuesta…'} />
                    <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 'var(--ax-text-sm)' }}>
                          <input type="checkbox" checked={interno} onChange={(e) => setInterno(e.target.checked)} /> Nota interna
                        </label>
                        {!interno && (
                          <select className="ax-select" aria-label="Estado después de responder" value={estadoAlResponder} onChange={(e) => setEstadoAlResponder(e.target.value as '' | Estado)}>
                            <option value="">Mantener estado</option>
                            <option value="ESPERANDO_CLIENTE">Pasar a Esperando cliente</option>
                            <option value="RESUELTO">Pasar a Resuelto</option>
                          </select>
                        )}
                      </div>
                      <button type="submit" className="ax-btn ax-btn--primary ax-btn--sm" disabled={guardando || !texto.trim()}>
                        <span className="ax-btn__label">{interno ? 'Guardar nota' : 'Enviar respuesta'}</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="ax-field">
                  <label className="ax-label" htmlFor="t-notas">Resumen interno</label>
                  <textarea id="t-notas" className="ax-textarea" rows={3} maxLength={2000} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Diagnóstico, acuerdos, próximos pasos…" />
                  <div className="ax-cluster" style={{ justifyContent: 'flex-end' }}>
                    <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" disabled={guardando || notas === (sel.notas ?? '')} onClick={() => actualizar({ notas })}>
                      <span className="ax-btn__label">Guardar resumen</span>
                    </button>
                  </div>
                </div>

                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={eliminar}>Eliminar ticket</button>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}

export default WebTickets;
