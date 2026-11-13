'use client';
/*
 * FPTecnologi-HUB — piezas comunes del CRM (Embudo, Oportunidades, Agenda): tipos, etiquetas, la ficha de una
 * oportunidad (panel lateral con etapa, responsable, monto, próxima acción, solicitud original e historial) y el
 * formulario de nueva oportunidad. Todo va a la API `/crm/*` con la marca activa (admin y comercial).
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { ApiError } from '../../../context/AuthContext';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { manifest, hrefForSlug } from '../../../lib/manifest';
import { Icon } from '../../../components/ui/Icon';
import { Select } from '../../../components/ui/Select';

export type Etapa = 'NUEVO' | 'CONTACTADO' | 'PROPUESTA' | 'NEGOCIACION' | 'GANADO' | 'PERDIDO';
export type Origen = 'MANUAL' | 'COTIZADOR' | 'COTIZACION' | 'CONTACTO_WEB' | 'PRESUPUESTO';
export type TipoActividad = 'LLAMADA' | 'REUNION' | 'NOTA' | 'CORREO' | 'WHATSAPP' | 'TAREA' | 'ETAPA' | 'SOLICITUD';

export interface Usuario { id: string; nombre: string | null; email: string; rol?: string }
export interface Oportunidad {
  id: string; numero: string; titulo: string; etapa: Etapa; monto: string | number | null; moneda: string; probabilidad: number | null;
  cierreEstimado: string | null; origen: Origen; origenId: string | null; proximaAccion: string | null; proximaAccionAt: string | null;
  motivoPerdida: string | null; ganadoAt: string | null; createdAt: string; updatedAt: string; asignadoId: string | null;
  empresa: { id: string; razonSocial: string; ruc: string | null; rubro?: string | null; telefono?: string | null; web?: string | null } | null;
  contacto: { id: string; nombre: string; email: string | null; celular: string | null; cargo?: string | null } | null;
  asignado: Usuario | null;
  _count?: { actividades: number };
}
export interface Actividad { id: string; tipo: TipoActividad; texto: string; fecha: string; hecha: boolean; autor: string | null; createdAt: string }
export interface Detalle extends Oportunidad {
  actividades: Actividad[];
  solicitud: { origen: Origen; titulo: string; estado: string; detalle: string | null; createdAt: string; modulo: string } | null;
}

export const ETAPAS: { v: Etapa; label: string; badge: string; color: string }[] = [
  { v: 'NUEVO', label: 'Nuevo', badge: 'ax-badge--info', color: 'var(--ax-viz-cyan)' },
  { v: 'CONTACTADO', label: 'Contactado', badge: 'ax-badge--accent', color: 'var(--ax-viz-violet)' },
  { v: 'PROPUESTA', label: 'Propuesta enviada', badge: 'ax-badge--warning', color: 'var(--ax-viz-amber)' },
  { v: 'NEGOCIACION', label: 'Negociación', badge: 'ax-badge--warning', color: 'var(--ax-viz-pink)' },
  { v: 'GANADO', label: 'Ganado', badge: 'ax-badge--success', color: 'var(--ax-viz-emerald)' },
  { v: 'PERDIDO', label: 'Perdido', badge: 'ax-badge--danger', color: 'var(--ax-text-subtle)' },
];
export const ABIERTAS: Etapa[] = ['NUEVO', 'CONTACTADO', 'PROPUESTA', 'NEGOCIACION'];
export const etapa = (e: Etapa) => ETAPAS.find((x) => x.v === e)!;
export const ORIGENES: Record<Origen, string> = { MANUAL: 'Manual', COTIZADOR: 'Cotizador web', COTIZACION: 'Cotización de servicio', CONTACTO_WEB: 'Formulario de contacto', PRESUPUESTO: 'Presupuesto mayorista' };
export const TIPOS: Record<TipoActividad, string> = { LLAMADA: 'Llamada', REUNION: 'Reunión', NOTA: 'Nota', CORREO: 'Correo', WHATSAPP: 'WhatsApp', TAREA: 'Tarea', ETAPA: 'Cambio de etapa', SOLICITUD: 'Solicitud web' };
export const TIPOS_MANUALES: TipoActividad[] = ['LLAMADA', 'REUNION', 'WHATSAPP', 'CORREO', 'NOTA', 'TAREA'];

export const dinero = (monto: string | number | null | undefined, moneda = 'PEN') =>
  monto === null || monto === undefined || monto === '' ? '—' : `${moneda === 'USD' ? 'US$' : 'S/'} ${Number(monto).toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
export const montos = (m: Record<string, number> | undefined) => {
  const partes = Object.entries(m ?? {}).filter(([, v]) => v > 0).map(([mon, v]) => dinero(v, mon));
  return partes.length ? partes.join(' + ') : dinero(0);
};
export const fechaCorta = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const fechaHora = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const vencida = (iso: string | null) => !!iso && new Date(iso).getTime() < Date.now();
export const nombreDe = (u: Usuario | null | undefined) => (u ? u.nombre || u.email : 'Sin asignar');
/** <input type="datetime-local"> ⇄ ISO (hora local del navegador). */
export const aLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
export const deLocal = (v: string) => (v ? new Date(v).toISOString() : null);
export const msg = (e: unknown, d: string) => (e instanceof ApiError ? e.message : d);

export function useAsignables() {
  const [lista, setLista] = useState<Usuario[]>([]);
  useEffect(() => { api.get<Usuario[]>('/crm/asignables').then(setLista).catch(() => setLista([])); }, []);
  return lista;
}

export function Alerta({ tono = 'danger', children }: { tono?: 'danger' | 'success'; children: ReactNode }) {
  return (
    <div role={tono === 'danger' ? 'alert' : 'status'} className={`ax-alert ax-alert--${tono}`} style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
      <div className="ax-alert__content"><p className="ax-alert__message">{children}</p></div>
    </div>
  );
}

/** Ventana modal accesible (mismo patrón que Administración → Marcas). `lado` = panel a la derecha. */
export function Modal({ titulo, onClose, lado = false, ancho = 520, children }: { titulo: ReactNode; onClose: () => void; lado?: boolean; ancho?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', justifyContent: lado ? 'flex-end' : 'center', alignItems: lado ? 'stretch' : 'center', padding: lado ? 0 : 'var(--ax-space-4)' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)', backdropFilter: 'blur(2px)' }} />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={typeof titulo === 'string' ? titulo : undefined} className="ax-card"
        style={{ position: 'relative', width: '100%', maxWidth: ancho, maxHeight: lado ? '100vh' : '90vh', overflowY: 'auto', borderRadius: lado ? 0 : undefined }}>
        <div className="ax-card__header">
          <div className="ax-card__titles"><h2 className="ax-card__title">{titulo}</h2></div>
          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={onClose}>Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Botón de solo ícono (acciones de tablas e historial); `label` va como aria-label y tooltip. */
export function BotonIcono({ icono, label, peligro = false, disabled, onClick }: { icono: string; label: string; peligro?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" aria-label={label} title={label} disabled={disabled} onClick={onClick}
      style={peligro ? { color: 'var(--ax-danger-500)' } : undefined}>
      <Icon name={icono} width={18} height={18} />
    </button>
  );
}

/**
 * Confirmación con el modal del sistema (en vez de window.confirm). `confirmar(titulo, texto)` devuelve una promesa
 * con true/false; `dialogo` se renderiza donde se use el hook. Escape cierra solo este modal, no el panel de atrás.
 */
export function useConfirmar() {
  const [p, setP] = useState<{ titulo: string; texto: string; boton: string; resolver: (ok: boolean) => void } | null>(null);
  const confirmar = useCallback((titulo: string, texto: string, boton = 'Eliminar') => new Promise<boolean>((resolver) => setP({ titulo, texto, boton, resolver })), []);
  const cerrar = useCallback((ok: boolean) => { setP((x) => { x?.resolver(ok); return null; }); }, []);
  useEffect(() => {
    if (!p) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); cerrar(false); } };
    window.addEventListener('keydown', esc, true);
    return () => window.removeEventListener('keydown', esc, true);
  }, [p, cerrar]);
  const dialogo = p && (
    <Modal titulo={p.titulo} onClose={() => cerrar(false)} ancho={500}>
      <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
        <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>{p.texto}</p>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
          <button type="button" className="ax-btn ax-btn--ghost" onClick={() => cerrar(false)}>Cancelar</button>
          <button type="button" className="ax-btn ax-btn--primary ax-btn--danger" onClick={() => cerrar(true)}><span className="ax-btn__label">{p.boton}</span></button>
        </div>
      </div>
    </Modal>
  );
  return { confirmar, dialogo };
}

const fila = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--ax-space-3)' } as const;

/** Pide el motivo al pasar a Perdido (la API lo exige). null = cancelado. */
export function pedirMotivo(): string | null {
  const m = window.prompt('¿Por qué se perdió esta oportunidad? (precio, competencia, sin presupuesto, sin respuesta…)');
  return m && m.trim().length >= 2 ? m.trim() : null;
}

/** Ficha de una oportunidad en un panel lateral. `onCambio` refresca la lista de quien la abrió. */
export function OportunidadPanel({ id, onClose, onCambio }: { id: string; onClose: () => void; onCambio: () => void }) {
  const asignables = useAsignables();
  const { confirmar, dialogo } = useConfirmar();
  const [o, setO] = useState<Detalle | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ titulo: '', monto: '', moneda: 'PEN', cierreEstimado: '', asignadoId: '', proximaAccion: '', proximaAccionAt: '' });
  const [act, setAct] = useState<{ tipo: TipoActividad; texto: string; fecha: string }>({ tipo: 'LLAMADA', texto: '', fecha: '' });

  const cargarForm = (d: Detalle) => {
    setO(d);
    setForm({
      titulo: d.titulo, monto: d.monto === null ? '' : String(Number(d.monto)), moneda: d.moneda, cierreEstimado: d.cierreEstimado?.slice(0, 10) ?? '',
      asignadoId: d.asignadoId ?? '', proximaAccion: d.proximaAccion ?? '', proximaAccionAt: aLocal(d.proximaAccionAt),
    });
  };
  const cargar = useCallback(async () => {
    try { cargarForm(await api.get<Detalle>(`/crm/oportunidades/${id}`)); setError(''); } catch (e) { setError(msg(e, 'No se pudo abrir la oportunidad.')); }
  }, [id]);
  useEffect(() => { cargar(); }, [cargar]);

  async function correr(fn: () => Promise<Detalle>, okTxt: string) {
    setBusy(true); setError(''); setOk('');
    try { cargarForm(await fn()); setOk(okTxt); onCambio(); } catch (e) { setError(msg(e, 'No se pudo guardar.')); } finally { setBusy(false); }
  }

  const cambiarEtapa = (nueva: Etapa) => {
    if (!o || nueva === o.etapa) return;
    const motivoPerdida = nueva === 'PERDIDO' ? pedirMotivo() : undefined;
    if (nueva === 'PERDIDO' && !motivoPerdida) return;
    correr(() => api.patch<Detalle>(`/crm/oportunidades/${id}/etapa`, { etapa: nueva, motivoPerdida }), `Etapa: ${etapa(nueva).label}.`);
  };
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.monto && !(Number(form.monto) >= 0)) return setError('Monto no válido.');
    correr(() => api.patch<Detalle>(`/crm/oportunidades/${id}`, {
      titulo: form.titulo.trim(), monto: form.monto === '' ? null : Number(form.monto), moneda: form.moneda,
      cierreEstimado: form.cierreEstimado ? new Date(`${form.cierreEstimado}T12:00:00`).toISOString() : null,
      asignadoId: form.asignadoId || null, proximaAccion: form.proximaAccion.trim() || null, proximaAccionAt: deLocal(form.proximaAccionAt),
    }), 'Cambios guardados.');
  };
  const registrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (act.texto.trim().length < 2) return setError('Escribe el detalle de la actividad.');
    const tarea = act.tipo === 'TAREA';
    correr(() => api.post<Detalle>(`/crm/oportunidades/${id}/actividades`, { tipo: act.tipo, texto: act.texto.trim(), fecha: act.fecha ? deLocal(act.fecha) : undefined, hecha: tarea ? false : undefined }), tarea ? 'Tarea agendada.' : 'Actividad registrada.')
      .then(() => setAct({ tipo: act.tipo, texto: '', fecha: '' }));
  };
  const marcar = (a: Actividad) => correr(() => api.patch<Detalle>(`/crm/actividades/${a.id}`, { hecha: !a.hecha }), a.hecha ? 'Tarea reabierta.' : 'Tarea hecha.');
  const borrar = async (a: Actividad) => {
    if (await confirmar('Eliminar actividad', `¿Eliminar esta ${TIPOS[a.tipo].toLowerCase()} del historial? No se puede deshacer.`)) correr(() => api.delete<Detalle>(`/crm/actividades/${a.id}`), 'Actividad eliminada.');
  };

  const moduloSolicitud = o?.solicitud ? manifest.byId.get(o.solicitud.modulo) : null;
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  return (
    <Modal lado ancho={640} titulo={o ? <>{o.numero} · <span style={{ fontWeight: 'var(--ax-weight-regular)' }}>{o.titulo}</span></> : 'Cargando…'} onClose={onClose}>
      <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
        {error && <Alerta>{error}</Alerta>}
        {ok && <Alerta tono="success">{ok}</Alerta>}
        {o && (
          <>
            {/* Etapas */}
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Etapa" style={{ flexWrap: 'wrap' }}>
              {ETAPAS.map((e) => (
                <button key={e.v} type="button" role="radio" aria-checked={o.etapa === e.v} disabled={busy} className={`ax-btn ax-btn--sm${o.etapa === e.v ? ' is-selected' : ''}`} onClick={() => cambiarEtapa(e.v)}>{e.label}</button>
              ))}
            </div>
            {o.etapa === 'PERDIDO' && o.motivoPerdida && <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Motivo de la pérdida: <b>{o.motivoPerdida}</b></p>}

            {/* Cliente */}
            <div style={fila}>
              <div>
                <div className="ax-label">Empresa</div>
                <div>{o.empresa ? <>{o.empresa.razonSocial}{o.empresa.ruc && <span style={{ color: 'var(--ax-text-subtle)' }}> · RUC {o.empresa.ruc}</span>}</> : '—'}</div>
              </div>
              <div>
                <div className="ax-label">Contacto</div>
                <div>{o.contacto?.nombre ?? '—'}{o.contacto?.cargo ? <span style={{ color: 'var(--ax-text-subtle)' }}> · {o.contacto.cargo}</span> : null}</div>
                <div style={{ fontSize: 'var(--ax-text-sm)', display: 'flex', gap: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
                  {o.contacto?.email && <a href={`mailto:${o.contacto.email}`}>{o.contacto.email}</a>}
                  {o.contacto?.celular && <a href={`https://wa.me/51${o.contacto.celular}`} target="_blank" rel="noreferrer">WhatsApp {o.contacto.celular}</a>}
                </div>
              </div>
            </div>

            {o.solicitud && (
              <div className="ax-card ax-card--flat" style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                <div className="ax-label">Solicitud original · {ORIGENES[o.solicitud.origen]}</div>
                <div style={{ fontWeight: 'var(--ax-weight-medium)' }}>{o.solicitud.titulo}</div>
                <div style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{fechaCorta(o.solicitud.createdAt)} · estado en su bandeja: {o.solicitud.estado}</div>
                {moduloSolicitud && <div><Link className="ax-btn ax-btn--link" href={hrefForSlug(moduloSolicitud.slug)} style={{ paddingInline: 0, display: 'inline-flex' }}>Ver en {moduloSolicitud.title}</Link></div>}
              </div>
            )}

            {/* Datos editables */}
            <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              <div className="ax-field"><label className="ax-label" htmlFor="op-tit">Título</label><input id="op-tit" className="ax-input" maxLength={160} value={form.titulo} onChange={set('titulo')} /></div>
              <div style={fila}>
                <div className="ax-field"><label className="ax-label" htmlFor="op-resp">Responsable</label>
                  <Select id="op-resp" className="ax-select" value={form.asignadoId} onChange={set('asignadoId')}>
                    <option value="">Sin asignar</option>
                    {asignables.map((u) => <option key={u.id} value={u.id}>{nombreDe(u)}</option>)}
                  </Select></div>
                <div className="ax-field"><label className="ax-label" htmlFor="op-monto">Monto estimado</label>
                  <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
                    <Select aria-label="Moneda" className="ax-select" style={{ width: 84 }} value={form.moneda} onChange={set('moneda')}><option value="PEN">S/</option><option value="USD">US$</option></Select>
                    <input id="op-monto" className="ax-input" inputMode="decimal" value={form.monto} onChange={set('monto')} placeholder="0" />
                  </div></div>
                <div className="ax-field"><label className="ax-label" htmlFor="op-cierre">Cierre estimado</label><input id="op-cierre" type="date" className="ax-input" value={form.cierreEstimado} onChange={set('cierreEstimado')} /></div>
              </div>
              <div style={fila}>
                <div className="ax-field"><label className="ax-label" htmlFor="op-acc">Próxima acción</label><input id="op-acc" className="ax-input" maxLength={200} value={form.proximaAccion} onChange={set('proximaAccion')} placeholder="Ej. Llamar para agendar visita" /></div>
                <div className="ax-field"><label className="ax-label" htmlFor="op-accf">¿Cuándo?</label><input id="op-accf" type="datetime-local" className="ax-input" value={form.proximaAccionAt} onChange={set('proximaAccionAt')} /></div>
              </div>
              <div><button type="submit" className="ax-btn ax-btn--primary ax-btn--sm" disabled={busy}><span className="ax-btn__label">Guardar cambios</span></button></div>
            </form>

            {/* Nueva actividad */}
            <form onSubmit={registrar} className="ax-card ax-card--flat" style={{ padding: 'var(--ax-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              <div className="ax-label">Registrar actividad</div>
              <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Tipo de actividad" style={{ flexWrap: 'wrap' }}>
                {TIPOS_MANUALES.map((t) => (
                  <button key={t} type="button" role="radio" aria-checked={act.tipo === t} className={`ax-btn ax-btn--sm${act.tipo === t ? ' is-selected' : ''}`} onClick={() => setAct({ ...act, tipo: t })}>{TIPOS[t]}</button>
                ))}
              </div>
              <textarea aria-label="Detalle de la actividad" className="ax-textarea" rows={3} maxLength={4000} value={act.texto} onChange={(e) => setAct({ ...act, texto: e.target.value })}
                placeholder={act.tipo === 'TAREA' ? 'Ej. Enviar la propuesta firmada' : 'Ej. Llamé a Ana: pide propuesta para 10 equipos'} />
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', alignItems: 'flex-end' }}>
                <div className="ax-field"><label className="ax-label" htmlFor="ac-f">{act.tipo === 'TAREA' ? 'Vence' : 'Fecha (vacío = ahora)'}</label><input id="ac-f" type="datetime-local" className="ax-input" value={act.fecha} onChange={(e) => setAct({ ...act, fecha: e.target.value })} /></div>
                <button type="submit" className="ax-btn ax-btn--secondary ax-btn--sm" disabled={busy}><span className="ax-btn__label">{act.tipo === 'TAREA' ? 'Agendar tarea' : 'Registrar'}</span></button>
              </div>
            </form>

            {/* Historial */}
            <div>
              <div className="ax-label" style={{ marginBlockEnd: 'var(--ax-space-2)' }}>Historial ({o.actividades.length})</div>
              <ol className="ax-list ax-list--compact" style={{ margin: 0, padding: 0 }}>
                {o.actividades.map((a) => (
                  <li key={a.id} className="ax-list__row" style={{ alignItems: 'flex-start', paddingInline: 0 }}>
                    <span className="ax-list__content">
                      <span className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
                        <span className={`ax-badge ax-badge--soft ax-badge--sm ${a.tipo === 'TAREA' ? (a.hecha ? 'ax-badge--success' : vencida(a.fecha) ? 'ax-badge--danger' : 'ax-badge--warning') : a.tipo === 'SOLICITUD' ? 'ax-badge--info' : ''}`}>
                          {TIPOS[a.tipo]}{a.tipo === 'TAREA' ? (a.hecha ? ' · hecha' : vencida(a.fecha) ? ' · vencida' : ' · pendiente') : ''}
                        </span>
                        <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{fechaHora(a.fecha)}{a.autor ? ` · ${a.autor}` : ' · automático'}</span>
                      </span>
                      <span className="ax-list__title" style={{ whiteSpace: 'pre-wrap', fontWeight: 'var(--ax-weight-regular)', textDecoration: a.tipo === 'TAREA' && a.hecha ? 'line-through' : undefined }}>{a.texto}</span>
                    </span>
                    {a.tipo !== 'ETAPA' && a.tipo !== 'SOLICITUD' && (
                      <span className="ax-list__trailing ax-cluster" style={{ gap: 'var(--ax-space-1)' }}>
                        {a.tipo === 'TAREA' && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={busy} onClick={() => marcar(a)}>{a.hecha ? 'Reabrir' : 'Hecha'}</button>}
                        <BotonIcono icono="trash" label="Eliminar actividad" peligro disabled={busy} onClick={() => borrar(a)} />
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
      {dialogo}
    </Modal>
  );
}

type EmpresaSel = { id: string; razonSocial: string; ruc?: string | null };
type ContactoSel = { id: string; nombre: string; email: string | null; celular: string | null; empresa?: EmpresaSel | null };

/** Alta manual: título, empresa y contacto (existentes o nuevos), etapa, monto, responsable y próxima acción. */
export function NuevaOportunidad({ onClose, onCreada }: { onClose: () => void; onCreada: (id: string) => void }) {
  const asignables = useAsignables();
  // Cliente existente: se busca por RUC, empresa, nombre, correo o celular y se elige en vez de volver a escribirlo.
  const [buscar, setBuscar] = useState('');
  const [sug, setSug] = useState<{ empresas: EmpresaSel[]; contactos: ContactoSel[] }>({ empresas: [], contactos: [] });
  const [empresaSel, setEmpresaSel] = useState<EmpresaSel | null>(null);
  const [contactoSel, setContactoSel] = useState<ContactoSel | null>(null);
  const [deEmpresa, setDeEmpresa] = useState<ContactoSel[]>([]);
  useEffect(() => {
    const q = buscar.trim();
    if (q.length < 2) { setSug({ empresas: [], contactos: [] }); return; }
    const t = setTimeout(() => {
      const qs = `?q=${encodeURIComponent(q)}`;
      Promise.all([api.get<EmpresaSel[]>(`/crm/empresas${qs}`), api.get<ContactoSel[]>(`/crm/contactos${qs}`)])
        .then(([empresas, contactos]) => setSug({ empresas: empresas.slice(0, 5), contactos: contactos.slice(0, 5) }))
        .catch(() => setSug({ empresas: [], contactos: [] }));
    }, 250);
    return () => clearTimeout(t);
  }, [buscar]);
  useEffect(() => {
    if (!empresaSel) { setDeEmpresa([]); return; }
    api.get<ContactoSel[]>(`/crm/contactos?empresaId=${empresaSel.id}`).then(setDeEmpresa).catch(() => setDeEmpresa([]));
  }, [empresaSel]);
  const elegirEmpresa = (e: EmpresaSel) => { setEmpresaSel(e); setContactoSel(null); setBuscar(''); };
  const elegirContacto = (c: ContactoSel) => { setContactoSel(c); setEmpresaSel(c.empresa ?? null); setBuscar(''); };
  const [f, setF] = useState({ titulo: '', empresa: '', ruc: '', contacto: '', email: '', celular: '', etapa: 'NUEVO' as Etapa, monto: '', moneda: 'PEN', asignadoId: '', proximaAccion: '', proximaAccionAt: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (f.titulo.trim().length < 3) return setError('Escribe un título (qué quiere comprar o contratar).');
    if (!empresaSel && f.ruc && !/^(10|15|16|17|20)\d{9}$/.test(f.ruc)) return setError('El RUC debe tener 11 dígitos.');
    if (!contactoSel && !f.contacto.trim() && (f.email || f.celular)) return setError('Escribe el nombre del contacto.');
    setBusy(true); setError('');
    try {
      const o = await api.post<Detalle>('/crm/oportunidades', {
        titulo: f.titulo.trim(), etapa: f.etapa, moneda: f.moneda, monto: f.monto ? Number(f.monto) : undefined,
        empresaId: empresaSel?.id,
        contactoId: contactoSel?.id,
        empresaNueva: !empresaSel && (f.empresa.trim() || f.ruc) ? { razonSocial: f.empresa.trim() || undefined, ruc: f.ruc || undefined } : undefined,
        contactoNuevo: !contactoSel && f.contacto.trim() ? { nombre: f.contacto.trim(), email: f.email.trim() || undefined, celular: f.celular.trim() || undefined } : undefined,
        asignadoId: f.asignadoId || undefined, proximaAccion: f.proximaAccion.trim() || undefined, proximaAccionAt: deLocal(f.proximaAccionAt) ?? undefined,
      });
      onCreada(o.id);
    } catch (err) { setError(msg(err, 'No se pudo crear la oportunidad.')); } finally { setBusy(false); }
  }

  return (
    <Modal titulo="Nueva oportunidad" onClose={onClose} ancho={620}>
      <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }} onSubmit={crear}>
        {error && <Alerta>{error}</Alerta>}
        <div className="ax-field"><label className="ax-label" htmlFor="no-tit">Título *</label><input id="no-tit" className="ax-input" maxLength={160} value={f.titulo} onChange={set('titulo')} placeholder="Ej. 20 laptops para el área de ventas" /></div>
        {!empresaSel && !contactoSel && (
          <div className="ax-field" style={{ position: 'relative' }}>
            <label className="ax-label" htmlFor="no-bus">¿Cliente existente?</label>
            <input id="no-bus" className="ax-input" autoComplete="off" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Busca por RUC, empresa, nombre, correo o celular" />
            {(sug.empresas.length > 0 || sug.contactos.length > 0) && (
              <ul aria-label="Clientes encontrados" className="ax-card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, margin: '4px 0 0', padding: 'var(--ax-space-1)', listStyle: 'none', maxHeight: 280, overflowY: 'auto' }}>
                {sug.empresas.map((e) => (
                  <li key={`e${e.id}`}><button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => elegirEmpresa(e)}>
                    <span className="ax-badge ax-badge--soft ax-badge--sm">Empresa</span> {e.razonSocial}{e.ruc ? ` · RUC ${e.ruc}` : ''}</button></li>
                ))}
                {sug.contactos.map((c) => (
                  <li key={`c${c.id}`}><button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => elegirContacto(c)}>
                    <span className="ax-badge ax-badge--soft ax-badge--sm">Contacto</span> {c.nombre}{c.email ? ` · ${c.email}` : ''}{c.empresa ? ` · ${c.empresa.razonSocial}` : ''}</button></li>
                ))}
              </ul>
            )}
            <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Elige uno para no volver a escribir sus datos. Si es nuevo, llena los campos de abajo.</span>
          </div>
        )}
        {empresaSel ? (
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
            <span className="ax-label" style={{ margin: 0 }}>Empresa:</span>
            <b>{empresaSel.razonSocial}</b>{empresaSel.ruc && <span style={{ color: 'var(--ax-text-subtle)' }}>RUC {empresaSel.ruc}</span>}
            <button type="button" className="ax-btn ax-btn--link ax-btn--sm" onClick={() => { setEmpresaSel(null); setContactoSel(null); }}>Cambiar</button>
          </div>
        ) : (
          <div style={fila}>
            <div className="ax-field"><label className="ax-label" htmlFor="no-emp">Empresa</label><input id="no-emp" className="ax-input" maxLength={160} value={f.empresa} onChange={set('empresa')} /></div>
            <div className="ax-field"><label className="ax-label" htmlFor="no-ruc">RUC</label><input id="no-ruc" className="ax-input" inputMode="numeric" maxLength={11} value={f.ruc} onChange={(e) => setF({ ...f, ruc: e.target.value.replace(/\D/g, '') })} /></div>
          </div>
        )}
        {contactoSel ? (
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
            <span className="ax-label" style={{ margin: 0 }}>Contacto:</span>
            <b>{contactoSel.nombre}</b>{(contactoSel.email || contactoSel.celular) && <span style={{ color: 'var(--ax-text-subtle)' }}>{[contactoSel.email, contactoSel.celular].filter(Boolean).join(' · ')}</span>}
            <button type="button" className="ax-btn ax-btn--link ax-btn--sm" onClick={() => setContactoSel(null)}>Cambiar</button>
          </div>
        ) : (
          <>
            {empresaSel && deEmpresa.length > 0 && (
              <div className="ax-field"><label className="ax-label" htmlFor="no-cex">Contacto de la empresa</label>
                <Select id="no-cex" className="ax-select" value="" onChange={(e) => { const c = deEmpresa.find((x) => x.id === e.target.value); if (c) setContactoSel({ ...c, empresa: empresaSel }); }}>
                  <option value="">Nuevo contacto (llenar abajo)</option>
                  {deEmpresa.map((c) => <option key={c.id} value={c.id}>{c.nombre}{c.email ? ` · ${c.email}` : ''}</option>)}
                </Select></div>
            )}
            <div style={fila}>
              <div className="ax-field"><label className="ax-label" htmlFor="no-con">Contacto</label><input id="no-con" className="ax-input" maxLength={160} value={f.contacto} onChange={set('contacto')} /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="no-mail">Correo</label><input id="no-mail" type="email" className="ax-input" maxLength={120} value={f.email} onChange={set('email')} /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="no-cel">Celular</label><input id="no-cel" className="ax-input" maxLength={30} value={f.celular} onChange={set('celular')} /></div>
            </div>
          </>
        )}
        <div style={fila}>
          <div className="ax-field"><label className="ax-label" htmlFor="no-et">Etapa</label>
            <Select id="no-et" className="ax-select" value={f.etapa} onChange={set('etapa')}>{ETAPAS.filter((e) => e.v !== 'PERDIDO').map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}</Select></div>
          <div className="ax-field"><label className="ax-label" htmlFor="no-monto">Monto estimado</label>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
              <Select aria-label="Moneda" className="ax-select" style={{ width: 84 }} value={f.moneda} onChange={set('moneda')}><option value="PEN">S/</option><option value="USD">US$</option></Select>
              <input id="no-monto" className="ax-input" inputMode="decimal" value={f.monto} onChange={set('monto')} />
            </div></div>
          <div className="ax-field"><label className="ax-label" htmlFor="no-resp">Responsable</label>
            <Select id="no-resp" className="ax-select" value={f.asignadoId} onChange={set('asignadoId')}><option value="">Sin asignar</option>{asignables.map((u) => <option key={u.id} value={u.id}>{nombreDe(u)}</option>)}</Select></div>
        </div>
        <div style={fila}>
          <div className="ax-field"><label className="ax-label" htmlFor="no-acc">Próxima acción</label><input id="no-acc" className="ax-input" maxLength={200} value={f.proximaAccion} onChange={set('proximaAccion')} /></div>
          <div className="ax-field"><label className="ax-label" htmlFor="no-accf">¿Cuándo?</label><input id="no-accf" type="datetime-local" className="ax-input" value={f.proximaAccionAt} onChange={set('proximaAccionAt')} /></div>
        </div>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
          <button type="button" className="ax-btn ax-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="ax-btn ax-btn--primary" disabled={busy}><span className="ax-btn__label">{busy ? 'Creando…' : 'Crear oportunidad'}</span></button>
        </div>
      </form>
    </Modal>
  );
}
