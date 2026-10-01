'use client';
/*
 * FPTecnologi-HUB — Web informativa → Proyectos (GET/POST/PATCH/DELETE /proyectos).
 * Proyectos de referencia que se ven en /proyectos y en el mapa del home.
 * "Dato de muestra" = no es un caso real: la web lo muestra igual, pero el
 * asistente virtual no lo cita como referencia.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { DEPARTAMENTOS } from '../../lib/departamentos';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

interface Proyecto {
  id: string;
  titulo: string;
  departamento: string;
  imagenUrl: string | null;
  cliente: string;
  anio: number;
  descripcion: string;
  alcance: string[];
  orden: number;
  activo: boolean;
  esEjemplo: boolean;
}
interface Form {
  titulo: string; departamento: string; cliente: string; anio: string; imagenUrl: string;
  descripcion: string; alcance: string; orden: string; activo: boolean; esEjemplo: boolean;
}

const VACIO: Form = { titulo: '', departamento: 'lima', cliente: '', anio: String(new Date().getFullYear()), imagenUrl: '', descripcion: '', alcance: '', orden: '0', activo: true, esEjemplo: false };
const nombreDpto = (id: string) => DEPARTAMENTOS.find((d) => d.id === id)?.name ?? id;
const desde = (p: Proyecto): Form => ({
  titulo: p.titulo, departamento: p.departamento, cliente: p.cliente, anio: String(p.anio), imagenUrl: p.imagenUrl ?? '',
  descripcion: p.descripcion, alcance: p.alcance.join('\n'), orden: String(p.orden), activo: p.activo, esEjemplo: p.esEjemplo,
});
const src = (u: string | null) => (u ? (u.startsWith('/') ? `${WEB}${u}` : u) : null);

export function WebProyectos() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<{ id: string | null; form: Form } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      setLista(await api.get<Proyecto[]>('/proyectos'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los proyectos.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter((p) => !t || `${p.titulo} ${p.cliente} ${nombreDpto(p.departamento)}`.toLowerCase().includes(t));
  }, [lista, q]);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setEdit((e) => (e ? { ...e, form: { ...e.form, [k]: v } } : e));
  }

  async function guardar() {
    if (!edit) return;
    const f = edit.form;
    const anio = Number(f.anio);
    const orden = Number(f.orden);
    if (f.titulo.trim().length < 3 || !f.cliente.trim()) return setError('El título y el cliente son obligatorios.');
    if (!Number.isInteger(anio) || anio < 1990 || anio > 2100) return setError('El año no es válido.');
    if (!Number.isInteger(orden) || orden < 0) return setError('El orden debe ser un entero mayor o igual a 0.');
    if (f.imagenUrl.trim() && !/^(https?:\/\/|\/)/.test(f.imagenUrl.trim())) return setError('La imagen debe ser una URL (https://…) o una ruta que empiece con /.');
    const body = {
      titulo: f.titulo.trim(), departamento: f.departamento, cliente: f.cliente.trim(), anio,
      imagenUrl: f.imagenUrl.trim(), descripcion: f.descripcion.trim(),
      alcance: f.alcance.split('\n').map((l) => l.trim()).filter(Boolean),
      orden, activo: f.activo, esEjemplo: f.esEjemplo,
    };
    setGuardando(true);
    setError('');
    try {
      if (edit.id) await api.patch(`/proyectos/${edit.id}`, body);
      else await api.post('/proyectos', body);
      setOk(edit.id ? 'Proyecto actualizado.' : 'Proyecto creado.');
      setEdit(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar el proyecto.');
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActivo(p: Proyecto) {
    try {
      await api.patch(`/proyectos/${p.id}`, { activo: !p.activo });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo actualizar.');
    }
  }

  async function borrar() {
    if (!edit?.id || !window.confirm('¿Eliminar este proyecto?')) return;
    try {
      await api.delete(`/proyectos/${edit.id}`);
      setOk('Proyecto eliminado.');
      setEdit(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar.');
    }
  }

  return (
    <>
      <PageHead
        title="Proyectos"
        subtitle={`Proyectos de referencia de la web (${lista.length}). Marca como "dato de muestra" los que no son casos reales.`}
        actions={
          <button type="button" className="ax-btn ax-btn--primary" onClick={() => { setOk(''); setError(''); setEdit({ id: null, form: { ...VACIO, orden: String(lista.length + 1) } }); }}>
            <span className="ax-btn__label">Nuevo proyecto</span>
          </button>
        }
      />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}
      {ok && !error && <p role="status" style={{ marginBlockEnd: 'var(--ax-space-4)', color: 'var(--ax-success-500, #2f9e62)', fontSize: 'var(--ax-text-sm)' }}>{ok}</p>}

      <div className="ax-dash-grid">
        <section className={`ax-card ${edit ? 'ax-col--7' : 'ax-col--12'}`} role="region" aria-label="Proyectos" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body">
            <input type="search" className="ax-input" placeholder="Buscar título, cliente o región…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar proyectos" style={{ maxWidth: 320 }} />
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col">Proyecto</th>
                  <th className="ax-table__th" scope="col">Región</th>
                  <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Año</th>
                  <th className="ax-table__th" scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={4}>Cargando…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={4} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay proyectos.' : 'Ningún proyecto coincide.'}</td></tr>
                ) : (
                  visibles.map((p) => (
                    <tr key={p.id} className="ax-table__row" onClick={() => { setOk(''); setError(''); setEdit({ id: p.id, form: desde(p) }); }} style={{ cursor: 'pointer', background: edit?.id === p.id ? 'var(--ax-surface-subtle)' : undefined }}>
                      <td className="ax-table__td">
                        <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                          <span style={{ width: 52, height: 40, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: 'var(--ax-surface-subtle)' }}>
                            {src(p.imagenUrl) && <img src={src(p.imagenUrl)!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titulo}</div>
                            <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{p.cliente}{p.esEjemplo ? ' · dato de muestra' : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="ax-table__td">{nombreDpto(p.departamento)}</td>
                      <td className="ax-table__td" style={{ textAlign: 'right' }}>{p.anio}</td>
                      <td className="ax-table__td">
                        <button type="button" className={`ax-badge ax-badge--soft ax-badge--sm ${p.activo ? 'ax-badge--success' : 'ax-badge--neutral'}`} style={{ cursor: 'pointer', border: 0 }} onClick={(e) => { e.stopPropagation(); void alternarActivo(p); }}>
                          {p.activo ? 'Visible' : 'Oculto'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {edit && (
          <section className="ax-card ax-col--5" role="region" aria-label="Editar proyecto">
            <div className="ax-card__header">
              <div className="ax-card__titles"><h2 className="ax-card__title">{edit.id ? 'Editar proyecto' : 'Nuevo proyecto'}</h2></div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setEdit(null)}>Cerrar</button>
            </div>
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
              <div className="ax-field">
                <label className="ax-label" htmlFor="pr-titulo">Título</label>
                <input id="pr-titulo" className="ax-input" value={edit.form.titulo} onChange={(e) => set('titulo', e.target.value)} />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="pr-cliente">Cliente</label>
                <input id="pr-cliente" className="ax-input" value={edit.form.cliente} onChange={(e) => set('cliente', e.target.value)} />
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                <div className="ax-field" style={{ flex: 1 }}>
                  <label className="ax-label" htmlFor="pr-dpto">Región</label>
                  <select id="pr-dpto" className="ax-select" value={edit.form.departamento} onChange={(e) => set('departamento', e.target.value)}>
                    {DEPARTAMENTOS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="ax-field" style={{ flex: '0 0 90px' }}>
                  <label className="ax-label" htmlFor="pr-anio">Año</label>
                  <input id="pr-anio" className="ax-input" inputMode="numeric" value={edit.form.anio} onChange={(e) => set('anio', e.target.value)} />
                </div>
                <div className="ax-field" style={{ flex: '0 0 80px' }}>
                  <label className="ax-label" htmlFor="pr-orden">Orden</label>
                  <input id="pr-orden" className="ax-input" inputMode="numeric" value={edit.form.orden} onChange={(e) => set('orden', e.target.value)} />
                </div>
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="pr-img">Imagen (URL o ruta que empiece con /)</label>
                <input id="pr-img" className="ax-input" value={edit.form.imagenUrl} onChange={(e) => set('imagenUrl', e.target.value)} />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="pr-desc">Descripción</label>
                <textarea id="pr-desc" className="ax-textarea" rows={4} value={edit.form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="pr-alc">Alcance (uno por línea)</label>
                <textarea id="pr-alc" className="ax-textarea" rows={3} value={edit.form.alcance} onChange={(e) => set('alcance', e.target.value)} placeholder="Videovigilancia&#10;Fibra óptica" />
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-5)' }}>
                <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)' }}>
                  <input type="checkbox" className="ax-switch" checked={edit.form.activo} onChange={(e) => set('activo', e.target.checked)} /> Visible en la web
                </label>
                <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)' }}>
                  <input type="checkbox" className="ax-switch" checked={edit.form.esEjemplo} onChange={(e) => set('esEjemplo', e.target.checked)} /> Dato de muestra
                </label>
              </div>
            </div>
            <div className="ax-card__body" style={{ borderTop: '1px solid var(--ax-border)', display: 'flex', justifyContent: 'space-between', gap: 'var(--ax-space-3)' }}>
              <div>{edit.id && <button type="button" className="ax-btn ax-btn--ghost" onClick={() => void borrar()} disabled={guardando}>Eliminar</button>}</div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEdit(null)} disabled={guardando}>Cancelar</button>
                <button type="button" className={`ax-btn ax-btn--primary${guardando ? ' is-loading' : ''}`} onClick={() => void guardar()} disabled={guardando}>
                  <span className="ax-btn__label">{edit.id ? 'Guardar cambios' : 'Crear proyecto'}</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default WebProyectos;
