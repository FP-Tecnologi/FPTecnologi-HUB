'use client';
/*
 * FPTecnologi-HUB — Web informativa → Popups (GET/POST/PATCH/DELETE /popups).
 * Avisos emergentes de la web pública: se crean desde una plantilla (aviso, promoción, descuento con cupón,
 * evento, producto destacado), se editan (contenido, a dónde lleva el botón, cuándo aparece, con qué
 * frecuencia, en qué páginas y entre qué fechas) y se activan/pausan. Puede haber varios a la vez: por
 * ejemplo uno para la tienda y otro para el home. La web (apps/web-fptecnologi) los pinta con lo que se guarda aquí.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { SubirImagen, urlImagen } from '../../components/ui/SubirImagen';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Estado = 'BORRADOR' | 'ACTIVO' | 'PAUSADO';
type Situacion = 'borrador' | 'pausado' | 'programado' | 'en_curso' | 'finalizado';
type Accion = 'ninguna' | 'url' | 'producto' | 'whatsapp';
type Tema = 'azul' | 'oscuro' | 'claro' | 'acento';

interface Contenido {
  etiqueta: string; titulo: string; texto: string; imagenUrl: string; descuento: string; codigo: string; fecha: string; lugar: string;
  botonTexto: string; accion: Accion; url: string; whatsappTexto: string; cerrarTexto: string; tema: Tema;
}
interface Plantilla { id: string; nombre: string; descripcion: string; usa: string[]; formato: string; contenido: Contenido }
interface Opciones {
  plantillas: Plantilla[]; formatos: string[]; disparadores: string[]; frecuencias: string[]; dispositivos: string[]; paginas: [string, string][];
}
interface Popup {
  id: string; nombre: string; plantilla: string; formato: string; estado: Estado; contenido: Contenido; productoId: string | null;
  productoNombre?: string | null; prioridad: number; disparador: string; disparadorValor: number; frecuencia: string; frecuenciaValor: number;
  paginas: string[]; dispositivo: string; inicio: string | null; fin: string | null; vistas: number; clics: number; situacion?: Situacion; updatedAt: string;
}
interface ProductoLite { id: string; nombre: string; sku: string; activo: boolean }

const SITUACION: Record<Situacion, { label: string; badge: string }> = {
  borrador: { label: 'Borrador', badge: 'ax-badge--neutral' },
  pausado: { label: 'Pausado', badge: 'ax-badge--warning' },
  programado: { label: 'Programado', badge: 'ax-badge--info' },
  en_curso: { label: 'En curso', badge: 'ax-badge--success' },
  finalizado: { label: 'Finalizado', badge: 'ax-badge--neutral' },
};
const FORMATO: Record<string, string> = { modal: 'Ventana central', esquina: 'Tarjeta en la esquina', barra: 'Barra superior' };
const DISPARADOR: Record<string, string> = { carga: 'Al entrar a la página', retraso: 'Tras unos segundos', scroll: 'Al bajar por la página', salida: 'Al intentar salir (solo escritorio)' };
const FRECUENCIA: Record<string, string> = { siempre: 'Cada vez que entra a la página', sesion: 'Una vez por visita (sesión)', una_vez: 'Una sola vez por visitante', horas: 'Cada cierto número de horas', dias: 'Cada cierto número de días' };
const DISPOSITIVO: Record<string, string> = { todos: 'Todos', escritorio: 'Solo computador', movil: 'Solo celular' };
const ACCION: Record<Accion, string> = { ninguna: 'Solo cierra el popup', url: 'Enlace (página o URL)', producto: 'Ir a un producto', whatsapp: 'Abrir WhatsApp' };
const TEMA: Record<Tema, string> = { azul: 'Azul', oscuro: 'Oscuro', claro: 'Claro', acento: 'Acento (naranja)' };
const COLORES: Record<Tema, { bg: string; fg: string; btn: string; btnFg: string }> = {
  azul: { bg: '#2898ee', fg: '#fff', btn: '#fff', btnFg: '#107acc' },
  oscuro: { bg: '#0f172a', fg: '#fff', btn: '#38bdf8', btnFg: '#0f172a' },
  claro: { bg: '#fff', fg: '#0f172a', btn: '#2898ee', btnFg: '#fff' },
  acento: { bg: '#f97316', fg: '#fff', btn: '#fff', btnFg: '#c2410c' },
};

const errMsg = (e: unknown, fb: string) => (e instanceof ApiError ? e.message : fb);
const aLocal = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const deLocal = (v: string) => (v ? new Date(v).toISOString() : null);
const fechaCorta = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function WebPopups() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Popup[]>([]);
  const [opciones, setOpciones] = useState<Opciones | null>(null);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      const [l, o] = await Promise.all([api.get<Popup[]>('/popups'), api.get<Opciones>('/popups/plantillas')]);
      setLista(l); setOpciones(o);
    } catch (e) {
      setAviso({ ok: false, texto: errMsg(e, 'No se pudieron cargar los popups.') });
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);

  const sel = useMemo(() => lista.find((p) => p.id === selId) ?? null, [lista, selId]);

  async function crear(plantilla: string, nombre: string) {
    try {
      const p = await api.post<Popup>('/popups', { plantilla, nombre });
      setNuevo(false); setAviso(null);
      await cargar();
      setSelId(p.id);
    } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo crear el popup.') }); }
  }

  async function duplicar(p: Popup) {
    try { await api.post(`/popups/${p.id}/duplicar`); setAviso({ ok: true, texto: 'Copia creada en borrador.' }); await cargar(); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo duplicar.') }); }
  }
  async function eliminar(p: Popup) {
    if (!window.confirm(`¿Eliminar el popup “${p.nombre}”?`)) return;
    try { await api.delete(`/popups/${p.id}`); setAviso({ ok: true, texto: 'Popup eliminado.' }); if (selId === p.id) setSelId(null); await cargar(); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo eliminar.') }); }
  }

  if (sel && opciones) {
    return <Editor key={sel.id} popup={sel} opciones={opciones} alSalir={() => { setSelId(null); void cargar(); }} />;
  }

  return (
    <>
      <PageHead
        title="Popups"
        subtitle="Avisos emergentes de la web: promociones, descuentos, eventos o un producto. Tú decides dónde, cuándo y cada cuánto se muestran."
        actions={<button type="button" className="ax-btn ax-btn--primary" onClick={() => { setAviso(null); setNuevo(true); }}><span className="ax-btn__label">Nuevo popup</span></button>}
      />
      <Aviso aviso={aviso} />

      {nuevo && opciones && <NuevoPopup opciones={opciones} alCrear={crear} alCancelar={() => setNuevo(false)} />}

      <section className="ax-card ax-col--12" role="region" aria-label="Popups">
        <div className="ax-table-wrap">
          <table className="ax-table ax-table--hover">
            <thead className="ax-table__head">
              <tr>
                <th className="ax-table__th" scope="col">Popup</th>
                <th className="ax-table__th" scope="col">Dónde y cuándo</th>
                <th className="ax-table__th" scope="col">Estado</th>
                <th className="ax-table__th" scope="col">Vistas / clics</th>
                <th className="ax-table__th" scope="col"><span className="ax-visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td className="ax-table__td" colSpan={5}>Cargando…</td></tr>
              ) : lista.length === 0 ? (
                <tr><td className="ax-table__td" colSpan={5} style={{ color: 'var(--ax-text-muted)' }}>Todavía no hay popups. Crea el primero con “Nuevo popup”.</td></tr>
              ) : lista.map((p) => {
                const s = SITUACION[p.situacion ?? 'borrador'];
                const paginas = p.paginas.includes('todas') ? 'Todas las páginas' : p.paginas.map((k) => opciones?.paginas.find(([c]) => c === k)?.[1] ?? k).join(', ') || 'Sin página';
                return (
                  <tr key={p.id} className="ax-table__row" onClick={() => setSelId(p.id)} style={{ cursor: 'pointer' }}>
                    <td className="ax-table__td">
                      <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{p.nombre}</div>
                      <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{opciones?.plantillas.find((x) => x.id === p.plantilla)?.nombre ?? p.plantilla} · {FORMATO[p.formato] ?? p.formato}</div>
                    </td>
                    <td className="ax-table__td">
                      <div>{paginas}</div>
                      <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                        {p.inicio || p.fin ? `${p.inicio ? fechaCorta(p.inicio) : 'Ya'} → ${p.fin ? fechaCorta(p.fin) : 'sin fin'}` : 'Sin fechas (siempre vigente)'}
                      </div>
                    </td>
                    <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--pill ${s.badge}`}>{s.label}</span></td>
                    <td className="ax-table__td">{p.vistas} / {p.clics}{p.vistas > 0 ? ` (${Math.round((p.clics / p.vistas) * 100)}%)` : ''}</td>
                    <td className="ax-table__td" onClick={(e) => e.stopPropagation()}>
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => void duplicar(p)}>Duplicar</button>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => void eliminar(p)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Aviso({ aviso }: { aviso: { ok: boolean; texto: string } | null }) {
  if (!aviso) return null;
  return aviso.ok
    ? <p role="status" style={{ marginBlockEnd: 'var(--ax-space-4)', color: 'var(--ax-success-500, #2f9e62)', fontSize: 'var(--ax-text-sm)' }}>{aviso.texto}</p>
    : (
      <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
        <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{aviso.texto}</p></div>
      </div>
    );
}

function NuevoPopup({ opciones, alCrear, alCancelar }: { opciones: Opciones; alCrear: (plantilla: string, nombre: string) => void; alCancelar: () => void }) {
  const [plantilla, setPlantilla] = useState(opciones.plantillas[0]?.id ?? 'aviso');
  const [nombre, setNombre] = useState('');
  return (
    <section className="ax-card ax-col--12" role="region" aria-label="Nuevo popup" style={{ marginBlockEnd: 'var(--ax-space-4)' }}>
      <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Elige una plantilla</h2></div></div>
      <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 'var(--ax-space-3)' }}>
          {opciones.plantillas.map((p) => (
            <button key={p.id} type="button" onClick={() => setPlantilla(p.id)} aria-pressed={plantilla === p.id}
              style={{ textAlign: 'start', padding: 'var(--ax-space-3)', borderRadius: 10, cursor: 'pointer', background: 'var(--ax-surface)', border: `2px solid ${plantilla === p.id ? 'var(--ax-primary-500, #155382)' : 'var(--ax-border)'}` }}>
              <strong style={{ display: 'block', color: 'var(--ax-text-strong)' }}>{p.nombre}</strong>
              <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{p.descripcion}</span>
            </button>
          ))}
        </div>
        <div className="ax-field" style={{ maxWidth: 420 }}>
          <label className="ax-label" htmlFor="np-nombre">Nombre interno (solo lo ves tú)</label>
          <input id="np-nombre" className="ax-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Cyber Days — Home" maxLength={100} />
        </div>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
          <button type="button" className="ax-btn ax-btn--primary" disabled={nombre.trim().length < 2} onClick={() => alCrear(plantilla, nombre.trim())}><span className="ax-btn__label">Crear y editar</span></button>
          <button type="button" className="ax-btn ax-btn--ghost" onClick={alCancelar}>Cancelar</button>
        </div>
      </div>
    </section>
  );
}

/** Vista previa aproximada: la web usa el mismo contenido con su propio estilo. */
function Vista({ c, formato, producto }: { c: Contenido; formato: string; producto: string | null }) {
  const col = COLORES[c.tema];
  const titulo = c.titulo || producto || 'Título del popup';
  const boton = c.accion !== 'ninguna' || c.botonTexto ? c.botonTexto || 'Aceptar' : '';
  const cuerpo = (
    <>
      {c.etiqueta && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .85 }}>{c.etiqueta}</span>}
      {c.descuento && <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{c.descuento}</div>}
      <div style={{ fontSize: formato === 'barra' ? 14 : 20, fontWeight: 700 }}>{titulo}</div>
      {c.texto && formato !== 'barra' && <div style={{ fontSize: 13, opacity: .9 }}>{c.texto}</div>}
      {(c.fecha || c.lugar) && formato !== 'barra' && <div style={{ fontSize: 12, opacity: .85 }}>{[c.fecha, c.lugar].filter(Boolean).join(' · ')}</div>}
      {c.codigo && formato !== 'barra' && <div style={{ alignSelf: 'flex-start', border: `1.5px dashed ${col.fg}`, borderRadius: 6, padding: '4px 10px', fontWeight: 700, letterSpacing: '.08em', fontSize: 13 }}>{c.codigo}</div>}
      {boton && <span style={{ alignSelf: 'flex-start', background: col.btn, color: col.btnFg, borderRadius: 8, padding: formato === 'barra' ? '4px 12px' : '8px 16px', fontWeight: 700, fontSize: 13 }}>{boton}</span>}
      {c.cerrarTexto && formato !== 'barra' && <span style={{ fontSize: 12, opacity: .75, textDecoration: 'underline' }}>{c.cerrarTexto}</span>}
    </>
  );
  const img = c.imagenUrl && formato === 'modal' ? <img src={urlImagen(c.imagenUrl)} alt="" style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} /> : null;
  return (
    <div style={{ background: 'var(--ax-surface-subtle)', borderRadius: 10, padding: 'var(--ax-space-4)', minHeight: 260, display: 'flex', alignItems: formato === 'barra' ? 'flex-start' : formato === 'esquina' ? 'flex-end' : 'center', justifyContent: formato === 'esquina' ? 'flex-end' : 'center' }}>
      <div style={{ background: col.bg, color: col.fg, borderRadius: formato === 'barra' ? 8 : 14, overflow: 'hidden', width: formato === 'barra' ? '100%' : formato === 'esquina' ? '70%' : '85%', boxShadow: '0 12px 32px rgba(0,0,0,.25)' }}>
        {img}
        <div style={{ padding: formato === 'barra' ? '8px 14px' : 16, display: 'flex', flexDirection: formato === 'barra' ? 'row' : 'column', alignItems: formato === 'barra' ? 'center' : 'stretch', flexWrap: 'wrap', gap: formato === 'barra' ? 12 : 8 }}>{cuerpo}</div>
      </div>
    </div>
  );
}

type Tab = 'contenido' | 'cuando' | 'estadisticas';

function Editor({ popup, opciones, alSalir }: { popup: Popup; opciones: Opciones; alSalir: () => void }) {
  const plantilla = opciones.plantillas.find((p) => p.id === popup.plantilla);
  const usa = plantilla?.usa ?? [];
  const [p, setP] = useState<Popup>(popup);
  const [tab, setTab] = useState<Tab>('contenido');
  const [productos, setProductos] = useState<ProductoLite[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  useEffect(() => { api.get<ProductoLite[]>('/productos').then((l) => setProductos(l.filter((x) => x.activo))).catch(() => undefined); }, []);

  const c = p.contenido;
  const setC = <K extends keyof Contenido>(k: K, v: Contenido[K]) => setP((x) => ({ ...x, contenido: { ...x.contenido, [k]: v } }));
  const set = <K extends keyof Popup>(k: K, v: Popup[K]) => setP((x) => ({ ...x, [k]: v }));
  const productoNombre = productos.find((x) => x.id === p.productoId)?.nombre ?? p.productoNombre ?? null;

  function alternarPagina(k: string) {
    setP((x) => {
      if (k === 'todas') return { ...x, paginas: x.paginas.includes('todas') ? [] : ['todas'] };
      const sin = x.paginas.filter((v) => v !== 'todas');
      return { ...x, paginas: sin.includes(k) ? sin.filter((v) => v !== k) : [...sin, k] };
    });
  }

  async function guardar(estado?: Estado) {
    setGuardando(true); setAviso(null);
    try {
      await api.patch(`/popups/${p.id}`, {
        nombre: p.nombre, formato: p.formato, estado: estado ?? p.estado, contenido: p.contenido, productoId: p.productoId,
        prioridad: p.prioridad, disparador: p.disparador, disparadorValor: p.disparadorValor, frecuencia: p.frecuencia,
        frecuenciaValor: p.frecuenciaValor, paginas: p.paginas, dispositivo: p.dispositivo, inicio: p.inicio, fin: p.fin,
      });
      if (estado) set('estado', estado);
      setAviso({ ok: true, texto: estado === 'ACTIVO' ? 'Popup activado: ya se muestra en la web según su programación.' : 'Cambios guardados.' });
    } catch (e) {
      setAviso({ ok: false, texto: errMsg(e, 'No se pudo guardar.') });
    } finally { setGuardando(false); }
  }

  const campo = (id: string, etiqueta: string, valor: string, onChange: (v: string) => void, extra?: { area?: boolean; max?: number; ph?: string }) => (
    <div className="ax-field">
      <label className="ax-label" htmlFor={id}>{etiqueta}</label>
      {extra?.area
        ? <textarea id={id} className="ax-textarea" rows={3} maxLength={extra.max} value={valor} onChange={(e) => onChange(e.target.value)} placeholder={extra.ph} />
        : <input id={id} className="ax-input" maxLength={extra?.max} value={valor} onChange={(e) => onChange(e.target.value)} placeholder={extra?.ph} />}
    </div>
  );
  const select = (id: string, etiqueta: string, valor: string, onChange: (v: string) => void, items: [string, string][]) => (
    <div className="ax-field">
      <label className="ax-label" htmlFor={id}>{etiqueta}</label>
      <select id={id} className="ax-select" value={valor} onChange={(e) => onChange(e.target.value)}>{items.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    </div>
  );
  const num = (id: string, etiqueta: string, valor: number, onChange: (v: number) => void, min: number, max: number) => (
    <div className="ax-field" style={{ maxWidth: 200 }}>
      <label className="ax-label" htmlFor={id}>{etiqueta}</label>
      <input id={id} type="number" className="ax-input" min={min} max={max} value={valor} onChange={(e) => onChange(Math.min(max, Math.max(min, Math.round(Number(e.target.value) || min))))} />
    </div>
  );

  return (
    <>
      <PageHead
        title={p.nombre}
        subtitle={`Plantilla: ${plantilla?.nombre ?? p.plantilla}`}
        actions={
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={alSalir}>← Volver</button>
            {p.estado === 'ACTIVO'
              ? <button type="button" className="ax-btn ax-btn--secondary" disabled={guardando} onClick={() => void guardar('PAUSADO')}>Pausar</button>
              : <button type="button" className="ax-btn ax-btn--secondary" disabled={guardando} onClick={() => void guardar('ACTIVO')}>Activar</button>}
            <button type="button" className={`ax-btn ax-btn--primary${guardando ? ' is-loading' : ''}`} disabled={guardando} onClick={() => void guardar()}><span className="ax-btn__label">Guardar</span></button>
          </div>
        }
      />
      <Aviso aviso={aviso} />
      <p style={{ marginBlockEnd: 'var(--ax-space-3)', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-subtle)' }}>
        Estado: <strong>{p.estado === 'ACTIVO' ? 'Activo' : p.estado === 'PAUSADO' ? 'Pausado' : 'Borrador'}</strong> — solo se muestra en la web cuando está activo y dentro de sus fechas.
      </p>

      <div className="ax-tabs" style={{ marginBlockEnd: 'var(--ax-space-4)' }}>
        <div className="ax-tabs__list" role="tablist" aria-label="Secciones del popup">
          {([['contenido', 'Contenido'], ['cuando', 'Dónde y cuándo'], ['estadisticas', 'Resultados']] as const).map(([id, texto]) => (
            <button key={id} type="button" className="ax-tabs__tab" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{texto}</button>
          ))}
        </div>
      </div>

      <div className="ax-dash-grid">
        <section className="ax-card ax-col--7" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
            {tab === 'contenido' && (
              <>
                {campo('pp-nombre', 'Nombre interno', p.nombre, (v) => set('nombre', v), { max: 100 })}
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 180 }}>{select('pp-formato', 'Formato', p.formato, (v) => set('formato', v), opciones.formatos.map((f) => [f, FORMATO[f] ?? f]))}</div>
                  <div style={{ flex: 1, minWidth: 180 }}>{select('pp-tema', 'Color', c.tema, (v) => setC('tema', v as Tema), (Object.keys(TEMA) as Tema[]).map((t) => [t, TEMA[t]]))}</div>
                </div>
                {campo('pp-etiqueta', 'Sello (texto corto sobre el título)', c.etiqueta, (v) => setC('etiqueta', v), { max: 40, ph: 'Oferta por tiempo limitado' })}
                {campo('pp-titulo', usa.includes('producto') ? 'Título (vacío = nombre del producto)' : 'Título', c.titulo, (v) => setC('titulo', v), { max: 90 })}
                {campo('pp-texto', 'Mensaje', c.texto, (v) => setC('texto', v), { area: true, max: 400 })}
                {usa.includes('descuento') && campo('pp-desc', 'Descuento destacado', c.descuento, (v) => setC('descuento', v), { max: 16, ph: '-20%' })}
                {usa.includes('codigo') && campo('pp-codigo', 'Código de cupón (el visitante podrá copiarlo)', c.codigo, (v) => setC('codigo', v.toUpperCase()), { max: 32 })}
                {usa.includes('fechaLugar') && (
                  <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 180 }}>{campo('pp-fecha', 'Fecha del evento', c.fecha, (v) => setC('fecha', v), { max: 80, ph: '15 de octubre, 7 pm' })}</div>
                    <div style={{ flex: 1, minWidth: 180 }}>{campo('pp-lugar', 'Lugar o enlace', c.lugar, (v) => setC('lugar', v), { max: 120, ph: 'Lima / Zoom' })}</div>
                  </div>
                )}
                {p.formato === 'modal' && !usa.includes('producto') && (
                  <div className="ax-field">
                    <label className="ax-label" htmlFor="pp-img">Imagen (URL o ruta que empiece con /)</label>
                    <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
                      <input id="pp-img" className="ax-input" style={{ flex: 1 }} value={c.imagenUrl} onChange={(e) => setC('imagenUrl', e.target.value)} />
                      <SubirImagen onSubida={(u) => u[0] && setC('imagenUrl', u[0])} />
                    </div>
                  </div>
                )}
                <hr style={{ border: 0, borderTop: '1px solid var(--ax-border)', width: '100%' }} />
                <strong style={{ color: 'var(--ax-text-strong)' }}>Botón</strong>
                {select('pp-accion', '¿Qué pasa al tocar el botón?', c.accion, (v) => setC('accion', v as Accion), (Object.keys(ACCION) as Accion[]).map((a) => [a, ACCION[a]]))}
                {c.accion !== 'ninguna' && campo('pp-boton', 'Texto del botón', c.botonTexto, (v) => setC('botonTexto', v), { max: 30 })}
                {c.accion === 'ninguna' && campo('pp-boton2', 'Texto del botón de cierre', c.botonTexto, (v) => setC('botonTexto', v), { max: 30, ph: 'Entendido' })}
                {c.accion === 'url' && campo('pp-url', 'Dirección (https://… o /ruta de la web)', c.url, (v) => setC('url', v), { max: 500, ph: '/tienda?categoria=laptops' })}
                {c.accion === 'whatsapp' && campo('pp-wsp', 'Mensaje que se enviará por WhatsApp', c.whatsappTexto, (v) => setC('whatsappTexto', v), { area: true, max: 300, ph: 'Hola, vi la promoción y quiero más información.' })}
                {c.accion === 'producto' && (
                  <div className="ax-field">
                    <label className="ax-label" htmlFor="pp-prod">Producto (el botón lleva a su ficha en la web)</label>
                    <select id="pp-prod" className="ax-select" value={p.productoId ?? ''} onChange={(e) => set('productoId', e.target.value || null)}>
                      <option value="">— Elige un producto —</option>
                      {productos.map((x) => <option key={x.id} value={x.id}>{x.nombre} ({x.sku})</option>)}
                    </select>
                  </div>
                )}
                {p.formato !== 'barra' && campo('pp-cerrar', 'Enlace para cerrar (vacío = solo la X)', c.cerrarTexto, (v) => setC('cerrarTexto', v), { max: 30, ph: 'No, gracias' })}
              </>
            )}

            {tab === 'cuando' && (
              <>
                <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend className="ax-label">¿En qué páginas se muestra?</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--ax-space-2)', marginBlockStart: 'var(--ax-space-2)' }}>
                    <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)', fontWeight: 600 }}>
                      <input type="checkbox" checked={p.paginas.includes('todas')} onChange={() => alternarPagina('todas')} /> Todas las páginas
                    </label>
                    {opciones.paginas.map(([k, l]) => (
                      <label key={k} className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)', opacity: p.paginas.includes('todas') ? .5 : 1 }}>
                        <input type="checkbox" disabled={p.paginas.includes('todas')} checked={p.paginas.includes(k) || p.paginas.includes('todas')} onChange={() => alternarPagina(k)} /> {l}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <hr style={{ border: 0, borderTop: '1px solid var(--ax-border)', width: '100%' }} />
                {select('pp-disp', '¿Cuándo aparece?', p.disparador, (v) => set('disparador', v), opciones.disparadores.map((d) => [d, DISPARADOR[d] ?? d]))}
                {p.disparador === 'retraso' && num('pp-disp-v', 'Segundos de espera', p.disparadorValor, (v) => set('disparadorValor', v), 0, 600)}
                {p.disparador === 'scroll' && num('pp-disp-s', '% de la página recorrido', p.disparadorValor, (v) => set('disparadorValor', v), 5, 100)}
                {select('pp-frec', '¿Cada cuánto se muestra al mismo visitante?', p.frecuencia, (v) => set('frecuencia', v), opciones.frecuencias.map((f) => [f, FRECUENCIA[f] ?? f]))}
                {p.frecuencia === 'horas' && num('pp-frec-h', 'Cada cuántas horas', p.frecuenciaValor, (v) => set('frecuenciaValor', v), 1, 720)}
                {p.frecuencia === 'dias' && num('pp-frec-d', 'Cada cuántos días', p.frecuenciaValor, (v) => set('frecuenciaValor', v), 1, 365)}
                {select('pp-dev', 'Dispositivo', p.dispositivo, (v) => set('dispositivo', v), opciones.dispositivos.map((d) => [d, DISPOSITIVO[d] ?? d]))}
                <hr style={{ border: 0, borderTop: '1px solid var(--ax-border)', width: '100%' }} />
                <strong style={{ color: 'var(--ax-text-strong)' }}>Programación</strong>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', alignItems: 'flex-start' }}>
                  <div className="ax-field" style={{ flex: 1, minWidth: 200 }}>
                    <label className="ax-label" htmlFor="pp-ini">Desde (vacío = ya)</label>
                    <input id="pp-ini" type="datetime-local" className="ax-input" value={aLocal(p.inicio)} onChange={(e) => set('inicio', deLocal(e.target.value))} />
                  </div>
                  <div className="ax-field" style={{ flex: 1, minWidth: 200 }}>
                    <label className="ax-label" htmlFor="pp-fin">Hasta (vacío = sin fin)</label>
                    <input id="pp-fin" type="datetime-local" className="ax-input" value={aLocal(p.fin)} onChange={(e) => set('fin', deLocal(e.target.value))} />
                  </div>
                </div>
                {num('pp-prio', 'Prioridad (si coinciden varios en una página, sale el de mayor número)', p.prioridad, (v) => set('prioridad', v), 0, 100)}
                <p style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                  Para tener un popup distinto en el home y otro en la tienda, crea uno por página (o usa “Duplicar” en el listado). En una misma visita solo se muestra uno a la vez.
                </p>
              </>
            )}

            {tab === 'estadisticas' && (
              <>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-6)' }}>
                  <div><div style={{ fontSize: 28, fontWeight: 800, color: 'var(--ax-text-strong)' }}>{p.vistas}</div><div style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-subtle)' }}>Vistas</div></div>
                  <div><div style={{ fontSize: 28, fontWeight: 800, color: 'var(--ax-text-strong)' }}>{p.clics}</div><div style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-subtle)' }}>Clics en el botón</div></div>
                  <div><div style={{ fontSize: 28, fontWeight: 800, color: 'var(--ax-text-strong)' }}>{p.vistas > 0 ? `${Math.round((p.clics / p.vistas) * 100)}%` : '—'}</div><div style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-subtle)' }}>Tasa de clic</div></div>
                </div>
                <p style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Se cuentan solo mientras el popup está activo.</p>
              </>
            )}
          </div>
        </section>

        <section className="ax-card ax-col--5" style={{ alignSelf: 'start' }} aria-label="Vista previa">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Vista previa</h2></div></div>
          <div className="ax-card__body">
            <Vista c={c} formato={p.formato} producto={productoNombre} />
            <p style={{ marginBlockStart: 'var(--ax-space-3)', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Aproximada. Guarda y activa para verlo en la web real.</p>
          </div>
        </section>
      </div>
    </>
  );
}

export default WebPopups;
