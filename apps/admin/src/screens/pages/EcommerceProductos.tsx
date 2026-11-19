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
import { CampoImagenes } from '../../components/ui/CampoImagen';
import { teclaFila } from '../../lib/teclado';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { confirmar } from '../../components/ui/Dialogos';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  detalle: string | null;
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
  detalle: string; // texto corto bajo el nombre (tarjetas de catálogo)
  destacado: boolean;
  activo: boolean;
}

const VACIO: Form = { nombre: '', sku: '', slug: '', precio: '', precioAntes: '', precioMayorista: '', stock: '0', marcaComercial: '', categoriaId: '', imagenes: '', descripcion: '', detalle: '', destacado: false, activo: true };

const usd = (v: string | number) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const desde = (p: Producto): Form => ({
  nombre: p.nombre, sku: p.sku, slug: p.slug ?? '', precio: String(Number(p.precio)), precioAntes: p.precioAntes ? String(Number(p.precioAntes)) : '', precioMayorista: p.precioMayorista ? String(Number(p.precioMayorista)) : '',
  stock: String(p.stock), marcaComercial: p.marcaComercial ?? '', categoriaId: p.categoriaId ?? '', imagenes: p.imagenes.join('\n'),
  descripcion: p.descripcion ?? '', detalle: p.detalle ?? '', destacado: p.destacado, activo: p.activo,
});
const src = (u: string | undefined) => (u ? (u.startsWith('/') ? `${WEB}${u}` : u) : null);

export function EcommerceProductos() {
  const { activeMarcaId, marcas } = useAuth();
  const esAdmin = marcas.find((m) => m.marcaId === activeMarcaId)?.rol.nombre.toLowerCase() === 'admin';
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
      detalle: f.detalle.trim(),
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

  async function borrar(id: string) {
    if (!await confirmar('¿Eliminar este producto? No se puede deshacer.')) return;
    try {
      await api.delete(`/productos/${id}`);
      setOk('Producto eliminado.');
      if (edit?.id === id) setEdit(null);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar el producto.');
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

  // Selección múltiple: acciones en bloque sobre los productos marcados.
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const idsVisibles = visibles.map((p) => p.id);
  const todosMarcados = idsVisibles.length > 0 && idsVisibles.every((id) => marcados.has(id));
  const alternarMarca = (id: string) => setMarcados((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const alternarTodos = () => setMarcados((s) => { const n = new Set(s); if (todosMarcados) idsVisibles.forEach((id) => n.delete(id)); else idsVisibles.forEach((id) => n.add(id)); return n; });

  async function enBloque(accion: 'activar' | 'desactivar' | 'eliminar') {
    const ids = [...marcados];
    if (ids.length === 0) return;
    if (accion === 'eliminar' && !await confirmar(`¿Eliminar ${ids.length} producto(s)? No se puede deshacer.`)) return;
    setError('');
    const resultados = await Promise.allSettled(ids.map((id) => (accion === 'eliminar' ? api.delete(`/productos/${id}`) : api.patch(`/productos/${id}`, { activo: accion === 'activar' }))));
    const fallos = resultados.filter((r) => r.status === 'rejected').length;
    setMarcados(new Set());
    if (fallos) setError(`${fallos} de ${ids.length} no se pudieron ${accion === 'eliminar' ? 'eliminar' : 'actualizar'}.`);
    else setOk(accion === 'eliminar' ? `${ids.length} producto(s) eliminado(s).` : `${ids.length} producto(s) ${accion === 'activar' ? 'activado(s)' : 'desactivado(s)'}.`);
    await cargar();
  }

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
        <section className="ax-card ax-col--12" role="region" aria-label="Productos" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body">
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                <Select className="ax-select" aria-label="Filtrar por categoría" value={cat} onChange={(e) => setCat(e.target.value)} style={{ maxWidth: 220 }}>
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </Select>
                <Select className="ax-select" aria-label="Filtrar por estado" value={estado} onChange={(e) => setEstado(e.target.value as typeof estado)} style={{ maxWidth: 180 }}>
                  <option value="">Todos</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                  <option value="sinstock">Sin stock</option>
                </Select>
              </div>
              <input type="search" className="ax-input" placeholder="Buscar nombre, SKU o marca…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar productos" style={{ maxWidth: 300 }} />
            </div>
            {marcados.size > 0 && (
              <div role="toolbar" aria-label="Acciones sobre los productos seleccionados" className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap', marginBlockStart: 'var(--ax-space-3)', padding: 'var(--ax-space-2) var(--ax-space-3)', background: 'var(--ax-surface-subtle)', borderRadius: 'var(--ax-radius-md)' }}>
                <strong style={{ fontSize: 'var(--ax-text-sm)' }}>{marcados.size} seleccionado{marcados.size === 1 ? '' : 's'}</strong>
                <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => void enBloque('activar')}>Activar</button>
                <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => void enBloque('desactivar')}>Desactivar</button>
                {esAdmin && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={() => void enBloque('eliminar')}>Eliminar</button>}
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setMarcados(new Set())}>Quitar selección</button>
              </div>
            )}
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col" style={{ width: 40 }}>
                    <input type="checkbox" aria-label="Seleccionar todos los productos visibles" checked={todosMarcados} onChange={alternarTodos} />
                  </th>
                  <th className="ax-table__th" scope="col">Producto</th>
                  <th className="ax-table__th" scope="col">Categoría</th>
                  <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Precio</th>
                  <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Stock</th>
                  <th className="ax-table__th" scope="col">Estado</th>
                  <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={7}>Cargando…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={7} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay productos. Importa el catálogo o crea el primero.' : 'Ningún producto coincide con el filtro.'}</td></tr>
                ) : (
                  visibles.map((p) => (
                    <tr key={p.id} className="ax-table__row" onClick={() => { setOk(''); setError(''); setEdit({ id: p.id, form: desde(p) }); }} tabIndex={0} onKeyDown={teclaFila(() => { setOk(''); setError(''); setEdit({ id: p.id, form: desde(p) }); })} style={{ cursor: 'pointer', background: marcados.has(p.id) || edit?.id === p.id ? 'var(--ax-surface-subtle)' : undefined }}>
                      <td className="ax-table__td" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" aria-label={`Seleccionar ${p.nombre}`} checked={marcados.has(p.id)} onChange={() => alternarMarca(p.id)} />
                      </td>
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
                      <td className="ax-table__td" style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
                          <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => { setOk(''); setError(''); setEdit({ id: p.id, form: desde(p) }); }}>Editar</button>
                          {esAdmin && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => void borrar(p.id)} aria-label="Eliminar" style={{ color: 'var(--ax-danger-500)' }}>Eliminar</button>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {edit && (
          <Modal
            tamano="lg"
            titulo={edit.id ? 'Editar producto' : 'Nuevo producto'}
            subtitulo={edit.id && edit.form.slug ? <a href={`${WEB}/producto/${edit.form.slug}`} target="_blank" rel="noreferrer">Ver en la tienda</a> : undefined}
            onCerrar={() => setEdit(null)}
            pie={
              <>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEdit(null)} disabled={guardando}>Cancelar</button>
                <button type="button" className={`ax-btn ax-btn--primary${guardando ? ' is-loading' : ''}`} onClick={guardar} disabled={guardando}>
                  <span className="ax-btn__label">{edit.id ? 'Guardar cambios' : 'Crear producto'}</span>
                </button>
              </>
            }
          >
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
                <Select id="p-cat" className="ax-select" value={edit.form.categoriaId} onChange={(e) => set('categoriaId', e.target.value)}>
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </Select>
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="p-img">Imágenes (la primera es la portada)</label>
                <CampoImagenes id="p-img" value={edit.form.imagenes.split('\n').map((l) => l.trim()).filter(Boolean)} onChange={(urls) => set('imagenes', urls.join('\n'))} />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="p-detalle">Detalle corto (bajo el nombre en las tarjetas)</label>
                <input id="p-detalle" className="ax-input" value={edit.form.detalle} onChange={(e) => set('detalle', e.target.value)} />
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
          </Modal>
        )}
      </div>
    </>
  );
}

export default EcommerceProductos;
