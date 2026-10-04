'use client';
/*
 * FPTecnologi-HUB — Web informativa → Tickets (GET /tickets). Reclamos, verificaciones y soporte técnico que los
 * clientes abren en /tickets de la web: datos de la compra, evidencia adjunta, estado y notas internas.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Estado = 'NUEVO' | 'EN_REVISION' | 'RESUELTO' | 'CERRADO';
type Tipo = 'RECLAMO' | 'VERIFICACION' | 'SOPORTE';

interface Ticket {
  id: string;
  numero: string;
  tipo: Tipo;
  estado: Estado;
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
}

const ESTADOS: { v: Estado; label: string; badge: string }[] = [
  { v: 'NUEVO', label: 'Nuevo', badge: 'ax-badge--info' },
  { v: 'EN_REVISION', label: 'En revisión', badge: 'ax-badge--warning' },
  { v: 'RESUELTO', label: 'Resuelto', badge: 'ax-badge--success' },
  { v: 'CERRADO', label: 'Cerrado', badge: 'ax-badge--neutral' },
];
const TIPOS: Record<Tipo, string> = { RECLAMO: 'Reclamo', VERIFICACION: 'Verificación', SOPORTE: 'Soporte técnico' };
const meta = (e: Estado) => ESTADOS.find((x) => x.v === e)!;
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
  const [notas, setNotas] = useState('');
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

  const sel = lista.find((t) => t.id === selId) ?? null;
  useEffect(() => {
    setNotas(sel?.notas ?? '');
  }, [sel?.id, sel?.notas]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter(
      (x) =>
        (!filtro || x.estado === filtro) &&
        (!tipo || x.tipo === tipo) &&
        (!t || `${x.numero} ${x.nombre} ${x.email} ${x.documento ?? ''} ${x.numeroCompra ?? ''} ${x.producto ?? ''}`.toLowerCase().includes(t)),
    );
  }, [lista, filtro, tipo, q]);

  const cuenta = (e: '' | Estado) => lista.filter((x) => !e || x.estado === e).length;

  async function actualizar(t: Ticket, cambios: { estado?: Estado; notas?: string }) {
    setGuardando(true);
    try {
      const nuevo = await api.patch<Ticket>(`/tickets/${t.id}`, cambios);
      setLista((ls) => ls.map((x) => (x.id === t.id ? nuevo : x)));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(t: Ticket) {
    if (!window.confirm(`¿Eliminar el ticket ${t.numero}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/tickets/${t.id}`);
      setSelId(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar (solo administradores).');
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
      <PageHead title="Tickets de soporte" subtitle="Reclamos, verificaciones y soporte técnico que abren los clientes desde la web." />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <div className="ax-dash-grid">
        <section className={`ax-card ${sel ? 'ax-col--8' : 'ax-col--12'}`} role="region" aria-label="Tickets" style={{ alignSelf: 'start' }}>
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
                  <th className="ax-table__th" scope="col">Recibido</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={4}>Cargando…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={4} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay tickets. Aparecerán cuando un cliente use /tickets en la web.' : 'Ningún ticket coincide con el filtro.'}</td></tr>
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
                      <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{fecha(t.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {sel && (
          <section className="ax-card ax-col--4" role="region" aria-label="Detalle del ticket">
            <div className="ax-card__header">
              <div className="ax-card__titles">
                <h2 className="ax-card__title">{sel.numero}</h2>
                <p className="ax-card__subtitle">{TIPOS[sel.tipo]}</p>
              </div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setSelId(null)} aria-label="Cerrar detalle">Cerrar</button>
            </div>
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--ax-space-2) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', margin: 0 }}>
                {fila('Cliente', `${sel.nombre} (${sel.esEmpresa ? 'empresa' : 'persona natural'})`)}
                {sel.documento && fila(sel.esEmpresa ? 'RUC' : 'DNI', sel.documento)}
                {fila('Correo', <a href={`mailto:${sel.email}`}>{sel.email}</a>)}
                {sel.celular && fila('Celular', <a href={`https://wa.me/51${sel.celular}`} target="_blank" rel="noreferrer">{sel.celular} (WhatsApp)</a>)}
                {sel.numeroCompra && fila('Compra n.º', sel.numeroCompra)}
                {sel.fechaCompra && fila('Fecha compra', sel.fechaCompra)}
                {sel.producto && fila('Producto', sel.producto)}
                {sel.comprobante && fila('Comprobante', sel.comprobante)}
                {fila('Recibido', fecha(sel.createdAt))}
                {sel.atendidoPor && fila('Gestionó', sel.atendidoPor)}
              </dl>

              <div className="ax-field">
                <span className="ax-label">Descripción</span>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 'var(--ax-text-sm)' }}>{sel.descripcion}</p>
              </div>

              {sel.evidencias.length > 0 && (
                <div className="ax-field">
                  <span className="ax-label">Evidencia ({sel.evidencias.length})</span>
                  <ul style={{ margin: 0, paddingInlineStart: '1.1rem', fontSize: 'var(--ax-text-sm)' }}>
                    {sel.evidencias.map((u, i) => (
                      <li key={u}><a href={u} target="_blank" rel="noreferrer noopener">Archivo {i + 1}</a></li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="ax-field">
                <label className="ax-label" htmlFor="ticket-estado">Estado</label>
                <select id="ticket-estado" className="ax-select" value={sel.estado} disabled={guardando} onChange={(e) => actualizar(sel, { estado: e.target.value as Estado })}>
                  {ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                </select>
              </div>

              <div className="ax-field">
                <label className="ax-label" htmlFor="ticket-notas">Notas internas</label>
                <textarea id="ticket-notas" className="ax-textarea" rows={4} maxLength={2000} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Diagnóstico, acuerdos, próximos pasos…" />
                <div className="ax-cluster" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" disabled={guardando || notas === (sel.notas ?? '')} onClick={() => actualizar(sel, { notas })}>
                    <span className="ax-btn__label">Guardar notas</span>
                  </button>
                </div>
              </div>

              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => eliminar(sel)}>Eliminar ticket</button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default WebTickets;
