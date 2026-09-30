'use client';
/*
 * FPTecnologi-HUB — Blogs → Nuevo / editar artículo (?id=...). Contenido en
 * Markdown con barra de formato y pestaña de vista previa (mismo conversor
 * que la web pública). A la derecha: publicación (borrador/publicado,
 * destacado), detalles (URL, categoría, etiquetas, autor) y portada.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { markdownToHtml } from '../../lib/markdown';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';
const CATEGORIAS = ['Tienda', 'Videoconferencia', 'Seguridad', 'Data centers', 'Datos empresariales', 'Cloud', 'Educación', 'Novedades'];

type Estado = 'BORRADOR' | 'PUBLICADO';
interface Form {
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  portadaUrl: string;
  categoria: string;
  etiquetas: string;
  autorNombre: string;
  destacado: boolean;
}
const VACIO: Form = { titulo: '', slug: '', resumen: '', contenido: '', portadaUrl: '', categoria: 'Novedades', etiquetas: '', autorNombre: 'Equipo FPTecnologi', destacado: false };

const slugify = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);

const ICON = { className: 'ax-btn__icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

// Barra de formato: envuelve la selección o inserta al inicio de la línea.
const FORMATOS: { label: string; title: string; wrap?: [string, string]; line?: string }[] = [
  { label: 'H2', title: 'Subtítulo', line: '## ' },
  { label: 'H3', title: 'Subtítulo menor', line: '### ' },
  { label: 'B', title: 'Negrita', wrap: ['**', '**'] },
  { label: 'I', title: 'Cursiva', wrap: ['*', '*'] },
  { label: '•', title: 'Lista', line: '- ' },
  { label: '1.', title: 'Lista numerada', line: '1. ' },
  { label: '❝', title: 'Cita', line: '> ' },
  { label: 'Link', title: 'Enlace', wrap: ['[', '](https://)'] },
  { label: 'Img', title: 'Imagen', wrap: ['![descripción](', ')'] },
];

// Estilos de lectura para la vista previa (equivalentes a .blog-prose de la web).
const PREVIEW_CSS = `
.bp{font-size:15px;line-height:1.75;color:var(--ax-text)}
.bp>*+*{margin-top:1em}
.bp h2{font-size:1.45rem;font-weight:700;color:var(--ax-text-strong);margin-top:1.6em}
.bp h3{font-size:1.15rem;font-weight:700;color:var(--ax-text-strong);margin-top:1.4em}
.bp strong{color:var(--ax-text-strong)}
.bp a{color:var(--ax-accent);text-decoration:underline}
.bp ul{list-style:disc;padding-left:1.4em}.bp ol{list-style:decimal;padding-left:1.4em}
.bp blockquote{border-left:4px solid var(--ax-accent);background:color-mix(in oklab,var(--ax-accent) 10%,transparent);padding:.8rem 1rem;border-radius:0 10px 10px 0;font-weight:600}
.bp img{max-width:100%;border-radius:12px}
.bp code{background:var(--ax-surface-subtle);padding:.1em .35em;border-radius:6px}`;

export function BlogEditor() {
  const { activeMarcaId, user } = useAuth();
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(VACIO);
  const [estado, setEstado] = useState<Estado>('BORRADOR');
  const [slugTocado, setSlugTocado] = useState(false);
  const [tab, setTab] = useState<'escribir' | 'vista'>('escribir');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState<Estado | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // ?id=... = editar un artículo existente.
  useEffect(() => {
    const qid = new URLSearchParams(window.location.search).get('id');
    if (!qid || !activeMarcaId) return;
    setId(qid);
    setCargando(true);
    api
      .get<Form & { etiquetas: string[]; estado: Estado; portadaUrl: string | null }>(`/blog/${qid}`)
      .then((a) => {
        // Solo los campos del formulario: la API rechaza campos extra (id, marcaId...).
        setForm({
          titulo: a.titulo,
          slug: a.slug,
          resumen: a.resumen,
          contenido: a.contenido,
          portadaUrl: a.portadaUrl ?? '',
          categoria: a.categoria,
          etiquetas: a.etiquetas.join(', '),
          autorNombre: a.autorNombre,
          destacado: a.destacado,
        });
        setEstado(a.estado);
        setSlugTocado(true);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'No se pudo cargar el artículo.'))
      .finally(() => setCargando(false));
  }, [activeMarcaId]);

  useEffect(() => {
    if (!id && user?.nombre) setForm((f) => (f.autorNombre === VACIO.autorNombre ? { ...f, autorNombre: user.nombre } : f));
  }, [id, user?.nombre]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v, ...(k === 'titulo' && !slugTocado ? { slug: slugify(String(v)) } : {}) }));

  const html = useMemo(() => markdownToHtml(form.contenido), [form.contenido]);
  const palabras = form.contenido.trim() ? form.contenido.trim().split(/\s+/).length : 0;

  function formato(f: (typeof FORMATOS)[number]) {
    const el = areaRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    let nuevo: string;
    let cursor: number;
    if (f.wrap) {
      const sel = value.slice(a, b) || 'texto';
      nuevo = value.slice(0, a) + f.wrap[0] + sel + f.wrap[1] + value.slice(b);
      cursor = a + f.wrap[0].length + sel.length;
    } else {
      const ini = value.lastIndexOf('\n', a - 1) + 1;
      nuevo = value.slice(0, ini) + f.line + value.slice(ini);
      cursor = a + f.line!.length;
    }
    set('contenido', nuevo);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  async function guardar(nuevoEstado: Estado) {
    setError('');
    setOk('');
    if (form.titulo.trim().length < 3 || !form.resumen.trim() || !form.contenido.trim()) {
      setError('Completa el título, el resumen y el contenido.');
      return;
    }
    setGuardando(nuevoEstado);
    const body = {
      ...form,
      slug: form.slug || undefined,
      portadaUrl: form.portadaUrl.trim() || undefined,
      etiquetas: form.etiquetas.split(',').map((t) => t.trim()).filter(Boolean),
      estado: nuevoEstado,
    };
    try {
      const a = id ? await api.patch<{ id: string; slug: string }>(`/blog/${id}`, body) : await api.post<{ id: string; slug: string }>('/blog', body);
      setId(a.id);
      setEstado(nuevoEstado);
      setForm((f) => ({ ...f, slug: a.slug }));
      setSlugTocado(true);
      window.history.replaceState(null, '', `/blogs/nuevo?id=${a.id}`);
      setOk(nuevoEstado === 'PUBLICADO' ? 'Artículo publicado en la web.' : 'Borrador guardado.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(null);
    }
  }

  const portada = form.portadaUrl ? (form.portadaUrl.startsWith('/') ? `${WEB}${form.portadaUrl}` : form.portadaUrl) : '';

  return (
    <>
      <style>{PREVIEW_CSS}</style>
      <PageHead
        title={id ? 'Editar artículo' : 'Nuevo artículo'}
        subtitle={cargando ? 'Cargando…' : 'Escribe en Markdown; la vista previa muestra cómo se verá en la web.'}
        actions={
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
            {estado === 'PUBLICADO' && form.slug && (
              <a className="ax-btn ax-btn--ghost" href={`${WEB}/blog/${form.slug}`} target="_blank" rel="noreferrer">
                <svg {...ICON}><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg>
                <span className="ax-btn__label">Ver en la web</span>
              </a>
            )}
            <button type="button" className={`ax-btn ax-btn--secondary${guardando === 'BORRADOR' ? ' is-loading' : ''}`} disabled={!!guardando} onClick={() => guardar('BORRADOR')}>
              <span className="ax-btn__spinner" aria-hidden="true"></span>
              <span className="ax-btn__label">{estado === 'PUBLICADO' ? 'Pasar a borrador' : 'Guardar borrador'}</span>
            </button>
            <button type="button" className={`ax-btn ax-btn--primary${guardando === 'PUBLICADO' ? ' is-loading' : ''}`} disabled={!!guardando} onClick={() => guardar('PUBLICADO')}>
              <span className="ax-btn__spinner" aria-hidden="true"></span>
              <span className="ax-btn__label">{estado === 'PUBLICADO' ? 'Guardar y publicar' : 'Publicar'}</span>
            </button>
          </div>
        }
      />

      {(error || ok) && (
        <div role={error ? 'alert' : 'status'} className={`ax-alert ${error ? 'ax-alert--danger' : 'ax-alert--success'}`} style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={error ? { color: 'var(--ax-danger-500)' } : undefined}>{error || ok}</p></div>
        </div>
      )}

      <div className="ax-dash-grid">
        {/* Contenido */}
        <section className="ax-card ax-col--8" role="region" aria-label="Contenido del artículo">
          <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
            <div className="ax-field">
              <label className="ax-label" htmlFor="bl-titulo">Título</label>
              <input id="bl-titulo" className="ax-input" style={{ fontSize: 'var(--ax-text-lg)', fontWeight: 600 }} maxLength={160} placeholder="Ej. 5 claves para equipar una sala de videoconferencia" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} />
            </div>
            <div className="ax-field">
              <label className="ax-label" htmlFor="bl-resumen">Resumen <span style={{ color: 'var(--ax-text-subtle)', fontWeight: 400 }}>({form.resumen.length}/300 · se muestra en el listado)</span></label>
              <textarea id="bl-resumen" className="ax-textarea" rows={2} maxLength={300} value={form.resumen} onChange={(e) => set('resumen', e.target.value)} />
            </div>

            <div className="ax-field">
              <div className="ax-cluster" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--ax-space-2)' }}>
                <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Modo">
                  <button type="button" role="radio" aria-checked={tab === 'escribir'} className={`ax-btn ax-btn--sm${tab === 'escribir' ? ' is-selected' : ''}`} onClick={() => setTab('escribir')}>Escribir</button>
                  <button type="button" role="radio" aria-checked={tab === 'vista'} className={`ax-btn ax-btn--sm${tab === 'vista' ? ' is-selected' : ''}`} onClick={() => setTab('vista')}>Vista previa</button>
                </div>
                {tab === 'escribir' && (
                  <div className="ax-cluster" style={{ gap: 4 }}>
                    {FORMATOS.map((f) => (
                      <button key={f.label} type="button" title={f.title} aria-label={f.title} className="ax-btn ax-btn--ghost ax-btn--sm" style={{ minWidth: 34, fontWeight: 700, fontStyle: f.label === 'I' ? 'italic' : undefined }} onClick={() => formato(f)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {tab === 'escribir' ? (
                <textarea
                  ref={areaRef}
                  className="ax-textarea"
                  rows={20}
                  value={form.contenido}
                  onChange={(e) => set('contenido', e.target.value)}
                  placeholder={'Escribe aquí el artículo.\n\n## Un subtítulo\n\nUn párrafo con **negrita** y un [enlace](/servicios).\n\n- Punto uno\n- Punto dos'}
                  style={{ fontFamily: 'var(--ax-font-mono)', fontSize: 13, lineHeight: 1.6, minHeight: 420 }}
                />
              ) : (
                <div style={{ minHeight: 420, padding: 'var(--ax-space-5)', border: '1px solid var(--ax-border)', borderRadius: 12 }}>
                  {form.contenido.trim() ? <div className="bp" dangerouslySetInnerHTML={{ __html: html }} /> : <p style={{ color: 'var(--ax-text-muted)' }}>Todavía no hay contenido.</p>}
                </div>
              )}
              <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                {palabras} palabras · {Math.max(1, Math.round(palabras / 200))} min de lectura
              </span>
            </div>
          </div>
        </section>

        {/* Lateral */}
        <div className="ax-col--4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
          <section className="ax-card" aria-label="Publicación">
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              <h2 className="ax-card__title">Publicación</h2>
              <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Estado</span>
                <span className={`ax-badge ax-badge--soft ax-badge--sm ${estado === 'PUBLICADO' ? 'ax-badge--success' : 'ax-badge--warning'}`}>{estado === 'PUBLICADO' ? 'Publicado' : 'Borrador'}</span>
              </div>
              <label className="ax-cluster" style={{ justifyContent: 'space-between', fontSize: 'var(--ax-text-sm)' }}>
                <span>Destacado en el blog</span>
                <input type="checkbox" className="ax-switch" checked={form.destacado} onChange={(e) => set('destacado', e.target.checked)} />
              </label>
            </div>
          </section>

          <section className="ax-card" aria-label="Detalles">
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <h2 className="ax-card__title">Detalles</h2>
              <div className="ax-field">
                <label className="ax-label" htmlFor="bl-slug">URL</label>
                <input
                  id="bl-slug"
                  className="ax-input"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTocado(true);
                    setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                  }}
                />
                <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>/blog/{form.slug || '…'}</span>
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="bl-cat">Categoría</label>
                <input id="bl-cat" className="ax-input" list="bl-cats" maxLength={60} value={form.categoria} onChange={(e) => set('categoria', e.target.value)} />
                <datalist id="bl-cats">{CATEGORIAS.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="bl-tags">Etiquetas</label>
                <input id="bl-tags" className="ax-input" placeholder="separadas por comas" value={form.etiquetas} onChange={(e) => set('etiquetas', e.target.value)} />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="bl-autor">Autor</label>
                <input id="bl-autor" className="ax-input" maxLength={80} value={form.autorNombre} onChange={(e) => set('autorNombre', e.target.value)} />
              </div>
            </div>
          </section>

          <section className="ax-card" aria-label="Portada">
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              <h2 className="ax-card__title">Portada</h2>
              <div style={{ aspectRatio: '16 / 10', borderRadius: 12, overflow: 'hidden', background: 'var(--ax-surface-subtle)', display: 'grid', placeItems: 'center', color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-sm)' }}>
                {portada ? <img src={portada} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'Sin portada'}
              </div>
              <input className="ax-input" placeholder="https://… o /images/…" value={form.portadaUrl} onChange={(e) => set('portadaUrl', e.target.value)} aria-label="URL de la portada" />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default BlogEditor;
