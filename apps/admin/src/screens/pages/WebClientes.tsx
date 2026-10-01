'use client';
/*
 * FPTecnologi-HUB — Web informativa → Clientes (GET/POST/PATCH/DELETE /clientes).
 * Clientes de la sección "Nuestros clientes" (home y Nosotros), agrupados por
 * sector. "Dato de muestra" = nombre genérico, no un cliente real: se ve en
 * la web pero el asistente virtual no lo cita.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

const SECTORES = [['gobierno', 'Sector gobierno'], ['educacion', 'Educación'], ['privado', 'Sector privado']] as const;
const etiquetaSector = (k: string) => SECTORES.find(([v]) => v === k)?.[1] ?? k;

interface Cliente {
  id: string;
  nombre: string;
  sigla: string;
  logoUrl: string | null;
  sector: string;
  orden: number;
  activo: boolean;
  esEjemplo: boolean;
}
interface Form { nombre: string; sigla: string; logoUrl: string; sector: string; orden: string; activo: boolean; esEjemplo: boolean }

const VACIO: Form = { nombre: '', sigla: '', logoUrl: '', sector: 'privado', orden: '0', activo: true, esEjemplo: false };
const desde = (c: Cliente): Form => ({ nombre: c.nombre, sigla: c.sigla, logoUrl: c.logoUrl ?? '', sector: c.sector, orden: String(c.orden), activo: c.activo, esEjemplo: c.esEjemplo });
const siglaDe = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');

export function WebClientes() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('');
  const [edit, setEdit] = useState<{ id: string | null; form: Form } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      setLista(await api.get<Cliente[]>('/clientes'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los clientes.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter((c) => (!sector || c.sector === sector) && (!t || c.nombre.toLowerCase().includes(t)));
  }, [lista, q, sector]);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setEdit((e) => (e ? { ...e, form: { ...e.form, [k]: v } } : e));
  }

  async function guardar() {
    if (!edit) return;
    const f = edit.form;
    const orden = Number(f.orden);
    if (f.nombre.trim().length < 2) return setError('El nombre es obligatorio.');
    if (!Number.isInteger(orden) || orden < 0) return setError('El orden debe ser un entero mayor o igual a 0.');
    if (f.logoUrl.trim() && !/^(https?:\/\/|\/)/.test(f.logoUrl.trim())) return setError('El logo debe ser una URL (https://…) o una ruta que empiece con /.');
    const body = {
      nombre: f.nombre.trim(),
      sigla: (f.sigla.trim() || siglaDe(f.nombre)).slice(0, 4).toUpperCase(),
      logoUrl: f.logoUrl.trim(), sector: f.sector, orden, activo: f.activo, esEjemplo: f.esEjemplo,
    };
    setGuardando(true);
    setError('');
    try {
      if (edit.id) await api.patch(`/clientes/${edit.id}`, body);
      else await api.post('/clientes', body);
      setOk(edit.id ? 'Cliente actualizado.' : 'Cliente creado.');
      setEdit(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar el cliente.');
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActivo(c: Cliente) {
    try {
      await api.patch(`/clientes/${c.id}`, { activo: !c.activo });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo actualizar.');
    }
  }

  async function borrar() {
    if (!edit?.id || !window.confirm('¿Eliminar este cliente?')) return;
    try {
      await api.delete(`/clientes/${edit.id}`);
      setOk('Cliente eliminado.');
      setEdit(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar.');
    }
  }

  return (
    <>
      <PageHead
        title="Clientes"
        subtitle={`Clientes de la web (${lista.length}). Marca como "dato de muestra" los nombres genéricos que no son clientes reales.`}
        actions={
          <button type="button" className="ax-btn ax-btn--primary" onClick={() => { setOk(''); setError(''); setEdit({ id: null, form: { ...VACIO, orden: String(lista.length + 1) } }); }}>
            <span className="ax-btn__label">Nuevo cliente</span>
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
        <section className={`ax-card ${edit ? 'ax-col--7' : 'ax-col--12'}`} role="region" aria-label="Clientes" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body">
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
              <select className="ax-select" aria-label="Filtrar por sector" value={sector} onChange={(e) => setSector(e.target.value)} style={{ maxWidth: 200 }}>
                <option value="">Todos los sectores</option>
                {SECTORES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input type="search" className="ax-input" placeholder="Buscar cliente…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar clientes" style={{ maxWidth: 280 }} />
            </div>
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col">Cliente</th>
                  <th className="ax-table__th" scope="col">Sector</th>
                  <th className="ax-table__th" scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={3}>Cargando…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={3} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay clientes.' : 'Ningún cliente coincide.'}</td></tr>
                ) : (
                  visibles.map((c) => (
                    <tr key={c.id} className="ax-table__row" onClick={() => { setOk(''); setError(''); setEdit({ id: c.id, form: desde(c) }); }} style={{ cursor: 'pointer', background: edit?.id === c.id ? 'var(--ax-surface-subtle)' : undefined }}>
                      <td className="ax-table__td">
                        <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{c.nombre}</div>
                        <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{c.sigla}{c.esEjemplo ? ' · dato de muestra' : ''}</div>
                      </td>
                      <td className="ax-table__td">{etiquetaSector(c.sector)}</td>
                      <td className="ax-table__td">
                        <button type="button" className={`ax-badge ax-badge--soft ax-badge--sm ${c.activo ? 'ax-badge--success' : 'ax-badge--neutral'}`} style={{ cursor: 'pointer', border: 0 }} onClick={(e) => { e.stopPropagation(); void alternarActivo(c); }}>
                          {c.activo ? 'Visible' : 'Oculto'}
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
          <section className="ax-card ax-col--5" role="region" aria-label="Editar cliente">
            <div className="ax-card__header">
              <div className="ax-card__titles"><h2 className="ax-card__title">{edit.id ? 'Editar cliente' : 'Nuevo cliente'}</h2></div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setEdit(null)}>Cerrar</button>
            </div>
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <div className="ax-field">
                <label className="ax-label" htmlFor="c-nombre">Nombre</label>
                <input id="c-nombre" className="ax-input" value={edit.form.nombre} onChange={(e) => set('nombre', e.target.value)} />
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                <div className="ax-field" style={{ flex: 1 }}>
                  <label className="ax-label" htmlFor="c-sector">Sector</label>
                  <select id="c-sector" className="ax-select" value={edit.form.sector} onChange={(e) => set('sector', e.target.value)}>
                    {SECTORES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="ax-field" style={{ flex: '0 0 90px' }}>
                  <label className="ax-label" htmlFor="c-sigla">Sigla</label>
                  <input id="c-sigla" className="ax-input" maxLength={4} value={edit.form.sigla} onChange={(e) => set('sigla', e.target.value)} placeholder="Auto" />
                </div>
                <div className="ax-field" style={{ flex: '0 0 80px' }}>
                  <label className="ax-label" htmlFor="c-orden">Orden</label>
                  <input id="c-orden" className="ax-input" inputMode="numeric" value={edit.form.orden} onChange={(e) => set('orden', e.target.value)} />
                </div>
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="c-logo">Logo (URL o ruta que empiece con /; si no hay se muestra la sigla)</label>
                <input id="c-logo" className="ax-input" value={edit.form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} />
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
                  <span className="ax-btn__label">{edit.id ? 'Guardar cambios' : 'Crear cliente'}</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default WebClientes;
