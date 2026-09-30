'use client';
/*
 * FPTecnologi-HUB — CMS de la home de la web informativa (Web informativa →
 * Home page). Izquierda: secciones de la home en su orden (mostrar/ocultar)
 * y el formulario de la sección elegida. Derecha: vista previa de la web
 * real (iframe) que salta a esa sección y se recarga al guardar.
 *
 * Los textos actuales vienen de la propia web (GET {web}/api/cms/home =
 * valores por defecto + lo guardado), así el formulario arranca con lo que
 * hoy se ve. Guardar = PUT /contenido/home/:seccion en la API central
 * (admin/marketing); la web lo lee en cada visita.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

type Datos = Record<string, unknown>;
type Campo =
  | { key: string; label: string; tipo: 'text' | 'textarea'; ayuda?: string }
  | { key: string; label: string; tipo: 'lista-texto' }
  | { key: string; label: string; tipo: 'lista-items'; itemLabel: string }
  | { key: string; label: string; tipo: 'slides' };

const BADGE: Campo = { key: 'badge', label: 'Etiqueta (badge)', tipo: 'text' };
const TITULO: Campo = { key: 'titulo', label: 'Título — parte en color sólido', tipo: 'text' };
const DESTACADO: Campo = { key: 'destacado', label: 'Título — parte con brillo', tipo: 'text' };
const DESCRIPCION: Campo = { key: 'descripcion', label: 'Descripción', tipo: 'textarea' };
const BOTON: Campo = { key: 'botonTexto', label: 'Texto del botón', tipo: 'text', ayuda: 'Vacío = sin botón' };
const URL: Campo = { key: 'botonUrl', label: 'Enlace del botón', tipo: 'text', ayuda: 'Ej. /servicios o https://…' };

const SECCIONES: { key: string; nombre: string; ancla: string; campos: Campo[] }[] = [
  { key: 'hero', nombre: 'Banner principal', ancla: '', campos: [{ key: 'slides', label: 'Diapositivas', tipo: 'slides' }] },
  { key: 'marcas', nombre: 'Marcas', ancla: 'marcas', campos: [] },
  { key: 'nosotros', nombre: 'Nosotros', ancla: 'nosotros', campos: [BADGE, TITULO, DESTACADO, DESCRIPCION, { key: 'puntos', label: 'Puntos destacados', tipo: 'lista-texto' }, BOTON, URL] },
  { key: 'servicios', nombre: 'Servicios', ancla: 'servicios', campos: [BADGE, TITULO, DESTACADO, BOTON, URL] },
  { key: 'porque', nombre: 'Por qué elegirnos', ancla: 'porque', campos: [BADGE, TITULO, DESTACADO, { key: 'items', label: 'Diferenciadores', tipo: 'lista-items', itemLabel: 'Diferenciador' }] },
  { key: 'categorias', nombre: 'Categorías', ancla: 'categorias', campos: [BADGE, TITULO, DESTACADO, DESCRIPCION, BOTON, URL] },
  { key: 'productos', nombre: 'Los más vendidos', ancla: 'catalogo', campos: [BADGE, TITULO, DESTACADO, BOTON, URL] },
  { key: 'proyectos', nombre: 'Proyectos', ancla: 'proyectos', campos: [BADGE, TITULO, DESTACADO, DESCRIPCION] },
  { key: 'clientes', nombre: 'Clientes', ancla: 'clientes', campos: [BADGE, TITULO, DESTACADO, DESCRIPCION] },
  { key: 'partners', nombre: 'Partners', ancla: 'partners', campos: [BADGE, TITULO, DESTACADO, DESCRIPCION, BOTON, { key: 'pasos', label: 'Pasos', tipo: 'lista-items', itemLabel: 'Paso' }] },
  { key: 'contacto', nombre: 'Contacto', ancla: 'contacto', campos: [BADGE, TITULO, DESTACADO, DESCRIPCION] },
];

const SLIDE_CAMPOS = [
  { key: 'eyebrow', label: 'Etiqueta' },
  { key: 'titleLead', label: 'Título — parte sólida' },
  { key: 'titleAccent', label: 'Título — parte con brillo' },
  { key: 'text', label: 'Texto' },
];

const ICON = { className: 'ax-btn__icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
const I_SAVE = <svg {...ICON}><path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" /><path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M14 4l0 4l-6 0l0 -4" /></svg>;
const I_EXT = <svg {...ICON}><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg>;
const I_PLUS = <svg {...ICON}><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>;
const I_X = <svg {...ICON}><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>;

const PANEL_H = 'calc(100vh - 370px)';

export function WebHomeCms() {
  const { activeMarcaId } = useAuth();
  const [guardado, setGuardado] = useState<Record<string, Datos> | null>(null);
  const [borrador, setBorrador] = useState<Record<string, Datos>>({});
  const [sel, setSel] = useState('hero');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [vista, setVista] = useState<'escritorio' | 'celular'>('escritorio');
  const [recarga, setRecarga] = useState(0);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`${WEB}/api/cms/home`, { cache: 'no-store' });
      const data = (await res.json()) as Record<string, Datos>;
      setGuardado(data);
      setBorrador(structuredClone(data));
      setError('');
    } catch {
      setError(`No se pudo leer el contenido de la web (${WEB}). ¿Está encendida?`);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar, activeMarcaId]);

  const seccion = SECCIONES.find((s) => s.key === sel)!;
  const datos = borrador[sel] ?? {};
  const sucio = useMemo(
    () => guardado !== null && JSON.stringify(guardado[sel]) !== JSON.stringify(borrador[sel]),
    [guardado, borrador, sel],
  );

  const set = (key: string, value: unknown) => setBorrador((b) => ({ ...b, [sel]: { ...b[sel], [key]: value } }));

  async function guardar(key = sel, datosSeccion = borrador[key]) {
    setGuardando(true);
    setOk('');
    setError('');
    try {
      await api.put(`/contenido/home/${key}`, { datos: datosSeccion });
      setGuardado((g) => ({ ...(g ?? {}), [key]: structuredClone(datosSeccion) }));
      setBorrador((b) => ({ ...b, [key]: structuredClone(datosSeccion) }));
      setOk('Cambios publicados en la web.');
      setRecarga((n) => n + 1);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  function toggleVisible(key: string) {
    const actual = borrador[key] ?? {};
    const nuevo = { ...actual, visible: actual.visible === false };
    setBorrador((b) => ({ ...b, [key]: nuevo }));
    setSel(key);
    guardar(key, nuevo);
  }

  const src = `${WEB}/?cms=${recarga}${seccion.ancla ? `#${seccion.ancla}` : ''}`;

  return (
    <>
      <PageHead
        title="Home page"
        subtitle="Edita los textos de cada sección de la página de inicio. Los cambios se publican al guardar."
        actions={
          <a className="ax-btn ax-btn--secondary" href={WEB} target="_blank" rel="noreferrer">
            {I_EXT}
            <span className="ax-btn__label">Ver web</span>
          </a>
        }
      />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <div className="ax-dash-grid">
        {/* Secciones + formulario */}
        <section className="ax-card ax-col--5" role="region" aria-label="Contenido de la sección" style={{ display: 'flex', flexDirection: 'column', height: PANEL_H, minHeight: 560, overflow: 'hidden' }}>
          <div className="ax-card__body" style={{ flex: '0 0 auto', borderBottom: '1px solid var(--ax-border)' }}>
            <label className="ax-label" htmlFor="cms-sec">Sección</label>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
              <select id="cms-sec" className="ax-select" value={sel} onChange={(e) => setSel(e.target.value)} style={{ flex: 1 }}>
                {SECCIONES.map((s, i) => (
                  <option key={s.key} value={s.key}>
                    {i + 1}. {s.nombre}{borrador[s.key]?.visible === false ? ' (oculta)' : ''}
                  </option>
                ))}
              </select>
              <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap', whiteSpace: 'nowrap', fontSize: 'var(--ax-text-sm)' }}>
                <input type="checkbox" className="ax-switch" checked={datos.visible !== false} onChange={() => toggleVisible(sel)} disabled={!guardado || guardando} />
                Visible
              </label>
            </div>
          </div>

          <div className="ax-card__body" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
            {!guardado ? (
              <p style={{ color: 'var(--ax-text-muted)' }}>Cargando contenido…</p>
            ) : seccion.campos.length === 0 ? (
              <p style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)' }}>
                Esta sección no tiene textos editables todavía. Puedes mostrarla u ocultarla con «Visible».
              </p>
            ) : (
              seccion.campos.map((c) => <CampoEditor key={c.key} campo={c} valor={datos[c.key]} onChange={(v) => set(c.key, v)} />)
            )}
          </div>

          <div className="ax-card__body" style={{ flex: '0 0 auto', borderTop: '1px solid var(--ax-border)', display: 'flex', gap: 'var(--ax-space-3)', alignItems: 'center', justifyContent: 'flex-end' }}>
            {ok && !sucio && <span style={{ marginInlineEnd: 'auto', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-success-500, #2f9e62)' }}>{ok}</span>}
            {sucio && <span style={{ marginInlineEnd: 'auto', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Tienes cambios sin guardar</span>}
            <button type="button" className="ax-btn ax-btn--ghost" disabled={!sucio || guardando} onClick={() => setBorrador((b) => ({ ...b, [sel]: structuredClone(guardado![sel]) }))}>
              Descartar
            </button>
            <button type="button" className={`ax-btn ax-btn--primary${guardando ? ' is-loading' : ''}`} disabled={!sucio || guardando} onClick={() => guardar()}>
              <span className="ax-btn__spinner" aria-hidden="true"></span>
              {I_SAVE}
              <span className="ax-btn__label">Guardar y publicar</span>
            </button>
          </div>
        </section>

        {/* Vista previa */}
        <section className="ax-card ax-col--7" role="region" aria-label="Vista previa" style={{ display: 'flex', flexDirection: 'column', height: PANEL_H, minHeight: 560, overflow: 'hidden' }}>
          <div className="ax-card__header">
            <div className="ax-card__titles">
              <h2 className="ax-card__title">Vista previa</h2>
              <p className="ax-card__subtitle">{seccion.nombre} · se actualiza al guardar</p>
            </div>
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Tamaño de la vista previa">
              {(['escritorio', 'celular'] as const).map((v) => (
                <button key={v} type="button" role="radio" aria-checked={vista === v} className={`ax-btn ax-btn--sm${vista === v ? ' is-selected' : ''}`} onClick={() => setVista(v)}>
                  {v === 'escritorio' ? 'Escritorio' : 'Celular'}
                </button>
              ))}
            </div>
          </div>
          <Preview src={src} ancho={vista === 'escritorio' ? 1440 : 390} />
        </section>
      </div>
    </>
  );
}

/* Iframe de la web a su ancho real (1440 o 390 px) escalado para caber en la tarjeta. */
function Preview({ src, ancho }: { src: string; ancho: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [caja, setCaja] = useState({ w: 800, h: 600 });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCaja({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const escala = Math.min(1, caja.w / ancho);
  return (
    <div ref={boxRef} style={{ flex: '1 1 auto', minHeight: 0, position: 'relative', overflow: 'hidden', background: 'var(--ax-surface-subtle)' }}>
      <iframe
        key={src}
        title="Vista previa de la home"
        src={src}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: ancho,
          height: caja.h / escala,
          border: 0,
          transform: `translateX(-50%) scale(${escala})`,
          transformOrigin: 'top center',
          background: '#fff',
        }}
      />
    </div>
  );
}

function CampoEditor({ campo, valor, onChange }: { campo: Campo; valor: unknown; onChange: (v: unknown) => void }) {
  const id = `cms-${campo.key}`;
  if (campo.tipo === 'text' || campo.tipo === 'textarea') {
    return (
      <div className="ax-field">
        <label className="ax-label" htmlFor={id}>{campo.label}</label>
        {campo.tipo === 'text' ? (
          <input id={id} className="ax-input" value={String(valor ?? '')} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <textarea id={id} className="ax-textarea" rows={4} value={String(valor ?? '')} onChange={(e) => onChange(e.target.value)} />
        )}
        {'ayuda' in campo && campo.ayuda && <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{campo.ayuda}</span>}
      </div>
    );
  }

  if (campo.tipo === 'lista-texto') {
    const lista = Array.isArray(valor) ? (valor as string[]) : [];
    return (
      <Grupo titulo={campo.label} onAdd={() => onChange([...lista, ''])}>
        {lista.map((t, i) => (
          <div key={i} className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
            <input className="ax-input" value={t} aria-label={`${campo.label} ${i + 1}`} onChange={(e) => onChange(lista.map((x, j) => (j === i ? e.target.value : x)))} />
            <Quitar onClick={() => onChange(lista.filter((_, j) => j !== i))} />
          </div>
        ))}
      </Grupo>
    );
  }

  if (campo.tipo === 'lista-items') {
    const lista = Array.isArray(valor) ? (valor as { title: string; text: string }[]) : [];
    const upd = (i: number, k: 'title' | 'text', v: string) => onChange(lista.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
    return (
      <Grupo titulo={campo.label} onAdd={() => onChange([...lista, { title: '', text: '' }])}>
        {lista.map((it, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)', padding: 'var(--ax-space-3)', border: '1px solid var(--ax-border)', borderRadius: 10 }}>
            <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
              <strong style={{ fontSize: 'var(--ax-text-sm)' }}>{campo.itemLabel} {i + 1}</strong>
              <Quitar onClick={() => onChange(lista.filter((_, j) => j !== i))} />
            </div>
            <input className="ax-input" placeholder="Título" value={it.title} onChange={(e) => upd(i, 'title', e.target.value)} />
            <textarea className="ax-textarea" rows={2} placeholder="Texto" value={it.text} onChange={(e) => upd(i, 'text', e.target.value)} />
          </div>
        ))}
      </Grupo>
    );
  }

  // slides del hero: cantidad fija (cada una tiene su imagen en la web).
  const slides = Array.isArray(valor) ? (valor as Record<string, string>[]) : [];
  return (
    <>
      {slides.map((sl, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)', padding: 'var(--ax-space-3)', border: '1px solid var(--ax-border)', borderRadius: 10 }}>
          <strong style={{ fontSize: 'var(--ax-text-sm)' }}>Diapositiva {i + 1}</strong>
          {SLIDE_CAMPOS.map((f) => (
            <div key={f.key} className="ax-field">
              <label className="ax-label" htmlFor={`sl-${i}-${f.key}`}>{f.label}</label>
              {f.key === 'text' ? (
                <textarea id={`sl-${i}-${f.key}`} className="ax-textarea" rows={2} value={sl[f.key] ?? ''} onChange={(e) => onChange(slides.map((x, j) => (j === i ? { ...x, [f.key]: e.target.value } : x)))} />
              ) : (
                <input id={`sl-${i}-${f.key}`} className="ax-input" value={sl[f.key] ?? ''} onChange={(e) => onChange(slides.map((x, j) => (j === i ? { ...x, [f.key]: e.target.value } : x)))} />
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function Grupo({ titulo, onAdd, children }: { titulo: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="ax-field" style={{ gap: 'var(--ax-space-2)' }}>
      <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
        <span className="ax-label">{titulo}</span>
        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={onAdd}>
          {I_PLUS}
          <span className="ax-btn__label">Agregar</span>
        </button>
      </div>
      {children}
    </div>
  );
}

function Quitar({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" onClick={onClick} aria-label="Quitar">
      {I_X}
    </button>
  );
}

export default WebHomeCms;
