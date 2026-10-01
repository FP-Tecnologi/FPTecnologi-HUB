'use client';
/*
 * FPTecnologi-HUB — Soluciones → Cotizaciones (GET/PATCH /cotizaciones, POST /cotizaciones/:id/enviar):
 * solicitudes de cotización que llegan del detalle de cada servicio. El equipo arma la propuesta (texto,
 * monto, vigencia) y la envía al cliente por correo o WhatsApp; cada envío queda en el historial, y se
 * puede ver todo lo cotizado a un mismo cliente. Distinto de Cotizador → Leads (formulario general).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Estado = 'PENDIENTE' | 'EN_REVISION' | 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA';
interface Envio { id: string; canal: 'EMAIL' | 'WHATSAPP'; destinatario: string; mensaje: string; enviadoPor: string; createdAt: string }
interface Cotizacion {
  id: string; numero: string | null; estado: Estado;
  clienteNombre: string; clienteEmail: string; clienteTelefono: string | null; clienteEmpresa: string | null;
  mensaje: string | null; origen: string | null;
  propuesta: string | null; monto: string | null; moneda: 'USD' | 'PEN'; validezHasta: string | null; notas: string | null;
  atendidoPor: string | null; enviadaAt: string | null; createdAt: string;
  servicio: { id: string; nombre: string; slug: string | null };
  _count?: { envios: number };
  envios?: Envio[];
}

const ESTADOS: { v: Estado; label: string; badge: string }[] = [
  { v: 'PENDIENTE', label: 'Pendiente', badge: 'ax-badge--warning' },
  { v: 'EN_REVISION', label: 'En revisión', badge: 'ax-badge--info' },
  { v: 'ENVIADA', label: 'Enviada', badge: 'ax-badge--info' },
  { v: 'ACEPTADA', label: 'Aceptada', badge: 'ax-badge--success' },
  { v: 'RECHAZADA', label: 'Rechazada', badge: 'ax-badge--danger' },
];
const est = (v: Estado) => ESTADOS.find((e) => e.v === v)!;
const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
const errMsg = (e: unknown, fb: string) => (e instanceof ApiError ? e.message : fb);

export function SolucionesCotizaciones() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Cotizacion[]>([]);
  const [filtro, setFiltro] = useState<Estado | 'TODAS'>('TODAS');
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [sel, setSel] = useState<Cotizacion | null>(null);
  const [form, setForm] = useState({ propuesta: '', monto: '', moneda: 'USD' as 'USD' | 'PEN', validezDias: '15', notas: '' });
  const [extra, setExtra] = useState('');
  const [busy, setBusy] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try { setLista(await api.get<Cotizacion[]>('/cotizaciones')); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudieron cargar las cotizaciones.') }); }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);
  // Enlace desde la notificación: /soluciones/cotizaciones?id=…
  useEffect(() => { const id = new URLSearchParams(window.location.search).get('id'); if (id) setSelId(id); }, []);

  const cargarDetalle = useCallback(async (id: string) => {
    const c = await api.get<Cotizacion>(`/cotizaciones/${id}`);
    setSel(c);
    setForm({
      propuesta: c.propuesta ?? '',
      monto: c.monto != null ? String(Number(c.monto)) : '',
      moneda: c.moneda,
      validezDias: c.validezHasta ? String(Math.max(0, Math.ceil((new Date(c.validezHasta).getTime() - Date.now()) / 86_400_000))) : '15',
      notas: c.notas ?? '',
    });
    setExtra('');
  }, []);
  useEffect(() => {
    setSel(null);
    if (selId) cargarDetalle(selId).catch((e) => setAviso({ ok: false, texto: errMsg(e, 'No se pudo abrir la cotización.') }));
  }, [selId, cargarDetalle]);

  const conteo = useMemo(() => Object.fromEntries(ESTADOS.map((e) => [e.v, lista.filter((c) => c.estado === e.v).length])), [lista]);
  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter((c) => (filtro === 'TODAS' || c.estado === filtro) && (!t || `${c.numero} ${c.clienteNombre} ${c.clienteEmail} ${c.clienteEmpresa ?? ''} ${c.servicio.nombre}`.toLowerCase().includes(t)));
  }, [lista, filtro, q]);
  // Otras cotizaciones del mismo cliente (por correo)
  const delCliente = sel ? lista.filter((c) => c.clienteEmail.toLowerCase() === sel.clienteEmail.toLowerCase() && c.id !== sel.id) : [];

  async function guardar(extraCambios: Record<string, unknown> = {}) {
    if (!sel) return;
    setBusy(true); setAviso(null);
    try {
      const monto = form.monto.trim() === '' ? undefined : Number(form.monto);
      await api.patch(`/cotizaciones/${sel.id}`, {
        propuesta: form.propuesta,
        ...(monto !== undefined && !Number.isNaN(monto) ? { monto } : {}),
        moneda: form.moneda,
        validezDias: Number(form.validezDias) || 0,
        notas: form.notas,
        ...extraCambios,
      });
      setAviso({ ok: true, texto: 'Cotización guardada.' });
      await Promise.all([cargar(), cargarDetalle(sel.id)]);
    } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo guardar.') }); }
    finally { setBusy(false); }
  }

  async function enviar(canal: 'EMAIL' | 'WHATSAPP') {
    if (!sel) return;
    setBusy(true); setAviso(null);
    try {
      await guardar(); // asegura que lo que se envía es lo que se ve en pantalla
      const r = await api.post<{ ok: true; url: string | null; destinatario: string }>(`/cotizaciones/${sel.id}/enviar`, { canal, mensaje: extra.trim() || undefined });
      if (canal === 'WHATSAPP' && r.url) window.open(r.url, '_blank', 'noopener');
      setAviso({ ok: true, texto: canal === 'EMAIL' ? `Cotización enviada por correo a ${r.destinatario}.` : 'Se abrió WhatsApp con el mensaje listo; envíalo desde ahí.' });
      await Promise.all([cargar(), cargarDetalle(sel.id)]);
    } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo enviar la cotización.') }); }
    finally { setBusy(false); }
  }

  async function eliminar() {
    if (!sel || !window.confirm(`¿Eliminar la cotización ${sel.numero ?? ''}? No se puede deshacer.`)) return;
    try { await api.delete(`/cotizaciones/${sel.id}`); setSelId(null); await cargar(); setAviso({ ok: true, texto: 'Cotización eliminada.' }); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo eliminar.') }); }
  }

  return (
    <>
      <PageHead title="Cotizaciones de servicios" subtitle="Solicitudes de cotización del detalle de cada servicio: arma la propuesta y envíala por correo o WhatsApp." />
      <div className="ax-dash-grid">
        {aviso && (
          <div role={aviso.ok ? 'status' : 'alert'} className={`ax-alert ax-col--12 ${aviso.ok ? 'ax-alert--success' : 'ax-alert--danger'}`} style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
            <div className="ax-alert__content"><p className="ax-alert__message">{aviso.texto}</p></div>
          </div>
        )}

        <section className="ax-card ax-col--12" aria-label="Filtros">
          <div className="ax-card__body ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Estado">
              <button type="button" role="radio" aria-checked={filtro === 'TODAS'} className={`ax-btn ax-btn--sm${filtro === 'TODAS' ? ' is-selected' : ''}`} onClick={() => setFiltro('TODAS')}>Todas ({lista.length})</button>
              {ESTADOS.map((e) => (
                <button key={e.v} type="button" role="radio" aria-checked={filtro === e.v} className={`ax-btn ax-btn--sm${filtro === e.v ? ' is-selected' : ''}`} onClick={() => setFiltro(e.v)}>{e.label} ({conteo[e.v]})</button>
              ))}
            </div>
            <input type="search" className="ax-input" placeholder="Buscar por cliente, correo, servicio o número…" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 340 }} />
          </div>
        </section>

        <section className={`ax-card ${selId ? 'ax-col--6' : 'ax-col--12'}`} aria-label="Lista de cotizaciones">
          {visibles.length === 0 ? (
            <div className="ax-card__body" style={{ textAlign: 'center', color: 'var(--ax-text-muted)', paddingBlock: 'var(--ax-space-8)' }}>{lista.length === 0 ? 'Aún no hay solicitudes: llegan desde el botón “Solicitar cotización” de cada servicio en la web.' : 'Ninguna cotización coincide con los filtros.'}</div>
          ) : (
            <div className="ax-table-wrap">
              <table className="ax-table ax-table--hover">
                <thead className="ax-table__head"><tr>
                  <th className="ax-table__th" scope="col">N.º</th><th className="ax-table__th" scope="col">Cliente</th><th className="ax-table__th" scope="col">Servicio</th><th className="ax-table__th" scope="col">Estado</th><th className="ax-table__th" scope="col">Envíos</th><th className="ax-table__th" scope="col">Fecha</th>
                </tr></thead>
                <tbody>
                  {visibles.map((c) => (
                    <tr key={c.id} className={`ax-table__row${selId === c.id ? ' is-selected' : ''}`} onClick={() => setSelId(c.id)} style={{ cursor: 'pointer' }}>
                      <td className="ax-table__td" style={{ fontFamily: 'var(--ax-font-mono)', fontSize: 'var(--ax-text-xs)' }}>{c.numero ?? '—'}</td>
                      <td className="ax-table__td"><div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{c.clienteNombre}</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{c.clienteEmpresa ?? c.clienteEmail}</div></td>
                      <td className="ax-table__td">{c.servicio.nombre}</td>
                      <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--pill ${est(c.estado).badge}`}>{est(c.estado).label}</span></td>
                      <td className="ax-table__td">{c._count?.envios || '—'}</td>
                      <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)' }}>{fecha(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selId && (
          <section className="ax-card ax-col--6" aria-label="Detalle de la cotización">
            {!sel ? <div className="ax-card__body">Cargando…</div> : (
              <>
                <div className="ax-card__header">
                  <div className="ax-card__titles"><h2 className="ax-card__title">{sel.numero ?? 'Cotización'} · {sel.servicio.nombre}</h2><p className="ax-card__subtitle">Solicitada el {fecha(sel.createdAt)}{sel.atendidoPor ? ` · última gestión: ${sel.atendidoPor}` : ''}</p></div>
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setSelId(null)}>Cerrar</button>
                </div>
                <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
                  <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--ax-space-2) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', margin: 0 }}>
                    <dt style={{ color: 'var(--ax-text-muted)' }}>Cliente</dt><dd style={{ margin: 0 }}>{sel.clienteNombre}{sel.clienteEmpresa ? ` · ${sel.clienteEmpresa}` : ''}</dd>
                    <dt style={{ color: 'var(--ax-text-muted)' }}>Correo</dt><dd style={{ margin: 0, wordBreak: 'break-all' }}><a href={`mailto:${sel.clienteEmail}`}>{sel.clienteEmail}</a></dd>
                    <dt style={{ color: 'var(--ax-text-muted)' }}>Celular</dt><dd style={{ margin: 0 }}>{sel.clienteTelefono ? <a href={`https://wa.me/51${sel.clienteTelefono}`} target="_blank" rel="noreferrer">{sel.clienteTelefono} (WhatsApp)</a> : 'No dejó celular'}</dd>
                    {sel.mensaje && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Pidió</dt><dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{sel.mensaje}</dd></>)}
                  </dl>

                  <div className="ax-field">
                    <label className="ax-label" htmlFor="cot-estado">Estado</label>
                    <select id="cot-estado" className="ax-select" value={sel.estado} disabled={busy} onChange={(e) => guardar({ estado: e.target.value })}>
                      {ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                    </select>
                  </div>

                  <div className="ax-field">
                    <label className="ax-label" htmlFor="cot-propuesta">Propuesta para el cliente</label>
                    <textarea id="cot-propuesta" className="ax-input" rows={6} placeholder="Alcance, entregables, plazos, condiciones…" value={form.propuesta} onChange={(e) => setForm({ ...form, propuesta: e.target.value })} />
                  </div>
                  <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
                    <div className="ax-field" style={{ flex: '1 1 120px' }}><label className="ax-label" htmlFor="cot-monto">Monto</label><input id="cot-monto" type="number" min={0} step="0.01" className="ax-input" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} /></div>
                    <div className="ax-field" style={{ flex: '0 1 100px' }}><label className="ax-label" htmlFor="cot-moneda">Moneda</label><select id="cot-moneda" className="ax-select" value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value as 'USD' | 'PEN' })}><option value="USD">USD</option><option value="PEN">PEN</option></select></div>
                    <div className="ax-field" style={{ flex: '1 1 120px' }}><label className="ax-label" htmlFor="cot-validez">Vigencia (días, 0 = sin límite)</label><input id="cot-validez" type="number" min={0} max={365} className="ax-input" value={form.validezDias} onChange={(e) => setForm({ ...form, validezDias: e.target.value })} /></div>
                  </div>
                  <div className="ax-field"><label className="ax-label" htmlFor="cot-notas">Notas internas (el cliente no las ve)</label><textarea id="cot-notas" className="ax-input" rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} /></div>

                  <div className="ax-field"><label className="ax-label" htmlFor="cot-extra">Mensaje adicional al enviar (opcional)</label><input id="cot-extra" className="ax-input" placeholder="Ej.: Quedo atento a tus comentarios." value={extra} onChange={(e) => setExtra(e.target.value)} /></div>
                  <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                    <button type="button" className="ax-btn ax-btn--secondary" disabled={busy} onClick={() => guardar()}>Guardar</button>
                    <button type="button" className="ax-btn ax-btn--primary" disabled={busy} onClick={() => enviar('EMAIL')}>Enviar por correo</button>
                    <button type="button" className="ax-btn ax-btn--primary" disabled={busy || !sel.clienteTelefono} title={sel.clienteTelefono ? '' : 'El cliente no dejó celular'} onClick={() => enviar('WHATSAPP')}>Enviar por WhatsApp</button>
                    <button type="button" className="ax-btn ax-btn--ghost" style={{ color: 'var(--ax-danger-500)', marginInlineStart: 'auto' }} onClick={eliminar}>Eliminar</button>
                  </div>

                  <div>
                    <h3 style={{ fontSize: 'var(--ax-text-sm)', margin: '0 0 var(--ax-space-2)' }}>Historial de envíos ({sel.envios?.length ?? 0})</h3>
                    {(sel.envios ?? []).length === 0 ? <p style={{ color: 'var(--ax-text-muted)', margin: 0 }}>Todavía no se ha enviado al cliente.</p> : (
                      <ul className="ax-list">
                        {sel.envios!.map((e) => (
                          <li key={e.id} className="ax-list__row" style={{ paddingInline: 0 }}>
                            <span className="ax-list__content"><span className="ax-list__title">{e.canal === 'EMAIL' ? 'Correo' : 'WhatsApp'} → {e.destinatario}</span><span className="ax-list__meta">{fecha(e.createdAt)} · {e.enviadoPor}</span></span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {delCliente.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: 'var(--ax-text-sm)', margin: '0 0 var(--ax-space-2)' }}>Otras cotizaciones de este cliente ({delCliente.length})</h3>
                      <ul className="ax-list">
                        {delCliente.map((c) => (
                          <li key={c.id} className="ax-list__row" style={{ paddingInline: 0, cursor: 'pointer' }} onClick={() => setSelId(c.id)}>
                            <span className="ax-list__content"><span className="ax-list__title">{c.servicio.nombre}</span><span className="ax-list__meta">{c.numero} · {fecha(c.createdAt)}</span></span>
                            <span className="ax-list__trailing"><span className={`ax-badge ax-badge--soft ax-badge--pill ${est(c.estado).badge}`}>{est(c.estado).label}</span></span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </>
  );
}

export default SolucionesCotizaciones;
