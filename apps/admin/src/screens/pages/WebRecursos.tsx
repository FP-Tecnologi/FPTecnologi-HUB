'use client';
/*
 * FPTecnologi-HUB — Web informativa → Recursos (GET/POST /recursos). Material de marcas para los socios (logos,
 * fichas técnicas, banners, videos, catálogos): el equipo lo sube aquí y los socios autorizados lo descargan en
 * /recursos de la web. Segunda pestaña: lista de socios (correos autorizados a entrar).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { urlImagen } from '../../components/ui/SubirImagen';

type Tipo = 'IMAGEN' | 'PDF' | 'VIDEO' | 'DOCUMENTO' | 'OTRO';
interface Recurso {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: Tipo;
  fabricante: string | null;
  categoria: string | null;
  archivoUrl: string;
  bytes: number;
  visible: boolean;
}
interface Socio {
  id: string;
  email: string;
  nombre: string | null;
  empresa: string | null;
  ruc: string | null;
  activo: boolean;
}
interface Subido {
  ruta: string;
  tipo: Tipo;
  mime: string;
  bytes: number;
}

const TIPO_LABEL: Record<Tipo, string> = { IMAGEN: 'Imagen', PDF: 'PDF', VIDEO: 'Video', DOCUMENTO: 'Documento', OTRO: 'Otro' };
const CATEGORIAS = ['Logos', 'Fichas técnicas', 'Banners', 'Catálogos', 'Videos', 'Presentaciones', 'Promociones'];
const peso = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export function WebRecursos() {
  const { activeMarcaId } = useAuth();
  const [pestana, setPestana] = useState<'recursos' | 'socios'>('recursos');
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [q, setQ] = useState('');

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      const [r, s] = await Promise.all([api.get<Recurso[]>('/recursos'), api.get<Socio[]>('/recursos/socios')]);
      setRecursos(r);
      setSocios(s);
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cargar.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const fabricantes = useMemo(() => [...new Set(recursos.map((r) => r.fabricante).filter(Boolean) as string[])].sort(), [recursos]);

  // ---- subir recurso
  const archivoRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ titulo: '', fabricante: '', categoria: '', descripcion: '' });
  const [subiendo, setSubiendo] = useState(false);

  async function subir(e: React.FormEvent) {
    e.preventDefault();
    const archivo = archivoRef.current?.files?.[0];
    if (!archivo) return setError('Elige un archivo.');
    if (form.titulo.trim().length < 2) return setError('Escribe un título.');
    setSubiendo(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('archivo', archivo);
      const s = await api.post<Subido>('/recursos/archivo', fd);
      await api.post('/recursos', {
        titulo: form.titulo.trim(),
        tipo: s.tipo,
        archivoUrl: s.ruta,
        mime: s.mime,
        bytes: s.bytes,
        fabricante: form.fabricante.trim() || undefined,
        categoria: form.categoria.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
      });
      setForm({ titulo: '', fabricante: form.fabricante, categoria: form.categoria, descripcion: '' });
      if (archivoRef.current) archivoRef.current.value = '';
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo subir el archivo.');
    } finally {
      setSubiendo(false);
    }
  }

  async function cambiar(r: Recurso, cambios: Partial<Recurso>) {
    try {
      const n = await api.patch<Recurso>(`/recursos/${r.id}`, cambios);
      setRecursos((l) => l.map((x) => (x.id === r.id ? { ...x, ...n } : x)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    }
  }

  async function borrar(r: Recurso) {
    if (!window.confirm(`¿Eliminar "${r.titulo}"? Se borra también el archivo.`)) return;
    try {
      await api.delete(`/recursos/${r.id}`);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar.');
    }
  }

  // ---- socios
  const [nuevo, setNuevo] = useState({ email: '', nombre: '', empresa: '', ruc: '' });

  async function agregarSocio(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/recursos/socios', {
        email: nuevo.email.trim(),
        nombre: nuevo.nombre.trim() || undefined,
        empresa: nuevo.empresa.trim() || undefined,
        ruc: nuevo.ruc.trim() || undefined,
      });
      setNuevo({ email: '', nombre: '', empresa: '', ruc: '' });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar el socio.');
    }
  }

  async function cambiarSocio(s: Socio, cambios: Partial<Socio>) {
    try {
      const n = await api.patch<Socio>(`/recursos/socios/${s.id}`, cambios);
      setSocios((l) => l.map((x) => (x.id === s.id ? n : x)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    }
  }

  async function quitarSocio(s: Socio) {
    if (!window.confirm(`¿Quitar el acceso de ${s.email}?`)) return;
    try {
      await api.delete(`/recursos/socios/${s.id}`);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo quitar.');
    }
  }

  const visibles = recursos.filter((r) => !q.trim() || `${r.titulo} ${r.fabricante ?? ''} ${r.categoria ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()));
  const campo = { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160, flex: '1 1 160px' } as const;

  return (
    <>
      <PageHead title="Recursos para socios" subtitle="Material de marcas (logos, fichas, banners, videos) que los socios descargan en la web." />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Sección" style={{ marginBlockEnd: 'var(--ax-space-4)' }}>
        <button type="button" role="radio" aria-checked={pestana === 'recursos'} className={`ax-btn ax-btn--sm${pestana === 'recursos' ? ' is-selected' : ''}`} onClick={() => setPestana('recursos')}>Recursos ({recursos.length})</button>
        <button type="button" role="radio" aria-checked={pestana === 'socios'} className={`ax-btn ax-btn--sm${pestana === 'socios' ? ' is-selected' : ''}`} onClick={() => setPestana('socios')}>Socios ({socios.length})</button>
      </div>

      {pestana === 'recursos' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
          <section className="ax-card" aria-label="Subir recurso">
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Subir recurso</h2><p className="ax-card__subtitle">Imagen, PDF, video MP4/WEBM, Word/Excel/PowerPoint o ZIP · hasta 100 MB.</p></div></div>
            <form className="ax-card__body" onSubmit={subir} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ax-space-3)', alignItems: 'flex-end' }}>
              <div style={campo}><label className="ax-label" htmlFor="rec-archivo">Archivo *</label><input id="rec-archivo" ref={archivoRef} type="file" className="ax-input" required /></div>
              <div style={campo}><label className="ax-label" htmlFor="rec-titulo">Título *</label><input id="rec-titulo" className="ax-input" maxLength={160} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></div>
              <div style={campo}>
                <label className="ax-label" htmlFor="rec-fab">Marca del fabricante</label>
                <input id="rec-fab" className="ax-input" list="rec-fabs" maxLength={80} placeholder="Dell, HP, Lenovo…" value={form.fabricante} onChange={(e) => setForm({ ...form, fabricante: e.target.value })} />
                <datalist id="rec-fabs">{fabricantes.map((f) => <option key={f} value={f} />)}</datalist>
              </div>
              <div style={campo}>
                <label className="ax-label" htmlFor="rec-cat">Categoría</label>
                <input id="rec-cat" className="ax-input" list="rec-cats" maxLength={80} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
                <datalist id="rec-cats">{CATEGORIAS.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <div style={{ ...campo, flexBasis: '100%' }}><label className="ax-label" htmlFor="rec-desc">Descripción</label><input id="rec-desc" className="ax-input" maxLength={1000} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
              <button type="submit" className="ax-btn ax-btn--primary" disabled={subiendo}><span className="ax-btn__label">{subiendo ? 'Subiendo…' : 'Subir recurso'}</span></button>
            </form>
          </section>

          <section className="ax-card" aria-label="Recursos">
            <div className="ax-card__body">
              <input type="search" className="ax-input" placeholder="Buscar título, marca, categoría…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar recursos" style={{ maxWidth: 320 }} />
            </div>
            <div className="ax-table-wrap">
              <table className="ax-table ax-table--hover">
                <thead className="ax-table__head">
                  <tr>
                    <th className="ax-table__th" scope="col">Recurso</th>
                    <th className="ax-table__th" scope="col">Marca</th>
                    <th className="ax-table__th" scope="col">Categoría</th>
                    <th className="ax-table__th" scope="col">Tipo</th>
                    <th className="ax-table__th" scope="col">Visible</th>
                    <th className="ax-table__th" scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td className="ax-table__td" colSpan={6}>Cargando…</td></tr>
                  ) : visibles.length === 0 ? (
                    <tr><td className="ax-table__td" colSpan={6} style={{ color: 'var(--ax-text-muted)' }}>{recursos.length === 0 ? 'Aún no hay recursos. Sube el primero arriba.' : 'Nada coincide con la búsqueda.'}</td></tr>
                  ) : (
                    visibles.map((r) => (
                      <tr key={r.id} className="ax-table__row">
                        <td className="ax-table__td">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ax-space-3)' }}>
                            {r.tipo === 'IMAGEN' && <img src={urlImagen(r.archivoUrl)} alt="" width={40} height={40} style={{ objectFit: 'cover', borderRadius: 8 }} loading="lazy" />}
                            <div>
                              <a href={urlImagen(r.archivoUrl)} target="_blank" rel="noreferrer noopener" style={{ fontWeight: 'var(--ax-weight-semibold)' }}>{r.titulo}</a>
                              <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{peso(r.bytes)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="ax-table__td">{r.fabricante ?? '—'}</td>
                        <td className="ax-table__td">{r.categoria ?? '—'}</td>
                        <td className="ax-table__td">{TIPO_LABEL[r.tipo]}</td>
                        <td className="ax-table__td"><input type="checkbox" checked={r.visible} aria-label={`Visible: ${r.titulo}`} onChange={(e) => cambiar(r, { visible: e.target.checked })} /></td>
                        <td className="ax-table__td"><button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => borrar(r)}>Eliminar</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
          <section className="ax-card" aria-label="Agregar socio">
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Agregar socio</h2><p className="ax-card__subtitle">El socio entra en /recursos con su correo (recibe un código); no necesita haber comprado.</p></div></div>
            <form className="ax-card__body" onSubmit={agregarSocio} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ax-space-3)', alignItems: 'flex-end' }}>
              <div style={campo}><label className="ax-label" htmlFor="soc-email">Correo *</label><input id="soc-email" type="email" className="ax-input" required maxLength={120} value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} /></div>
              <div style={campo}><label className="ax-label" htmlFor="soc-nombre">Nombre</label><input id="soc-nombre" className="ax-input" maxLength={120} value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} /></div>
              <div style={campo}><label className="ax-label" htmlFor="soc-emp">Empresa</label><input id="soc-emp" className="ax-input" maxLength={120} value={nuevo.empresa} onChange={(e) => setNuevo({ ...nuevo, empresa: e.target.value })} /></div>
              <div style={campo}><label className="ax-label" htmlFor="soc-ruc">RUC</label><input id="soc-ruc" className="ax-input" maxLength={15} value={nuevo.ruc} onChange={(e) => setNuevo({ ...nuevo, ruc: e.target.value })} /></div>
              <button type="submit" className="ax-btn ax-btn--primary"><span className="ax-btn__label">Agregar socio</span></button>
            </form>
          </section>

          <section className="ax-card" aria-label="Socios">
            <div className="ax-table-wrap">
              <table className="ax-table ax-table--hover">
                <thead className="ax-table__head">
                  <tr>
                    <th className="ax-table__th" scope="col">Socio</th>
                    <th className="ax-table__th" scope="col">Empresa</th>
                    <th className="ax-table__th" scope="col">Activo</th>
                    <th className="ax-table__th" scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {socios.length === 0 ? (
                    <tr><td className="ax-table__td" colSpan={4} style={{ color: 'var(--ax-text-muted)' }}>Aún no hay socios autorizados.</td></tr>
                  ) : (
                    socios.map((s) => (
                      <tr key={s.id} className="ax-table__row">
                        <td className="ax-table__td"><div style={{ fontWeight: 'var(--ax-weight-semibold)' }}>{s.nombre ?? s.email}</div>{s.nombre && <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{s.email}</div>}</td>
                        <td className="ax-table__td">{s.empresa ?? '—'}{s.ruc ? ` · RUC ${s.ruc}` : ''}</td>
                        <td className="ax-table__td"><input type="checkbox" checked={s.activo} aria-label={`Activo: ${s.email}`} onChange={(e) => cambiarSocio(s, { activo: e.target.checked })} /></td>
                        <td className="ax-table__td"><button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => quitarSocio(s)}>Quitar</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default WebRecursos;
