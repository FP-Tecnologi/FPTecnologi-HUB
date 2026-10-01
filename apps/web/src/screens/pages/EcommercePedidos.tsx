'use client';
/*
 * FPTecnologi-HUB — Ecommerce → Pedidos (GET /pedidos). Pedidos del checkout de
 * la web: filtro por estado, búsqueda, detalle con los datos del comprador y los
 * ítems (copia de la venta), cambio de estado y de pago. Cancelar un pedido
 * devuelve el stock (lo hace la API). Exporta lo filtrado a CSV.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Estado = 'PENDIENTE' | 'PAGADO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';
type Pago = 'PENDIENTE' | 'POR_CONFIRMAR' | 'PAGADO';

interface Item {
  id: string;
  cantidad: number;
  precioUnitario: string;
  igvUnitario: string;
  subtotal: string;
  nombreSnapshot: string;
  skuSnapshot: string;
  producto?: { nombre: string; sku: string } | null;
}
interface Pedido {
  id: string;
  numeroPedido: string | null;
  nombre: string;
  email: string;
  celular: string;
  documento: string | null;
  direccion: string | null;
  distrito: string | null;
  notas: string | null;
  envio: string;
  envioProveedor: string | null;
  envioDepartamento: string | null;
  envioSede: string | null;
  envioPlazo: string | null;
  trackingCodigo: string | null;
  estado: Estado;
  estadoPago: Pago;
  metodoPago: string | null;
  subtotal: string;
  igv: string;
  total: string;
  moneda: string;
  createdAt: string;
  items: Item[];
}

const ESTADOS: { v: Estado; label: string; badge: string }[] = [
  { v: 'PENDIENTE', label: 'Pendiente', badge: 'ax-badge--warning' },
  { v: 'PAGADO', label: 'Pagado', badge: 'ax-badge--info' },
  { v: 'ENVIADO', label: 'Enviado', badge: 'ax-badge--info' },
  { v: 'ENTREGADO', label: 'Entregado', badge: 'ax-badge--success' },
  { v: 'CANCELADO', label: 'Cancelado', badge: 'ax-badge--danger' },
];
const PAGOS: { v: Pago; label: string; badge: string }[] = [
  { v: 'PENDIENTE', label: 'Pago pendiente', badge: 'ax-badge--neutral' },
  { v: 'POR_CONFIRMAR', label: 'Por confirmar', badge: 'ax-badge--warning' },
  { v: 'PAGADO', label: 'Pagado', badge: 'ax-badge--success' },
];
const METODOS: Record<string, string> = { TRANSFERENCIA: 'Transferencia', YAPE_PLIN: 'Yape / Plin', EFECTIVO: 'Efectivo' };

const estadoMeta = (e: Estado) => ESTADOS.find((x) => x.v === e)!;
const pagoMeta = (e: Pago) => PAGOS.find((x) => x.v === e) ?? PAGOS[0];
const usd = (v: string | number) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const numero = (p: Pedido) => p.numeroPedido ?? p.id.slice(0, 8);

function csv(lista: Pedido[]) {
  const cab = ['Pedido', 'Fecha', 'Comprador', 'Correo', 'Celular', 'Documento', 'Estado', 'Pago', 'Método', 'Subtotal', 'IGV', 'Total', 'Ítems'];
  const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
  const filas = lista.map((p) => [numero(p), fecha(p.createdAt), p.nombre, p.email, p.celular, p.documento ?? '', estadoMeta(p.estado).label, pagoMeta(p.estadoPago).label, METODOS[p.metodoPago ?? ''] ?? p.metodoPago ?? '', p.subtotal, p.igv, p.total, p.items.map((i) => `${i.cantidad}× ${i.skuSnapshot || i.producto?.sku}`).join(' | ')]);
  const blob = new Blob(['﻿' + [cab, ...filas].map((f) => f.map((c) => esc(String(c))).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function EcommercePedidos() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<'' | Estado>('');
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      setLista(await api.get<Pedido[]>('/pedidos'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const sel = lista.find((p) => p.id === selId) ?? null;
  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter((p) => (!filtro || p.estado === filtro) && (!t || `${numero(p)} ${p.nombre} ${p.email} ${p.celular} ${p.documento ?? ''}`.toLowerCase().includes(t)));
  }, [lista, filtro, q]);
  const cuenta = (e: '' | Estado) => lista.filter((p) => !e || p.estado === e).length;

  async function actualizar(p: Pedido, cambios: { estado?: Estado; estadoPago?: Pago; trackingCodigo?: string }) {
    if (cambios.estado === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido ${numero(p)}? El stock de sus productos volverá al inventario y no se podrá reactivar.`)) return;
    setGuardando(true);
    try {
      await api.patch(`/pedidos/${p.id}/estado`, cambios);
      await cargar(); // recarga: cancelar también cambia el stock
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <PageHead
        title="Pedidos"
        subtitle="Compras hechas desde el checkout de la tienda. Coordina el pago y la entrega por WhatsApp y actualiza el estado."
        actions={
          <button type="button" className="ax-btn ax-btn--secondary" disabled={visibles.length === 0} onClick={() => csv(visibles)}>
            <span className="ax-btn__label">Exportar CSV</span>
          </button>
        }
      />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <div className="ax-dash-grid">
        <section className={`ax-card ${sel ? 'ax-col--7' : 'ax-col--12'}`} role="region" aria-label="Pedidos" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body">
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
              <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Filtrar por estado">
                {([{ v: '' as const, label: 'Todos' }, ...ESTADOS] as { v: '' | Estado; label: string }[]).map((e) => (
                  <button key={e.label} type="button" role="radio" aria-checked={filtro === e.v} className={`ax-btn ax-btn--sm${filtro === e.v ? ' is-selected' : ''}`} onClick={() => setFiltro(e.v)}>
                    {e.label} ({cuenta(e.v)})
                  </button>
                ))}
              </div>
              </div>
              <input type="search" className="ax-input" placeholder="Buscar pedido, nombre, documento…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar pedidos" style={{ maxWidth: 300 }} />
            </div>
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col">Pedido</th>
                  <th className="ax-table__th" scope="col">Comprador</th>
                  <th className="ax-table__th" scope="col">Estado</th>
                  <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={4}>Cargando…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={4} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay pedidos.' : 'Ningún pedido coincide con el filtro.'}</td></tr>
                ) : (
                  visibles.map((p) => (
                    <tr key={p.id} className="ax-table__row" onClick={() => setSelId(p.id)} style={{ cursor: 'pointer', background: p.id === selId ? 'var(--ax-surface-subtle)' : undefined }}>
                      <td className="ax-table__td">
                        <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{numero(p)}</div>
                        <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{fecha(p.createdAt)}</div>
                      </td>
                      <td className="ax-table__td">
                        <div>{p.nombre}</div>
                        <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{p.items.length} producto{p.items.length === 1 ? '' : 's'}</div>
                      </td>
                      <td className="ax-table__td">
                        <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)' }}>
                          <span className={`ax-badge ax-badge--soft ax-badge--sm ${estadoMeta(p.estado).badge}`}>{estadoMeta(p.estado).label}</span>
                          <span className={`ax-badge ax-badge--soft ax-badge--sm ${pagoMeta(p.estadoPago).badge}`}>{pagoMeta(p.estadoPago).label}</span>
                        </div>
                      </td>
                      <td className="ax-table__td" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{usd(p.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {sel && (
          <section className="ax-card ax-col--5" role="region" aria-label="Detalle del pedido">
            <div className="ax-card__header">
              <div className="ax-card__titles">
                <h2 className="ax-card__title">{numero(sel)}</h2>
                <p className="ax-card__subtitle">{fecha(sel.createdAt)}</p>
              </div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setSelId(null)}>Cerrar</button>
            </div>
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--ax-space-2) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', margin: 0 }}>
                <dt style={{ color: 'var(--ax-text-muted)' }}>Comprador</dt><dd style={{ margin: 0 }}>{sel.nombre}</dd>
                {sel.documento && (<><dt style={{ color: 'var(--ax-text-muted)' }}>{sel.documento.length === 11 ? 'RUC' : 'DNI'}</dt><dd style={{ margin: 0 }}>{sel.documento}</dd></>)}
                <dt style={{ color: 'var(--ax-text-muted)' }}>Correo</dt><dd style={{ margin: 0, wordBreak: 'break-all' }}><a href={`mailto:${sel.email}`}>{sel.email}</a></dd>
                <dt style={{ color: 'var(--ax-text-muted)' }}>Celular</dt><dd style={{ margin: 0 }}><a href={`https://wa.me/51${sel.celular}`} target="_blank" rel="noreferrer">{sel.celular} (WhatsApp)</a></dd>
                {(sel.direccion || sel.distrito) && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Envío a</dt><dd style={{ margin: 0 }}>{[sel.direccion, sel.distrito].filter(Boolean).join(', ')}</dd></>)}
                {sel.envioProveedor && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Courier</dt><dd style={{ margin: 0 }}>{sel.envioProveedor} · {sel.envioDepartamento}{sel.envioSede ? ` · ${sel.envioSede}` : ''}{sel.envioPlazo ? ` (${sel.envioPlazo})` : ''}</dd></>)}
                <dt style={{ color: 'var(--ax-text-muted)' }}>Pago</dt><dd style={{ margin: 0 }}>{METODOS[sel.metodoPago ?? ''] ?? sel.metodoPago ?? '—'}</dd>
              </dl>

              {sel.notas && (
                <div className="ax-field">
                  <span className="ax-label">Notas</span>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 'var(--ax-text-sm)' }}>{sel.notas}</p>
                </div>
              )}

              <div className="ax-table-wrap">
                <table className="ax-table">
                  <thead className="ax-table__head">
                    <tr><th className="ax-table__th" scope="col">Producto</th><th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Cant.</th><th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {sel.items.map((i) => (
                      <tr key={i.id} className="ax-table__row">
                        <td className="ax-table__td">
                          <div style={{ fontSize: 'var(--ax-text-sm)' }}>{i.nombreSnapshot || i.producto?.nombre}</div>
                          <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{i.skuSnapshot || i.producto?.sku} · {usd(i.precioUnitario)} c/u</div>
                        </td>
                        <td className="ax-table__td" style={{ textAlign: 'right' }}>{i.cantidad}</td>
                        <td className="ax-table__td" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{usd(i.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <dl style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--ax-space-1) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', margin: 0 }}>
                <dt style={{ color: 'var(--ax-text-muted)' }}>Subtotal</dt><dd style={{ margin: 0, textAlign: 'right' }}>{usd(sel.subtotal)}</dd>
                <dt style={{ color: 'var(--ax-text-muted)' }}>IGV (18%)</dt><dd style={{ margin: 0, textAlign: 'right' }}>{usd(sel.igv)}</dd>
                {Number(sel.envio) > 0 && (<><dt style={{ color: 'var(--ax-text-muted)' }}>Envío</dt><dd style={{ margin: 0, textAlign: 'right' }}>{usd(sel.envio)}</dd></>)}
                <dt><strong>Total</strong></dt><dd style={{ margin: 0, textAlign: 'right' }}><strong>{usd(sel.total)}</strong></dd>
              </dl>

              <div className="ax-field">
                <label className="ax-label" htmlFor="ped-estado">Estado del pedido</label>
                <select id="ped-estado" className="ax-select" value={sel.estado} disabled={guardando || sel.estado === 'CANCELADO'} onChange={(e) => actualizar(sel, { estado: e.target.value as Estado })}>
                  {ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                </select>
                {sel.estado === 'CANCELADO' && <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Un pedido cancelado no se puede reactivar.</span>}
              </div>
              {sel.envioProveedor && (
                <div className="ax-field">
                  <label className="ax-label" htmlFor="ped-tracking">Código de seguimiento ({sel.envioProveedor})</label>
                  <input id="ped-tracking" key={sel.id} className="ax-input" defaultValue={sel.trackingCodigo ?? ''} placeholder="Se guarda al salir del campo" disabled={guardando}
                    onBlur={(e) => { if (e.target.value.trim() !== (sel.trackingCodigo ?? '')) void actualizar(sel, { trackingCodigo: e.target.value }); }} />
                </div>
              )}
              <div className="ax-field">
                <label className="ax-label" htmlFor="ped-pago">Estado del pago</label>
                <select id="ped-pago" className="ax-select" value={sel.estadoPago} disabled={guardando} onChange={(e) => actualizar(sel, { estadoPago: e.target.value as Pago })}>
                  {PAGOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                </select>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default EcommercePedidos;
