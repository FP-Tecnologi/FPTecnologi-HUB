'use client';
/*
 * FPTecnologi-HUB — Cotizador → Leads (GET /cotizador/leads). Bandeja de las
 * solicitudes del formulario público: filtro por estado, búsqueda, detalle con
 * datos de contacto (correo/WhatsApp en un clic), cambio de estado y notas
 * internas. Exporta lo filtrado a CSV.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Estado = 'NUEVO' | 'CONTACTADO' | 'COTIZADO' | 'GANADO' | 'PERDIDO';

interface Lead {
  id: string;
  nombres: string;
  apellidos: string;
  tipoPersona: 'NATURAL' | 'JURIDICA';
  tipoDocumento: string;
  nroDocumento: string;
  empresa: string | null;
  email: string;
  celular: string;
  interes: string;
  mensaje: string | null;
  origen: string | null;
  estado: Estado;
  notas: string | null;
  atendidoPor: string | null;
  createdAt: string;
  updatedAt: string;
}

const ESTADOS: { v: Estado; label: string; badge: string }[] = [
  { v: 'NUEVO', label: 'Nuevo', badge: 'ax-badge--info' },
  { v: 'CONTACTADO', label: 'Contactado', badge: 'ax-badge--warning' },
  { v: 'COTIZADO', label: 'Cotizado', badge: 'ax-badge--neutral' },
  { v: 'GANADO', label: 'Ganado', badge: 'ax-badge--success' },
  { v: 'PERDIDO', label: 'Perdido', badge: 'ax-badge--danger' },
];
const meta = (e: Estado) => ESTADOS.find((x) => x.v === e)!;

const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const nombre = (l: Lead) => `${l.nombres} ${l.apellidos}`;

function csv(leads: Lead[]) {
  const cab = ['Fecha', 'Nombres', 'Apellidos', 'Tipo persona', 'Documento', 'Nro documento', 'Empresa', 'Correo', 'Celular', 'Interés', 'Estado', 'Mensaje'];
  const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
  const filas = leads.map((l) => [fecha(l.createdAt), l.nombres, l.apellidos, l.tipoPersona === 'JURIDICA' ? 'Jurídica' : 'Natural', l.tipoDocumento, l.nroDocumento, l.empresa ?? '', l.email, l.celular, l.interes, meta(l.estado).label, l.mensaje ?? '']);
  const blob = new Blob(['﻿' + [cab, ...filas].map((f) => f.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `leads-cotizador-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function CotizadorLeads() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Lead[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<'' | Estado>('');
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      setLista(await api.get<Lead[]>('/cotizador/leads'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los leads.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Abre el lead de ?id= (viene del aviso por correo/notificación).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) setSelId(id);
  }, []);

  const sel = lista.find((l) => l.id === selId) ?? null;
  useEffect(() => {
    setNotas(sel?.notas ?? '');
  }, [sel?.id, sel?.notas]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter((l) => (!filtro || l.estado === filtro) && (!t || `${nombre(l)} ${l.empresa ?? ''} ${l.email} ${l.celular} ${l.nroDocumento} ${l.interes}`.toLowerCase().includes(t)));
  }, [lista, filtro, q]);

  const cuenta = (e: '' | Estado) => lista.filter((l) => !e || l.estado === e).length;

  async function actualizar(l: Lead, cambios: { estado?: Estado; notas?: string }) {
    setGuardando(true);
    try {
      const nuevo = await api.patch<Lead>(`/cotizador/leads/${l.id}`, cambios);
      setLista((ls) => ls.map((x) => (x.id === l.id ? nuevo : x)));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(l: Lead) {
    if (!window.confirm(`¿Eliminar el lead de ${nombre(l)}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/cotizador/leads/${l.id}`);
      setSelId(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar.');
    }
  }

  return (
    <>
      <PageHead
        title="Leads del cotizador"
        subtitle="Solicitudes de cotización que llegan desde el formulario de la web."
        actions={
          <button type="button" className="ax-btn ax-btn--secondary" disabled={visibles.length === 0} onClick={() => csv(visibles)}>
            <span className="ax-btn__label">Exportar CSV</span>
          </button>
        }
      />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <div className="ax-dash-grid">
        <section className={`ax-card ${sel ? 'ax-col--8' : 'ax-col--12'}`} role="region" aria-label="Leads" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body">
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
              <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Filtrar por estado">
                {([{ v: '' as const, label: 'Todos' }, ...ESTADOS] as { v: '' | Estado; label: string }[]).map((e) => (
                  <button key={e.label} type="button" role="radio" aria-checked={filtro === e.v} className={`ax-btn ax-btn--sm${filtro === e.v ? ' is-selected' : ''}`} onClick={() => setFiltro(e.v)}>
                    {e.label} ({cuenta(e.v)})
                  </button>
                ))}
              </div>
              </div>
              <input type="search" className="ax-input" placeholder="Buscar nombre, empresa, documento…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar leads" style={{ maxWidth: 300 }} />
            </div>
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col">Contacto</th>
                  <th className="ax-table__th" scope="col">Interés</th>
                  <th className="ax-table__th" scope="col">Estado</th>
                  <th className="ax-table__th" scope="col">Recibido</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={4}>Cargando…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={4} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay leads. Aparecerán cuando alguien llene el cotizador.' : 'Ningún lead coincide con el filtro.'}</td></tr>
                ) : (
                  visibles.map((l) => (
                    <tr key={l.id} className="ax-table__row" onClick={() => setSelId(l.id)} style={{ cursor: 'pointer', background: l.id === selId ? 'var(--ax-surface-subtle)' : undefined }}>
                      <td className="ax-table__td">
                        <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{nombre(l)}</div>
                        <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                          {l.empresa || (l.tipoPersona === 'NATURAL' ? 'Persona natural' : '—')} · {l.tipoDocumento} {l.nroDocumento}
                        </div>
                      </td>
                      <td className="ax-table__td">{l.interes}</td>
                      <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--sm ${meta(l.estado).badge}`}>{meta(l.estado).label}</span></td>
                      <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{fecha(l.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {sel && (
          <section className="ax-card ax-col--4" role="region" aria-label="Detalle del lead">
            <div className="ax-card__header">
              <div className="ax-card__titles">
                <h2 className="ax-card__title">{nombre(sel)}</h2>
                <p className="ax-card__subtitle">{sel.tipoPersona === 'JURIDICA' ? 'Persona jurídica' : 'Persona natural'} · {sel.tipoDocumento} {sel.nroDocumento}</p>
              </div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setSelId(null)} aria-label="Cerrar detalle">Cerrar</button>
            </div>
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--ax-space-2) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', margin: 0 }}>
                {sel.empresa && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Empresa</dt><dd style={{ margin: 0 }}>{sel.empresa}</dd></>)}
                <dt style={{ color: 'var(--ax-text-muted)' }}>Correo</dt>
                <dd style={{ margin: 0, wordBreak: 'break-all' }}><a href={`mailto:${sel.email}`}>{sel.email}</a></dd>
                <dt style={{ color: 'var(--ax-text-muted)' }}>Celular</dt>
                <dd style={{ margin: 0 }}>
                  <a href={`https://wa.me/51${sel.celular}`} target="_blank" rel="noreferrer">{sel.celular} (WhatsApp)</a>
                </dd>
                <dt style={{ color: 'var(--ax-text-muted)' }}>Interés</dt>
                <dd style={{ margin: 0 }}>{sel.interes}</dd>
                <dt style={{ color: 'var(--ax-text-muted)' }}>Recibido</dt>
                <dd style={{ margin: 0 }}>{fecha(sel.createdAt)}</dd>
                {sel.atendidoPor && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Gestionó</dt><dd style={{ margin: 0 }}>{sel.atendidoPor}</dd></>)}
              </dl>

              {sel.mensaje && (
                <div className="ax-field">
                  <span className="ax-label">Mensaje del cliente</span>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 'var(--ax-text-sm)' }}>{sel.mensaje}</p>
                </div>
              )}

              <div className="ax-field">
                <label className="ax-label" htmlFor="lead-estado">Estado</label>
                <select id="lead-estado" className="ax-select" value={sel.estado} disabled={guardando} onChange={(e) => actualizar(sel, { estado: e.target.value as Estado })}>
                  {ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                </select>
              </div>

              <div className="ax-field">
                <label className="ax-label" htmlFor="lead-notas">Notas internas</label>
                <textarea id="lead-notas" className="ax-textarea" rows={4} maxLength={2000} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Llamada, acuerdos, próximos pasos…" />
                <div className="ax-cluster" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" disabled={guardando || notas === (sel.notas ?? '')} onClick={() => actualizar(sel, { notas })}>
                    <span className="ax-btn__label">Guardar notas</span>
                  </button>
                </div>
              </div>

              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => eliminar(sel)}>Eliminar lead</button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default CotizadorLeads;
