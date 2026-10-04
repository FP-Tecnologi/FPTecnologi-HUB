'use client';
/*
 * FPTecnologi-HUB — Ecommerce → Presupuestos (GET/PATCH /presupuestos, POST /presupuestos/:id/enviar):
 * presupuestos que generan los clientes mayoristas desde el carrito de la web (mínimo 6 unidades por
 * producto, precios de mayorista). El equipo comercial les da seguimiento (estado) y puede reenviar el
 * enlace al documento al correo del cliente.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Estado = 'PENDIENTE' | 'EN_REVISION' | 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA';
interface Item { id: string; sku: string; nombre: string; cantidad: number; precioLista: string; precioUnitario: string; mayorista: boolean; subtotal: string }
interface Presupuesto {
  id: string; numero: string; estado: Estado;
  clienteNombre: string; clienteDocumento: string | null; clienteEmail: string; clienteTelefono: string | null; clienteDireccion: string | null;
  notas: string | null; moneda: string; subtotal: string; igv: string; total: string; validezHasta: string; origen: string | null; createdAt: string;
  _count?: { items: number };
  items?: Item[];
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
const usd = (n: string | number) => `US$ ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const errMsg = (e: unknown, fb: string) => (e instanceof ApiError ? e.message : fb);

export function EcommercePresupuestos() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Presupuesto[]>([]);
  const [filtro, setFiltro] = useState<Estado | 'TODAS'>('TODAS');
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [sel, setSel] = useState<Presupuesto | null>(null);
  const [busy, setBusy] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try { setLista(await api.get<Presupuesto[]>('/presupuestos')); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudieron cargar los presupuestos.') }); }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);
  // Enlace desde la notificación: /ecommerce/presupuestos?id=…
  useEffect(() => { const id = new URLSearchParams(window.location.search).get('id'); if (id) setSelId(id); }, []);

  useEffect(() => {
    setSel(null);
    if (selId) api.get<Presupuesto>(`/presupuestos/${selId}`).then(setSel).catch((e) => setAviso({ ok: false, texto: errMsg(e, 'No se pudo abrir el presupuesto.') }));
  }, [selId]);

  const conteo = useMemo(() => Object.fromEntries(ESTADOS.map((e) => [e.v, lista.filter((p) => p.estado === e.v).length])), [lista]);
  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter((p) => (filtro === 'TODAS' || p.estado === filtro) && (!t || `${p.numero} ${p.clienteNombre} ${p.clienteEmail} ${p.clienteDocumento ?? ''}`.toLowerCase().includes(t)));
  }, [lista, filtro, q]);

  async function cambiarEstado(estado: Estado) {
    if (!sel) return;
    setBusy(true); setAviso(null);
    try {
      setSel(await api.patch<Presupuesto>(`/presupuestos/${sel.id}`, { estado }));
      setAviso({ ok: true, texto: 'Estado actualizado.' });
      await cargar();
    } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo cambiar el estado.') }); }
    finally { setBusy(false); }
  }

  async function reenviar() {
    if (!sel) return;
    setBusy(true); setAviso(null);
    try {
      const r = await api.post<{ ok: true; destinatario: string }>(`/presupuestos/${sel.id}/enviar`, {});
      setAviso({ ok: true, texto: `Presupuesto enviado por correo a ${r.destinatario}.` });
      await cargar();
      setSel(await api.get<Presupuesto>(`/presupuestos/${sel.id}`));
    } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo enviar el correo.') }); }
    finally { setBusy(false); }
  }

  async function eliminar() {
    if (!sel || !window.confirm(`¿Eliminar el presupuesto ${sel.numero}? No se puede deshacer.`)) return;
    try { await api.delete(`/presupuestos/${sel.id}`); setSelId(null); await cargar(); setAviso({ ok: true, texto: 'Presupuesto eliminado.' }); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo eliminar.') }); }
  }

  return (
    <>
      <PageHead title="Presupuestos mayoristas" subtitle="Presupuestos que arman los clientes mayoristas desde el carrito (mínimo 6 unidades por producto): dales seguimiento y reenvía el documento por correo." />
      <div className="ax-dash-grid">
        {aviso && (
          <div role={aviso.ok ? 'status' : 'alert'} className={`ax-alert ax-col--12 ${aviso.ok ? 'ax-alert--success' : 'ax-alert--danger'}`} style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
            <div className="ax-alert__content"><p className="ax-alert__message">{aviso.texto}</p></div>
          </div>
        )}

        <section className="ax-card ax-col--12" aria-label="Filtros">
          <div className="ax-card__body ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Estado">
              <button type="button" role="radio" aria-checked={filtro === 'TODAS'} className={`ax-btn ax-btn--sm${filtro === 'TODAS' ? ' is-selected' : ''}`} onClick={() => setFiltro('TODAS')}>Todos ({lista.length})</button>
              {ESTADOS.map((e) => (
                <button key={e.v} type="button" role="radio" aria-checked={filtro === e.v} className={`ax-btn ax-btn--sm${filtro === e.v ? ' is-selected' : ''}`} onClick={() => setFiltro(e.v)}>{e.label} ({conteo[e.v]})</button>
              ))}
            </div>
            <input type="search" className="ax-input" placeholder="Buscar por cliente, correo, RUC/DNI o número…" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 340 }} />
          </div>
        </section>

        <section className={`ax-card ${selId ? 'ax-col--6' : 'ax-col--12'}`} aria-label="Lista de presupuestos">
          {visibles.length === 0 ? (
            <div className="ax-card__body" style={{ textAlign: 'center', color: 'var(--ax-text-muted)', paddingBlock: 'var(--ax-space-8)' }}>{lista.length === 0 ? 'Aún no hay presupuestos: se crean cuando un cliente mayorista pide su presupuesto desde el carrito.' : 'Ningún presupuesto coincide con el filtro.'}</div>
          ) : (
            <div className="ax-table-wrap">
              <table className="ax-table ax-table--hover">
                <thead className="ax-table__head"><tr>
                  <th className="ax-table__th" scope="col">N.º</th><th className="ax-table__th" scope="col">Cliente</th><th className="ax-table__th" scope="col">Total</th><th className="ax-table__th" scope="col">Estado</th><th className="ax-table__th" scope="col">Fecha</th>
                </tr></thead>
                <tbody>
                  {visibles.map((p) => (
                    <tr key={p.id} className={`ax-table__row${selId === p.id ? ' is-selected' : ''}`} onClick={() => setSelId(p.id)} style={{ cursor: 'pointer' }}>
                      <td className="ax-table__td" style={{ fontFamily: 'var(--ax-font-mono)', fontSize: 'var(--ax-text-xs)' }}>{p.numero}</td>
                      <td className="ax-table__td"><div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{p.clienteNombre}</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{p._count?.items ?? 0} productos</div></td>
                      <td className="ax-table__td" style={{ fontFamily: 'var(--ax-font-mono)' }}>{usd(p.total)}</td>
                      <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--pill ${est(p.estado).badge}`}>{est(p.estado).label}</span></td>
                      <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)' }}>{fecha(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selId && (
          <section className="ax-card ax-col--6" aria-label="Detalle del presupuesto">
            {!sel ? <div className="ax-card__body">Cargando…</div> : (
              <>
                <div className="ax-card__header">
                  <div className="ax-card__titles"><h2 className="ax-card__title">{sel.numero}</h2><p className="ax-card__subtitle">Solicitado el {fecha(sel.createdAt)} · válido hasta {fecha(sel.validezHasta)}</p></div>
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setSelId(null)}>Cerrar</button>
                </div>
                <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
                  <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--ax-space-2) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', margin: 0 }}>
                    <dt style={{ color: 'var(--ax-text-muted)' }}>Cliente</dt><dd style={{ margin: 0 }}>{sel.clienteNombre}</dd>
                    {sel.clienteDocumento && (<><dt style={{ color: 'var(--ax-text-muted)' }}>{sel.clienteDocumento.length === 11 ? 'RUC' : 'DNI'}</dt><dd style={{ margin: 0 }}>{sel.clienteDocumento}</dd></>)}
                    <dt style={{ color: 'var(--ax-text-muted)' }}>Correo</dt><dd style={{ margin: 0, wordBreak: 'break-all' }}><a href={`mailto:${sel.clienteEmail}`}>{sel.clienteEmail}</a></dd>
                    <dt style={{ color: 'var(--ax-text-muted)' }}>Celular</dt><dd style={{ margin: 0 }}>{sel.clienteTelefono ? <a href={`https://wa.me/51${sel.clienteTelefono}`} target="_blank" rel="noreferrer">{sel.clienteTelefono}</a> : '—'}</dd>
                    {sel.clienteDireccion && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Dirección</dt><dd style={{ margin: 0 }}>{sel.clienteDireccion}</dd></>)}
                    {sel.notas && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Notas</dt><dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{sel.notas}</dd></>)}
                  </dl>

                  <div className="ax-field">
                    <label className="ax-label" htmlFor="pre-estado">Estado</label>
                    <select id="pre-estado" className="ax-select" value={sel.estado} disabled={busy} onChange={(e) => cambiarEstado(e.target.value as Estado)}>
                      {ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                    </select>
                  </div>

                  <div className="ax-table-wrap">
                    <table className="ax-table">
                      <thead className="ax-table__head"><tr>
                        <th className="ax-table__th" scope="col">Producto</th><th className="ax-table__th" scope="col">Cant.</th><th className="ax-table__th" scope="col">P. unit.</th><th className="ax-table__th" scope="col">Subtotal</th>
                      </tr></thead>
                      <tbody>
                        {(sel.items ?? []).map((i) => (
                          <tr key={i.id} className="ax-table__row">
                            <td className="ax-table__td"><div>{i.nombre}</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>SKU {i.sku}{i.mayorista ? ' · precio mayorista' : ' · sin precio mayorista (se usó el normal)'}</div></td>
                            <td className="ax-table__td">{i.cantidad}</td>
                            <td className="ax-table__td" style={{ fontFamily: 'var(--ax-font-mono)' }}>{usd(i.precioUnitario)}</td>
                            <td className="ax-table__td" style={{ fontFamily: 'var(--ax-font-mono)' }}>{usd(i.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <dl style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--ax-space-1) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', margin: 0, marginInlineStart: 'auto', minWidth: 220 }}>
                    <dt style={{ color: 'var(--ax-text-muted)' }}>Subtotal</dt><dd style={{ margin: 0, textAlign: 'right', fontFamily: 'var(--ax-font-mono)' }}>{usd(sel.subtotal)}</dd>
                    <dt style={{ color: 'var(--ax-text-muted)' }}>IGV (18%)</dt><dd style={{ margin: 0, textAlign: 'right', fontFamily: 'var(--ax-font-mono)' }}>{usd(sel.igv)}</dd>
                    <dt style={{ fontWeight: 'var(--ax-weight-semibold)' }}>Total</dt><dd style={{ margin: 0, textAlign: 'right', fontFamily: 'var(--ax-font-mono)', fontWeight: 'var(--ax-weight-semibold)' }}>{usd(sel.total)}</dd>
                  </dl>

                  <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                    <button type="button" className="ax-btn ax-btn--primary" disabled={busy} onClick={reenviar}>Enviar por correo</button>
                    <button type="button" className="ax-btn ax-btn--ghost" style={{ color: 'var(--ax-danger-500)', marginInlineStart: 'auto' }} onClick={eliminar}>Eliminar</button>
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </>
  );
}

export default EcommercePresupuestos;
