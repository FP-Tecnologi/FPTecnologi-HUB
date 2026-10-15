'use client';
/*
 * FPTecnologi-HUB — Web informativa → Páginas de servicios. Se elige un servicio
 * y se edita TODO el contenido de su página (/servicios/[slug]) por secciones,
 * con la vista previa de esa misma página. Cada campo se guarda donde vive:
 *  - datos del servicio (nombre, intro, qué incluye, beneficios, sectores, FAQs…)
 *    → PATCH /servicios/:id (el mismo contenido que usan tarjetas, cotizador y chat);
 *  - textos de la plantilla (títulos de sección, botones, proceso) → contenido de
 *    la página `servicio-<slug>`, que sobrescribe los textos comunes de Servicios.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { CampoEditor, Preview, type Seccion } from './WebHomeCms';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';
const PANEL_H = 'calc(100vh - 370px)';

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  slug: string | null;
  etiqueta: string | null;
  imagenUrl: string | null;
  intro: string | null;
  incluye: string[];
  beneficios: { titulo: string; texto: string }[];
  sectores: string[];
  faqs: { p: string; r: string }[];
}
type Items = { title: string; text: string }[];
type Datos = Record<string, unknown>;

const S = (f: string) => `s:${f}`;
const P = (sec: string, f: string) => `p:${sec}:${f}`;
const t = (key: string, label: string, ayuda?: string) => ({ key, label, tipo: 'text', ayuda }) as const;
const enc = (sec: string) => [
  t(P(sec, 'badge'), 'Etiqueta (badge)'),
  t(P(sec, 'titulo'), 'Título — parte en color sólido'),
  t(P(sec, 'destacado'), 'Título — parte con brillo'),
];

const SECCIONES: Seccion[] = [
  {
    key: 'encabezado',
    nombre: 'Encabezado',
    ancla: '',
    campos: [
      t(S('nombre'), 'Nombre del servicio'),
      t(S('etiqueta'), 'Etiqueta sobre el título', 'Ej. Soluciones de, Somos expertos en…'),
      { key: S('descripcion'), label: 'Descripción corta (encabezado y tarjeta)', tipo: 'textarea' },
      t(S('imagenUrl'), 'Imagen (URL o ruta que empiece con /)'),
      t(P('det-hero', 'destacado'), 'Título — parte con brillo (tras el nombre)'),
      t(P('det-hero', 'botonCotizar'), 'Botón de cotizar'),
      t(P('det-hero', 'botonContactar'), 'Botón de WhatsApp'),
    ],
  },
  {
    key: 'incluye',
    nombre: 'Qué incluye',
    ancla: 'incluye',
    campos: [
      ...enc('det-incluye'),
      { key: S('intro'), label: 'Introducción', tipo: 'textarea' },
      { key: S('incluye'), label: 'Qué incluye', tipo: 'lista-texto' },
    ],
  },
  {
    key: 'beneficios',
    nombre: 'Beneficios',
    ancla: 'beneficios',
    campos: [...enc('det-beneficios'), { key: S('beneficios'), label: 'Beneficios (título + texto)', tipo: 'lista-items', itemLabel: 'Beneficio' }],
  },
  {
    key: 'proceso',
    nombre: 'Cómo trabajamos',
    ancla: 'proceso',
    campos: [...enc('proceso'), { key: P('proceso', 'items'), label: 'Pasos (título + texto)', tipo: 'lista-items', itemLabel: 'Paso' }],
  },
  {
    key: 'sectores',
    nombre: 'Sectores que atendemos',
    ancla: 'sectores',
    campos: [...enc('det-sectores'), { key: S('sectores'), label: 'Sectores', tipo: 'lista-texto' }],
  },
  {
    key: 'faqs',
    nombre: 'Preguntas frecuentes',
    ancla: 'sectores',
    campos: [t(P('det-faqs', 'badge'), 'Etiqueta (badge)'), { key: S('faqs'), label: 'Preguntas (pregunta + respuesta)', tipo: 'lista-items', itemLabel: 'Pregunta' }],
  },
  {
    key: 'cotizar',
    nombre: 'Cotización',
    ancla: 'cotizar',
    campos: [...enc('det-cotizar'), { key: P('det-cotizar', 'texto'), label: 'Texto', tipo: 'textarea', ayuda: 'Usa {servicio} para insertar el nombre del servicio.' }],
  },
  {
    key: 'otros',
    nombre: 'Otros servicios',
    ancla: 'otros',
    campos: [...enc('det-otros'), t(P('det-otros', 'boton'), 'Texto del botón')],
  },
];

const TODOS = SECCIONES.flatMap((s) => s.campos.map((c) => c.key));
const esPagina = (k: string) => k.startsWith('p:');

/** Valor de cada campo en el formulario: datos del servicio + textos (comunes, o los propios del servicio). */
function valoresDe(s: Servicio, global: Record<string, Datos>, propio: Record<string, Datos>): Record<string, unknown> {
  const v: Record<string, unknown> = {
    [S('nombre')]: s.nombre,
    [S('etiqueta')]: s.etiqueta ?? '',
    [S('descripcion')]: s.descripcion ?? '',
    [S('imagenUrl')]: s.imagenUrl ?? '',
    [S('intro')]: s.intro ?? '',
    [S('incluye')]: [...s.incluye],
    [S('beneficios')]: s.beneficios.map((b) => ({ title: b.titulo, text: b.texto })),
    [S('sectores')]: [...s.sectores],
    [S('faqs')]: s.faqs.map((f) => ({ title: f.p, text: f.r })),
  };
  for (const k of TODOS.filter(esPagina)) {
    const [, sec, campo] = k.split(':');
    v[k] = structuredClone(propio[sec]?.[campo] ?? global[sec]?.[campo] ?? (campo === 'items' ? [] : ''));
  }
  return v;
}

export function WebServiciosPaginas() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Servicio[]>([]);
  const [selId, setSelId] = useState('');
  const [global, setGlobal] = useState<Record<string, Datos>>({});
  const [guardado, setGuardado] = useState<Record<string, unknown> | null>(null);
  const [borrador, setBorrador] = useState<Record<string, unknown>>({});
  const [sel, setSel] = useState(SECCIONES[0].key);
  const [vista, setVista] = useState<'escritorio' | 'celular'>('escritorio');
  const [recarga, setRecarga] = useState(0);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);

  const servicio = lista.find((s) => s.id === selId) ?? null;

  const cargarLista = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      const data = await api.get<Servicio[]>('/servicios');
      setLista(data);
      setSelId((id) => id || data[0]?.id || '');
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los servicios.');
    }
  }, [activeMarcaId]);
  useEffect(() => { void cargarLista(); }, [cargarLista]);

  // Textos comunes de la plantilla (una vez).
  useEffect(() => {
    fetch(`${WEB}/api/cms/servicios`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setGlobal(d as Record<string, Datos>))
      .catch(() => setError(`No se pudo leer el contenido de la web (${WEB}). ¿Está encendida?`));
  }, []);

  // Al elegir servicio (o llegar los textos comunes): sus datos y sus textos propios.
  const slugSel = servicio?.slug ?? null;
  useEffect(() => {
    if (!servicio || !slugSel || Object.keys(global).length === 0) return;
    let vigente = true;
    setGuardado(null);
    api
      .get<Record<string, Datos>>(`/contenido/servicio-${slugSel}`)
      .then((propio) => {
        if (!vigente) return;
        const v = valoresDe(servicio, global, propio ?? {});
        setGuardado(v);
        setBorrador(structuredClone(v));
      })
      .catch((e) => vigente && setError(e instanceof ApiError ? e.message : 'No se pudo leer el contenido del servicio.'));
    return () => { vigente = false; };
    // Solo al cambiar de servicio o al llegar los textos comunes (no al guardar).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selId, slugSel, global]);

  const seccion = SECCIONES.find((s) => s.key === sel)!;
  const sucio = useMemo(
    () => guardado !== null && seccion.campos.some((c) => JSON.stringify(guardado[c.key]) !== JSON.stringify(borrador[c.key])),
    [guardado, borrador, seccion],
  );

  async function guardar() {
    if (!servicio?.slug || !guardado) return;
    setError('');
    setOk('');
    const claves = seccion.campos.map((c) => c.key);
    const cambios = claves.filter((k) => JSON.stringify(guardado[k]) !== JSON.stringify(borrador[k]));
    const txt = (k: string) => String(borrador[k] ?? '').trim();
    const limpiarItems = (k: string) => ((borrador[k] as Items) ?? []).filter((i) => i.title.trim() || i.text.trim());

    const body: Record<string, unknown> = {};
    if (cambios.includes(S('nombre'))) {
      if (txt(S('nombre')).length < 2) return setError('El nombre es obligatorio.');
      body.nombre = txt(S('nombre'));
    }
    if (cambios.includes(S('imagenUrl'))) {
      if (txt(S('imagenUrl')) && !/^(https?:\/\/|\/)/.test(txt(S('imagenUrl')))) return setError('La imagen debe ser una URL (https://…) o una ruta que empiece con /.');
      body.imagenUrl = txt(S('imagenUrl'));
    }
    for (const k of ['etiqueta', 'descripcion', 'intro'] as const) if (cambios.includes(S(k))) body[k] = txt(S(k));
    for (const k of ['incluye', 'sectores'] as const) {
      if (cambios.includes(S(k))) body[k] = ((borrador[S(k)] as string[]) ?? []).map((x) => x.trim()).filter(Boolean);
    }
    if (cambios.includes(S('beneficios'))) {
      const it = limpiarItems(S('beneficios'));
      if (it.some((i) => !i.title.trim() || !i.text.trim())) return setError('Cada beneficio necesita título y texto.');
      body.beneficios = it.map((i) => ({ titulo: i.title.trim(), texto: i.text.trim() }));
    }
    if (cambios.includes(S('faqs'))) {
      const it = limpiarItems(S('faqs'));
      if (it.some((i) => !i.title.trim() || !i.text.trim())) return setError('Cada pregunta necesita pregunta y respuesta.');
      body.faqs = it.map((i) => ({ p: i.title.trim(), r: i.text.trim() }));
    }

    setGuardando(true);
    try {
      if (Object.keys(body).length > 0) await api.patch(`/servicios/${servicio.id}`, body);
      // Cada sección de la plantilla se guarda completa en la página propia del servicio.
      const secs = [...new Set(cambios.filter(esPagina).map((k) => k.split(':')[1]))];
      for (const sec of secs) {
        const datos: Datos = {};
        for (const k of TODOS.filter((x) => esPagina(x) && x.split(':')[1] === sec)) datos[k.split(':')[2]] = borrador[k];
        await api.put(`/contenido/servicio-${servicio.slug}/${sec}`, { datos });
      }
      setGuardado((g) => ({ ...(g ?? {}), ...structuredClone(Object.fromEntries(claves.map((k) => [k, borrador[k]]))) }));
      setOk('Cambios publicados en la web.');
      setRecarga((n) => n + 1);
      if (Object.keys(body).length > 0) void cargarLista();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  const src = servicio?.slug ? `${WEB}/servicios/${servicio.slug}?cms=${recarga}${seccion.ancla ? `#${seccion.ancla}` : ''}` : '';

  return (
    <>
      <PageHead
        title="Páginas de servicios"
        subtitle="Elige un servicio y edita todo el contenido de su página, sección por sección. Los cambios se publican al guardar."
      />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <div className="ax-dash-grid">
        <section className="ax-card ax-col--5" role="region" aria-label="Contenido de la sección" style={{ display: 'flex', flexDirection: 'column', height: PANEL_H, minHeight: 560, overflow: 'hidden' }}>
          <div className="ax-card__body" style={{ flex: '0 0 auto', borderBottom: '1px solid var(--ax-border)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <div className="ax-field">
              <label className="ax-label" htmlFor="sp-serv">Servicio</label>
              <select id="sp-serv" className="ax-select" value={selId} onChange={(e) => { setOk(''); setError(''); setSelId(e.target.value); }}>
                {lista.map((s) => <option key={s.id} value={s.id}>{s.nombre}{s.activo ? '' : ' (inactivo)'}</option>)}
              </select>
            </div>
            <div className="ax-field">
              <label className="ax-label" htmlFor="sp-sec">Sección</label>
              <select id="sp-sec" className="ax-select" value={sel} onChange={(e) => setSel(e.target.value)}>
                {SECCIONES.map((s, i) => <option key={s.key} value={s.key}>{i + 1}. {s.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="ax-card__body" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
            {lista.length === 0 ? (
              <p style={{ color: 'var(--ax-text-muted)' }}>Todavía no hay servicios. Créalos en Soluciones → Servicios.</p>
            ) : !guardado ? (
              <p style={{ color: 'var(--ax-text-muted)' }}>Cargando contenido…</p>
            ) : (
              seccion.campos.map((c) => (
                <CampoEditor key={`${selId}-${c.key}`} campo={c} valor={borrador[c.key]} onChange={(v) => setBorrador((b) => ({ ...b, [c.key]: v }))} />
              ))
            )}
          </div>

          <div className="ax-card__body" style={{ flex: '0 0 auto', borderTop: '1px solid var(--ax-border)', display: 'flex', gap: 'var(--ax-space-3)', alignItems: 'center', justifyContent: 'flex-end' }}>
            {ok && !sucio && <span style={{ marginInlineEnd: 'auto', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-success-500, #2f9e62)' }}>{ok}</span>}
            {sucio && <span style={{ marginInlineEnd: 'auto', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Tienes cambios sin guardar</span>}
            <button
              type="button"
              className="ax-btn ax-btn--ghost"
              disabled={!sucio || guardando}
              onClick={() => setBorrador((b) => ({ ...b, ...Object.fromEntries(seccion.campos.map((c) => [c.key, structuredClone(guardado![c.key])])) }))}
            >
              Descartar
            </button>
            <button type="button" className={`ax-btn ax-btn--primary${guardando ? ' is-loading' : ''}`} disabled={!sucio || guardando} onClick={() => void guardar()}>
              <span className="ax-btn__label">Guardar y publicar</span>
            </button>
          </div>
        </section>

        <section className="ax-card ax-col--7" role="region" aria-label="Vista previa" style={{ display: 'flex', flexDirection: 'column', height: PANEL_H, minHeight: 560, overflow: 'hidden' }}>
          <div className="ax-card__header">
            <div className="ax-card__titles">
              <h2 className="ax-card__title">Vista previa</h2>
              <p className="ax-card__subtitle">{servicio ? `${servicio.nombre} · ${seccion.nombre}` : '—'} · se actualiza al guardar</p>
            </div>
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Tamaño de la vista previa">
              {(['escritorio', 'celular'] as const).map((v) => (
                <button key={v} type="button" role="radio" aria-checked={vista === v} className={`ax-btn ax-btn--sm${vista === v ? ' is-selected' : ''}`} onClick={() => setVista(v)}>
                  {v === 'escritorio' ? 'Escritorio' : 'Celular'}
                </button>
              ))}
            </div>
          </div>
          {src ? <Preview src={src} ancho={vista === 'escritorio' ? 1440 : 390} /> : <p className="ax-card__body" style={{ color: 'var(--ax-text-muted)' }}>Elige un servicio con URL (slug).</p>}
        </section>
      </div>
    </>
  );
}

export default WebServiciosPaginas;
