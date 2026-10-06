'use client';
/*
 * FPTecnologi-HUB — Web informativa → Recursos (GET/POST /recursos). Intranet de socios: el equipo sube el material
 * de marcas (logos, fichas, banners, videos, packs ZIP; varios archivos a la vez) y gestiona a los socios: aprueba o
 * rechaza solicitudes de registro, da o quita el acceso. Los archivos son PRIVADOS: solo los ve un socio activo
 * con sesión (y el equipo desde aquí).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { abrirArchivoPrivado, api } from '../../lib/api';

type Tipo = 'IMAGEN' | 'PDF' | 'VIDEO' | 'DOCUMENTO' | 'OTRO';
type EstadoSocio = 'PENDIENTE' | 'ACTIVO' | 'SUSPENDIDO' | 'RECHAZADO';
interface Recurso {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: Tipo;
  fabricante: string | null;
  categoria: string | null;
  bytes: number;
  visible: boolean;
  descargas: number;
}
interface Socio {
  id: string;
  email: string;
  nombre: string | null;
  empresa: string | null;
  ruc: string | null;
  cargo: string | null;
  celular: string | null;
  mensaje: string | null;
  notas: string | null;
  estado: EstadoSocio;
  aprobadoPor: string | null;
  ultimoAcceso: string | null;
  createdAt: string;
}
interface Subido {
  clave: string;
  tipo: Tipo;
  mime: string;
  bytes: number;
}

const TIPO_LABEL: Record<Tipo, string> = { IMAGEN: 'Imagen', PDF: 'PDF', VIDEO: 'Video', DOCUMENTO: 'Documento', OTRO: 'ZIP / otro' };
// Fondo e ícono SVG por tipo de archivo (no se generan miniaturas en el servidor).
const TIPO_ESTILO: Record<Tipo, { bg: string; fg: string; d: string }> = {
  IMAGEN: { bg: '#e0f2fe', fg: '#0369a1', d: 'M4 5h16v14H4zM8 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-4 8 5-5 3 3 4-4 4 4' },
  PDF: { bg: '#fee2e2', fg: '#b91c1c', d: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6' },
  VIDEO: { bg: '#ede9fe', fg: '#6d28d9', d: 'M4 6h12v12H4zM16 10l5-3v10l-5-3' },
  DOCUMENTO: { bg: '#dcfce7', fg: '#15803d', d: 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h6M9 16h4' },
  OTRO: { bg: '#fef3c7', fg: '#b45309', d: 'M5 8h14v12H5zM5 8l2-4h10l2 4M12 8v6M10 12h4' },
};
const CATEGORIAS = ['Logos', 'Fichas técnicas', 'Banners', 'Catálogos', 'Videos', 'Presentaciones', 'Promociones', 'Packs'];
const ESTADO_SOCIO: { v: EstadoSocio; label: string; badge: string }[] = [
  { v: 'PENDIENTE', label: 'Pendiente', badge: 'ax-badge--warning' },
  { v: 'ACTIVO', label: 'Activo', badge: 'ax-badge--success' },
  { v: 'SUSPENDIDO', label: 'Suspendido', badge: 'ax-badge--neutral' },
  { v: 'RECHAZADO', label: 'Rechazado', badge: 'ax-badge--danger' },
];
const peso = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
const tituloDe = (nombreArchivo: string) => nombreArchivo.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim().slice(0, 160);

function IconoTipo({ tipo }: { tipo: Tipo }) {
  const e = TIPO_ESTILO[tipo];
  return (
    <span aria-hidden style={{ display: 'inline-flex', width: 40, height: 40, borderRadius: 10, background: e.bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={e.fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={e.d} /></svg>
    </span>
  );
}

export function WebRecursos() {
  const { activeMarcaId } = useAuth();
  const [pestana, setPestana] = useState<'recursos' | 'socios'>('recursos');
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(true);
  const [q, setQ] = useState('');
  const [filtroSocio, setFiltroSocio] = useState<'' | EstadoSocio>('');

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

  // Abre la pestaña de socios si el aviso/notificación trae ?socio=
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('socio')) setPestana('socios');
  }, []);

  const fabricantes = useMemo(() => [...new Set(recursos.map((r) => r.fabricante).filter(Boolean) as string[])].sort(), [recursos]);
  const pendientes = socios.filter((s) => s.estado === 'PENDIENTE').length;

  // ---- subir recursos (uno o varios a la vez)
  const archivoRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ titulo: '', fabricante: '', categoria: '', descripcion: '' });
  const [archivos, setArchivos] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState<string>('');

  async function subir(e: React.FormEvent) {
    e.preventDefault();
    if (archivos.length === 0) return setError('Elige al menos un archivo.');
    if (archivos.length === 1 && form.titulo.trim().length < 2) return setError('Escribe un título.');
    setError('');
    setAviso('');
    let ok = 0;
    const fallos: string[] = [];
    for (const [i, archivo] of archivos.entries()) {
      setSubiendo(`Subiendo ${i + 1} de ${archivos.length}: ${archivo.name}`);
      try {
        const fd = new FormData();
        fd.append('archivo', archivo);
        const s = await api.post<Subido>('/recursos/archivo', fd);
        await api.post('/recursos', {
          titulo: archivos.length === 1 ? form.titulo.trim() : tituloDe(archivo.name) || archivo.name,
          tipo: s.tipo,
          clave: s.clave,
          mime: s.mime,
          bytes: s.bytes,
          fabricante: form.fabricante.trim() || undefined,
          categoria: form.categoria.trim() || undefined,
          descripcion: form.descripcion.trim() || undefined,
        });
        ok++;
      } catch (err) {
        fallos.push(`${archivo.name}: ${err instanceof ApiError ? err.message : 'no se pudo subir'}`);
      }
    }
    setSubiendo('');
    if (ok) setAviso(`${ok} recurso${ok > 1 ? 's' : ''} subido${ok > 1 ? 's' : ''}.`);
    if (fallos.length) setError(fallos.join(' · '));
    setForm({ titulo: '', fabricante: form.fabricante, categoria: form.categoria, descripcion: '' });
    setArchivos([]);
    if (archivoRef.current) archivoRef.current.value = '';
    await cargar();
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

  async function ver(r: Recurso) {
    try {
      await abrirArchivoPrivado(`/recursos/${r.id}/archivo`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo abrir el archivo.');
    }
  }

  // ---- socios
  const [nuevo, setNuevo] = useState({ email: '', nombre: '', empresa: '', ruc: '' });

  async function agregarSocio(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/recursos/socios', { email: nuevo.email.trim(), nombre: nuevo.nombre.trim() || undefined, empresa: nuevo.empresa.trim() || undefined, ruc: nuevo.ruc.trim() || undefined });
      setNuevo({ email: '', nombre: '', empresa: '', ruc: '' });
      setAviso('Socio agregado: recibe un correo de bienvenida cuando el envío de correos esté configurado.');
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar el socio.');
    }
  }

  async function cambiarSocio(s: Socio, cambios: Partial<Pick<Socio, 'estado' | 'notas'>>) {
    try {
      const n = await api.patch<Socio>(`/recursos/socios/${s.id}`, cambios);
      setSocios((l) => l.map((x) => (x.id === s.id ? n : x)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    }
  }

  async function quitarSocio(s: Socio) {
    if (!window.confirm(`¿Eliminar a ${s.email}? Pierde el acceso y se borra su registro.`)) return;
    try {
      await api.delete(`/recursos/socios/${s.id}`);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar.');
    }
  }

  const visibles = recursos.filter((r) => !q.trim() || `${r.titulo} ${r.fabricante ?? ''} ${r.categoria ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()));
  const sociosVisibles = socios.filter((s) => !filtroSocio || s.estado === filtroSocio);
  const campo = { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160, flex: '1 1 160px' } as const;

  return (
    <>
      <PageHead title="Intranet de socios" subtitle="Material de marcas para los socios (privado: solo con sesión) y gestión de sus accesos." />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}
      {aviso && !error && (
        <div role="status" className="ax-alert" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message">{aviso}</p></div>
        </div>
      )}

      <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Sección" style={{ marginBlockEnd: 'var(--ax-space-4)' }}>
        <button type="button" role="radio" aria-checked={pestana === 'recursos'} className={`ax-btn ax-btn--sm${pestana === 'recursos' ? ' is-selected' : ''}`} onClick={() => setPestana('recursos')}>Recursos ({recursos.length})</button>
        <button type="button" role="radio" aria-checked={pestana === 'socios'} className={`ax-btn ax-btn--sm${pestana === 'socios' ? ' is-selected' : ''}`} onClick={() => setPestana('socios')}>Socios ({socios.length}){pendientes > 0 ? ` · ${pendientes} por aprobar` : ''}</button>
      </div>

      {pestana === 'recursos' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
          <section className="ax-card" aria-label="Subir recursos">
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Subir recursos</h2><p className="ax-card__subtitle">Elige uno o varios archivos (imágenes, PDF, video MP4/WEBM, Word/Excel/PowerPoint o un ZIP como pack) · hasta 100 MB c/u. Todo se revisa con el antivirus antes de guardarse.</p></div></div>
            <form className="ax-card__body" onSubmit={subir} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ax-space-3)', alignItems: 'flex-end' }}>
              <div style={campo}><label className="ax-label" htmlFor="rec-archivo">Archivos *</label><input id="rec-archivo" ref={archivoRef} type="file" multiple className="ax-input" required onChange={(e) => setArchivos(Array.from(e.target.files ?? []))} /></div>
              {archivos.length <= 1 && <div style={campo}><label className="ax-label" htmlFor="rec-titulo">Título *</label><input id="rec-titulo" className="ax-input" maxLength={160} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required={archivos.length === 1} /></div>}
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
              {archivos.length > 1 && <p style={{ flexBasis: '100%', margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Con varios archivos, cada título sale del nombre del archivo; los podrás editar después.</p>}
              <button type="submit" className="ax-btn ax-btn--primary" disabled={!!subiendo}><span className="ax-btn__label">{subiendo ? 'Subiendo…' : archivos.length > 1 ? `Subir ${archivos.length} archivos` : 'Subir recurso'}</span></button>
              {subiendo && <span role="status" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{subiendo}</span>}
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
                    <th className="ax-table__th" scope="col">Descargas</th>
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
                            <IconoTipo tipo={r.tipo} />
                            <div>
                              <button type="button" onClick={() => ver(r)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)', textAlign: 'left' }}>{r.titulo}</button>
                              <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{TIPO_LABEL[r.tipo]} · {peso(r.bytes)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="ax-table__td">{r.fabricante ?? '—'}</td>
                        <td className="ax-table__td">{r.categoria ?? '—'}</td>
                        <td className="ax-table__td">{r.descargas}</td>
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
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Dar acceso a un socio</h2><p className="ax-card__subtitle">También pueden registrarse solos en /socios/registro: sus solicitudes llegan abajo como «Pendiente» para que las apruebes.</p></div></div>
            <form className="ax-card__body" onSubmit={agregarSocio} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ax-space-3)', alignItems: 'flex-end' }}>
              <div style={campo}><label className="ax-label" htmlFor="soc-email">Correo *</label><input id="soc-email" type="email" className="ax-input" required maxLength={120} value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} /></div>
              <div style={campo}><label className="ax-label" htmlFor="soc-nombre">Nombre</label><input id="soc-nombre" className="ax-input" maxLength={120} value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} /></div>
              <div style={campo}><label className="ax-label" htmlFor="soc-emp">Empresa</label><input id="soc-emp" className="ax-input" maxLength={120} value={nuevo.empresa} onChange={(e) => setNuevo({ ...nuevo, empresa: e.target.value })} /></div>
              <div style={campo}><label className="ax-label" htmlFor="soc-ruc">RUC</label><input id="soc-ruc" className="ax-input" maxLength={15} value={nuevo.ruc} onChange={(e) => setNuevo({ ...nuevo, ruc: e.target.value })} /></div>
              <button type="submit" className="ax-btn ax-btn--primary"><span className="ax-btn__label">Dar acceso</span></button>
            </form>
          </section>

          <section className="ax-card" aria-label="Socios">
            <div className="ax-card__body">
              <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Filtrar socios">
                {([{ v: '' as const, label: 'Todos' }, ...ESTADO_SOCIO] as { v: '' | EstadoSocio; label: string }[]).map((e) => (
                  <button key={e.label} type="button" role="radio" aria-checked={filtroSocio === e.v} className={`ax-btn ax-btn--sm${filtroSocio === e.v ? ' is-selected' : ''}`} onClick={() => setFiltroSocio(e.v)}>
                    {e.label} ({socios.filter((s) => !e.v || s.estado === e.v).length})
                  </button>
                ))}
              </div>
            </div>
            <div className="ax-table-wrap">
              <table className="ax-table ax-table--hover">
                <thead className="ax-table__head">
                  <tr>
                    <th className="ax-table__th" scope="col">Socio</th>
                    <th className="ax-table__th" scope="col">Empresa</th>
                    <th className="ax-table__th" scope="col">Estado</th>
                    <th className="ax-table__th" scope="col">Último acceso</th>
                    <th className="ax-table__th" scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {sociosVisibles.length === 0 ? (
                    <tr><td className="ax-table__td" colSpan={5} style={{ color: 'var(--ax-text-muted)' }}>No hay socios en esta vista.</td></tr>
                  ) : (
                    sociosVisibles.map((s) => (
                      <tr key={s.id} className="ax-table__row">
                        <td className="ax-table__td">
                          <div style={{ fontWeight: 'var(--ax-weight-semibold)' }}>{s.nombre ?? s.email}{s.cargo ? ` · ${s.cargo}` : ''}</div>
                          <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{s.email}{s.celular ? ` · ${s.celular}` : ''}</div>
                          {s.mensaje && <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)', marginBlockStart: 2 }}>“{s.mensaje}”</div>}
                        </td>
                        <td className="ax-table__td">{s.empresa ?? '—'}{s.ruc ? <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>RUC {s.ruc}</div> : null}<div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Solicitó {fecha(s.createdAt)}</div></td>
                        <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--sm ${ESTADO_SOCIO.find((x) => x.v === s.estado)!.badge}`}>{ESTADO_SOCIO.find((x) => x.v === s.estado)!.label}</span></td>
                        <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{s.ultimoAcceso ? fecha(s.ultimoAcceso) : '—'}</td>
                        <td className="ax-table__td">
                          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                            {s.estado !== 'ACTIVO' && <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" onClick={() => cambiarSocio(s, { estado: 'ACTIVO' })}><span className="ax-btn__label">Aprobar</span></button>}
                            {s.estado === 'PENDIENTE' && <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => cambiarSocio(s, { estado: 'RECHAZADO' })}><span className="ax-btn__label">Rechazar</span></button>}
                            {s.estado === 'ACTIVO' && <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => cambiarSocio(s, { estado: 'SUSPENDIDO' })}><span className="ax-btn__label">Suspender</span></button>}
                            <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => quitarSocio(s)}>Eliminar</button>
                          </div>
                        </td>
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
