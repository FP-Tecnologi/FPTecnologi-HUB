'use client';
/*
 * FPTecnologi-HUB — Folletos (Web informativa). El equipo, comercial incluido, sube un PDF y obtiene un enlace público
 * que abre solo el folleto (pasa-páginas, controles y logo), sin menú ni encabezado de la web. Es para compartir por
 * WhatsApp o correo; cada folleto cuenta sus visitas y se puede ocultar o borrar.
 *
 * Pantalla: subida con arrastrar-y-soltar, resumen, búsqueda/filtros/orden, vista de tarjetas con miniatura de la
 * portada o lista, y una vista previa a pantalla completa (visor tal como lo ve el cliente, PDF original, móvil/escritorio).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { ApiError, useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Folleto { id: string; titulo: string; slug: string; bytes: number; activo: boolean; vistas: number; creadoPor: string | null; createdAt: string; url: string; pdf: string }
type Filtro = 'todos' | 'visibles' | 'ocultos';
type Orden = 'recientes' | 'vistas' | 'nombre';
const MAX_MB = 50;

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(1)} MB`;
const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
const portada = (pdf: string) => `${pdf}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=Fit`;

/** Miniatura de la portada: el iframe solo se monta cuando la tarjeta entra en pantalla (no carga 50 PDF de golpe). */
function Miniatura({ f }: { f: Folleto }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setVisible(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', aspectRatio: '3 / 4', background: 'var(--ax-surface-sunken, #eef1f6)', overflow: 'hidden', borderRadius: 'var(--ax-radius-md, 8px)' }}>
      {visible && <iframe title={`Portada de ${f.titulo}`} src={portada(f.pdf)} loading="lazy" tabIndex={-1} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, pointerEvents: 'none', background: '#fff' }} />}
      {!f.activo && <span className="ax-badge ax-badge--neutral ax-badge--sm" style={{ position: 'absolute', top: 8, left: 8 }}>Oculto</span>}
    </div>
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
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', background: 'rgba(8,10,16,.72)', padding: 'var(--ax-space-3)' }}>
      <div role="dialog" aria-modal="true" aria-label={`Vista previa de ${f.titulo}`} className="ax-card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap', padding: 'var(--ax-space-3)', borderBlockEnd: '1px solid var(--ax-border, #e5e7eb)', alignItems: 'center' }}>
          <strong style={{ flex: '1 1 12rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.titulo}</strong>
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
        <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', background: 'var(--ax-surface-sunken, #eef1f6)', padding: modo === 'visor' && disp === 'movil' ? 'var(--ax-space-3)' : 0 }}>
          <iframe
            key={`${modo}-${disp}`}
            title={`${modo === 'visor' ? 'Visor' : 'PDF'} de ${f.titulo}`}
            src={modo === 'visor' ? f.url : f.pdf}
            style={{ border: 0, background: '#fff', height: '100%', width: modo === 'visor' && disp === 'movil' ? 390 : '100%', maxWidth: '100%', borderRadius: modo === 'visor' && disp === 'movil' ? 24 : 0, boxShadow: modo === 'visor' && disp === 'movil' ? '0 8px 30px rgba(0,0,0,.25)' : 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

export function WebFolletos() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Folleto[] | null>(null);
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [orden, setOrden] = useState<Orden>('recientes');
  const [vista, setVista] = useState<'tarjetas' | 'lista'>('tarjetas');
  const [previa, setPrevia] = useState<Folleto | null>(null);
  const [editando, setEditando] = useState<{ id: string; titulo: string } | null>(null);
  const [borrando, setBorrando] = useState<Folleto | null>(null);
  const input = useRef<HTMLInputElement>(null);

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

  function elegir(file: File | null) {
    setError('');
    if (!file) return setArchivo(null);
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) return setError('Elige un archivo PDF.');
    if (file.size > MAX_MB * 1024 * 1024) return setError(`El PDF pesa ${mb(file.size)} y el máximo es ${MAX_MB} MB. Comprímelo (por ejemplo en ilovepdf.com → «Comprimir PDF») y vuelve a subirlo.`);
    setArchivo(file);
    if (!titulo.trim()) setTitulo(file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim().slice(0, 120));
  }

  async function subir(ev: React.FormEvent) {
    ev.preventDefault();
    if (!archivo) return;
    setError('');
    setAviso('');
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('titulo', titulo.trim());
      fd.append('archivo', archivo);
      const f = await api.post<Folleto>('/folletos', fd);
      setTitulo('');
      setArchivo(null);
      if (input.current) input.current.value = '';
      await copiar(f.url, 'Folleto subido. Enlace copiado: ya puedes pegarlo en WhatsApp o correo.');
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError && e.statusCode !== 413 ? e.message : 'No se pudo subir: el PDF es muy pesado para el servidor. Comprímelo y vuelve a subirlo.');
    } finally {
      setSubiendo(false);
    }
  }

  async function accion(fn: () => Promise<unknown>, ok?: string) {
    try { await fn(); setError(''); if (ok) setAviso(ok); await cargar(); } catch (e) { setError(e instanceof ApiError ? e.message : 'No se pudo completar.'); }
  }

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    const l = (lista ?? []).filter((f) => (filtro === 'todos' || (filtro === 'visibles') === f.activo) && (!t || f.titulo.toLowerCase().includes(t)));
    return [...l].sort((a, b) => orden === 'vistas' ? b.vistas - a.vistas : orden === 'nombre' ? a.titulo.localeCompare(b.titulo, 'es') : b.createdAt.localeCompare(a.createdAt));
  }, [lista, q, filtro, orden]);
  const totalVistas = (lista ?? []).reduce((s, f) => s + f.vistas, 0);
  const nVisibles = (lista ?? []).filter((f) => f.activo).length;

  const acciones = (f: Folleto) => {
    const wa = `https://wa.me/?text=${encodeURIComponent(`${f.titulo}: ${f.url}`)}`;
    const mail = `mailto:?subject=${encodeURIComponent(f.titulo)}&body=${encodeURIComponent(`Te comparto el folleto «${f.titulo}»:\n${f.url}`)}`;
    return (
      <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
        <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" onClick={() => setPrevia(f)}>Ver folleto</button>
        <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => copiar(f.url)}>Copiar enlace</button>
        <a className="ax-btn ax-btn--ghost ax-btn--sm" href={wa} target="_blank" rel="noreferrer">WhatsApp</a>
        <a className="ax-btn ax-btn--ghost ax-btn--sm" href={mail}>Correo</a>
        <a className="ax-btn ax-btn--ghost ax-btn--sm" href={f.url} target="_blank" rel="noreferrer">Abrir</a>
        <a className="ax-btn ax-btn--ghost ax-btn--sm" href={f.pdf} target="_blank" rel="noreferrer" download>PDF</a>
        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setEditando({ id: f.id, titulo: f.titulo })}>Renombrar</button>
        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => accion(() => api.patch(`/folletos/${f.id}`, { activo: !f.activo }), f.activo ? 'Folleto oculto: su enlace ya no abre.' : 'Folleto visible de nuevo.')}>{f.activo ? 'Ocultar' : 'Mostrar'}</button>
        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={() => setBorrando(f)}>Eliminar</button>
      </div>
    );
  };

  return (
    <>
      <PageHead title="Folletos" subtitle="Sube un PDF y comparte su enlace: quien lo abre ve solo el folleto, con pasa-páginas, controles y el logo de FP Tecnologi. Ideal para que el equipo comercial envíe sus catálogos y propuestas." />
      {error && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{error}</p>}
      {aviso && <p role="status" style={{ color: 'var(--ax-text-muted)' }}>{aviso}</p>}

      <form
        className="ax-card"
        onSubmit={subir}
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastrando(false); elegir(e.dataTransfer.files?.[0] ?? null); }}
        style={{ padding: 'var(--ax-space-4)', display: 'flex', flexWrap: 'wrap', gap: 'var(--ax-space-3)', alignItems: 'flex-end', marginBlockEnd: 'var(--ax-space-4)', outline: arrastrando ? '2px dashed var(--ax-primary-500, #2563eb)' : 'none', outlineOffset: -6 }}
      >
        <div className="ax-field" style={{ flex: '1 1 16rem' }}>
          <label className="ax-label" htmlFor="fol-pdf">PDF * (máx. {MAX_MB} MB) — o arrástralo aquí</label>
          <input id="fol-pdf" ref={input} className="ax-input" type="file" accept="application/pdf,.pdf" required onChange={(e) => elegir(e.target.files?.[0] ?? null)} />
          {archivo && <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{archivo.name} · {mb(archivo.size)}</span>}
        </div>
        <div className="ax-field" style={{ flex: '1 1 16rem' }}>
          <label className="ax-label" htmlFor="fol-titulo">Título *</label>
          <input id="fol-titulo" className="ax-input" maxLength={120} minLength={2} required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Catálogo Stock FP octubre" />
        </div>
        <button type="submit" className="ax-btn ax-btn--primary" disabled={subiendo || !archivo}>{subiendo ? 'Subiendo…' : 'Subir y copiar enlace'}</button>
      </form>

      {lista && lista.length > 0 && (
        <>
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap', marginBlockEnd: 'var(--ax-space-3)', alignItems: 'center' }}>
            <span className="ax-badge ax-badge--soft ax-badge--neutral">{lista.length} folletos</span>
            <span className="ax-badge ax-badge--soft ax-badge--success">{nVisibles} visibles</span>
            <span className="ax-badge ax-badge--soft ax-badge--info">{totalVistas} visitas</span>
            <input className="ax-input" style={{ flex: '1 1 14rem', maxWidth: '22rem' }} type="search" placeholder="Buscar folleto…" aria-label="Buscar folleto" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="ax-select" aria-label="Filtrar" value={filtro} onChange={(e) => setFiltro(e.target.value as Filtro)}>
              <option value="todos">Todos</option><option value="visibles">Visibles</option><option value="ocultos">Ocultos</option>
            </select>
            <select className="ax-select" aria-label="Ordenar" value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
              <option value="recientes">Más recientes</option><option value="vistas">Más vistos</option><option value="nombre">Nombre A–Z</option>
            </select>
            <div className="ax-segment" role="group" aria-label="Vista">
              <button type="button" className="ax-segment__option" aria-pressed={vista === 'tarjetas'} onClick={() => setVista('tarjetas')}>Tarjetas</button>
              <button type="button" className="ax-segment__option" aria-pressed={vista === 'lista'} onClick={() => setVista('lista')}>Lista</button>
            </div>
          </div>
          {visibles.length === 0 && <p style={{ color: 'var(--ax-text-muted)' }}>Ningún folleto coincide con la búsqueda.</p>}
        </>
      )}
      {lista && lista.length === 0 && <p style={{ color: 'var(--ax-text-muted)' }}>Aún no hay folletos. Sube el primero arriba.</p>}
      {!lista && !error && <p style={{ color: 'var(--ax-text-muted)' }}>Cargando…</p>}

      {vista === 'tarjetas' ? (
        <div style={{ display: 'grid', gap: 'var(--ax-space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))' }}>
          {visibles.map((f) => (
            <article key={f.id} className="ax-card" style={{ padding: 'var(--ax-space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
              <button type="button" onClick={() => setPrevia(f)} aria-label={`Ver ${f.titulo}`} style={{ all: 'unset', cursor: 'pointer', display: 'block', opacity: f.activo ? 1 : 0.6 }}>
                <Miniatura f={f} />
              </button>
              <strong style={{ overflowWrap: 'anywhere' }}>{f.titulo}</strong>
              <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                {mb(f.bytes)} · {f.vistas} visitas · {fecha(f.createdAt)}{f.creadoPor ? ` · ${f.creadoPor}` : ''}
              </span>
              <code style={{ fontSize: 'var(--ax-text-xs)', overflowWrap: 'anywhere', color: 'var(--ax-text-muted)' }}>{f.url}</code>
              {acciones(f)}
            </article>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
          {visibles.map((f) => (
            <article key={f.id} className="ax-card" style={{ padding: 'var(--ax-space-3)', display: 'flex', gap: 'var(--ax-space-3)', flexWrap: 'wrap', alignItems: 'center', opacity: f.activo ? 1 : 0.7 }}>
              <div style={{ flex: '1 1 16rem', minWidth: 0 }}>
                <strong style={{ overflowWrap: 'anywhere' }}>{f.titulo}</strong>{' '}
                <span className={`ax-badge ax-badge--sm ${f.activo ? 'ax-badge--success' : 'ax-badge--neutral'}`}>{f.activo ? 'Visible' : 'Oculto'}</span>
                <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{mb(f.bytes)} · {f.vistas} visitas · {fecha(f.createdAt)}{f.creadoPor ? ` · ${f.creadoPor}` : ''}</div>
              </div>
              {acciones(f)}
            </article>
          ))}
        </div>
      )}

      {previa && <VistaPrevia f={previa} onClose={() => setPrevia(null)} onCopiar={(u) => copiar(u)} />}

      {editando && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 85, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setEditando(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)' }} />
          <form
            role="dialog" aria-modal="true" aria-label="Renombrar folleto" className="ax-card" style={{ position: 'relative', maxWidth: 440, width: '100%', padding: 'var(--ax-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}
            onSubmit={(e) => { e.preventDefault(); const t = editando.titulo.trim(); if (t.length >= 2) { const id = editando.id; setEditando(null); accion(() => api.patch(`/folletos/${id}`, { titulo: t }), 'Título actualizado.'); } }}
          >
            <h2 className="ax-card__title">Renombrar folleto</h2>
            <input className="ax-input" autoFocus required minLength={2} maxLength={120} aria-label="Nuevo título" value={editando.titulo} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} />
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEditando(null)}>Cancelar</button>
              <button type="submit" className="ax-btn ax-btn--primary">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {borrando && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 85, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setBorrando(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)' }} />
          <div role="alertdialog" aria-modal="true" aria-label="Eliminar folleto" className="ax-card" style={{ position: 'relative', maxWidth: 440, width: '100%', padding: 'var(--ax-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <h2 className="ax-card__title">¿Eliminar «{borrando.titulo}»?</h2>
            <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>El enlace dejará de funcionar para todos y el PDF se borra. Si solo quieres que no se vea por ahora, usa «Ocultar».</p>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setBorrando(null)}>Cancelar</button>
              <button type="button" className="ax-btn ax-btn--primary" style={{ background: 'var(--ax-danger-500)' }} onClick={() => { const id = borrando.id; setBorrando(null); accion(() => api.delete(`/folletos/${id}`), 'Folleto eliminado.'); }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WebFolletos;
