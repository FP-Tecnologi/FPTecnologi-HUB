'use client';
/*
 * FPTecnologi-HUB — Asesores de WhatsApp (GET/POST/PATCH/DELETE /chat/asesores).
 * Son los perfiles que el widget de la web muestra en "Habla con un
 * asesor": nombre, área, teléfono visible, número de WhatsApp (wa.me), foto
 * y orden. Los inactivos no se muestran en la web.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Asesor {
  id: string;
  nombre: string;
  area: string;
  telefono: string;
  whatsapp: string;
  fotoUrl: string | null;
  activo: boolean;
  orden: number;
}
type Form = Omit<Asesor, 'id'>;

const VACIO: Form = { nombre: '', area: '', telefono: '', whatsapp: '51', fotoUrl: '', activo: true, orden: 0 };
const AREAS = ['Ventas', 'Servicios', 'Tienda', 'Partners', 'Soporte'];

export function ChatAsesores() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Asesor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState<Asesor | 'nuevo' | null>(null);
  const [form, setForm] = useState<Form>(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, editando !== null);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      setLista(await api.get<Asesor[]>('/chat/asesores'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los asesores.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (editando === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditando(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editando]);

  function abrir(a: Asesor | 'nuevo') {
    setEditando(a);
    setFormError('');
    setForm(a === 'nuevo' ? { ...VACIO, orden: lista.length } : { ...a, fotoUrl: a.fotoUrl ?? '' });
  }

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    if (guardando || editando === null) return;
    setGuardando(true);
    setFormError('');
    const body = { ...form, whatsapp: form.whatsapp.replace(/\D/g, ''), fotoUrl: form.fotoUrl?.trim() || undefined, orden: Number(form.orden) || 0 };
    try {
      if (editando === 'nuevo') await api.post('/chat/asesores', body);
      else await api.patch(`/chat/asesores/${editando.id}`, body);
      setEditando(null);
      await cargar();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo(a: Asesor) {
    try {
      await api.patch(`/chat/asesores/${a.id}`, { activo: !a.activo });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo actualizar.');
    }
  }

  async function borrar(a: Asesor) {
    if (!window.confirm(`¿Borrar a ${a.nombre} (${a.area})? Dejará de aparecer en la web.`)) return;
    try {
      await api.delete(`/chat/asesores/${a.id}`);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo borrar.');
    }
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <PageHead
        title="Asesores de WhatsApp"
        subtitle="Perfiles que aparecen en el chat de la web, en «Habla con un asesor»."
        actions={
          <button type="button" className="ax-btn ax-btn--primary" onClick={() => abrir('nuevo')}>
            <span className="ax-btn__label">Agregar asesor</span>
          </button>
        }
      />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <section className="ax-card" role="region" aria-label="Lista de asesores">
        <div className="ax-table-wrap">
          <table className="ax-table ax-table--hover">
            <thead className="ax-table__head">
              <tr>
                <th className="ax-table__th" scope="col">Asesor</th>
                <th className="ax-table__th" scope="col">Área</th>
                <th className="ax-table__th" scope="col">WhatsApp</th>
                <th className="ax-table__th" scope="col">Visible en la web</th>
                <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td className="ax-table__td" colSpan={5}>Cargando…</td></tr>
              ) : lista.length === 0 ? (
                <tr><td className="ax-table__td" colSpan={5} style={{ color: 'var(--ax-text-muted)' }}>Todavía no hay asesores. Agrega el primero.</td></tr>
              ) : (
                lista.map((a) => (
                  <tr key={a.id} className="ax-table__row">
                    <td className="ax-table__td">
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                        <span className="ax-avatar ax-avatar--sm" style={{ overflow: 'hidden', background: 'var(--ax-surface-subtle)' }}>
                          {a.fotoUrl ? (
                            // Rutas relativas (/images/...) son de la web pública; se muestran igual si es URL absoluta.
                            <img src={a.fotoUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002'}${a.fotoUrl}` : a.fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span className="ax-avatar__initials">{a.nombre[0]}</span>
                          )}
                        </span>
                        <div>
                          <div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{a.nombre}</div>
                          <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Tel. visible: {a.telefono}</div>
                        </div>
                      </div>
                    </td>
                    <td className="ax-table__td"><span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">{a.area}</span></td>
                    <td className="ax-table__td">
                      <a href={`https://wa.me/${a.whatsapp}`} target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--ax-font-mono)', fontSize: 'var(--ax-text-sm)' }}>+{a.whatsapp}</a>
                    </td>
                    <td className="ax-table__td">
                      <input type="checkbox" className="ax-switch" checked={a.activo} onChange={() => toggleActivo(a)} aria-label={`Mostrar a ${a.nombre} en la web`} />
                    </td>
                    <td className="ax-table__td" style={{ textAlign: 'right' }}>
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', justifyContent: 'flex-end' }}>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrir(a)}>Editar</button>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => borrar(a)}>Borrar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editando !== null && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setEditando(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)', backdropFilter: 'blur(2px)' }} />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="as-title" className="ax-card" style={{ position: 'relative', maxWidth: 480, width: '100%' }}>
            <div className="ax-card__header">
              <div className="ax-card__titles">
                <h2 className="ax-card__title" id="as-title">{editando === 'nuevo' ? 'Agregar asesor' : `Editar a ${editando.nombre}`}</h2>
              </div>
            </div>
            <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} onSubmit={guardar}>
              {formError && (
                <div role="alert" className="ax-alert ax-alert--danger" style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                  <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{formError}</p></div>
                </div>
              )}
              <div className="ax-field"><label className="ax-label" htmlFor="as-nombre">Nombre</label><input id="as-nombre" className="ax-input" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required maxLength={60} /></div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="as-area">Área</label>
                <input id="as-area" className="ax-input" list="as-areas" value={form.area} onChange={(e) => set('area', e.target.value)} required maxLength={40} />
                <datalist id="as-areas">{AREAS.map((a) => <option key={a} value={a} />)}</datalist>
              </div>
              <div className="ax-field"><label className="ax-label" htmlFor="as-tel">Teléfono que se muestra</label><input id="as-tel" className="ax-input" placeholder="999 999 999" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} required maxLength={30} /></div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="as-wa">Número de WhatsApp (con código de país)</label>
                <input id="as-wa" className="ax-input" inputMode="numeric" placeholder="51999999999" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} required />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="as-foto">Foto (URL)</label>
                <input id="as-foto" className="ax-input" placeholder="https://… o /images/asesores/nombre.jpg" value={form.fotoUrl ?? ''} onChange={(e) => set('fotoUrl', e.target.value)} maxLength={500} />
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-4)' }}>
                <div className="ax-field" style={{ maxWidth: 120 }}><label className="ax-label" htmlFor="as-orden">Orden</label><input id="as-orden" type="number" min={0} className="ax-input" value={form.orden} onChange={(e) => set('orden', Number(e.target.value))} /></div>
                <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginTop: 'var(--ax-space-5)' }}>
                  <input type="checkbox" className="ax-switch" checked={form.activo} onChange={(e) => set('activo', e.target.checked)} />
                  <span style={{ fontSize: 'var(--ax-text-sm)' }}>Visible en la web</span>
                </label>
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEditando(null)}>Cancelar</button>
                <button type="submit" className={`ax-btn ax-btn--primary${guardando ? ' is-loading' : ''}`} disabled={guardando}>
                  <span className="ax-btn__spinner" aria-hidden="true"></span>
                  <span className="ax-btn__label">Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatAsesores;
