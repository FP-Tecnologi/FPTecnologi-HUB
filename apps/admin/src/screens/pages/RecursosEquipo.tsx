'use client';
/*
 * FPTecnologi-HUB — Recursos del equipo (GET/POST /recursos-equipo). Biblioteca interna compartida por TODAS las áreas y
 * marcas: logos en todos los formatos, plantillas de correo y de documentos, imágenes, presentaciones… Cualquier usuario
 * con sesión ve, descarga y sube; editar o borrar lo hace quien lo subió o un administrador. No confundir con
 * «Web → Recursos» (intranet de socios externos).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { Modal } from '../../components/ui/Modal';
import { confirmar } from '../../components/ui/Dialogos';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api, obtenerArchivoPrivado } from '../../lib/api';

interface Recurso {
  id: string;
  titulo: string;
  descripcion: string | null;
  area: string;
  categoria: string;
  variante: string | null;
  marcaRef: string | null;
  marcaNombre: string | null;
  etiquetas: string[];
  nombreOriginal: string;
  ext: string;
  mime: string;
  bytes: number;
  descargas: number;
  subidoPorId: string;
  subidoPorNombre: string;
  createdAt: string;
  previsualizable: boolean;
  puedeGestionar: boolean;
}
interface MarcaLite { id: string; nombre: string }
interface Datos { items: Recurso[]; marcas: MarcaLite[] }
interface Meta { titulo: string; descripcion: string; area: string; categoria: string; variante: string; marcaRef: string; etiquetas: string }

const AREAS: Record<string, string> = { GENERAL: 'General', MARKETING: 'Marketing', COMERCIAL: 'Comercial', VENTAS: 'Ventas', SOPORTE: 'Soporte', LOGISTICA: 'Logística', FINANZAS: 'Finanzas' };
const CATEGORIAS: Record<string, string> = { LOGOS: 'Logos', IMAGENES: 'Imágenes', CORREOS: 'Plantillas de correo', DOCUMENTOS: 'Documentos', PLANTILLAS: 'Plantillas', PRESENTACIONES: 'Presentaciones', VIDEOS: 'Videos y audio', TIPOGRAFIAS: 'Tipografías', OTROS: 'Otros' };
const ORDENES = { recientes: 'Más recientes', nombre: 'Nombre (A–Z)', tamano: 'Más pesados', descargas: 'Más descargados' } as const;
type Orden = keyof typeof ORDENES;

const EXT_IMAGEN = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);
const peso = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
const tituloDe = (n: string) => n.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim().slice(0, 160);

/** Categoría sugerida por el archivo (el usuario puede cambiarla). */
function categoriaDe(nombre: string): string {
  const ext = (nombre.split('.').pop() ?? '').toLowerCase();
  const esLogo = /logo|isotipo|marca/i.test(nombre);
  if (['ai', 'eps', 'psd', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return esLogo ? 'LOGOS' : 'IMAGENES';
  if (['html', 'eml'].includes(ext)) return 'CORREOS';
  if (['pptx', 'ppt'].includes(ext)) return 'PRESENTACIONES';
  if (['mp4', 'webm', 'mp3'].includes(ext)) return 'VIDEOS';
  if (['ttf', 'otf', 'woff2'].includes(ext)) return 'TIPOGRAFIAS';
  if (['docx', 'doc', 'xlsx', 'xls', 'csv', 'pdf', 'txt'].includes(ext)) return /plantilla|modelo|formato/i.test(nombre) ? 'PLANTILLAS' : 'DOCUMENTOS';
  return 'OTROS';
}

/** Color de la etiqueta de formato por familia de archivo. */
function colorExt(ext: string): { bg: string; fg: string } {
  if (EXT_IMAGEN.has(ext) || ['ai', 'eps', 'psd'].includes(ext)) return { bg: '#e0f2fe', fg: '#0369a1' };
  if (ext === 'pdf') return { bg: '#fee2e2', fg: '#b91c1c' };
  if (['docx', 'doc', 'txt'].includes(ext)) return { bg: '#dbeafe', fg: '#1d4ed8' };
  if (['xlsx', 'xls', 'csv'].includes(ext)) return { bg: '#dcfce7', fg: '#15803d' };
  if (['pptx', 'ppt'].includes(ext)) return { bg: '#ffedd5', fg: '#c2410c' };
  if (['mp4', 'webm', 'mp3'].includes(ext)) return { bg: '#ede9fe', fg: '#6d28d9' };
  if (['html', 'eml'].includes(ext)) return { bg: '#fae8ff', fg: '#a21caf' };
  return { bg: '#fef3c7', fg: '#b45309' };
}

const urls = new Map<string, string>(); // miniaturas ya descargadas (blob URL) durante la sesión

/** Vista pequeña del archivo: imagen real si es imagen liviana (se baja solo al entrar en pantalla), si no, el formato. */
function Miniatura({ r, alto = 120 }: { r: Recurso; alto?: number }) {
  const caja = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(urls.get(r.id) ?? null);
  const conImagen = EXT_IMAGEN.has(r.ext) && r.bytes <= 4 * 1024 * 1024;

  useEffect(() => {
    if (!conImagen || src || !caja.current) return;
    const el = caja.current;
    let vivo = true;
    const obs = new IntersectionObserver((entradas) => {
      if (!entradas[0]?.isIntersecting) return;
      obs.disconnect();
      obtenerArchivoPrivado(`/recursos-equipo/${r.id}/archivo?inline=1`)
        .then((b) => {
          const u = URL.createObjectURL(b);
          urls.set(r.id, u);
          if (vivo) setSrc(u);
        })
        .catch(() => undefined);
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => { vivo = false; obs.disconnect(); };
  }, [conImagen, r.id, src]);

  const c = colorExt(r.ext);
  return (
    <div ref={caja} style={{ height: alto, background: src ? 'repeating-conic-gradient(var(--ax-surface-sunken, #f1f5f9) 0% 25%, var(--ax-surface, #fff) 0% 50%) 50% / 16px 16px' : c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 'var(--ax-radius-md, 8px)' }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" style={{ maxWidth: '88%', maxHeight: '88%', objectFit: 'contain' }} />
      ) : (
        <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1, color: c.fg }}>.{r.ext.toUpperCase()}</span>
      )}
    </div>
  );
}

async function guardarComo(r: Recurso) {
  const blob = await obtenerArchivoPrivado(`/recursos-equipo/${r.id}/archivo`);
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u;
  a.download = r.nombreOriginal;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 10_000);
}

const metaVacia = (): Meta => ({ titulo: '', descripcion: '', area: 'GENERAL', categoria: '', variante: '', marcaRef: '', etiquetas: '' });

export function RecursosEquipo() {
  const { user } = useAuth();
  const [datos, setDatos] = useState<Datos>({ items: [], marcas: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  // filtros
  const [q, setQ] = useState('');
  const [area, setArea] = useState('');
  const [categoria, setCategoria] = useState('');
  const [marca, setMarca] = useState('');
  const [soloMios, setSoloMios] = useState(false);
  const [orden, setOrden] = useState<Orden>('recientes');
  const [vista, setVista] = useState<'tarjetas' | 'lista'>('tarjetas');
  // ventanas
  const [abierto, setAbierto] = useState<Recurso | null>(null);
  const [editando, setEditando] = useState<Recurso | null>(null);
  const [subiendoAbierto, setSubiendoAbierto] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setDatos(await api.get<Datos>('/recursos-equipo'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cargar la biblioteca.');
    } finally {
      setCargando(false);
    }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  // Enlace compartido: /recursos?ver=<id> abre ese archivo.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('ver');
    if (id && datos.items.length) setAbierto((a) => a ?? datos.items.find((r) => r.id === id) ?? null);
  }, [datos.items]);

  const conteo = useMemo(() => {
    const por = (campo: 'area' | 'categoria') => datos.items.reduce<Record<string, number>>((m, r) => ({ ...m, [r[campo]]: (m[r[campo]] ?? 0) + 1 }), {});
    return { area: por('area'), categoria: por('categoria') };
  }, [datos.items]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    const lista = datos.items.filter((r) =>
      (!area || r.area === area) && (!categoria || r.categoria === categoria) &&
      (!marca || (marca === '_general' ? !r.marcaRef : r.marcaRef === marca)) &&
      (!soloMios || r.subidoPorId === user?.id) &&
      (!t || `${r.titulo} ${r.descripcion ?? ''} ${r.variante ?? ''} ${r.marcaNombre ?? ''} ${r.etiquetas.join(' ')} ${r.nombreOriginal} ${r.subidoPorNombre}`.toLowerCase().includes(t)));
    const cmp: Record<Orden, (a: Recurso, b: Recurso) => number> = {
      recientes: (a, b) => b.createdAt.localeCompare(a.createdAt),
      nombre: (a, b) => a.titulo.localeCompare(b.titulo, 'es'),
      tamano: (a, b) => b.bytes - a.bytes,
      descargas: (a, b) => b.descargas - a.descargas,
    };
    return [...lista].sort(cmp[orden]);
  }, [datos.items, q, area, categoria, marca, soloMios, orden, user?.id]);

  const hayFiltros = !!(q || area || categoria || marca || soloMios);
  const limpiar = () => { setQ(''); setArea(''); setCategoria(''); setMarca(''); setSoloMios(false); };

  async function descargar(r: Recurso) {
    try {
      await guardarComo(r);
      setDatos((d) => ({ ...d, items: d.items.map((x) => (x.id === r.id ? { ...x, descargas: x.descargas + 1 } : x)) }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo descargar.');
    }
  }

  async function copiarEnlace(r: Recurso) {
    const url = `${window.location.origin}/recursos?ver=${r.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setAviso('Enlace copiado: quien lo abra con su sesión del dashboard verá este archivo.');
    } catch {
      setAviso(url);
    }
  }

  async function borrar(r: Recurso) {
    if (!await confirmar(`¿Borrar «${r.titulo}»? Se elimina para todo el equipo y no se puede deshacer.`)) return;
    try {
      await api.delete(`/recursos-equipo/${r.id}`);
      setAbierto(null);
      urls.delete(r.id);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo borrar.');
    }
  }

  const chip = (activo: boolean) => ({
    display: 'flex', justifyContent: 'space-between', gap: 8, width: '100%', textAlign: 'left' as const, padding: '6px 10px', borderRadius: 8, border: 0, cursor: 'pointer',
    background: activo ? 'var(--ax-accent-100, #e0e7ff)' : 'transparent', color: activo ? 'var(--ax-accent-700, #3730a3)' : 'var(--ax-text, inherit)', fontWeight: activo ? 600 : 400, fontSize: 'var(--ax-text-sm)',
  });
  const grupo = (titulo: string, mapa: Record<string, string>, cuenta: Record<string, number>, valor: string, set: (v: string) => void) => (
    <div>
      <h3 style={{ margin: '0 0 6px', fontSize: 'var(--ax-text-xs)', textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--ax-text-subtle)' }}>{titulo}</h3>
      <button type="button" style={chip(!valor)} onClick={() => set('')}><span>Todas</span><span>{datos.items.length}</span></button>
      {Object.entries(mapa).map(([k, label]) => (
        <button key={k} type="button" style={{ ...chip(valor === k), opacity: cuenta[k] ? 1 : 0.5 }} onClick={() => set(valor === k ? '' : k)}><span>{label}</span><span>{cuenta[k] ?? 0}</span></button>
      ))}
    </div>
  );

  return (
    <>
      <PageHead
        title="Recursos del equipo"
        subtitle="Biblioteca compartida de todas las áreas: logos de todas las marcas, plantillas de correo y documentos, imágenes y más. Sube lo que sirva a otros y descarga lo que necesites."
        actions={<button type="button" className="ax-btn ax-btn--primary" onClick={() => setSubiendoAbierto(true)}><span className="ax-btn__label">Subir archivos</span></button>}
      />

      {error && <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div></div>}
      {aviso && !error && <div role="status" className="ax-alert" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{aviso}</p></div></div>}

      <div style={{ display: 'flex', gap: 'var(--ax-space-5)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <aside className="ax-card" aria-label="Filtros" style={{ flex: '0 0 230px', maxWidth: '100%', minWidth: 200 }}>
          <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
            {grupo('Área', AREAS, conteo.area, area, setArea)}
            {grupo('Tipo de recurso', CATEGORIAS, conteo.categoria, categoria, setCategoria)}
            <div>
              <label className="ax-label" htmlFor="rq-marca">Marca</label>
              <select id="rq-marca" className="ax-input" value={marca} onChange={(e) => setMarca(e.target.value)}>
                <option value="">Todas las marcas</option>
                <option value="_general">General (sin marca)</option>
                {datos.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 'var(--ax-text-sm)' }}>
              <input type="checkbox" checked={soloMios} onChange={(e) => setSoloMios(e.target.checked)} /> Solo lo que yo subí
            </label>
          </div>
        </aside>

        <section style={{ flex: '1 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} aria-label="Archivos">
          <div style={{ display: 'flex', gap: 'var(--ax-space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="search" className="ax-input" placeholder="Buscar por nombre, etiqueta, marca, persona…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar recursos" style={{ flex: '1 1 260px', maxWidth: 420 }} />
            <select className="ax-input" aria-label="Ordenar" value={orden} onChange={(e) => setOrden(e.target.value as Orden)} style={{ width: 'auto' }}>
              {Object.entries(ORDENES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Vista">
              <button type="button" role="radio" aria-checked={vista === 'tarjetas'} className={`ax-btn ax-btn--sm${vista === 'tarjetas' ? ' is-selected' : ''}`} onClick={() => setVista('tarjetas')}>Tarjetas</button>
              <button type="button" role="radio" aria-checked={vista === 'lista'} className={`ax-btn ax-btn--sm${vista === 'lista' ? ' is-selected' : ''}`} onClick={() => setVista('lista')}>Lista</button>
            </div>
            <span style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{visibles.length} de {datos.items.length}</span>
            {hayFiltros && <button type="button" className="ax-btn ax-btn--sm" onClick={limpiar}>Quitar filtros</button>}
          </div>

          {cargando ? (
            <p style={{ color: 'var(--ax-text-muted)' }}>Cargando…</p>
          ) : visibles.length === 0 ? (
            <div className="ax-card"><div className="ax-card__body" style={{ textAlign: 'center', color: 'var(--ax-text-muted)', padding: 'var(--ax-space-8)' }}>
              {datos.items.length === 0 ? <><p style={{ margin: 0 }}>Aún no hay recursos. Sube el primero: logos, plantillas de correo, documentos modelo…</p><button type="button" className="ax-btn ax-btn--primary" style={{ marginBlockStart: 12 }} onClick={() => setSubiendoAbierto(true)}>Subir archivos</button></> : <p style={{ margin: 0 }}>Nada coincide con los filtros.</p>}
            </div></div>
          ) : vista === 'tarjetas' ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 'var(--ax-space-4)' }}>
              {visibles.map((r) => (
                <li key={r.id} className="ax-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <button type="button" onClick={() => setAbierto(r)} aria-label={`Ver ${r.titulo}`} style={{ border: 0, background: 'none', padding: 'var(--ax-space-2)', cursor: 'pointer' }}><Miniatura r={r} /></button>
                  <div style={{ padding: '0 var(--ax-space-3) var(--ax-space-3)', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <button type="button" onClick={() => setAbierto(r)} style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', fontWeight: 600, color: 'var(--ax-text-strong)', overflowWrap: 'anywhere' }}>{r.titulo}</button>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <span className="ax-badge ax-badge--neutral">{CATEGORIAS[r.categoria] ?? r.categoria}</span>
                      {r.marcaNombre && <span className="ax-badge ax-badge--accent">{r.marcaNombre}</span>}
                      {r.variante && <span className="ax-badge">{r.variante}</span>}
                    </div>
                    <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>.{r.ext} · {peso(r.bytes)} · {AREAS[r.area] ?? r.area}</div>
                    <div style={{ marginBlockStart: 'auto', display: 'flex', gap: 6, paddingBlockStart: 6 }}>
                      <button type="button" className="ax-btn ax-btn--sm ax-btn--primary" onClick={() => descargar(r)}><span className="ax-btn__label">Descargar</span></button>
                      <button type="button" className="ax-btn ax-btn--sm" onClick={() => setAbierto(r)}><span className="ax-btn__label">Detalle</span></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="ax-card"><div className="ax-table-wrap">
              <table className="ax-table ax-table--hover">
                <thead className="ax-table__head"><tr>
                  <th className="ax-table__th" scope="col">Recurso</th><th className="ax-table__th" scope="col">Área / tipo</th><th className="ax-table__th" scope="col">Marca</th>
                  <th className="ax-table__th" scope="col">Tamaño</th><th className="ax-table__th" scope="col">Subido por</th><th className="ax-table__th" scope="col"><span className="sr-only">Acciones</span></th>
                </tr></thead>
                <tbody>
                  {visibles.map((r) => (
                    <tr key={r.id} className="ax-table__row">
                      <td className="ax-table__td">
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ background: colorExt(r.ext).bg, color: colorExt(r.ext).fg, fontWeight: 700, fontSize: 11, borderRadius: 6, padding: '6px 8px', minWidth: 46, textAlign: 'center' }}>.{r.ext}</span>
                          <button type="button" onClick={() => setAbierto(r)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontWeight: 600, textAlign: 'left', color: 'var(--ax-text-strong)' }}>{r.titulo}{r.variante ? ` · ${r.variante}` : ''}</button>
                        </div>
                      </td>
                      <td className="ax-table__td">{AREAS[r.area] ?? r.area}<div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{CATEGORIAS[r.categoria] ?? r.categoria}</div></td>
                      <td className="ax-table__td">{r.marcaNombre ?? '—'}</td>
                      <td className="ax-table__td">{peso(r.bytes)}</td>
                      <td className="ax-table__td">{r.subidoPorNombre}<div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{fecha(r.createdAt)}</div></td>
                      <td className="ax-table__td"><button type="button" className="ax-btn ax-btn--sm ax-btn--primary" onClick={() => descargar(r)}><span className="ax-btn__label">Descargar</span></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          )}
        </section>
      </div>

      {abierto && <Detalle r={abierto} onCerrar={() => setAbierto(null)} onDescargar={() => descargar(abierto)} onCopiar={() => copiarEnlace(abierto)} onEditar={() => { setEditando(abierto); setAbierto(null); }} onBorrar={() => borrar(abierto)} />}
      {editando && <Editar r={editando} marcas={datos.marcas} onCerrar={() => setEditando(null)} onGuardado={async () => { setEditando(null); setAviso('Cambios guardados.'); await cargar(); }} onError={setError} />}
      {subiendoAbierto && <Subir marcas={datos.marcas} onCerrar={() => setSubiendoAbierto(false)} onTerminado={async (n) => { setSubiendoAbierto(false); setAviso(`${n} archivo${n === 1 ? '' : 's'} subido${n === 1 ? '' : 's'}: ya los ve todo el equipo.`); await cargar(); }} />}
    </>
  );
}

/** Vista previa + toda la información del archivo y sus acciones. */
function Detalle({ r, onCerrar, onDescargar, onCopiar, onEditar, onBorrar }: { r: Recurso; onCerrar: () => void; onDescargar: () => void; onCopiar: () => void; onEditar: () => void; onBorrar: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);
  useEffect(() => {
    if (!r.previsualizable) return;
    let u: string | null = null;
    let vivo = true;
    obtenerArchivoPrivado(`/recursos-equipo/${r.id}/archivo?inline=1`).then((b) => { if (!vivo) return; u = URL.createObjectURL(b); setSrc(u); }).catch(() => vivo && setFallo(true));
    return () => { vivo = false; if (u) URL.revokeObjectURL(u); };
  }, [r.id, r.previsualizable]);

  const fila = (k: string, v: string | null) => v ? <div style={{ display: 'flex', gap: 8, fontSize: 'var(--ax-text-sm)' }}><dt style={{ color: 'var(--ax-text-subtle)', minWidth: 110 }}>{k}</dt><dd style={{ margin: 0, overflowWrap: 'anywhere' }}>{v}</dd></div> : null;
  const video = ['mp4', 'webm'].includes(r.ext);
  return (
    <Modal titulo={r.titulo} subtitulo={`${r.nombreOriginal} · ${peso(r.bytes)}`} onCerrar={onCerrar} tamano="lg"
      pie={<>
        {r.puedeGestionar && <button type="button" className="ax-btn ax-btn--danger" onClick={onBorrar}>Borrar</button>}
        {r.puedeGestionar && <button type="button" className="ax-btn" onClick={onEditar}>Editar</button>}
        <button type="button" className="ax-btn" onClick={onCopiar}>Copiar enlace</button>
        <button type="button" className="ax-btn ax-btn--primary" onClick={onDescargar}>Descargar ({peso(r.bytes)})</button>
      </>}>
      <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ax-surface-sunken, #f1f5f9)', borderRadius: 8, overflow: 'hidden' }}>
        {!r.previsualizable ? <Miniatura r={r} alto={200} />
          : fallo ? <p style={{ color: 'var(--ax-text-muted)' }}>No se pudo cargar la vista previa.</p>
          : !src ? <p style={{ color: 'var(--ax-text-muted)' }}>Cargando vista previa…</p>
          : r.ext === 'pdf' ? <iframe src={src} title={r.titulo} style={{ width: '100%', height: 460, border: 0 }} />
          : video ? <video src={src} controls style={{ maxWidth: '100%', maxHeight: 460 }} />
          : r.ext === 'mp3' ? <audio src={src} controls />
          // eslint-disable-next-line @next/next/no-img-element
          : <img src={src} alt={r.titulo} style={{ maxWidth: '100%', maxHeight: 460, objectFit: 'contain' }} />}
      </div>
      {r.descripcion && <p style={{ margin: 0 }}>{r.descripcion}</p>}
      <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fila('Área', AREAS[r.area] ?? r.area)}
        {fila('Tipo', CATEGORIAS[r.categoria] ?? r.categoria)}
        {fila('Marca', r.marcaNombre ?? 'General (todas)')}
        {fila('Estilo / versión', r.variante)}
        {fila('Formato', `.${r.ext.toUpperCase()} · ${r.mime}`)}
        {fila('Etiquetas', r.etiquetas.length ? r.etiquetas.map((e) => `#${e}`).join('  ') : null)}
        {fila('Subido por', `${r.subidoPorNombre} · ${fecha(r.createdAt)}`)}
        {fila('Descargas', String(r.descargas))}
      </dl>
    </Modal>
  );
}

function CamposMeta({ m, set, marcas, ocultarTitulo }: { m: Meta; set: (m: Meta) => void; marcas: MarcaLite[]; ocultarTitulo?: boolean }) {
  const campo = { display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 200px' } as const;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ax-space-3)' }}>
      {!ocultarTitulo && <div style={{ ...campo, flexBasis: '100%' }}><label className="ax-label" htmlFor="rq-t">Título *</label><input id="rq-t" className="ax-input" maxLength={160} required value={m.titulo} onChange={(e) => set({ ...m, titulo: e.target.value })} /></div>}
      <div style={campo}><label className="ax-label" htmlFor="rq-a">Área</label><select id="rq-a" className="ax-input" value={m.area} onChange={(e) => set({ ...m, area: e.target.value })}>{Object.entries(AREAS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      <div style={campo}><label className="ax-label" htmlFor="rq-c">Tipo de recurso</label><select id="rq-c" className="ax-input" value={m.categoria} onChange={(e) => set({ ...m, categoria: e.target.value })}><option value="">Detectar según el archivo</option>{Object.entries(CATEGORIAS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      <div style={campo}><label className="ax-label" htmlFor="rq-m">Marca</label><select id="rq-m" className="ax-input" value={m.marcaRef} onChange={(e) => set({ ...m, marcaRef: e.target.value })}><option value="">General (todas las marcas)</option>{marcas.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select></div>
      <div style={campo}><label className="ax-label" htmlFor="rq-v">Estilo / versión</label><input id="rq-v" className="ax-input" maxLength={60} placeholder="Color, Blanco, Horizontal, Vertical…" value={m.variante} onChange={(e) => set({ ...m, variante: e.target.value })} /></div>
      <div style={{ ...campo, flexBasis: '100%' }}><label className="ax-label" htmlFor="rq-e">Etiquetas (separadas por coma)</label><input id="rq-e" className="ax-input" maxLength={300} placeholder="logo, redes, fondo oscuro" value={m.etiquetas} onChange={(e) => set({ ...m, etiquetas: e.target.value })} /></div>
      <div style={{ ...campo, flexBasis: '100%' }}><label className="ax-label" htmlFor="rq-d">Descripción</label><textarea id="rq-d" className="ax-input" rows={2} maxLength={1000} value={m.descripcion} onChange={(e) => set({ ...m, descripcion: e.target.value })} /></div>
    </div>
  );
}

function Editar({ r, marcas, onCerrar, onGuardado, onError }: { r: Recurso; marcas: MarcaLite[]; onCerrar: () => void; onGuardado: () => void; onError: (e: string) => void }) {
  const [m, setM] = useState<Meta>({ titulo: r.titulo, descripcion: r.descripcion ?? '', area: r.area, categoria: r.categoria, variante: r.variante ?? '', marcaRef: r.marcaRef ?? '', etiquetas: r.etiquetas.join(', ') });
  const [guardando, setGuardando] = useState(false);
  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.patch(`/recursos-equipo/${r.id}`, { ...m, categoria: m.categoria || r.categoria });
      onGuardado();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'No se pudo guardar.');
      setGuardando(false);
    }
  }
  return (
    <Modal titulo="Editar recurso" subtitulo={r.nombreOriginal} onCerrar={onCerrar} pie={<><button type="button" className="ax-btn" onClick={onCerrar}>Cancelar</button><button type="submit" form="rq-editar" className="ax-btn ax-btn--primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button></>}>
      <form id="rq-editar" onSubmit={guardar}><CamposMeta m={m} set={setM} marcas={marcas} /></form>
    </Modal>
  );
}

function Subir({ marcas, onCerrar, onTerminado }: { marcas: MarcaLite[]; onCerrar: () => void; onTerminado: (n: number) => void }) {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [m, setM] = useState<Meta>(metaVacia());
  const [arrastrando, setArrastrando] = useState(false);
  const [progreso, setProgreso] = useState('');
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);

  function agregar(lista: FileList | File[]) {
    const nuevos = Array.from(lista);
    setArchivos((a) => [...a, ...nuevos.filter((n) => !a.some((x) => x.name === n.name && x.size === n.size))]);
    if (nuevos.length === 1 && !m.titulo) setM((x) => ({ ...x, titulo: tituloDe(nuevos[0].name) }));
  }

  async function subir(e: React.FormEvent) {
    e.preventDefault();
    if (archivos.length === 0) return setError('Elige al menos un archivo.');
    if (archivos.length === 1 && m.titulo.trim().length < 2) return setError('Escribe un título.');
    setError('');
    let ok = 0;
    const fallos: string[] = [];
    for (const [i, f] of archivos.entries()) {
      setProgreso(`Subiendo ${i + 1} de ${archivos.length}: ${f.name}`);
      try {
        const fd = new FormData();
        fd.append('archivo', f);
        fd.append('titulo', archivos.length === 1 ? m.titulo.trim() : tituloDe(f.name) || f.name);
        fd.append('area', m.area);
        fd.append('categoria', m.categoria || categoriaDe(f.name));
        if (m.marcaRef) fd.append('marcaRef', m.marcaRef);
        if (m.variante.trim()) fd.append('variante', m.variante.trim());
        if (m.etiquetas.trim()) fd.append('etiquetas', m.etiquetas.trim());
        if (m.descripcion.trim()) fd.append('descripcion', m.descripcion.trim());
        await api.post('/recursos-equipo', fd);
        ok++;
      } catch (err) {
        fallos.push(`${f.name}: ${err instanceof ApiError ? err.message : 'error'}`);
      }
    }
    setProgreso('');
    if (fallos.length) {
      setError(`No se subieron ${fallos.length}: ${fallos.join(' · ')}`);
      setArchivos((a) => a.filter((f) => fallos.some((x) => x.startsWith(`${f.name}:`))));
      if (ok === 0) return;
    }
    onTerminado(ok);
  }

  return (
    <Modal titulo="Subir archivos" subtitulo="Imágenes, SVG, PDF, Word/Excel/PowerPoint, ZIP, HTML o EML (plantillas), AI/EPS/PSD, fuentes, MP4/WEBM/MP3 · hasta 25 MB cada uno. Los revisa el antivirus." onCerrar={onCerrar} tamano="lg"
      pie={<><button type="button" className="ax-btn" onClick={onCerrar} disabled={!!progreso}>Cancelar</button><button type="submit" form="rq-subir" className="ax-btn ax-btn--primary" disabled={!!progreso || archivos.length === 0}>{progreso ? 'Subiendo…' : archivos.length > 1 ? `Subir ${archivos.length} archivos` : 'Subir'}</button></>}>
      <form id="rq-subir" onSubmit={subir} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }} onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => { e.preventDefault(); setArrastrando(false); agregar(e.dataTransfer.files); }}
          style={{ border: `2px dashed ${arrastrando ? 'var(--ax-accent-500, #6366f1)' : 'var(--ax-border, #cbd5e1)'}`, borderRadius: 12, padding: 'var(--ax-space-6)', textAlign: 'center', background: arrastrando ? 'var(--ax-accent-50, #eef2ff)' : 'transparent' }}>
          <p style={{ margin: 0 }}>Arrastra aquí tus archivos o</p>
          <button type="button" className="ax-btn" style={{ marginBlockStart: 8 }} onClick={() => input.current?.click()}>Elegir archivos</button>
          <input ref={input} type="file" multiple hidden onChange={(e) => { if (e.target.files) agregar(e.target.files); e.target.value = ''; }} />
        </div>
        {archivos.length > 0 && (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflow: 'auto' }}>
            {archivos.map((f) => (
              <li key={`${f.name}-${f.size}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 'var(--ax-text-sm)' }}>
                <span style={{ overflowWrap: 'anywhere' }}>{f.name} <span style={{ color: 'var(--ax-text-subtle)' }}>· {peso(f.size)} · {CATEGORIAS[m.categoria || categoriaDe(f.name)]}</span></span>
                <button type="button" className="ax-btn ax-btn--sm" aria-label={`Quitar ${f.name}`} onClick={() => setArchivos((a) => a.filter((x) => x !== f))}>✕</button>
              </li>
            ))}
          </ul>
        )}
        <CamposMeta m={m} set={setM} marcas={marcas} ocultarTitulo={archivos.length > 1} />
        {archivos.length > 1 && <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Con varios archivos, cada título sale del nombre del archivo y el resto de datos se aplica a todos. Podrás editarlos después.</p>}
        {progreso && <p role="status" style={{ margin: 0, fontSize: 'var(--ax-text-sm)' }}>{progreso}</p>}
        {error && <p role="alert" style={{ margin: 0, color: 'var(--ax-danger-500)', fontSize: 'var(--ax-text-sm)' }}>{error}</p>}
      </form>
    </Modal>
  );
}
