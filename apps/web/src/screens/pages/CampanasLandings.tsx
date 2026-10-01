'use client';
/*
 * FPTecnologi-HUB — Campañas → Landing pages (GET/POST/PATCH/DELETE /landings): crear una landing eligiendo
 * una plantilla (evento/feria, oferta, captación), editar su contenido, armar el formulario (campos, tipos y
 * pasos, o elegir uno prediseñado), publicarla en https://…/l/<url> y ver/exportar los registros.
 * La página pública la dibuja apps/web-fptecnologi con lo que se guarda aquí.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { SubirImagen, urlImagen } from '../../components/ui/SubirImagen';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

type TipoCampo = 'texto' | 'textarea' | 'email' | 'telefono' | 'documento' | 'select' | 'checkbox';
interface Campo { id: string; tipo: TipoCampo; etiqueta: string; requerido: boolean; placeholder?: string; opciones?: string[]; paso?: number }
interface Formulario { pasos: string[]; campos: Campo[]; boton: string }
interface Contenido {
  badge: string; titulo: string; destacado: string; descripcion: string; imagenUrl: string; logoUrl: string; fecha: string; lugar: string;
  tema: 'azul' | 'oscuro' | 'claro'; ctaTexto: string; formTitulo: string; formSubtitulo: string; exitoTitulo: string; exitoMensaje: string;
  beneficiosTitulo: string; beneficios: { titulo: string; texto: string }[]; agendaTitulo: string; agenda: { hora: string; titulo: string; texto: string }[];
  faqs: { p: string; r: string }[]; whatsappTexto: string;
}
interface Plantilla { id: string; nombre: string; descripcion: string; usa: string[]; contenido: Contenido; formulario: Formulario }
interface FormularioPre { id: string; nombre: string; descripcion: string; formulario: Formulario }
interface Plantillas { plantillas: Plantilla[]; formularios: FormularioPre[]; tiposCampo: TipoCampo[] }
interface Campana { id: string; nombre: string }
interface FilaLanding { id: string; slug: string; nombre: string; plantilla: string; estado: 'BORRADOR' | 'PUBLICADA'; updatedAt: string; campana: { id: string; nombre: string } | null; _count: { registros: number } }
interface Landing extends FilaLanding { contenido: Contenido; formulario: Formulario; campanaId: string | null }
interface Registro { id: string; datos: Record<string, string | boolean>; nombre: string | null; email: string | null; celular: string | null; origen: string | null; createdAt: string }

const TIPO_LABEL: Record<TipoCampo, string> = { texto: 'Texto corto', textarea: 'Texto largo', email: 'Correo', telefono: 'Celular', documento: 'DNI / RUC', select: 'Lista de opciones', checkbox: 'Casilla de aceptación' };
const errMsg = (e: unknown, fb: string) => (e instanceof ApiError ? e.message : fb);
const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

type Tab = 'contenido' | 'formulario' | 'ajustes' | 'registros';

export function CampanasLandings() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<FilaLanding[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [plantillas, setPlantillas] = useState<Plantillas | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [nueva, setNueva] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      const [l, c, p] = await Promise.all([api.get<FilaLanding[]>('/landings'), api.get<Campana[]>('/campanas'), api.get<Plantillas>('/landings/plantillas')]);
      setLista(l); setCampanas(c); setPlantillas(p);
    } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudieron cargar las landings.') }); }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);
  useEffect(() => { const id = new URLSearchParams(window.location.search).get('id'); if (id) setSelId(id); }, []);

  if (selId && plantillas) {
    return <Editor id={selId} plantillas={plantillas} campanas={campanas} alSalir={() => { setSelId(null); void cargar(); }} />;
  }

  return (
    <>
      <PageHead
        title="Landing pages"
        subtitle="Páginas para eventos, ofertas y campañas, con su propio formulario de registro."
        actions={<button type="button" className="ax-btn ax-btn--primary" onClick={() => setNueva(true)}><span className="ax-btn__label">Nueva landing</span></button>}
      />
      <div className="ax-dash-grid">
        {aviso && <div role={aviso.ok ? 'status' : 'alert'} className={`ax-alert ax-col--12 ${aviso.ok ? 'ax-alert--success' : 'ax-alert--danger'}`} style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{aviso.texto}</p></div></div>}
        <section className="ax-card ax-col--12" aria-label="Landings">
          {lista.length === 0 ? (
            <div className="ax-card__body" style={{ textAlign: 'center', color: 'var(--ax-text-muted)', paddingBlock: 'var(--ax-space-8)' }}>Aún no hay landings. Crea la primera eligiendo una plantilla.</div>
          ) : (
            <div className="ax-table-wrap">
              <table className="ax-table ax-table--hover">
                <thead className="ax-table__head"><tr>
                  {['Landing', 'Plantilla', 'Estado', 'Campaña', 'Registros', 'Actualizada', ''].map((h, i) => <th key={i} className="ax-table__th" scope="col" style={i === 6 ? { textAlign: 'right' } : undefined}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {lista.map((l) => (
                    <tr key={l.id} className="ax-table__row" style={{ cursor: 'pointer' }} onClick={() => setSelId(l.id)}>
                      <td className="ax-table__td"><div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{l.nombre}</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>/l/{l.slug}</div></td>
                      <td className="ax-table__td">{plantillas?.plantillas.find((p) => p.id === l.plantilla)?.nombre ?? l.plantilla}</td>
                      <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--pill ${l.estado === 'PUBLICADA' ? 'ax-badge--success' : 'ax-badge--neutral'}`}>{l.estado === 'PUBLICADA' ? 'Publicada' : 'Borrador'}</span></td>
                      <td className="ax-table__td">{l.campana?.nombre ?? '—'}</td>
                      <td className="ax-table__td">{l._count.registros}</td>
                      <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)' }}>{fecha(l.updatedAt)}</td>
                      <td className="ax-table__td" style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', justifyContent: 'flex-end' }}>
                          {l.estado === 'PUBLICADA' && <a className="ax-btn ax-btn--ghost ax-btn--sm" href={`${WEB}/l/${l.slug}`} target="_blank" rel="noreferrer">Ver</a>}
                          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={async () => { try { await api.post(`/landings/${l.id}/duplicar`); setAviso({ ok: true, texto: 'Landing duplicada.' }); await cargar(); } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo duplicar.') }); } }}>Duplicar</button>
                          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={async () => { if (!window.confirm(`¿Eliminar “${l.nombre}” y sus ${l._count.registros} registros? No se puede deshacer.`)) return; try { await api.delete(`/landings/${l.id}`); setAviso({ ok: true, texto: 'Landing eliminada.' }); await cargar(); } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo eliminar.') }); } }}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      {nueva && plantillas && <NuevaLanding plantillas={plantillas} campanas={campanas} alCerrar={() => setNueva(false)} alCrear={(id) => { setNueva(false); setSelId(id); }} />}
    </>
  );
}

// ---------------------------------------------------------------- nueva

function NuevaLanding({ plantillas, campanas, alCerrar, alCrear }: { plantillas: Plantillas; campanas: Campana[]; alCerrar: () => void; alCrear: (id: string) => void }) {
  const [nombre, setNombre] = useState('');
  const [plantilla, setPlantilla] = useState(plantillas.plantillas[0]?.id ?? 'evento');
  const [campanaId, setCampanaId] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function crear(ev: React.FormEvent) {
    ev.preventDefault();
    if (nombre.trim().length < 2) return;
    setBusy(true); setErr('');
    try { const l = await api.post<{ id: string }>('/landings', { nombre: nombre.trim(), plantilla, ...(campanaId ? { campanaId } : {}) }); alCrear(l.id); }
    catch (e) { setErr(errMsg(e, 'No se pudo crear la landing.')); setBusy(false); }
  }
  return (
    <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
      <div onClick={alCerrar} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)' }} />
      <form onSubmit={crear} role="dialog" aria-modal="true" aria-label="Nueva landing" className="ax-card" style={{ position: 'relative', maxWidth: 640, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Nueva landing</h2><p className="ax-card__subtitle">Elige el modelo de página; luego editas el contenido y el formulario.</p></div></div>
        <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
          {err && <div role="alert" className="ax-alert ax-alert--danger"><div className="ax-alert__content"><p className="ax-alert__message">{err}</p></div></div>}
          <div className="ax-field"><label className="ax-label" htmlFor="nl-nombre">Nombre interno</label><input id="nl-nombre" className="ax-input" required autoFocus placeholder="Ej. Registro Expomina 2026" value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
          <div role="radiogroup" aria-label="Plantilla" style={{ display: 'grid', gap: 'var(--ax-space-3)', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
            {plantillas.plantillas.map((p) => (
              <button key={p.id} type="button" role="radio" aria-checked={plantilla === p.id} onClick={() => setPlantilla(p.id)} className="ax-card" style={{ textAlign: 'left', padding: 'var(--ax-space-4)', border: plantilla === p.id ? '2px solid var(--ax-accent)' : '1px solid var(--ax-border)', cursor: 'pointer' }}>
                <strong style={{ display: 'block', color: 'var(--ax-text-strong)' }}>{p.nombre}</strong>
                <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>{p.descripcion}</span>
              </button>
            ))}
          </div>
          <div className="ax-field"><label className="ax-label" htmlFor="nl-camp">Campaña (opcional)</label>
            <select id="nl-camp" className="ax-select" value={campanaId} onChange={(e) => setCampanaId(e.target.value)}><option value="">Sin campaña</option>{campanas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
          </div>
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={alCerrar}>Cancelar</button>
            <button type="submit" className="ax-btn ax-btn--primary" disabled={busy || nombre.trim().length < 2}>{busy ? 'Creando…' : 'Crear y editar'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- editor

function Editor({ id, plantillas, campanas, alSalir }: { id: string; plantillas: Plantillas; campanas: Campana[]; alSalir: () => void }) {
  const [l, setL] = useState<Landing | null>(null);
  const [tab, setTab] = useState<Tab>('contenido');
  const [busy, setBusy] = useState(false);
  const [sucio, setSucio] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const cargar = useCallback(async () => {
    try { setL(await api.get<Landing>(`/landings/${id}`)); setSucio(false); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo abrir la landing.') }); }
  }, [id]);
  useEffect(() => { void cargar(); }, [cargar]);

  const plantilla = plantillas.plantillas.find((p) => p.id === l?.plantilla);
  const usa = (b: string) => plantilla?.usa.includes(b) ?? false;

  const cambiar = (parcial: Partial<Landing>) => { setL((p) => (p ? { ...p, ...parcial } : p)); setSucio(true); };
  const cambiarContenido = (parcial: Partial<Contenido>) => l && cambiar({ contenido: { ...l.contenido, ...parcial } });

  async function guardar(extra: Record<string, unknown> = {}) {
    if (!l) return false;
    setBusy(true); setAviso(null);
    try {
      const guardada = await api.patch<Landing>(`/landings/${l.id}`, { nombre: l.nombre, slug: l.slug, campanaId: l.campanaId ?? null, contenido: l.contenido, formulario: l.formulario, ...extra });
      setL({ ...guardada }); setSucio(false);
      setAviso({ ok: true, texto: 'Cambios guardados.' });
      return true;
    } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo guardar.') }); return false; }
    finally { setBusy(false); }
  }

  async function vistaPrevia() {
    if (!l) return;
    if (sucio && !(await guardar())) return;
    try { const r = await api.post<{ slug: string; token: string }>(`/landings/${l.id}/vista-previa`); window.open(`${WEB}/l/${r.slug}?preview=${r.token}`, '_blank', 'noopener'); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo abrir la vista previa.') }); }
  }

  if (!l) return <><PageHead title="Landing" subtitle="Cargando…" />{aviso && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{aviso.texto}</p>}</>;
  const publicada = l.estado === 'PUBLICADA';

  return (
    <>
      <PageHead
        title={l.nombre}
        subtitle={`${plantilla?.nombre ?? l.plantilla} · ${publicada ? 'Publicada' : 'Borrador'} · ${WEB.replace(/^https?:\/\//, '')}/l/${l.slug}`}
        actions={
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={() => (!sucio || window.confirm('Hay cambios sin guardar. ¿Salir igual?')) && alSalir()}>← Volver</button>
            <button type="button" className="ax-btn ax-btn--secondary" onClick={vistaPrevia}>Vista previa</button>
            <button type="button" className="ax-btn ax-btn--secondary" disabled={busy || !sucio} onClick={() => guardar()}>{busy ? 'Guardando…' : sucio ? 'Guardar cambios' : 'Guardado'}</button>
            <button type="button" className="ax-btn ax-btn--primary" disabled={busy} onClick={async () => { if (await guardar({ estado: publicada ? 'BORRADOR' : 'PUBLICADA' })) { await cargar(); } }}>{publicada ? 'Despublicar' : 'Publicar'}</button>
          </div>
        }
      />
      <div className="ax-dash-grid">
        {aviso && <div role={aviso.ok ? 'status' : 'alert'} className={`ax-alert ax-col--12 ${aviso.ok ? 'ax-alert--success' : 'ax-alert--danger'}`} style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{aviso.texto}{publicada && aviso.ok ? ` — pública en ${WEB}/l/${l.slug}` : ''}</p></div></div>}
        <section className="ax-card ax-col--12">
          <div className="ax-card__body">
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Sección">
              {([['contenido', 'Contenido'], ['formulario', 'Formulario'], ['ajustes', 'Ajustes'], ['registros', `Registros (${l._count.registros})`]] as const).map(([t, label]) => (
                <button key={t} type="button" role="radio" aria-checked={tab === t} className={`ax-btn ax-btn--sm${tab === t ? ' is-selected' : ''}`} onClick={() => setTab(t)}>{label}</button>
              ))}
            </div>
          </div>
        </section>

        {tab === 'contenido' && <PestanaContenido l={l} usa={usa} cambiar={cambiarContenido} />}
        {tab === 'formulario' && <PestanaFormulario l={l} plantillas={plantillas} cambiar={(f) => cambiar({ formulario: f })} />}
        {tab === 'ajustes' && (
          <section className="ax-card ax-col--8"><div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
            <div className="ax-field"><label className="ax-label" htmlFor="aj-nombre">Nombre interno</label><input id="aj-nombre" className="ax-input" value={l.nombre} onChange={(e) => cambiar({ nombre: e.target.value })} /></div>
            <div className="ax-field"><label className="ax-label" htmlFor="aj-slug">Dirección pública</label>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}><span style={{ color: 'var(--ax-text-muted)', whiteSpace: 'nowrap' }}>{WEB.replace(/^https?:\/\//, '')}/l/</span><input id="aj-slug" className="ax-input" value={l.slug} onChange={(e) => cambiar({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} /></div>
              <span className="ax-help">Solo minúsculas, números y guiones. Si cambias la dirección, el enlace anterior deja de funcionar.</span>
            </div>
            <div className="ax-field"><label className="ax-label" htmlFor="aj-camp">Campaña</label>
              <select id="aj-camp" className="ax-select" value={l.campanaId ?? ''} onChange={(e) => cambiar({ campanaId: e.target.value || null })}><option value="">Sin campaña</option>{campanas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
            </div>
            {publicada && <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)' }}>Enlace público: <a href={`${WEB}/l/${l.slug}`} target="_blank" rel="noreferrer">{WEB}/l/{l.slug}</a></p>}
          </div></section>
        )}
        {tab === 'registros' && <PestanaRegistros l={l} />}
      </div>
    </>
  );
}

// ---- contenido

function Campo2({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className="ax-field"><label className="ax-label" htmlFor={id}>{label}</label>{children}</div>;
}

function PestanaContenido({ l, usa, cambiar }: { l: Landing; usa: (b: string) => boolean; cambiar: (p: Partial<Contenido>) => void }) {
  const c = l.contenido;
  const t = (k: keyof Contenido, label: string, area = false) => (
    <Campo2 id={`c-${k}`} label={label}>
      {area ? <textarea id={`c-${k}`} className="ax-input" rows={3} value={c[k] as string} onChange={(e) => cambiar({ [k]: e.target.value })} /> : <input id={`c-${k}`} className="ax-input" value={c[k] as string} onChange={(e) => cambiar({ [k]: e.target.value })} />}
    </Campo2>
  );
  const imagen = (k: 'imagenUrl' | 'logoUrl', label: string) => (
    <div className="ax-field"><span className="ax-label">{label}</span>
      <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', alignItems: 'center' }}>
        {c[k] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={urlImagen(c[k])} alt="" style={{ inlineSize: 72, blockSize: 56, objectFit: 'cover', borderRadius: 'var(--ax-radius-md)', border: '1px solid var(--ax-border)' }} />}
        <SubirImagen onSubida={(u) => cambiar({ [k]: u[0]! })} />
        {c[k] && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => cambiar({ [k]: '' })}>Quitar</button>}
      </div>
      <input className="ax-input" placeholder="…o pega una URL" value={c[k]} onChange={(e) => cambiar({ [k]: e.target.value })} aria-label={`URL de ${label}`} />
    </div>
  );
  const lista = <T extends Record<string, string>>(clave: 'beneficios' | 'agenda' | 'faqs', campos: { k: keyof T & string; label: string; area?: boolean }[], vacio: T, max: number, titulo: string) => {
    const items = c[clave] as unknown as T[];
    const set = (n: T[]) => cambiar({ [clave]: n } as Partial<Contenido>);
    return (
      <section className="ax-card ax-col--12"><div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">{titulo}</h2></div>
        <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" disabled={items.length >= max} onClick={() => set([...items, { ...vacio }])}>Agregar</button></div>
        <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
          {items.length === 0 && <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>Sin elementos.</p>}
          {items.map((it, i) => (
            <div key={i} className="ax-cluster" style={{ gap: 'var(--ax-space-2)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {campos.map((f) => <input key={f.k} className="ax-input" style={{ flex: f.area ? '2 1 260px' : '1 1 160px' }} placeholder={f.label} aria-label={f.label} value={it[f.k] as string} onChange={(e) => set(items.map((x, j) => (j === i ? { ...x, [f.k]: e.target.value } : x)))} />)}
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={i === 0} aria-label="Subir" onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i]!, n[i - 1]!]; set(n); }}>↑</button>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} aria-label="Quitar" onClick={() => set(items.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
        </div></section>
    );
  };
  return (
    <>
      <section className="ax-card ax-col--7"><div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Encabezado</h2></div></div>
        <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
          {t('badge', 'Etiqueta pequeña (arriba del título)')}
          {t('titulo', 'Título')}
          {t('destacado', 'Parte destacada del título (con brillo)')}
          {t('descripcion', 'Descripción', true)}
          {usa('fechaLugar') && <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap' }}><div style={{ flex: '1 1 200px' }}>{t('fecha', 'Fecha')}</div><div style={{ flex: '1 1 200px' }}>{t('lugar', 'Lugar')}</div></div>}
          {t('ctaTexto', 'Texto del botón principal')}
        </div></section>
      <section className="ax-card ax-col--5"><div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Apariencia</h2></div></div>
        <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
          <Campo2 id="c-tema" label="Fondo del encabezado"><select id="c-tema" className="ax-select" value={c.tema} onChange={(e) => cambiar({ tema: e.target.value as Contenido['tema'] })}><option value="azul">Azul de marca</option><option value="oscuro">Oscuro</option><option value="claro">Claro</option></select></Campo2>
          {usa('imagen') && imagen('imagenUrl', 'Imagen principal')}
          {imagen('logoUrl', 'Logo (opcional; si no, el de FPTecnologi)')}
        </div></section>
      <section className="ax-card ax-col--12"><div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Formulario y mensaje de éxito</h2></div></div>
        <div className="ax-card__body" style={{ paddingTop: 0, display: 'grid', gap: 'var(--ax-space-4)', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
          {t('formTitulo', 'Título del formulario')}
          {t('formSubtitulo', 'Subtítulo del formulario')}
          {t('exitoTitulo', 'Título al enviar')}
          {t('exitoMensaje', 'Mensaje al enviar', true)}
          {t('whatsappTexto', 'Texto de WhatsApp tras enviar (vacío = sin botón)')}
        </div></section>
      {usa('beneficios') && (
        <>
          <section className="ax-card ax-col--12"><div className="ax-card__body">{t('beneficiosTitulo', 'Título de la sección de beneficios')}</div></section>
          {lista<{ titulo: string; texto: string }>('beneficios', [{ k: 'titulo', label: 'Título' }, { k: 'texto', label: 'Texto', area: true }], { titulo: '', texto: '' }, 6, 'Beneficios')}
        </>
      )}
      {usa('agenda') && (
        <>
          <section className="ax-card ax-col--12"><div className="ax-card__body">{t('agendaTitulo', 'Título de la sección de programa')}</div></section>
          {lista<{ hora: string; titulo: string; texto: string }>('agenda', [{ k: 'hora', label: 'Hora o día' }, { k: 'titulo', label: 'Actividad' }, { k: 'texto', label: 'Detalle', area: true }], { hora: '', titulo: '', texto: '' }, 12, 'Programa')}
        </>
      )}
      {usa('faqs') && lista<{ p: string; r: string }>('faqs', [{ k: 'p', label: 'Pregunta' }, { k: 'r', label: 'Respuesta', area: true }], { p: '', r: '' }, 8, 'Preguntas frecuentes')}
    </>
  );
}

// ---- formulario

function PestanaFormulario({ l, plantillas, cambiar }: { l: Landing; plantillas: Plantillas; cambiar: (f: Formulario) => void }) {
  const f = l.formulario;
  const [tipoNuevo, setTipoNuevo] = useState<TipoCampo>('texto');
  const set = (campos: Campo[]) => cambiar({ ...f, campos });
  const upd = (i: number, p: Partial<Campo>) => set(f.campos.map((c, j) => (j === i ? { ...c, ...p } : c)));
  const idLibre = (base: string) => { let id = base; let n = 2; while (f.campos.some((c) => c.id === id)) id = `${base}${n++}`; return id; };

  function agregar() {
    const base = tipoNuevo === 'email' ? 'email' : tipoNuevo === 'telefono' ? 'telefono' : tipoNuevo === 'documento' ? 'documento' : tipoNuevo === 'checkbox' ? 'acepto' : 'campo';
    set([...f.campos, { id: idLibre(base), tipo: tipoNuevo, etiqueta: TIPO_LABEL[tipoNuevo], requerido: false, paso: f.pasos.length - 1, ...(tipoNuevo === 'select' ? { opciones: ['Opción 1', 'Opción 2'] } : {}) }]);
  }
  function cambiarPasos(pasos: string[]) {
    const max = Math.max(pasos.length - 1, 0);
    cambiar({ ...f, pasos, campos: f.campos.map((c) => ({ ...c, paso: Math.min(c.paso ?? 0, max) })) });
  }

  return (
    <>
      <section className="ax-card ax-col--12"><div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Tipo de formulario</h2><p className="ax-card__subtitle">Elige uno prediseñado como punto de partida (reemplaza los campos actuales) y luego ajústalo.</p></div></div>
        <div className="ax-card__body" style={{ paddingTop: 0, display: 'grid', gap: 'var(--ax-space-3)', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {plantillas.formularios.map((p) => (
            <button key={p.id} type="button" className="ax-card" style={{ textAlign: 'left', padding: 'var(--ax-space-4)', border: '1px solid var(--ax-border)', cursor: 'pointer' }}
              onClick={() => window.confirm(`¿Reemplazar el formulario actual por “${p.nombre}”?`) && cambiar(JSON.parse(JSON.stringify(p.formulario)))}>
              <strong style={{ display: 'block', color: 'var(--ax-text-strong)' }}>{p.nombre}</strong>
              <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>{p.descripcion}</span>
            </button>
          ))}
        </div></section>

      <section className="ax-card ax-col--12"><div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Pasos</h2><p className="ax-card__subtitle">Con 2 o más pasos el formulario se muestra por etapas, con barra de avance.</p></div>
        <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" disabled={f.pasos.length >= 5} onClick={() => cambiarPasos([...f.pasos, `Paso ${f.pasos.length + 1}`])}>Agregar paso</button></div>
        <div className="ax-card__body ax-cluster" style={{ paddingTop: 0, gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
          {f.pasos.map((p, i) => (
            <span key={i} className="ax-cluster" style={{ gap: 4 }}>
              <input className="ax-input" aria-label={`Nombre del paso ${i + 1}`} style={{ inlineSize: 150 }} value={p} onChange={(e) => cambiarPasos(f.pasos.map((x, j) => (j === i ? e.target.value : x)))} />
              {f.pasos.length > 1 && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label="Quitar paso" onClick={() => cambiarPasos(f.pasos.filter((_, j) => j !== i))}>✕</button>}
            </span>
          ))}
          <Campo2 id="f-boton" label="Texto del botón final"><input id="f-boton" className="ax-input" value={f.boton} onChange={(e) => cambiar({ ...f, boton: e.target.value })} /></Campo2>
        </div></section>

      <section className="ax-card ax-col--12"><div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Campos ({f.campos.length})</h2></div>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
          <select className="ax-select" aria-label="Tipo de campo nuevo" value={tipoNuevo} onChange={(e) => setTipoNuevo(e.target.value as TipoCampo)}>{plantillas.tiposCampo.map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}</select>
          <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" disabled={f.campos.length >= 30} onClick={agregar}>Agregar campo</button>
        </div></div>
        <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
          {f.campos.map((c, i) => (
            <div key={c.id} style={{ border: '1px solid var(--ax-border)', borderRadius: 'var(--ax-radius-md)', padding: 'var(--ax-space-3)' }}>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                <input className="ax-input" style={{ flex: '2 1 220px' }} aria-label="Etiqueta" value={c.etiqueta} onChange={(e) => upd(i, { etiqueta: e.target.value })} />
                <select className="ax-select" style={{ flex: '1 1 150px' }} aria-label="Tipo" value={c.tipo} onChange={(e) => upd(i, { tipo: e.target.value as TipoCampo, ...(e.target.value === 'select' && !c.opciones?.length ? { opciones: ['Opción 1', 'Opción 2'] } : {}) })}>{plantillas.tiposCampo.map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}</select>
                {f.pasos.length > 1 && <select className="ax-select" style={{ flex: '0 1 140px' }} aria-label="Paso" value={c.paso ?? 0} onChange={(e) => upd(i, { paso: Number(e.target.value) })}>{f.pasos.map((p, j) => <option key={j} value={j}>{p || `Paso ${j + 1}`}</option>)}</select>}
                <label className="ax-check"><input type="checkbox" className="ax-checkbox" checked={c.requerido} onChange={(e) => upd(i, { requerido: e.target.checked })} /><span>Obligatorio</span></label>
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={i === 0} aria-label="Subir" onClick={() => { const n = [...f.campos]; [n[i - 1], n[i]] = [n[i]!, n[i - 1]!]; set(n); }}>↑</button>
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={i === f.campos.length - 1} aria-label="Bajar" onClick={() => { const n = [...f.campos]; [n[i + 1], n[i]] = [n[i]!, n[i + 1]!]; set(n); }}>↓</button>
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} aria-label="Quitar campo" disabled={f.campos.length <= 1} onClick={() => set(f.campos.filter((_, j) => j !== i))}>✕</button>
              </div>
              {c.tipo === 'select' && (
                <textarea className="ax-input" rows={3} style={{ marginBlockStart: 'var(--ax-space-2)' }} aria-label="Opciones (una por línea)" placeholder="Una opción por línea" value={(c.opciones ?? []).join('\n')} onChange={(e) => upd(i, { opciones: e.target.value.split('\n') })} />
              )}
              {c.tipo !== 'select' && c.tipo !== 'checkbox' && <input className="ax-input" style={{ marginBlockStart: 'var(--ax-space-2)' }} aria-label="Texto de ayuda dentro del campo" placeholder="Texto de ayuda dentro del campo (opcional)" value={c.placeholder ?? ''} onChange={(e) => upd(i, { placeholder: e.target.value })} />}
              <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Identificador: {c.id}</span>
            </div>
          ))}
        </div></section>
    </>
  );
}

// ---- registros

function PestanaRegistros({ l }: { l: Landing }) {
  const [filas, setFilas] = useState<Registro[] | null>(null);
  const [q, setQ] = useState('');
  const cargar = useCallback(async () => { try { setFilas(await api.get<Registro[]>(`/landings/${l.id}/registros`)); } catch { setFilas([]); } }, [l.id]);
  useEffect(() => { void cargar(); }, [cargar]);
  const columnas = l.formulario.campos;
  const visibles = useMemo(() => (filas ?? []).filter((r) => !q || JSON.stringify(r.datos).toLowerCase().includes(q.toLowerCase())), [filas, q]);

  function exportar() {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const cab = ['Fecha', ...columnas.map((c) => c.etiqueta), 'Origen'];
    const rows = visibles.map((r) => [new Date(r.createdAt).toLocaleString('es-PE'), ...columnas.map((c) => (typeof r.datos[c.id] === 'boolean' ? (r.datos[c.id] ? 'Sí' : 'No') : r.datos[c.id] ?? '')), r.origen ?? '']);
    const csv = '﻿' + [cab, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `registros-${l.slug}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <section className="ax-card ax-col--12" aria-label="Registros">
      <div className="ax-card__body ax-cluster" style={{ gap: 'var(--ax-space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <input type="search" className="ax-input" placeholder="Buscar en los registros…" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320 }} />
        <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" disabled={visibles.length === 0} onClick={exportar}>Exportar CSV ({visibles.length})</button>
      </div>
      {filas === null ? <div className="ax-card__body">Cargando…</div> : visibles.length === 0 ? (
        <div className="ax-card__body" style={{ textAlign: 'center', color: 'var(--ax-text-muted)' }}>{filas.length === 0 ? 'Todavía no hay registros.' : 'Ningún registro coincide.'}</div>
      ) : (
        <div className="ax-table-wrap"><table className="ax-table ax-table--hover">
          <thead className="ax-table__head"><tr><th className="ax-table__th" scope="col">Fecha</th>{columnas.map((c) => <th key={c.id} className="ax-table__th" scope="col">{c.etiqueta}</th>)}<th className="ax-table__th" scope="col" /></tr></thead>
          <tbody>
            {visibles.map((r) => (
              <tr key={r.id} className="ax-table__row">
                <td className="ax-table__td" style={{ whiteSpace: 'nowrap', color: 'var(--ax-text-muted)' }}>{fecha(r.createdAt)}</td>
                {columnas.map((c) => <td key={c.id} className="ax-table__td">{typeof r.datos[c.id] === 'boolean' ? (r.datos[c.id] ? '✓' : '—') : String(r.datos[c.id] ?? '—')}</td>)}
                <td className="ax-table__td" style={{ textAlign: 'right' }}><button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={async () => { if (window.confirm('¿Eliminar este registro?')) { await api.delete(`/landings/${l.id}/registros/${r.id}`).catch(() => undefined); await cargar(); } }}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </section>
  );
}

export default CampanasLandings;
