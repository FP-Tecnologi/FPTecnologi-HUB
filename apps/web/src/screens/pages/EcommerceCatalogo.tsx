'use client';
/*
 * FPTecnologi-HUB — Ecommerce → Catálogo: gestión de categorías (crear, editar,
 * ordenar, activar, borrar si están vacías) y de marcas comerciales/fabricantes
 * (ver cuántos productos tiene cada una, renombrar o fusionar). Los productos
 * se siguen editando en Ecommerce → Productos.
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Categoria { id: string; nombre: string; slug: string | null; orden: number; activo: boolean; portadaUrl: string | null; _count: { productos: number } }
interface MarcaCom { nombre: string; productos: number }
type Tab = 'categorias' | 'marcas';
const VACIA = { nombre: '', slug: '', orden: '0', portadaUrl: '' };

const errMsg = (e: unknown, fb: string) => (e instanceof ApiError ? e.message : fb);

export function EcommerceCatalogo() {
  const { activeMarcaId } = useAuth();
  const [tab, setTab] = useState<Tab>('categorias');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<MarcaCom[]>([]);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [editId, setEditId] = useState<string | 'nueva' | null>(null);
  const [form, setForm] = useState(VACIA);
  const [renombrar, setRenombrar] = useState<{ desde: string; hasta: string } | null>(null);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      const [c, m] = await Promise.all([api.get<Categoria[]>('/catalogo/categorias'), api.get<MarcaCom[]>('/catalogo/marcas-comerciales')]);
      setCategorias(c); setMarcas(m);
    } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo cargar el catálogo.') }); }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);

  async function accion(fn: () => Promise<unknown>, ok: string) {
    setAviso(null);
    try { await fn(); setAviso({ ok: true, texto: ok }); setEditId(null); setRenombrar(null); await cargar(); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo completar la acción.') }); }
  }

  function abrir(c?: Categoria) {
    setEditId(c ? c.id : 'nueva');
    setForm(c ? { nombre: c.nombre, slug: c.slug ?? '', orden: String(c.orden), portadaUrl: c.portadaUrl ?? '' } : VACIA);
  }

  function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    const body = {
      nombre: form.nombre.trim(),
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      orden: Number(form.orden) || 0,
      portadaUrl: form.portadaUrl.trim(),
    };
    if (!body.nombre) return;
    return editId === 'nueva'
      ? accion(() => api.post('/productos/categorias', body), 'Categoría creada.')
      : accion(() => api.patch(`/catalogo/categorias/${editId}`, body), 'Categoría actualizada.');
  }

  const th = (t: string, right = false) => <th className="ax-table__th" scope="col" style={right ? { textAlign: 'right' } : undefined}>{t}</th>;

  return (
    <>
      <PageHead
        title="Catálogo"
        subtitle="Categorías y marcas comerciales de la tienda."
        actions={tab === 'categorias' ? <button type="button" className="ax-btn ax-btn--primary" onClick={() => abrir()}><span className="ax-btn__label">Nueva categoría</span></button> : undefined}
      />
      <div className="ax-dash-grid">
        {aviso && (
          <div role={aviso.ok ? 'status' : 'alert'} className={`ax-alert ax-col--12 ${aviso.ok ? 'ax-alert--success' : 'ax-alert--danger'}`} style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
            <div className="ax-alert__content"><p className="ax-alert__message">{aviso.texto}</p></div>
          </div>
        )}

        <section className="ax-card ax-col--12">
          <div className="ax-card__body">
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Sección">
              {([['categorias', `Categorías (${categorias.length})`], ['marcas', `Marcas comerciales (${marcas.length})`]] as const).map(([id, label]) => (
                <button key={id} type="button" role="radio" aria-checked={tab === id} className={`ax-btn ax-btn--sm${tab === id ? ' is-selected' : ''}`} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>
          </div>
        </section>

        {tab === 'categorias' && (
          <section className="ax-card ax-col--12" aria-label="Categorías">
            {categorias.length === 0 ? (
              <div className="ax-card__body" style={{ textAlign: 'center', color: 'var(--ax-text-muted)' }}>Aún no hay categorías.</div>
            ) : (
              <div className="ax-table-wrap">
                <table className="ax-table ax-table--hover">
                  <thead className="ax-table__head"><tr>{th('Categoría')}{th('Slug')}{th('Orden')}{th('Productos')}{th('Estado')}{th('Acciones', true)}</tr></thead>
                  <tbody>
                    {categorias.map((c) => (
                      <tr key={c.id} className="ax-table__row">
                        <td className="ax-table__td" style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{c.nombre}</td>
                        <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)' }}>{c.slug}</td>
                        <td className="ax-table__td">{c.orden}</td>
                        <td className="ax-table__td">{c._count.productos}</td>
                        <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--pill ${c.activo ? 'ax-badge--success' : 'ax-badge--neutral'}`}>{c.activo ? 'Visible' : 'Oculta'}</span></td>
                        <td className="ax-table__td" style={{ textAlign: 'right' }}>
                          <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', justifyContent: 'flex-end' }}>
                            <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrir(c)}>Editar</button>
                            <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => accion(() => api.patch(`/catalogo/categorias/${c.id}`, { activo: !c.activo }), c.activo ? 'Categoría oculta.' : 'Categoría visible.')}>{c.activo ? 'Ocultar' : 'Mostrar'}</button>
                            <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={() => window.confirm(`¿Borrar la categoría "${c.nombre}"?`) && accion(() => api.delete(`/catalogo/categorias/${c.id}`), 'Categoría eliminada.')}>Borrar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === 'marcas' && (
          <section className="ax-card ax-col--12" aria-label="Marcas comerciales">
            <div className="ax-card__body" style={{ paddingBottom: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
              Son los fabricantes que se muestran en la tienda (Dell, HP, Lenovo…). Para cambiar la marca de un producto, edítalo en Productos; aquí puedes renombrar o fusionar una marca en todos sus productos.
            </div>
            {marcas.length === 0 ? (
              <div className="ax-card__body" style={{ textAlign: 'center', color: 'var(--ax-text-muted)' }}>Ningún producto tiene marca asignada.</div>
            ) : (
              <div className="ax-table-wrap">
                <table className="ax-table ax-table--hover">
                  <thead className="ax-table__head"><tr>{th('Marca')}{th('Productos')}{th('Acciones', true)}</tr></thead>
                  <tbody>
                    {marcas.map((m) => (
                      <tr key={m.nombre} className="ax-table__row">
                        <td className="ax-table__td" style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{m.nombre}</td>
                        <td className="ax-table__td">{m.productos}</td>
                        <td className="ax-table__td" style={{ textAlign: 'right' }}>
                          <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', justifyContent: 'flex-end' }}>
                            <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setRenombrar({ desde: m.nombre, hasta: m.nombre })}>Renombrar / fusionar</button>
                            <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={() => window.confirm(`¿Quitar la marca "${m.nombre}" de ${m.productos} producto(s)?`) && accion(() => api.patch('/catalogo/marcas-comerciales', { desde: m.nombre, hasta: '' }), 'Marca quitada de los productos.')}>Quitar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      {editId && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setEditId(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)' }} />
          <form onSubmit={guardar} role="dialog" aria-modal="true" aria-label="Categoría" className="ax-card" style={{ position: 'relative', maxWidth: 440, width: '100%' }}>
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">{editId === 'nueva' ? 'Nueva categoría' : 'Editar categoría'}</h2></div></div>
            <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <div className="ax-field"><label className="ax-label" htmlFor="cat-nombre">Nombre</label><input id="cat-nombre" className="ax-input" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="cat-slug">Slug (opcional)</label><input id="cat-slug" className="ax-input" placeholder="se genera del nombre" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="cat-orden">Orden</label><input id="cat-orden" type="number" min={0} className="ax-input" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="cat-img">URL de portada</label><input id="cat-img" className="ax-input" value={form.portadaUrl} onChange={(e) => setForm({ ...form, portadaUrl: e.target.value })} /></div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEditId(null)}>Cancelar</button>
                <button type="submit" className="ax-btn ax-btn--primary">Guardar</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {renombrar && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setRenombrar(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)' }} />
          <form onSubmit={(e) => { e.preventDefault(); void accion(() => api.patch('/catalogo/marcas-comerciales', renombrar), 'Marca actualizada.'); }} role="dialog" aria-modal="true" aria-label="Renombrar marca" className="ax-card" style={{ position: 'relative', maxWidth: 420, width: '100%' }}>
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Renombrar «{renombrar.desde}»</h2><p className="ax-card__subtitle">Si escribes el nombre de otra marca existente, se fusionan.</p></div></div>
            <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <div className="ax-field"><label className="ax-label" htmlFor="mc-nuevo">Nuevo nombre</label><input id="mc-nuevo" className="ax-input" required value={renombrar.hasta} onChange={(e) => setRenombrar({ ...renombrar, hasta: e.target.value })} /></div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setRenombrar(null)}>Cancelar</button>
                <button type="submit" className="ax-btn ax-btn--primary" disabled={!renombrar.hasta.trim() || renombrar.hasta === renombrar.desde}>Guardar</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default EcommerceCatalogo;
