'use client';
/*
 * FPTecnologi-HUB — Folletos (Web informativa). El equipo, comercial incluido, sube un PDF y obtiene un enlace público
 * único que abre solo el folleto (pasa-páginas, controles y logo), sin menú ni encabezado de la web. Es para compartir
 * por WhatsApp o correo; cada folleto cuenta sus visitas.
 *
 * Pantalla: la lista de folletos va directa (tabla con portada, estado activo/inactivo, enlace y todas las acciones).
 * Subir y editar (título, PDF, enlace) son modales; la vista previa muestra el visor del cliente o el PDF original.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { ApiError, useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Folleto { id: string; titulo: string; slug: string; bytes: number; activo: boolean; vistas: number; creadoPor: string | null; createdAt: string; url: string; pdf: string }
type Filtro = 'todos' | 'activos' | 'inactivos';
const MAX_MB = 50;

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(1)} MB`;
const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
const portada = (pdf: string) => `${pdf}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=Fit`;
const errMsg = (e: unknown, def: string) => (e instanceof ApiError && e.statusCode !== 413 ? e.message : e instanceof ApiError ? 'El PDF es muy pesado para el servidor. Comprímelo y vuelve a subirlo.' : def);

/** Valida un PDF elegido; devuelve el texto del error o ''. */
function validarPdf(file: File): string {
  if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) return 'Elige un archivo PDF.';
  if (file.size > MAX_MB * 1024 * 1024) return `El PDF pesa ${mb(file.size)} y el máximo es ${MAX_MB} MB. Comprímelo (por ejemplo en ilovepdf.com → «Comprimir PDF») y vuelve a subirlo.`;
  return '';
}

/** Miniatura de la portada: el iframe solo se monta al entrar en pantalla (no carga decenas de PDF de golpe). */
function Miniatura({ f }: { f: Folleto }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setVer(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVer(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} style={{ position: 'relative', display: 'block', width: 56, aspectRatio: '3 / 4', background: 'var(--ax-surface-sunken, #eef1f6)', overflow: 'hidden', borderRadius: 6, border: '1px solid var(--ax-border, #e5e7eb)' }}>
      {ver && <iframe title={`Portada de ${f.titulo}`} src={portada(f.pdf)} loading="lazy" tabIndex={-1} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, pointerEvents: 'none', background: '#fff' }} />}
    </span>
  );
}

/** Ventana centrada con fondo oscuro; se cierra con Esc o al pulsar fuera. */
function Modal({ titulo, ancho = 520, onClose, children }: { titulo: string; ancho?: number; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 85, display: 'grid', placeItems: 'center', padding: 'var(--ax-space-4)' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)' }} />
      <div role="dialog" aria-modal="true" aria-label={titulo} className="ax-card" style={{ position: 'relative', width: '100%', maxWidth: ancho, maxHeight: '90vh', overflow: 'auto', padding: 'var(--ax-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
        <h2 className="ax-card__title" style={{ margin: 0 }}>{titulo}</h2>
        {children}
      </div>
    </div>
  );
}

/** Zona de elegir PDF (clic o arrastrar). */
function SelectorPdf({ archivo, onFile, error }: { archivo: File | null; onFile: (f: File) => void; error: string }) {
  const [arr, setArr] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div
        role="button" tabIndex={0}
        onClick={() => ref.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ref.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setArr(true); }}
        onDragLeave={() => setArr(false)}
        onDrop={(e) => { e.preventDefault(); setArr(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
        style={{ border: `2px dashed ${arr ? 'var(--ax-primary-500, #2563eb)' : 'var(--ax-border, #cbd5e1)'}`, borderRadius: 12, padding: 'var(--ax-space-5, 24px) var(--ax-space-3)', textAlign: 'center', cursor: 'pointer', background: arr ? 'var(--ax-surface-sunken, #f1f5f9)' : 'transparent' }}
      >
        {archivo ? (
          <><strong style={{ overflowWrap: 'anywhere' }}>{archivo.name}</strong><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{mb(archivo.size)} · clic para cambiar</div></>
        ) : (
          <><strong>Arrastra el PDF aquí</strong><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>o haz clic para elegirlo · máx. {MAX_MB} MB</div></>
        )}
        <input ref={ref} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
      </div>
      {error && <p role="alert" style={{ color: 'var(--ax-danger-500)', margin: 'var(--ax-space-2) 0 0' }}>{error}</p>}
    </div>
  );
}

function ModalNuevo({ onClose, onHecho }: { onClose: () => void; onHecho: (f: Folleto) => void }) {
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  function elegir(file: File) {
    const e = validarPdf(file);
    setError(e);
    if (e) return;
    setArchivo(file);
    if (!titulo.trim()) setTitulo(file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim().slice(0, 120));
  }
  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!archivo) return setError('Elige el PDF del folleto.');
    setSubiendo(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('titulo', titulo.trim());
      fd.append('archivo', archivo);
      onHecho(await api.post<Folleto>('/folletos', fd));
    } catch (e) {
      setError(errMsg(e, 'No se pudo subir el folleto.'));
      setSubiendo(false);
    }
  }
  return (
    <Modal titulo="Nuevo folleto" onClose={onClose}>
      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
        <SelectorPdf archivo={archivo} onFile={elegir} error={error} />
        <div className="ax-field">
          <label className="ax-label" htmlFor="fol-titulo">Título *</label>
          <input id="fol-titulo" className="ax-input" required minLength={2} maxLength={120} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Catálogo Stock FP octubre" />
        </div>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
          <button type="button" className="ax-btn ax-btn--ghost" onClick={onClose} disabled={subiendo}>Cancelar</button>
          <button type="submit" className="ax-btn ax-btn--primary" disabled={subiendo || !archivo}>{subiendo ? 'Subiendo…' : 'Subir folleto'}</button>
        </div>
      </form>
    </Modal>
  );
}

function ModalEditar({ f, onClose, onGuardado, onCopiar }: { f: Folleto; onClose: () => void; onGuardado: (msg: string) => void; onCopiar: (u: string) => void }) {
  const [actual, setActual] = useState(f);
  const [titulo, setTitulo] = useState(f.titulo);
  const [activo, setActivo] = useState(f.activo);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [nuevoEnlace, setNuevoEnlace] = useState(false);
  function elegir(file: File) {
    const e = validarPdf(file);
    setError(e);
    if (!e) setArchivo(file);
  }
  async function regenerar() {
    if (!window.confirm('El enlace actual dejará de funcionar y se creará uno nuevo. ¿Continuar?')) return;
    try {
      setActual(await api.post<Folleto>(`/folletos/${f.id}/enlace`));
      setNuevoEnlace(true);
    } catch (e) { setError(errMsg(e, 'No se pudo generar el enlace.')); }
  }
  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    setGuardando(true);
    setError('');
    try {
      if (archivo) {
        const fd = new FormData();
        fd.append('archivo', archivo);
        await api.post(`/folletos/${f.id}/archivo`, fd);
      }
      const cambios: { titulo?: string; activo?: boolean } = {};
      if (titulo.trim() !== f.titulo) cambios.titulo = titulo.trim();
      if (activo !== f.activo) cambios.activo = activo;
      if (Object.keys(cambios).length) await api.patch(`/folletos/${f.id}`, cambios);
      onGuardado(nuevoEnlace ? 'Folleto actualizado. Recuerda compartir el enlace nuevo.' : 'Folleto actualizado.');
    } catch (e) {
      setError(errMsg(e, 'No se pudo guardar.'));
      setGuardando(false);
    }
  }
  return (
    <Modal titulo="Editar folleto" onClose={onClose}>
      <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
        <div className="ax-field">
          <label className="ax-label" htmlFor="fol-edit-titulo">Título *</label>
          <input id="fol-edit-titulo" className="ax-input" required minLength={2} maxLength={120} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', alignItems: 'center' }}>
          <input type="checkbox" className="ax-switch" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          <span>{activo ? 'Activo: cualquiera con el enlace puede verlo' : 'Inactivo: el enlace no abre'}</span>
        </label>
        <div>
          <span className="ax-label">Cambiar PDF (opcional)</span>
          <SelectorPdf archivo={archivo} onFile={elegir} error={error} />
          <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>El enlace se mantiene: quien ya lo recibió verá el PDF nuevo. Actual: {mb(f.bytes)}.</span>
        </div>
        <div className="ax-field">
          <span className="ax-label">Enlace único para compartir</span>
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
            <code style={{ flex: '1 1 14rem', fontSize: 'var(--ax-text-xs)', overflowWrap: 'anywhere' }}>{actual.url}</code>
            <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => onCopiar(actual.url)}>Copiar</button>
            <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={regenerar}>Generar enlace nuevo</button>
          </div>
        </div>
        {error && !archivo && <p role="alert" style={{ color: 'var(--ax-danger-500)', margin: 0 }}>{error}</p>}
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
          <button type="button" className="ax-btn ax-btn--ghost" onClick={onClose} disabled={guardando}>Cancelar</button>
          <button type="submit" className="ax-btn ax-btn--primary" disabled={guardando || titulo.trim().length < 2}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </form>
    </Modal>
  );
}

function VistaPrevia({ f, onClose, onCopiar }: { f: Folleto; onClose: () => void; onCopiar: (u: string) => void }) {
  const [modo, setModo] = useState<'visor' | 'pdf'>('visor');
  const [disp, setDisp] = useState<'escritorio' | 'movil'>('escritorio');
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [onClose]);
  const movil = modo === 'visor' && disp === 'movil';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', background: 'rgba(8,10,16,.72)', padding: 'var(--ax-space-3)' }}>
      <div role="dialog" aria-modal="true" aria-label={`Vista previa de ${f.titulo}`} className="ax-card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap', padding: 'var(--ax-space-3)', borderBlockEnd: '1px solid var(--ax-border, #e5e7eb)', alignItems: 'center' }}>
          <strong style={{ flex: '1 1 12rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.titulo}</strong>
          {!f.activo && <span className="ax-badge ax-badge--neutral ax-badge--sm">Inactivo: el enlace público no abre</span>}
          <div className="ax-segment" role="group" aria-label="Qué ver">
            <button type="button" className="ax-segment__option" aria-pressed={modo === 'visor'} onClick={() => setModo('visor')}>Visor del cliente</button>
            <button type="button" className="ax-segment__option" aria-pressed={modo === 'pdf'} onClick={() => setModo('pdf')}>PDF original</button>
          </div>
          {modo === 'visor' && (
            <div className="ax-segment" role="group" aria-label="Dispositivo">
              <button type="button" className="ax-segment__option" aria-pressed={disp === 'escritorio'} onClick={() => setDisp('escritorio')}>Escritorio</button>
              <button type="button" className="ax-segment__option" aria-pressed={disp === 'movil'} onClick={() => setDisp('movil')}>Móvil</button>
            </div>
          )}
          <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => onCopiar(f.url)}>Copiar enlace</button>
          <a className="ax-btn ax-btn--ghost ax-btn--sm" href={f.url} target="_blank" rel="noreferrer">Abrir en pestaña</a>
          <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" onClick={onClose}>Cerrar</button>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', background: 'var(--ax-surface-sunken, #eef1f6)', padding: movil ? 'var(--ax-space-3)' : 0 }}>
          <iframe
            key={`${modo}-${disp}`}
            title={`${modo === 'visor' ? 'Visor' : 'PDF'} de ${f.titulo}`}
            src={modo === 'visor' ? f.url : f.pdf}
            style={{ border: 0, background: '#fff', height: '100%', width: movil ? 390 : '100%', maxWidth: '100%', borderRadius: movil ? 24 : 0, boxShadow: movil ? '0 8px 30px rgba(0,0,0,.25)' : 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

export function WebFolletos() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Folleto[] | null>(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [nuevo, setNuevo] = useState(false);
  const [previa, setPrevia] = useState<Folleto | null>(null);
  const [editando, setEditando] = useState<Folleto | null>(null);
  const [borrando, setBorrando] = useState<Folleto | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLista(await api.get<Folleto[]>('/folletos'));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los folletos.');
    }
  }, []);
  useEffect(() => { cargar(); }, [cargar, activeMarcaId]);

  async function copiar(url: string, msg = 'Enlace copiado.') {
    try { await navigator.clipboard.writeText(url); setError(''); setAviso(msg); } catch { setError('No se pudo copiar el enlace.'); }
  }
  async function alternar(f: Folleto) {
    try {
      await api.patch(`/folletos/${f.id}`, { activo: !f.activo });
      setError('');
      setAviso(f.activo ? 'Folleto inactivo: su enlace ya no abre.' : 'Folleto activo de nuevo.');
      await cargar();
    } catch (e) { setError(e instanceof ApiError ? e.message : 'No se pudo cambiar el estado.'); }
  }
  async function eliminar(f: Folleto) {
    setBorrando(null);
    try { await api.delete(`/folletos/${f.id}`); setError(''); setAviso('Folleto eliminado.'); await cargar(); } catch (e) { setError(e instanceof ApiError ? e.message : 'No se pudo eliminar.'); }
  }

  const filas = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (lista ?? []).filter((f) => (filtro === 'todos' || (filtro === 'activos') === f.activo) && (!t || f.titulo.toLowerCase().includes(t)));
  }, [lista, q, filtro]);
  const nActivos = (lista ?? []).filter((f) => f.activo).length;
  const totalVistas = (lista ?? []).reduce((s, f) => s + f.vistas, 0);

  return (
    <>
      <PageHead
        title="Folletos"
        subtitle="Sube un PDF y comparte su enlace único: quien lo abre ve solo el folleto, con pasa-páginas, controles y el logo de FP Tecnologi."
        actions={<button type="button" className="ax-btn ax-btn--primary" onClick={() => setNuevo(true)}>+ Nuevo folleto</button>}
      />
      {error && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{error}</p>}
      {aviso && <p role="status" style={{ color: 'var(--ax-text-muted)' }}>{aviso}</p>}

      <section className="ax-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap', padding: 'var(--ax-space-3)', alignItems: 'center' }}>
          <input className="ax-input" style={{ flex: '1 1 14rem', maxWidth: '22rem' }} type="search" placeholder="Buscar folleto…" aria-label="Buscar folleto" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="ax-segment" role="group" aria-label="Estado">
            {(['todos', 'activos', 'inactivos'] as const).map((k) => (
              <button key={k} type="button" className="ax-segment__option" aria-pressed={filtro === k} onClick={() => setFiltro(k)}>{k[0].toUpperCase() + k.slice(1)}</button>
            ))}
          </div>
          <span style={{ marginInlineStart: 'auto', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
            {lista?.length ?? 0} folletos · {nActivos} activos · {totalVistas} visitas
          </span>
        </div>

        {!lista && !error && <p style={{ padding: 'var(--ax-space-4)', color: 'var(--ax-text-muted)' }}>Cargando…</p>}
        {lista && lista.length === 0 && (
          <div style={{ padding: 'var(--ax-space-6, 40px) var(--ax-space-4)', textAlign: 'center', color: 'var(--ax-text-muted)' }}>
            <p style={{ margin: 0 }}>Aún no hay folletos.</p>
            <button type="button" className="ax-btn ax-btn--primary" style={{ marginBlockStart: 'var(--ax-space-3)' }} onClick={() => setNuevo(true)}>Subir el primero</button>
          </div>
        )}
        {lista && lista.length > 0 && filas.length === 0 && <p style={{ padding: 'var(--ax-space-4)', color: 'var(--ax-text-muted)' }}>Ningún folleto coincide con la búsqueda.</p>}

        {filas.length > 0 && (
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th">Folleto</th>
                  <th className="ax-table__th">Estado</th>
                  <th className="ax-table__th">Visitas</th>
                  <th className="ax-table__th">Enlace</th>
                  <th className="ax-table__th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.id} className="ax-table__row">
                    <td className="ax-table__td">
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', alignItems: 'center', flexWrap: 'nowrap' }}>
                        <button type="button" onClick={() => setPrevia(f)} aria-label={`Ver ${f.titulo}`} style={{ all: 'unset', cursor: 'pointer', flex: 'none', opacity: f.activo ? 1 : 0.55 }}><Miniatura f={f} /></button>
                        <div style={{ minWidth: 0 }}>
                          <button type="button" onClick={() => setPrevia(f)} style={{ all: 'unset', cursor: 'pointer', fontWeight: 600, overflowWrap: 'anywhere' }}>{f.titulo}</button>
                          <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{mb(f.bytes)} · {fecha(f.createdAt)}{f.creadoPor ? ` · ${f.creadoPor}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="ax-table__td">
                      <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', alignItems: 'center', flexWrap: 'nowrap' }}>
                        <input type="checkbox" className="ax-switch" checked={f.activo} onChange={() => alternar(f)} aria-label={`${f.activo ? 'Desactivar' : 'Activar'} ${f.titulo}`} />
                        <span className={`ax-badge ax-badge--sm ${f.activo ? 'ax-badge--success' : 'ax-badge--neutral'}`}>{f.activo ? 'Activo' : 'Inactivo'}</span>
                      </label>
                    </td>
                    <td className="ax-table__td ax-num">{f.vistas}</td>
                    <td className="ax-table__td">
                      <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => copiar(f.url)} title={f.url}>Copiar enlace</button>
                    </td>
                    <td className="ax-table__td">
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-1, 4px)', flexWrap: 'wrap' }}>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setPrevia(f)}>Previsualizar</button>
                        <a className="ax-btn ax-btn--ghost ax-btn--sm" href={`https://wa.me/?text=${encodeURIComponent(`${f.titulo}: ${f.url}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                        <a className="ax-btn ax-btn--ghost ax-btn--sm" href={`mailto:?subject=${encodeURIComponent(f.titulo)}&body=${encodeURIComponent(`Te comparto el folleto «${f.titulo}»:\n${f.url}`)}`}>Correo</a>
                        <a className="ax-btn ax-btn--ghost ax-btn--sm" href={f.pdf} target="_blank" rel="noreferrer" download>PDF</a>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setEditando(f)}>Editar</button>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={() => setBorrando(f)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {nuevo && (
        <ModalNuevo
          onClose={() => setNuevo(false)}
          onHecho={(f) => { setNuevo(false); copiar(f.url, 'Folleto subido. Enlace copiado: ya puedes pegarlo en WhatsApp o correo.'); cargar(); }}
        />
      )}
      {editando && <ModalEditar f={editando} onClose={() => setEditando(null)} onCopiar={(u) => copiar(u)} onGuardado={(m) => { setEditando(null); setAviso(m); setError(''); cargar(); }} />}
      {previa && <VistaPrevia f={previa} onClose={() => setPrevia(null)} onCopiar={(u) => copiar(u)} />}
      {borrando && (
        <Modal titulo={`¿Eliminar «${borrando.titulo}»?`} ancho={440} onClose={() => setBorrando(null)}>
          <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>El enlace dejará de funcionar para todos y el PDF se borra. Si solo quieres que no se vea por ahora, desactívalo.</p>
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setBorrando(null)}>Cancelar</button>
            <button type="button" className="ax-btn ax-btn--primary" style={{ background: 'var(--ax-danger-500)' }} onClick={() => eliminar(borrando)}>Eliminar</button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default WebFolletos;
