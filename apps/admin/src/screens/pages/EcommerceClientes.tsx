'use client';
/*
 * FPTecnologi-HUB — Ecommerce → Clientes (GET /clientes-tienda): compradores de la tienda agrupados por correo,
 * con cuántos pedidos hicieron, cuánto gastaron y cuántas cotizaciones de servicios pidieron. Al elegir uno
 * se ven sus pedidos y cotizaciones y se le puede escribir por WhatsApp o correo.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Cliente { email: string; nombre: string; celular: string; documento: string | null; pedidos: number; gastado: number; ultimoPedido: string; cotizaciones: number }
interface Detalle {
  pedidos: { id: string; numeroPedido: string | null; estado: string; estadoPago: string; total: string; moneda: string; createdAt: string }[];
  cotizaciones: { id: string; numero: string | null; estado: string; monto: string | null; moneda: string; createdAt: string; servicio: { nombre: string } }[];
}

const usd = (n: number | string) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
const etiqueta = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ');

export function EcommerceClientes() {
  const { activeMarcaId } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Cliente | null>(null);
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [err, setErr] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    setCargando(true);
    try { setClientes(await api.get<Cliente[]>('/clientes-tienda')); setErr(''); }
    catch (e) { setErr(e instanceof ApiError ? e.message : 'No se pudieron cargar los clientes.'); }
    finally { setCargando(false); }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);

  useEffect(() => {
    setDetalle(null);
    if (!sel) return;
    api.get<Detalle>(`/clientes-tienda/detalle?email=${encodeURIComponent(sel.email)}`).then(setDetalle).catch(() => setDetalle({ pedidos: [], cotizaciones: [] }));
  }, [sel]);

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    return clientes.filter((c) => !t || `${c.nombre} ${c.email} ${c.celular} ${c.documento ?? ''}`.toLowerCase().includes(t));
  }, [clientes, q]);
  const totalGastado = clientes.reduce((s, c) => s + c.gastado, 0);

  return (
    <>
      <PageHead title="Clientes" subtitle="Compradores de la tienda y personas que pidieron cotizaciones de servicios." />
      <div className="ax-dash-grid">
        {err && <div role="alert" className="ax-alert ax-alert--danger ax-col--12" style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{err}</p></div></div>}

        <section className="ax-card ax-col--12" aria-label="Resumen">
          <div className="ax-card__body ax-cluster" style={{ gap: 'var(--ax-space-6)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-6)' }}>
              <div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>Clientes</div><strong style={{ fontSize: 'var(--ax-text-xl)' }}>{clientes.length}</strong></div>
              <div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>Ventas acumuladas</div><strong style={{ fontSize: 'var(--ax-text-xl)' }}>{usd(totalGastado)}</strong></div>
              <div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>Recurrentes (2+ pedidos)</div><strong style={{ fontSize: 'var(--ax-text-xl)' }}>{clientes.filter((c) => c.pedidos > 1).length}</strong></div>
            </div>
            <input type="search" className="ax-input" placeholder="Buscar por nombre, correo, celular o documento…" aria-label="Buscar clientes" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 340 }} />
          </div>
        </section>

        <section className={`ax-card ${sel ? 'ax-col--7' : 'ax-col--12'}`} aria-label="Lista de clientes">
          {filtrados.length === 0 ? (
            <div className="ax-card__body" style={{ textAlign: 'center', color: 'var(--ax-text-muted)', paddingBlock: 'var(--ax-space-8)' }}>{cargando ? 'Cargando…' : clientes.length === 0 ? 'Aún no hay clientes: aparecen cuando alguien confirma un pedido en la tienda.' : 'Ningún cliente coincide con la búsqueda.'}</div>
          ) : (
            <div className="ax-table-wrap">
              <table className="ax-table ax-table--hover">
                <thead className="ax-table__head"><tr>
                  <th className="ax-table__th" scope="col">Cliente</th>
                  <th className="ax-table__th" scope="col">Pedidos</th>
                  <th className="ax-table__th" scope="col">Gastado</th>
                  <th className="ax-table__th" scope="col">Cotizaciones</th>
                  <th className="ax-table__th" scope="col">Último pedido</th>
                </tr></thead>
                <tbody>
                  {filtrados.map((c) => (
                    <tr key={c.email} className={`ax-table__row${sel?.email === c.email ? ' is-selected' : ''}`} onClick={() => setSel(c)} style={{ cursor: 'pointer' }}>
                      <td className="ax-table__td"><div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{c.nombre}</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{c.email}</div></td>
                      <td className="ax-table__td">{c.pedidos}</td>
                      <td className="ax-table__td" style={{ fontVariantNumeric: 'tabular-nums' }}>{usd(c.gastado)}</td>
                      <td className="ax-table__td">{c.cotizaciones || '—'}</td>
                      <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)' }}>{fecha(c.ultimoPedido)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {sel && (
          <section className="ax-card ax-col--5" aria-label="Detalle del cliente">
            <div className="ax-card__header">
              <div className="ax-card__titles"><h2 className="ax-card__title">{sel.nombre}</h2><p className="ax-card__subtitle">{sel.documento ? `${sel.documento.length === 11 ? 'RUC' : 'DNI'} ${sel.documento}` : 'Sin documento'}</p></div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setSel(null)}>Cerrar</button>
            </div>
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
                <a className="ax-btn ax-btn--secondary ax-btn--sm" href={`https://wa.me/51${sel.celular}`} target="_blank" rel="noreferrer">WhatsApp {sel.celular}</a>
                <a className="ax-btn ax-btn--ghost ax-btn--sm" href={`mailto:${sel.email}`}>{sel.email}</a>
              </div>

              <div>
                <h3 style={{ fontSize: 'var(--ax-text-sm)', margin: '0 0 var(--ax-space-2)' }}>Pedidos ({sel.pedidos})</h3>
                {!detalle ? <p style={{ color: 'var(--ax-text-muted)' }}>Cargando…</p> : detalle.pedidos.length === 0 ? <p style={{ color: 'var(--ax-text-muted)' }}>Sin pedidos.</p> : (
                  <ul className="ax-list">
                    {detalle.pedidos.map((p) => (
                      <li key={p.id} className="ax-list__row" style={{ paddingInline: 0 }}>
                        <span className="ax-list__content"><span className="ax-list__title">{p.numeroPedido ?? p.id.slice(0, 8)}</span><span className="ax-list__meta">{fecha(p.createdAt)} · {etiqueta(p.estado)} · pago {etiqueta(p.estadoPago)}</span></span>
                        <span className="ax-list__trailing" style={{ fontVariantNumeric: 'tabular-nums' }}>{usd(p.total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: 'var(--ax-text-sm)', margin: '0 0 var(--ax-space-2)' }}>Cotizaciones de servicios ({detalle?.cotizaciones.length ?? sel.cotizaciones})</h3>
                {!detalle ? null : detalle.cotizaciones.length === 0 ? <p style={{ color: 'var(--ax-text-muted)' }}>Sin cotizaciones.</p> : (
                  <ul className="ax-list">
                    {detalle.cotizaciones.map((c) => (
                      <li key={c.id} className="ax-list__row" style={{ paddingInline: 0 }}>
                        <span className="ax-list__content"><span className="ax-list__title">{c.servicio.nombre}</span><span className="ax-list__meta">{c.numero ?? ''} · {fecha(c.createdAt)} · {etiqueta(c.estado)}</span></span>
                        <span className="ax-list__trailing">{c.monto ? `${c.moneda} ${Number(c.monto).toFixed(2)}` : '—'}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <a className="ax-link" href="/soluciones/cotizaciones" style={{ fontSize: 'var(--ax-text-xs)' }}>Gestionar en Soluciones → Cotizaciones</a>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default EcommerceClientes;
