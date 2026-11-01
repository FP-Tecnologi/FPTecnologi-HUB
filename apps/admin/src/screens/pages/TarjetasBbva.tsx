'use client';
/*
 * FPTecnologi-HUB — Herramientas web → Tarjetas BBVA. Leads de la landing
 * /tarjetas-bbva: cada consulta de ofertas (ContactoWeb tipo TARJETA_BBVA, vía
 * GET /contacto-web) con DNI, celular, correo, ofertas que mostró BBVA y la
 * tarjeta elegida. Filtro por estado y por «solicitó / sin ofertas», búsqueda,
 * detalle con WhatsApp/correo, estado, notas internas y CSV.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { teclaFila } from '../../lib/teclado';

type Estado = 'NUEVO' | 'CONTACTADO' | 'RESUELTO' | 'DESCARTADO';
type Vista = '' | 'solicito' | 'ofertas' | 'sin-ofertas';

interface Contacto {
  id: string;
  tipo: 'CONTACTO' | 'RECLAMO' | 'TARJETA_BBVA';
  nombre: string;
  email: string;
  celular: string | null;
  mensaje: string;
  origen: string | null;
  estado: Estado;
  notas: string | null;
  atendidoPor: string | null;
  createdAt: string;
}

interface Consulta extends Contacto {
  dni: string;
  ofertas: string[];
  solicito: string | null;
}

const ESTADOS: { v: Estado; label: string; badge: string }[] = [
  { v: 'NUEVO', label: 'Nuevo', badge: 'ax-badge--info' },
  { v: 'CONTACTADO', label: 'Contactado', badge: 'ax-badge--warning' },
  { v: 'RESUELTO', label: 'Resuelto', badge: 'ax-badge--success' },
  { v: 'DESCARTADO', label: 'Descartado', badge: 'ax-badge--neutral' },
];
const VISTAS: { v: Vista; label: string }[] = [
  { v: '', label: 'Todas' },
  { v: 'solicito', label: 'Eligieron tarjeta' },
  { v: 'ofertas', label: 'Con ofertas' },
  { v: 'sin-ofertas', label: 'Sin ofertas' },
];
const meta = (e: Estado) => ESTADOS.find((x) => x.v === e)!;

const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Lee el texto que arma la API: «DNI: …», líneas «• Tarjeta: línea … · TEA …» y «Solicitó: …». */
function leer(c: Contacto): Consulta {
  const dni = /DNI:\s*(\d{8})/.exec(c.mensaje)?.[1] ?? '';
  const ofertas = c.mensaje.split('\n').filter((l) => l.startsWith('• ')).map((l) => l.slice(2));
  const solicito = /Solicitó:\s*(.+)$/m.exec(c.mensaje)?.[1]?.trim() ?? null;
  return { ...c, dni, ofertas, solicito };
}

function csv(filas: Consulta[]) {
  const cab = ['Fecha', 'Nombre', 'DNI', 'Correo', 'Celular', 'Estado', 'Ofertas', 'Eligió', 'Página'];
  const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
  const datos = filas.map((c) => [fecha(c.createdAt), c.nombre, c.dni, c.email, c.celular ?? '', meta(c.estado).label, c.ofertas.join(' | '), c.solicito ?? '', c.origen ?? '']);
  const blob = new Blob(['﻿' + [cab, ...datos].map((f) => f.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `tarjetas-bbva-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function TarjetasBbva() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Consulta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<'' | Estado>('');
  const [vista, setVista] = useState<Vista>('');
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      const todos = await api.get<Contacto[]>('/contacto-web');
      setLista(todos.filter((c) => c.tipo === 'TARJETA_BBVA').map(leer));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las consultas.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Abre la consulta de ?id= (viene del aviso por correo/notificación).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) setSelId(id);
  }, []);

  const sel = lista.find((c) => c.id === selId) ?? null;
  useEffect(() => {
    setNotas(sel?.notas ?? '');
  }, [sel?.id, sel?.notas]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter(
      (c) =>
        (!filtro || c.estado === filtro) &&
        (vista === '' || (vista === 'solicito' ? !!c.solicito : vista === 'ofertas' ? c.ofertas.length > 0 : c.ofertas.length === 0)) &&
        (!t || `${c.nombre} ${c.dni} ${c.email} ${c.celular ?? ''}`.toLowerCase().includes(t)),
    );
  }, [lista, filtro, vista, q]);

  const cuenta = (e: '' | Estado) => lista.filter((c) => !e || c.estado === e).length;
  const conOfertas = lista.filter((c) => c.ofertas.length > 0).length;
  const conSolicitud = lista.filter((c) => c.solicito).length;

  async function actualizar(c: Consulta, cambios: { estado?: Estado; notas?: string }) {
    setGuardando(true);
    try {
      const nuevo = await api.patch<Contacto>(`/contacto-web/${c.id}`, cambios);
      setLista((ls) => ls.map((x) => (x.id === c.id ? leer(nuevo) : x)));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(c: Consulta) {
    if (!window.confirm(`¿Eliminar la consulta de ${c.nombre}? Esta acción no se puede deshacer.`)) return;
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
        title="Tarjetas BBVA"
        subtitle="Consultas de la landing /tarjetas-bbva: quién consultó, qué ofertas le salieron y qué tarjeta eligió. La contratación se completa en BBVA."
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

      <div className="ax-cluster" style={{ gap: 'var(--ax-space-4)', flexWrap: 'wrap', marginBlockEnd: 'var(--ax-space-4)' }}>
        {[
          { label: 'Consultas', valor: lista.length },
          { label: 'Con ofertas', valor: conOfertas },
          { label: 'Eligieron tarjeta', valor: conSolicitud },
          { label: 'Por atender', valor: cuenta('NUEVO') },
        ].map((k) => (
          <div key={k.label} className="ax-card" style={{ minWidth: 150, flex: '1 1 150px' }}>
            <div className="ax-card__body">
              <div style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{k.label}</div>
              <div style={{ fontSize: 'var(--ax-text-2xl, 1.75rem)', fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{k.valor}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ax-dash-grid">
        <section className={`ax-card ${sel ? 'ax-col--8' : 'ax-col--12'}`} role="region" aria-label="Consultas BBVA" style={{ alignSelf: 'start' }}>
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
                <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Filtrar por resultado">
                  {VISTAS.map((t) => (
                    <button key={t.label} type="button" role="radio" aria-checked={vista === t.v} className={`ax-btn ax-btn--sm${vista === t.v ? ' is-selected' : ''}`} onClick={() => setVista(t.v)}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <input type="search" className="ax-input" placeholder="Buscar nombre, DNI, correo…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar consultas" style={{ maxWidth: 260 }} />
            </div>
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col">Cliente</th>
                  <th className="ax-table__th" scope="col">Ofertas</th>
                  <th className="ax-table__th" scope="col">Eligió</th>
                  <th className="ax-table__th" scope="col">Estado</th>
                  <th className="ax-table__th" scope="col">Recibido</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={5}>Cargando…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={5} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay consultas. Aparecerán cuando alguien use la landing de tarjetas BBVA.' : 'Ninguna consulta coincide con el filtro.'}</td></tr>
                ) : (
                  visibles.map((c) => (
                    <tr key={c.id} className="ax-table__row" onClick={() => setSelId(c.id)} tabIndex={0} onKeyDown={teclaFila(() => setSelId(c.id))} style={{ cursor: 'pointer', background: c.id === selId ? 'var(--ax-surface-subtle)' : undefined }}>
                      <td className="ax-table__td">
                        <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{c.nombre}</div>
                        <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{c.dni ? `DNI ${c.dni} · ` : ''}{c.celular || c.email}</div>
                      </td>
                      <td className="ax-table__td">
                        {c.ofertas.length > 0 ? <span className="ax-badge ax-badge--soft ax-badge--sm ax-badge--info">{c.ofertas.length} {c.ofertas.length === 1 ? 'oferta' : 'ofertas'}</span> : <span style={{ color: 'var(--ax-text-muted)' }}>Sin ofertas</span>}
                      </td>
                      <td className="ax-table__td">{c.solicito ? <span className="ax-badge ax-badge--soft ax-badge--sm ax-badge--success">{c.solicito}</span> : <span style={{ color: 'var(--ax-text-muted)' }}>—</span>}</td>
                      <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--sm ${meta(c.estado).badge}`}>{meta(c.estado).label}</span></td>
                      <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{fecha(c.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {sel && (
          <section className="ax-card ax-col--4" role="region" aria-label="Detalle de la consulta">
            <div className="ax-card__header">
              <div className="ax-card__titles">
                <h2 className="ax-card__title">{sel.nombre}</h2>
                <p className="ax-card__subtitle">Consulta de tarjetas BBVA</p>
              </div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setSelId(null)} aria-label="Cerrar detalle">Cerrar</button>
            </div>
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--ax-space-2) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', margin: 0 }}>
                {sel.dni && (<><dt style={{ color: 'var(--ax-text-muted)' }}>DNI</dt><dd style={{ margin: 0 }}>{sel.dni}</dd></>)}
                <dt style={{ color: 'var(--ax-text-muted)' }}>Correo</dt>
                <dd style={{ margin: 0, wordBreak: 'break-all' }}><a href={`mailto:${sel.email}`}>{sel.email}</a></dd>
                {sel.celular && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Celular</dt><dd style={{ margin: 0 }}><a href={`https://wa.me/51${sel.celular}`} target="_blank" rel="noreferrer">{sel.celular} (WhatsApp)</a></dd></>)}
                {sel.origen && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Página</dt><dd style={{ margin: 0 }}>{sel.origen}</dd></>)}
                <dt style={{ color: 'var(--ax-text-muted)' }}>Recibido</dt>
                <dd style={{ margin: 0 }}>{fecha(sel.createdAt)}</dd>
                {sel.atendidoPor && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Gestionó</dt><dd style={{ margin: 0 }}>{sel.atendidoPor}</dd></>)}
              </dl>

              <div className="ax-field">
                <span className="ax-label">Ofertas de BBVA</span>
                {sel.ofertas.length > 0 ? (
                  <ul style={{ margin: 0, paddingInlineStart: 'var(--ax-space-4)', fontSize: 'var(--ax-text-sm)' }}>
                    {sel.ofertas.map((o) => <li key={o}>{o}</li>)}
                  </ul>
                ) : (
                  <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>BBVA no devolvió ofertas para este DNI.</p>
                )}
              </div>

              <div className="ax-field">
                <span className="ax-label">Tarjeta elegida</span>
                <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)' }}>{sel.solicito ?? 'Todavía no pasó a solicitarla en BBVA.'}</p>
              </div>

              <div className="ax-field">
                <label className="ax-label" htmlFor="bbva-estado">Estado</label>
                <select id="bbva-estado" className="ax-select" value={sel.estado} disabled={guardando} onChange={(e) => actualizar(sel, { estado: e.target.value as Estado })}>
                  {ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                </select>
              </div>

              <div className="ax-field">
                <label className="ax-label" htmlFor="bbva-notas">Notas internas</label>
                <textarea id="bbva-notas" className="ax-textarea" rows={4} maxLength={2000} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Llamada, acuerdos, próximos pasos…" />
                <div className="ax-cluster" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" disabled={guardando || notas === (sel.notas ?? '')} onClick={() => actualizar(sel, { notas })}>
                    <span className="ax-btn__label">Guardar notas</span>
                  </button>
                </div>
              </div>

              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => eliminar(sel)}>Eliminar consulta</button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default TarjetasBbva;
