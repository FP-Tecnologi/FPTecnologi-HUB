'use client';
/*
 * FPTecnologi-HUB — Ecommerce → Productos (GET/POST/PATCH /productos). Catálogo
 * de la tienda: búsqueda, filtros (categoría, estado), edición en panel lateral
 * y alta de productos nuevos. Precios en USD sin IGV. Para retirar un producto de
 * la tienda se desactiva (no se borra: los pedidos viejos lo referencian).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { SubirImagen, urlImagen } from '../../components/ui/SubirImagen';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  sku: string;
  slug: string | null;
  precio: string;
  precioAntes: string | null;
  precioMayorista: string | null;
  marcaComercial: string | null;
  imagenes: string[];
  destacado: boolean;
  stock: number;
  activo: boolean;
  categoriaId: string | null;
  categoria: { id: string; nombre: string } | null;
}
interface Categoria {
  id: string;
  nombre: string;
}
interface Form {
  nombre: string;
  sku: string;
  slug: string;
  precio: string;
  precioAntes: string;
  precioMayorista: string;
  stock: string;
  marcaComercial: string;
  categoriaId: string;
  imagenes: string; // una URL por línea
  descripcion: string;
  destacado: boolean;
  activo: boolean;
}

const VACIO: Form = { nombre: '', sku: '', slug: '', precio: '', precioAntes: '', precioMayorista: '', stock: '0', marcaComercial: '', categoriaId: '', imagenes: '', descripcion: '', destacado: false, activo: true };

const usd = (v: string | number) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const desde = (p: Producto): Form => ({
  nombre: p.nombre, sku: p.sku, slug: p.slug ?? '', precio: String(Number(p.precio)), precioAntes: p.precioAntes ? String(Number(p.precioAntes)) : '', precioMayorista: p.precioMayorista ? String(Number(p.precioMayorista)) : '',
  stock: String(p.stock), marcaComercial: p.marcaComercial ?? '', categoriaId: p.categoriaId ?? '', imagenes: p.imagenes.join('\n'),
  descripcion: p.descripcion ?? '', destacado: p.destacado, activo: p.activo,
});
const src = (u: string | undefined) => (u ? (u.startsWith('/') ? `${WEB}${u}` : u) : null);

export function EcommerceProductos() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [estado, setEstado] = useState<'' | 'activos' | 'inactivos' | 'sinstock'>('');
  const [edit, setEdit] = useState<{ id: string | null; form: Form } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      const [ps, cs] = await Promise.all([api.get<Producto[]>('/productos'), api.get<Categoria[]>('/productos/categorias/todas')]);
      setLista(ps);
      setCategorias(cs);
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter(
      (p) =>
        (!t || `${p.nombre} ${p.sku} ${p.marcaComercial ?? ''}`.toLowerCase().includes(t)) &&
        (!cat || p.categoriaId === cat) &&
        (estado === '' || (estado === 'activos' && p.activo) || (estado === 'inactivos' && !p.activo) || (estado === 'sinstock' && p.stock === 0)),
    );
  }, [lista, q, cat, estado]);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setEdit((e) => (e ? { ...e, form: { ...e.form, [k]: v } } : e));
  }

  async function guardar() {
    if (!edit) return;
    const f = edit.form;
    const precio = Number(f.precio);
    const precioAntes = f.precioAntes.trim() === '' ? undefined : Number(f.precioAntes);
    const precioMayorista = f.precioMayorista.trim() === '' ? null : Number(f.precioMayorista);
    const stock = Number(f.stock);
    if (f.nombre.trim().length < 2 || !f.sku.trim()) return setError('El nombre y el SKU son obligatorios.');
    if (!Number.isFinite(precio) || precio < 0) return setError('El precio debe ser un número mayor o igual a 0.');
    if (precioAntes !== undefined && (!Number.isFinite(precioAntes) || precioAntes < 0)) return setError('El precio anterior no es válido.');
    if (precioMayorista !== null && (!Number.isFinite(precioMayorista) || precioMayorista < 0)) return setError('El precio mayorista no es válido.');
    if (!Number.isInteger(stock) || stock < 0) return setError('El stock debe ser un entero mayor o igual a 0.');
    const imagenes = f.imagenes.split('\n').map((l) => l.trim()).filter(Boolean);
    if (imagenes.some((u) => !/^(https?:\/\/|\/)/.test(u))) return setError('Cada imagen debe ser una URL (https://…) o una ruta que empiece con /.');

    const body = {
      nombre: f.nombre.trim(),
      sku: f.sku.trim(),
      ...(f.slug.trim() ? { slug: f.slug.trim() } : {}),
      precio,
      ...(precioAntes !== undefined ? { precioAntes } : {}),
      precioMayorista,
      stock,
      ...(f.marcaComercial.trim() ? { marcaComercial: f.marcaComercial.trim() } : {}),
      ...(f.categoriaId ? { categoriaId: f.categoriaId } : {}),
      imagenes,
      ...(f.descripcion.trim() ? { descripcion: f.descripcion.trim() } : {}),
      destacado: f.destacado,
      activo: f.activo,
    };
    setGuardando(true);
    setError('');
    try {
      if (edit.id) await api.patch(`/productos/${edit.id}`, body);
      else await api.post('/productos', body);
      setOk(edit.id ? 'Producto actualizado.' : 'Producto creado.');
      setEdit(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar el producto.');
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActivo(p: Producto) {
    try {
      await api.patch(`/productos/${p.id}`, { activo: !p.activo });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo actualizar.');
    }
  }

  const sinFoto = (p: Producto) => p.imagenes.length === 0;

  return (
    <>
      <PageHead
        title="Productos"
        subtitle={`Catálogo de la tienda (${lista.length} productos). Precios en USD sin IGV; el IGV se suma en el checkout.`}
        actions={
          <button type="button" className="ax-btn ax-btn--primary" onClick={() => { setOk(''); setError(''); setEdit({ id: null, form: VACIO }); }}>
            <span className="ax-btn__label">Nuevo producto</span>
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
        <section className={`ax-card ${edit ? 'ax-col--7' : 'ax-col--12'}`} role="region" aria-label="Productos" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body">
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                <select className="ax-select" aria-label="Filtrar por categoría" value={cat} onChange={(e) => setCat(e.target.value)} style={{ maxWidth: 220 }}>
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <select className="ax-select" aria-label="Filtrar por estado" value={estado} onChange={(e) => setEstado(e.target.value as typeof estado)} style={{ maxWidth: 180 }}>
                  <option value="">Todos</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                  <option value="sinstock">Sin stock</option>
                </select>
              </div>
              <input type="search" className="ax-input" placeholder="Buscar nombre, SKU o marca…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar productos" style={{ maxWidth: 300 }} />
            </div>
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col">Producto</th>
                  <th className="ax-table__th" scope="col">Categoría</th>
                  <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Precio</th>
                  <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Stock</th>
                  <th className="ax-table__th" scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={5}>Cargando…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={5} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay productos. Importa el catálogo o crea el primero.' : 'Ningún producto coincide con el filtro.'}</td></tr>
                ) : (
                  visibles.map((p) => (
                    <tr key={p.id} className="ax-table__row" onClick={() => { setOk(''); setError(''); setEdit({ id: p.id, form: desde(p) }); }} style={{ cursor: 'pointer', background: edit?.id === p.id ? 'var(--ax-surface-subtle)' : undefined }}>
                      <td className="ax-table__td">
                        <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                          <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: 'var(--ax-surface-subtle)' }}>
                            {src(p.imagenes[0]) && <img src={src(p.imagenes[0])!} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                            <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                              {p.sku}{p.marcaComercial ? ` · ${p.marcaComercial}` : ''}{p.destacado ? ' · ★' : ''}{sinFoto(p) ? ' · sin foto' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="ax-table__td">{p.categoria?.nombre ?? '—'}</td>
                      <td className="ax-table__td" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {Number(p.precio) > 0 ? usd(p.precio) : <span style={{ color: 'var(--ax-danger-500)' }}>Sin precio</span>}
                        {p.precioAntes && <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', textDecoration: 'line-through' }}>{usd(p.precioAntes)}</div>}
                      </td>
                      <td className="ax-table__td" style={{ textAlign: 'right', color: p.stock === 0 ? 'var(--ax-danger-500)' : undefined }}>{p.stock}</td>
                      <td className="ax-table__td">
                        <button type="button" className={`ax-badge ax-badge--soft ax-badge--sm ${p.activo ? 'ax-badge--success' : 'ax-badge--neutral'}`} style={{ cursor: 'pointer', border: 0 }} title={p.activo ? 'Desactivar (se oculta de la tienda)' : 'Activar (se muestra en la tienda)'} onClick={(e) => { e.stopPropagation(); alternarActivo(p); }}>
                          {p.activo ? 'Activo' : 'Inactivo'}
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
          <section className="ax-card ax-col--5" role="region" aria-label="Editar producto">
            <div className="ax-card__header">
              <div className="ax-card__titles">
                <h2 className="ax-card__title">{edit.id ? 'Editar producto' : 'Nuevo producto'}</h2>
                {edit.id && edit.form.slug && (
                  <p className="ax-card__subtitle"><a href={`${WEB}/producto/${edit.form.slug}`} target="_blank" rel="noreferrer">Ver en la tienda</a></p>
                )}
              </div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setEdit(null)}>Cerrar</button>
            </div>
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
              <div className="ax-field">
                <label className="ax-label" htmlFor="p-nombre">Nombre</label>
                <input id="p-nombre" className="ax-input" value={edit.form.nombre} onChange={(e) => set('nombre', e.target.value)} />
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                <div className="ax-field" style={{ flex: 1 }}>
                  <label className="ax-label" htmlFor="p-sku">SKU</label>
                  <input id="p-sku" className="ax-input" value={edit.form.sku} onChange={(e) => set('sku', e.target.value)} />
                </div>
                <div className="ax-field" style={{ flex: 1 }}>
                  <label className="ax-label" htmlFor="p-marca">Marca</label>
                  <input id="p-marca" className="ax-input" value={edit.form.marcaComercial} onChange={(e) => set('marcaComercial', e.target.value)} placeholder="HP, Dell, Lenovo…" />
                </div>
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                <div className="ax-field" style={{ flex: 1 }}>
                  <label className="ax-label" htmlFor="p-precio">Precio (USD sin IGV)</label>
                  <input id="p-precio" className="ax-input" inputMode="decimal" value={edit.form.precio} onChange={(e) => set('precio', e.target.value)} />
                </div>
                <div className="ax-field" style={{ flex: 1 }}>
                  <label className="ax-label" htmlFor="p-antes">Precio anterior</label>
                  <input id="p-antes" className="ax-input" inputMode="decimal" value={edit.form.precioAntes} onChange={(e) => set('precioAntes', e.target.value)} placeholder="Oferta si es mayor" />
                </div>
                <div className="ax-field" style={{ flex: 1 }}>
                  <label className="ax-label" htmlFor="p-mayor">Precio mayorista</label>
                  <input id="p-mayor" className="ax-input" inputMode="decimal" value={edit.form.precioMayorista} onChange={(e) => set('precioMayorista', e.target.value)} placeholder="Desde 6 u." />
                </div>
                <div className="ax-field" style={{ flex: '0 0 90px' }}>
                  <label className="ax-label" htmlFor="p-stock">Stock</label>
                  <input id="p-stock" className="ax-input" inputMode="numeric" value={edit.form.stock} onChange={(e) => set('stock', e.target.value)} />
                </div>
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="p-cat">Categoría</label>
                <select id="p-cat" className="ax-select" value={edit.form.categoriaId} onChange={(e) => set('categoriaId', e.target.value)}>
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="ax-field">
                <span className="ax-label">Imágenes (la primera es la portada)</span>
                {(() => {
                  const lista = edit.form.imagenes.split('\n').map((l) => l.trim()).filter(Boolean);
                  const guardar = (nueva: string[]) => set('imagenes', nueva.join('\n'));
                  return (
                    <>
                      {lista.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ax-space-2)', marginBlockEnd: 'var(--ax-space-2)' }}>
                          {lista.map((u, i) => (
                            <div key={u + i} style={{ position: 'relative', inlineSize: 84, blockSize: 84, borderRadius: 'var(--ax-radius-md)', border: i === 0 ? '2px solid var(--ax-accent)' : '1px solid var(--ax-border)', background: 'var(--ax-surface-subtle)', overflow: 'hidden' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={urlImagen(u)} alt="" style={{ inlineSize: '100%', blockSize: '100%', objectFit: 'contain' }} />
                              {i === 0 && <span style={{ position: 'absolute', insetBlockStart: 2, insetInlineStart: 2, fontSize: 10, background: 'var(--ax-accent)', color: 'var(--ax-on-accent)', borderRadius: 4, paddingInline: 4 }}>Portada</span>}
                              <div style={{ position: 'absolute', insetBlockEnd: 0, insetInline: 0, display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,.55)' }}>
                                <button type="button" aria-label="Poner de portada" disabled={i === 0} onClick={() => guardar([u, ...lista.filter((_, j) => j !== i)])} style={{ color: '#fff', fontSize: 12, padding: '2px 6px', opacity: i === 0 ? 0.3 : 1 }}>★</button>
                                <button type="button" aria-label="Quitar imagen" onClick={() => guardar(lista.filter((_, j) => j !== i))} style={{ color: '#fff', fontSize: 12, padding: '2px 6px' }}>✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <SubirImagen multiple onSubida={(urls) => guardar([...lista, ...urls])} />
                    </>
                  );
                })()}
                <label className="ax-label" htmlFor="p-img" style={{ marginBlockStart: 'var(--ax-space-3)' }}>…o pega URLs (una por línea)</label>
                <textarea id="p-img" className="ax-textarea" rows={3} value={edit.form.imagenes} onChange={(e) => set('imagenes', e.target.value)} placeholder="https://…" />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="p-desc">Descripción</label>
                <textarea id="p-desc" className="ax-textarea" rows={5} value={edit.form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="p-slug">URL (slug)</label>
                <input id="p-slug" className="ax-input" value={edit.form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="Se genera desde el nombre si lo dejas vacío" />
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-5)' }}>
                <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)' }}>
                  <input type="checkbox" className="ax-switch" checked={edit.form.activo} onChange={(e) => set('activo', e.target.checked)} /> Visible en la tienda
                </label>
                <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)' }}>
                  <input type="checkbox" className="ax-switch" checked={edit.form.destacado} onChange={(e) => set('destacado', e.target.checked)} /> Destacado
                </label>
              </div>
            </div>
            <div className="ax-card__body" style={{ borderTop: '1px solid var(--ax-border)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--ax-space-3)' }}>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEdit(null)} disabled={guardando}>Cancelar</button>
              <button type="button" className={`ax-btn ax-btn--primary${guardando ? ' is-loading' : ''}`} onClick={guardar} disabled={guardando}>
                <span className="ax-btn__label">{edit.id ? 'Guardar cambios' : 'Crear producto'}</span>
              </button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default EcommerceProductos;
