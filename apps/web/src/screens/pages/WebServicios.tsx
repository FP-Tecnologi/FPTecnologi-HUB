'use client';
/*
 * FPTecnologi-HUB — Soluciones → Servicios (GET/POST/PATCH/DELETE /servicios).
 * Los servicios TI que muestra la web pública (tarjetas, menú, página de cada
 * servicio, cotizador y asistente virtual). Edición en panel lateral. Para
 * retirar un servicio de la web se desactiva (si ya tiene cotizaciones no se
 * puede borrar).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precioDesde: string | null;
  activo: boolean;
  slug: string | null;
  etiqueta: string | null;
  icono: string | null;
  imagenUrl: string | null;
  intro: string | null;
  incluye: string[];
  beneficios: { titulo: string; texto: string }[];
  sectores: string[];
  faqs: { p: string; r: string }[];
  orden: number;
}
interface Form {
  nombre: string;
  slug: string;
  etiqueta: string;
  icono: string;
  imagenUrl: string;
  descripcion: string;
  intro: string;
  incluye: string; // una por línea
  beneficios: string; // "Título | Texto" por línea
  sectores: string; // uno por línea
  faqs: string; // "Pregunta | Respuesta" por línea
  precioDesde: string;
  orden: string;
  activo: boolean;
}

const ICONOS = [
  ['shield', 'Escudo (seguridad)'], ['academic', 'Birrete (educación)'], ['server', 'Servidor'], ['building', 'Edificio'],
  ['video', 'Video'], ['database', 'Base de datos'], ['cloud-upload', 'Nube con flecha'], ['cloud', 'Nube'],
  ['wrench', 'Llave (soporte)'], ['network', 'Red'], ['lock', 'Candado'], ['key', 'Llave (licencias)'],
] as const;

const VACIO: Form = { nombre: '', slug: '', etiqueta: '', icono: 'shield', imagenUrl: '', descripcion: '', intro: '', incluye: '', beneficios: '', sectores: '', faqs: '', precioDesde: '', orden: '0', activo: true };

const lineas = (t: string) => t.split('\n').map((l) => l.trim()).filter(Boolean);
const pares = (t: string) => lineas(t).map((l) => { const i = l.indexOf('|'); return i === -1 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()]; });
const desde = (s: Servicio): Form => ({
  nombre: s.nombre, slug: s.slug ?? '', etiqueta: s.etiqueta ?? '', icono: s.icono ?? 'shield', imagenUrl: s.imagenUrl ?? '',
  descripcion: s.descripcion ?? '', intro: s.intro ?? '', incluye: s.incluye.join('\n'),
  beneficios: s.beneficios.map((b) => `${b.titulo} | ${b.texto}`).join('\n'), sectores: s.sectores.join('\n'),
  faqs: s.faqs.map((f) => `${f.p} | ${f.r}`).join('\n'), precioDesde: s.precioDesde ? String(Number(s.precioDesde)) : '',
  orden: String(s.orden), activo: s.activo,
});
const src = (u: string | null) => (u ? (u.startsWith('/') ? `${WEB}${u}` : u) : null);

export function WebServicios() {
  const { activeMarcaId, marcas } = useAuth();
  const esAdmin = marcas.find((m) => m.marcaId === activeMarcaId)?.rol.nombre.toLowerCase() === 'admin';
  const [lista, setLista] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<{ id: string | null; form: Form } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      setLista(await api.get<Servicio[]>('/servicios'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los servicios.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter((s) => !t || `${s.nombre} ${s.slug ?? ''}`.toLowerCase().includes(t));
  }, [lista, q]);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setEdit((e) => (e ? { ...e, form: { ...e.form, [k]: v } } : e));
  }

  async function guardar() {
    if (!edit) return;
    const f = edit.form;
    if (f.nombre.trim().length < 2) return setError('El nombre es obligatorio.');
    const orden = Number(f.orden);
    if (!Number.isInteger(orden) || orden < 0) return setError('El orden debe ser un entero mayor o igual a 0.');
    const precio = f.precioDesde.trim() === '' ? undefined : Number(f.precioDesde);
    if (precio !== undefined && (!Number.isFinite(precio) || precio < 0)) return setError('El precio "desde" no es válido.');
    if (f.imagenUrl.trim() && !/^(https?:\/\/|\/)/.test(f.imagenUrl.trim())) return setError('La imagen debe ser una URL (https://…) o una ruta que empiece con /.');
    const beneficios = pares(f.beneficios).map(([titulo, texto]) => ({ titulo, texto }));
    if (beneficios.some((b) => !b.titulo || !b.texto)) return setError('Cada beneficio debe tener el formato: Título | Texto.');
    const faqs = pares(f.faqs).map(([p, r]) => ({ p, r }));
    if (faqs.some((x) => !x.p || !x.r)) return setError('Cada pregunta frecuente debe tener el formato: Pregunta | Respuesta.');

    const body = {
      nombre: f.nombre.trim(),
      ...(f.slug.trim() ? { slug: f.slug.trim() } : {}),
      etiqueta: f.etiqueta.trim(),
      icono: f.icono,
      imagenUrl: f.imagenUrl.trim(),
      descripcion: f.descripcion.trim(),
      intro: f.intro.trim(),
      incluye: lineas(f.incluye),
      beneficios,
      sectores: lineas(f.sectores),
      faqs,
      ...(precio !== undefined ? { precioDesde: precio } : {}),
      orden,
      activo: f.activo,
    };
    setGuardando(true);
    setError('');
    try {
      if (edit.id) await api.patch(`/servicios/${edit.id}`, body);
      else await api.post('/servicios', body);
      setOk(edit.id ? 'Servicio actualizado.' : 'Servicio creado.');
      setEdit(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar el servicio.');
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActivo(s: Servicio) {
    try {
      await api.patch(`/servicios/${s.id}`, { activo: !s.activo });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo actualizar.');
    }
  }

  async function borrar() {
    if (!edit?.id) return;
    if (!window.confirm('¿Eliminar este servicio? Si ya tiene cotizaciones no se podrá; en ese caso desactívalo.')) return;
    try {
      await api.delete(`/servicios/${edit.id}`);
      setOk('Servicio eliminado.');
      setEdit(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar. Si tiene cotizaciones, desactívalo.');
    }
  }

  return (
    <>
      <PageHead
        title="Servicios"
        subtitle={`Servicios TI de la web (${lista.length}). Lo que edites aquí se ve en la página de servicios, el menú, el cotizador y el asistente virtual.`}
        actions={
          <button type="button" className="ax-btn ax-btn--primary" onClick={() => { setOk(''); setError(''); setEdit({ id: null, form: { ...VACIO, orden: String(lista.length + 1) } }); }}>
            <span className="ax-btn__label">Nuevo servicio</span>
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
        <section className={`ax-card ${edit ? 'ax-col--6' : 'ax-col--12'}`} role="region" aria-label="Servicios" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body">
            <input type="search" className="ax-input" placeholder="Buscar servicio…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar servicios" style={{ maxWidth: 300 }} />
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col">Servicio</th>
                  <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Orden</th>
                  <th className="ax-table__th" scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={3}>Cargando…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={3} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay servicios. Crea el primero o carga el seed inicial.' : 'Ningún servicio coincide.'}</td></tr>
                ) : (
                  visibles.map((s) => (
                    <tr key={s.id} className="ax-table__row" onClick={() => { setOk(''); setError(''); setEdit({ id: s.id, form: desde(s) }); }} style={{ cursor: 'pointer', background: edit?.id === s.id ? 'var(--ax-surface-subtle)' : undefined }}>
                      <td className="ax-table__td">
                        <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                          <span style={{ width: 52, height: 40, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: 'var(--ax-surface-subtle)' }}>
                            {src(s.imagenUrl) && <img src={src(s.imagenUrl)!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{s.nombre}</div>
                            <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>/servicios/{s.slug ?? '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="ax-table__td" style={{ textAlign: 'right' }}>{s.orden}</td>
                      <td className="ax-table__td">
                        <button type="button" className={`ax-badge ax-badge--soft ax-badge--sm ${s.activo ? 'ax-badge--success' : 'ax-badge--neutral'}`} style={{ cursor: 'pointer', border: 0 }} title={s.activo ? 'Desactivar (se oculta de la web)' : 'Activar (se muestra en la web)'} onClick={(e) => { e.stopPropagation(); void alternarActivo(s); }}>
                          {s.activo ? 'Activo' : 'Inactivo'}
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
          <section className="ax-card ax-col--6" role="region" aria-label="Editar servicio">
            <div className="ax-card__header">
              <div className="ax-card__titles">
                <h2 className="ax-card__title">{edit.id ? 'Editar servicio' : 'Nuevo servicio'}</h2>
                {edit.id && edit.form.slug && (
                  <p className="ax-card__subtitle"><a href={`${WEB}/servicios/${edit.form.slug}`} target="_blank" rel="noreferrer">Ver en la web</a></p>
                )}
              </div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setEdit(null)}>Cerrar</button>
            </div>
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
              <div className="ax-field">
                <label className="ax-label" htmlFor="s-nombre">Nombre</label>
                <input id="s-nombre" className="ax-input" value={edit.form.nombre} onChange={(e) => set('nombre', e.target.value)} />
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                <div className="ax-field" style={{ flex: 1 }}>
                  <label className="ax-label" htmlFor="s-etiqueta">Etiqueta sobre el título</label>
                  <input id="s-etiqueta" className="ax-input" value={edit.form.etiqueta} onChange={(e) => set('etiqueta', e.target.value)} placeholder="Soluciones de, Somos expertos en…" />
                </div>
                <div className="ax-field" style={{ flex: 1 }}>
                  <label className="ax-label" htmlFor="s-icono">Ícono</label>
                  <select id="s-icono" className="ax-select" value={edit.form.icono} onChange={(e) => set('icono', e.target.value)}>
                    {ICONOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="s-img">Imagen (URL o ruta que empiece con /)</label>
                <input id="s-img" className="ax-input" value={edit.form.imagenUrl} onChange={(e) => set('imagenUrl', e.target.value)} placeholder="/images/solutions/seguridad.jpg" />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="s-desc">Descripción corta (tarjeta y encabezado)</label>
                <textarea id="s-desc" className="ax-textarea" rows={2} value={edit.form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="s-intro">Introducción (sección &quot;Qué incluye&quot;)</label>
                <textarea id="s-intro" className="ax-textarea" rows={4} value={edit.form.intro} onChange={(e) => set('intro', e.target.value)} />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="s-inc">Qué incluye (uno por línea)</label>
                <textarea id="s-inc" className="ax-textarea" rows={6} value={edit.form.incluye} onChange={(e) => set('incluye', e.target.value)} />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="s-ben">Beneficios (una línea por beneficio: Título | Texto)</label>
                <textarea id="s-ben" className="ax-textarea" rows={4} value={edit.form.beneficios} onChange={(e) => set('beneficios', e.target.value)} placeholder="Monitoreo 24/7 | Una sola central para ver todas las cámaras." />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="s-sec">Sectores que atendemos (uno por línea)</label>
                <textarea id="s-sec" className="ax-textarea" rows={3} value={edit.form.sectores} onChange={(e) => set('sectores', e.target.value)} />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="s-faq">Preguntas frecuentes (una línea por pregunta: Pregunta | Respuesta)</label>
                <textarea id="s-faq" className="ax-textarea" rows={5} value={edit.form.faqs} onChange={(e) => set('faqs', e.target.value)} />
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                <div className="ax-field" style={{ flex: 1 }}>
                  <label className="ax-label" htmlFor="s-slug">URL (slug)</label>
                  <input id="s-slug" className="ax-input" value={edit.form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="Se genera desde el nombre" />
                </div>
                <div className="ax-field" style={{ flex: '0 0 110px' }}>
                  <label className="ax-label" htmlFor="s-precio">Desde (USD)</label>
                  <input id="s-precio" className="ax-input" inputMode="decimal" value={edit.form.precioDesde} onChange={(e) => set('precioDesde', e.target.value)} />
                </div>
                <div className="ax-field" style={{ flex: '0 0 80px' }}>
                  <label className="ax-label" htmlFor="s-orden">Orden</label>
                  <input id="s-orden" className="ax-input" inputMode="numeric" value={edit.form.orden} onChange={(e) => set('orden', e.target.value)} />
                </div>
              </div>
              <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)' }}>
                <input type="checkbox" className="ax-switch" checked={edit.form.activo} onChange={(e) => set('activo', e.target.checked)} /> Visible en la web
              </label>
            </div>
            <div className="ax-card__body" style={{ borderTop: '1px solid var(--ax-border)', display: 'flex', justifyContent: 'space-between', gap: 'var(--ax-space-3)' }}>
              <div>{esAdmin && edit.id && <button type="button" className="ax-btn ax-btn--ghost" onClick={() => void borrar()} disabled={guardando}>Eliminar</button>}</div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEdit(null)} disabled={guardando}>Cancelar</button>
                <button type="button" className={`ax-btn ax-btn--primary${guardando ? ' is-loading' : ''}`} onClick={() => void guardar()} disabled={guardando}>
                  <span className="ax-btn__label">{edit.id ? 'Guardar cambios' : 'Crear servicio'}</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default WebServicios;
