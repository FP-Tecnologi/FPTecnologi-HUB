'use client';
/*
 * FPTecnologi-HUB — Folletos (Web informativa). El equipo, comercial incluido, sube un PDF y obtiene un enlace público
 * que abre solo el folleto (pasa-páginas, controles y logo), sin menú ni encabezado de la web. Es para compartir por
 * WhatsApp o correo; cada folleto cuenta sus visitas y se puede ocultar o borrar.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { ApiError, useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Folleto { id: string; titulo: string; slug: string; bytes: number; activo: boolean; vistas: number; creadoPor: string | null; createdAt: string; url: string }
const MAX_MB = 50;

export function WebFolletos() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Folleto[] | null>(null);
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
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
    try { await navigator.clipboard.writeText(url); setAviso(msg); } catch { setError('No se pudo copiar el enlace.'); }
  }

  async function subir(ev: React.FormEvent) {
    ev.preventDefault();
    if (!archivo) return;
    if (archivo.type !== 'application/pdf') return setError('Elige un archivo PDF.');
    if (archivo.size > MAX_MB * 1024 * 1024) return setError(`El PDF pesa ${(archivo.size / 1024 / 1024).toFixed(1)} MB y el máximo es ${MAX_MB} MB. Comprímelo (por ejemplo en ilovepdf.com → «Comprimir PDF») y vuelve a subirlo.`);
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

  async function accion(fn: () => Promise<unknown>) {
    try { await fn(); await cargar(); } catch (e) { setError(e instanceof ApiError ? e.message : 'No se pudo completar.'); }
  }
  function renombrar(f: Folleto) {
    const t = window.prompt('Nuevo título del folleto', f.titulo)?.trim();
    if (t && t !== f.titulo) accion(() => api.patch(`/folletos/${f.id}`, { titulo: t }));
  }
  function borrar(f: Folleto) {
    if (window.confirm(`¿Eliminar «${f.titulo}»? El enlace dejará de funcionar para todos.`)) accion(() => api.delete(`/folletos/${f.id}`));
  }

  return (
    <>
      <PageHead title="Folletos" subtitle="Sube un PDF y comparte su enlace: quien lo abre ve solo el folleto, con pasa-páginas, controles y el logo de FP Tecnologi. Ideal para que el equipo comercial envíe sus catálogos y propuestas." />
      {error && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{error}</p>}
      {aviso && <p role="status" style={{ color: 'var(--ax-text-muted)' }}>{aviso}</p>}

      <form className="ax-card" onSubmit={subir} style={{ padding: 'var(--ax-space-4)', display: 'flex', flexWrap: 'wrap', gap: 'var(--ax-space-3)', alignItems: 'flex-end', marginBlockEnd: 'var(--ax-space-4)' }}>
        <div className="ax-field" style={{ flex: '1 1 16rem' }}>
          <label className="ax-label" htmlFor="fol-titulo">Título *</label>
          <input id="fol-titulo" className="ax-input" maxLength={120} minLength={2} required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Catálogo Stock FP octubre" />
        </div>
        <div className="ax-field" style={{ flex: '1 1 16rem' }}>
          <label className="ax-label" htmlFor="fol-pdf">PDF * (máx. {MAX_MB} MB)</label>
          <input id="fol-pdf" ref={input} className="ax-input" type="file" accept="application/pdf" required onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
        </div>
        <button type="submit" className="ax-btn ax-btn--primary" disabled={subiendo || !archivo}>{subiendo ? 'Subiendo…' : 'Subir y copiar enlace'}</button>
      </form>

      {lista && lista.length === 0 && <p style={{ color: 'var(--ax-text-muted)' }}>Aún no hay folletos. Sube el primero arriba.</p>}
      <div style={{ display: 'grid', gap: 'var(--ax-space-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(21rem, 1fr))' }}>
        {lista?.map((f) => (
          <article key={f.id} className="ax-card" style={{ padding: 'var(--ax-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)', opacity: f.activo ? 1 : 0.6 }}>
            <strong style={{ overflowWrap: 'anywhere' }}>{f.titulo}</strong>
            <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
              {(f.bytes / 1024 / 1024).toFixed(1)} MB · {f.vistas} visitas · {f.activo ? 'visible' : 'oculto'}{f.creadoPor ? ` · ${f.creadoPor}` : ''}
            </span>
            <code style={{ fontSize: 'var(--ax-text-xs)', overflowWrap: 'anywhere', color: 'var(--ax-text-muted)' }}>{f.url}</code>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
              <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => copiar(f.url)}>Copiar enlace</button>
              <a className="ax-btn ax-btn--ghost ax-btn--sm" href={f.url} target="_blank" rel="noreferrer">Abrir</a>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => renombrar(f)}>Renombrar</button>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => accion(() => api.patch(`/folletos/${f.id}`, { activo: !f.activo }))}>{f.activo ? 'Ocultar' : 'Mostrar'}</button>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => borrar(f)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export default WebFolletos;
