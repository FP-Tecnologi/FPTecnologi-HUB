'use client';
/*
 * FPTecnologi-HUB — Web informativa → Contactos (GET /contacto-web). Bandeja
 * de las consultas del formulario de contacto y de los reclamos del Libro de
 * Reclamaciones: filtro por estado y tipo, búsqueda, detalle con correo/WhatsApp
 * en un clic, cambio de estado y notas internas. Exporta lo filtrado a CSV.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { VerEnCrm } from './crm/VerEnCrm';

type Estado = 'NUEVO' | 'CONTACTADO' | 'RESUELTO' | 'DESCARTADO';
type Tipo = 'CONTACTO' | 'RECLAMO' | 'TARJETA_BBVA'; // TARJETA_BBVA tiene su propia pantalla (web/bbva)

interface Contacto {
  id: string;
  tipo: Tipo;
  nombre: string;
  email: string;
  celular: string | null;
  empresa: string | null;
  mensaje: string;
  origen: string | null;
  estado: Estado;
  notas: string | null;
  atendidoPor: string | null;
  createdAt: string;
}

const ESTADOS: { v: Estado; label: string; badge: string }[] = [
  { v: 'NUEVO', label: 'Nuevo', badge: 'ax-badge--info' },
  { v: 'CONTACTADO', label: 'Contactado', badge: 'ax-badge--warning' },
  { v: 'RESUELTO', label: 'Resuelto', badge: 'ax-badge--success' },
  { v: 'DESCARTADO', label: 'Descartado', badge: 'ax-badge--neutral' },
];
const TIPOS: { v: '' | Tipo; label: string }[] = [
  { v: '', label: 'Todos' },
  { v: 'CONTACTO', label: 'Contacto' },
  { v: 'RECLAMO', label: 'Reclamos' },
];
const meta = (e: Estado) => ESTADOS.find((x) => x.v === e)!;

const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function csv(filas: Contacto[]) {
  const cab = ['Fecha', 'Tipo', 'Nombre', 'Empresa', 'Correo', 'Celular', 'Estado', 'Origen', 'Mensaje'];
  const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
  const datos = filas.map((c) => [fecha(c.createdAt), c.tipo, c.nombre, c.empresa ?? '', c.email, c.celular ?? '', meta(c.estado).label, c.origen ?? '', c.mensaje]);
  const blob = new Blob(['﻿' + [cab, ...datos].map((f) => f.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `contactos-web-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function ContactosWeb() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Contacto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<'' | Estado>('');
  const [tipo, setTipo] = useState<'' | Tipo>('');
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', celular: '', empresa: '', mensaje: '' });

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      setLista((await api.get<Contacto[]>('/contacto-web')).filter((c) => c.tipo !== 'TARJETA_BBVA'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los contactos.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Abre el contacto de ?id= (viene del aviso por correo/notificación).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) setSelId(id);
  }, []);

  const sel = lista.find((c) => c.id === selId) ?? null;
  useEffect(() => {
    setNotas(sel?.notas ?? '');
  }, [sel?.id, sel?.notas]);
  useEffect(() => {
    setEditando(false);
  }, [sel?.id]);

  function editar(c: Contacto) {
    setSelId(c.id);
    setForm({ nombre: c.nombre, email: c.email, celular: c.celular ?? '', empresa: c.empresa ?? '', mensaje: c.mensaje });
    setEditando(true);
  }

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter(
      (c) =>
        (!filtro || c.estado === filtro) &&
        (!tipo || c.tipo === tipo) &&
        (!t || `${c.nombre} ${c.empresa ?? ''} ${c.email} ${c.celular ?? ''} ${c.mensaje}`.toLowerCase().includes(t)),
    );
  }, [lista, filtro, tipo, q]);

  const cuenta = (e: '' | Estado) => lista.filter((c) => !e || c.estado === e).length;

  async function actualizar(c: Contacto, cambios: Partial<Pick<Contacto, 'estado' | 'notas' | 'nombre' | 'email' | 'celular' | 'empresa' | 'mensaje'>>) {
    setGuardando(true);
    try {
      const nuevo = await api.patch<Contacto>(`/contacto-web/${c.id}`, cambios);
      setLista((ls) => ls.map((x) => (x.id === c.id ? nuevo : x)));
      setError('');
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
      return false;
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(c: Contacto) {
    if (!window.confirm(`¿Eliminar el contacto de ${c.nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/contacto-web/${c.id}`);
      setSelId(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar.');
    }
  }

  return (
    <>
      <PageHead
        title="Contactos de la web"
        subtitle="Consultas del formulario de contacto y reclamos del Libro de Reclamaciones."
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
        <section className={`ax-card ${sel ? 'ax-col--8' : 'ax-col--12'}`} role="region" aria-label="Contactos" style={{ alignSelf: 'start' }}>
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
                <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Filtrar por tipo">
                  {TIPOS.map((t) => (
                    <button key={t.label} type="button" role="radio" aria-checked={tipo === t.v} className={`ax-btn ax-btn--sm${tipo === t.v ? ' is-selected' : ''}`} onClick={() => setTipo(t.v)}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <input type="search" className="ax-input" placeholder="Buscar nombre, empresa, correo…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar contactos" style={{ maxWidth: 260 }} />
            </div>
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col">Contacto</th>
                  <th className="ax-table__th" scope="col">Mensaje</th>
                  <th className="ax-table__th" scope="col">Estado</th>
                  <th className="ax-table__th" scope="col">Recibido</th>
                  <th className="ax-table__th" scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={5}>Cargando…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={5} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay contactos. Aparecerán cuando alguien use el formulario de la web.' : 'Ningún contacto coincide con el filtro.'}</td></tr>
                ) : (
                  visibles.map((c) => (
                    <tr key={c.id} className="ax-table__row" onClick={() => setSelId(c.id)} style={{ cursor: 'pointer', background: c.id === selId ? 'var(--ax-surface-subtle)' : undefined }}>
                      <td className="ax-table__td">
                        <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>
                          {c.nombre}{' '}
                          {c.tipo === 'RECLAMO' && <span className="ax-badge ax-badge--soft ax-badge--sm ax-badge--danger">Reclamo</span>}
                        </div>
                        <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{c.empresa || c.email}</div>
                      </td>
                      <td className="ax-table__td" style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.mensaje}</td>
                      <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--sm ${meta(c.estado).badge}`}>{meta(c.estado).label}</span></td>
                      <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{fecha(c.createdAt)}</td>
                      <td className="ax-table__td" onClick={(e) => e.stopPropagation()}>
                        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
                          {c.tipo === 'CONTACTO' && <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => editar(c)} aria-label={`Editar el contacto de ${c.nombre}`}>Editar</button>}
                          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => eliminar(c)} aria-label={`Eliminar el contacto de ${c.nombre}`} style={{ color: 'var(--ax-danger-500)' }}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {sel && (
          <section className="ax-card ax-col--4" role="region" aria-label="Detalle del contacto">
            <div className="ax-card__header">
              <div className="ax-card__titles">
                <h2 className="ax-card__title">{sel.nombre}</h2>
                <p className="ax-card__subtitle">{sel.tipo === 'RECLAMO' ? 'Libro de Reclamaciones' : 'Formulario de contacto'}</p>
              </div>
              {sel.tipo === 'CONTACTO' && <VerEnCrm origen="CONTACTO_WEB" id={sel.id} />}
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setSelId(null)} aria-label="Cerrar detalle">Cerrar</button>
            </div>
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              {editando ? (
                <form
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (await actualizar(sel, form)) setEditando(false);
                  }}
                >
                  {([['nombre', 'Nombre'], ['email', 'Correo'], ['celular', 'Celular'], ['empresa', 'Empresa']] as const).map(([k, label]) => (
                    <div className="ax-field" key={k}>
                      <label className="ax-label" htmlFor={`contacto-${k}`}>{label}</label>
                      <input id={`contacto-${k}`} className="ax-input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} maxLength={120} required={k === 'nombre' || k === 'email'} type={k === 'email' ? 'email' : 'text'} />
                    </div>
                  ))}
                  <div className="ax-field">
                    <label className="ax-label" htmlFor="contacto-mensaje">Mensaje</label>
                    <textarea id="contacto-mensaje" className="ax-textarea" rows={4} maxLength={3000} required value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} />
                  </div>
                  <div className="ax-cluster" style={{ justifyContent: 'flex-end' }}>
                    <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setEditando(false)}>Cancelar</button>
                    <button type="submit" className="ax-btn ax-btn--primary ax-btn--sm" disabled={guardando}><span className="ax-btn__label">Guardar cambios</span></button>
                  </div>
                </form>
              ) : (<>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--ax-space-2) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', margin: 0 }}>
                {sel.empresa && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Empresa</dt><dd style={{ margin: 0 }}>{sel.empresa}</dd></>)}
                <dt style={{ color: 'var(--ax-text-muted)' }}>Correo</dt>
                <dd style={{ margin: 0, wordBreak: 'break-all' }}><a href={`mailto:${sel.email}`}>{sel.email}</a></dd>
                {sel.celular && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Celular</dt><dd style={{ margin: 0 }}><a href={`https://wa.me/51${sel.celular}`} target="_blank" rel="noreferrer">{sel.celular} (WhatsApp)</a></dd></>)}
                {sel.origen && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Página</dt><dd style={{ margin: 0 }}>{sel.origen}</dd></>)}
                <dt style={{ color: 'var(--ax-text-muted)' }}>Recibido</dt>
                <dd style={{ margin: 0 }}>{fecha(sel.createdAt)}</dd>
                {sel.atendidoPor && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Gestionó</dt><dd style={{ margin: 0 }}>{sel.atendidoPor}</dd></>)}
              </dl>

              <div className="ax-field">
                <span className="ax-label">Mensaje</span>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 'var(--ax-text-sm)' }}>{sel.mensaje}</p>
              </div>
              </>)}

              <div className="ax-field">
                <label className="ax-label" htmlFor="contacto-estado">Estado</label>
                <select id="contacto-estado" className="ax-select" value={sel.estado} disabled={guardando} onChange={(e) => actualizar(sel, { estado: e.target.value as Estado })}>
                  {ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                </select>
              </div>

              <div className="ax-field">
                <label className="ax-label" htmlFor="contacto-notas">Notas internas</label>
                <textarea id="contacto-notas" className="ax-textarea" rows={4} maxLength={2000} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Llamada, acuerdos, próximos pasos…" />
                <div className="ax-cluster" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" disabled={guardando || notas === (sel.notas ?? '')} onClick={() => actualizar(sel, { notas })}>
                    <span className="ax-btn__label">Guardar notas</span>
                  </button>
                </div>
              </div>

              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
                {!editando && sel.tipo === 'CONTACTO' && <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => editar(sel)}>Editar datos</button>}
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={() => eliminar(sel)}>Eliminar contacto</button>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default ContactosWeb;
