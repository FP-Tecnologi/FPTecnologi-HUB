'use client';
/*
 * FPTecnologi-HUB — Reportes → Ventas (GET /reportes/ventas): ventas por rango de fechas (hora de Lima) con
 * comparación contra el periodo anterior, ingresos por día, estados, medios de pago, entregas, top de productos
 * y clientes, y exportación a CSV (un archivo con el detalle de pedidos y otro con los productos más vendidos).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { ApexChart } from '../../components/charts/ApexChart';
import { Icon } from '../../components/ui/Icon';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Grupo { nombre: string; pedidos: number; total: number }
interface Reporte {
  rango: { desde: string; hasta: string; dias: number };
  kpis: { pedidos: number; pedidosValidos: number; cancelados: number; ventas: number; ticketPromedio: number; unidades: number; igv: number; envios: number; porCobrar: number; ventasPrevias: number; pedidosPrevios: number };
  porDia: { fecha: string; pedidos: number; ventas: number }[];
  porEstado: Grupo[]; porPago: Grupo[]; porEntrega: Grupo[]; porDepartamento: Grupo[];
  topProductos: { nombre: string; sku: string; unidades: number; total: number }[];
  topClientes: { nombre: string; email: string; pedidos: number; total: number }[];
  detalle?: { numero: string | null; fecha: string; cliente: string; email: string; estado: string; estadoPago: string; metodoPago: string | null; envio: number; igv: number; total: number }[];
}

const hoyLima = () => new Date(Date.now() - 5 * 3600_000).toISOString().slice(0, 10);
const restarDias = (iso: string, d: number) => new Date(new Date(`${iso}T00:00:00Z`).getTime() - d * 86_400_000).toISOString().slice(0, 10);
const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (n: number) => n.toLocaleString('es-PE');
const delta = (a: number, b: number) => (b === 0 ? null : ((a - b) / b) * 100);
const etiqueta = (e: string) => (e.length ? e.charAt(0) + e.slice(1).toLowerCase().replace(/_/g, ' ') : e);
const PRESETS: { id: string; label: string; dias: number }[] = [{ id: '7', label: '7 días', dias: 6 }, { id: '30', label: '30 días', dias: 29 }, { id: '90', label: '90 días', dias: 89 }, { id: '365', label: '12 meses', dias: 364 }];

function descargar(nombre: string, filas: (string | number | null)[][]) {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + filas.map((f) => f.map(esc).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}

function Kpi({ icon, tono, label, valor, pct }: { icon: string; tono: string; label: string; valor: string; pct?: number | null }) {
  return (
    <div className="ax-statgroup__cell">
      <span className={`ax-statgroup__icon ax-statgroup__icon--${tono}`}><Icon name={icon} /></span>
      <span className="ax-statgroup__text"><span className="ax-statgroup__label">{label}</span><span className="ax-statgroup__value ax-num">{valor}</span></span>
      {pct != null && <span className={`ax-statgroup__delta ax-statgroup__delta--${pct >= 0 ? 'up' : 'down'}`}>{pct >= 0 ? '+' : '−'}{Math.abs(pct).toFixed(1)}%</span>}
    </div>
  );
}

function Tabla({ titulo, filas, cols }: { titulo: string; filas: Grupo[]; cols?: 4 | 6 }) {
  return (
    <section className={`ax-card ax-col--${cols ?? 4}`} aria-label={titulo}>
      <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">{titulo}</h2></div></div>
      <div className="ax-card__body" style={{ paddingTop: 0 }}>
        {filas.length === 0 ? <p style={{ margin: 0, color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-sm)' }}>Sin datos en el periodo.</p> : (
          <ul className="ax-list ax-list--compact">
            {filas.map((f) => (
              <li key={f.nombre} className="ax-list__row" style={{ paddingInline: 0 }}>
                <span className="ax-list__content"><span className="ax-list__title">{etiqueta(f.nombre)}</span><span className="ax-list__meta">{f.pedidos} pedido{f.pedidos === 1 ? '' : 's'}</span></span>
                <span className="ax-list__trailing ax-num">{usd(f.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function ReportesVentas() {
  const { activeMarcaId } = useAuth();
  const [preset, setPreset] = useState('30');
  const [desde, setDesde] = useState(restarDias(hoyLima(), 29));
  const [hasta, setHasta] = useState(hoyLima());
  const [r, setR] = useState<Reporte | null>(null);
  const [err, setErr] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    setCargando(true); setErr('');
    try { setR(await api.get<Reporte>(`/reportes/ventas?desde=${desde}&hasta=${hasta}&detalle=1`)); }
    catch (e) { setErr(e instanceof ApiError ? e.message : 'No se pudo cargar el reporte.'); setR(null); }
    finally { setCargando(false); }
  }, [activeMarcaId, desde, hasta]);
  useEffect(() => { void cargar(); }, [cargar]);

  function elegir(p: (typeof PRESETS)[number]) {
    setPreset(p.id); setHasta(hoyLima()); setDesde(restarDias(hoyLima(), p.dias));
  }

  const k = r?.kpis;
  const etiquetasDias = useMemo(() => (r?.porDia ?? []).map((d) => d.fecha.slice(5).replace('-', '/')), [r]);

  return (
    <>
      <PageHead
        title="Reporte de ventas"
        subtitle="Pedidos de la tienda por periodo (hora de Lima). Las ventas no incluyen pedidos cancelados; montos en USD con IGV."
        actions={
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
            <button type="button" className="ax-btn ax-btn--secondary" disabled={!r?.detalle?.length} onClick={() => r?.detalle && descargar(`ventas-${desde}_a_${hasta}.csv`, [['Pedido', 'Fecha', 'Cliente', 'Correo', 'Estado', 'Pago', 'Medio de pago', 'Envío', 'IGV', 'Total'], ...r.detalle.map((d) => [d.numero, d.fecha, d.cliente, d.email, d.estado, d.estadoPago, d.metodoPago, d.envio, d.igv, d.total])])}>Exportar pedidos (CSV)</button>
            <button type="button" className="ax-btn ax-btn--ghost" disabled={!r?.topProductos.length} onClick={() => r && descargar(`productos-mas-vendidos-${desde}_a_${hasta}.csv`, [['Producto', 'SKU', 'Unidades', 'Total'], ...r.topProductos.map((p) => [p.nombre, p.sku, p.unidades, p.total])])}>Exportar productos</button>
          </div>
        }
      />
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" aria-label="Periodo">
          <div className="ax-card__body ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Periodo rápido">
              {PRESETS.map((p) => <button key={p.id} type="button" role="radio" aria-checked={preset === p.id} className={`ax-btn ax-btn--sm${preset === p.id ? ' is-selected' : ''}`} onClick={() => elegir(p)}>{p.label}</button>)}
            </div>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', alignItems: 'center' }}>
              <label className="ax-label" htmlFor="rep-desde" style={{ margin: 0 }}>Desde</label>
              <input id="rep-desde" type="date" className="ax-input" value={desde} max={hasta} onChange={(e) => { setPreset(''); setDesde(e.target.value); }} />
              <label className="ax-label" htmlFor="rep-hasta" style={{ margin: 0 }}>Hasta</label>
              <input id="rep-hasta" type="date" className="ax-input" value={hasta} min={desde} max={hoyLima()} onChange={(e) => { setPreset(''); setHasta(e.target.value); }} />
            </div>
          </div>
        </section>

        {err && <div role="alert" className="ax-alert ax-alert--danger ax-col--12" style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{err}</p></div></div>}
        {cargando && !r && <p className="ax-col--12" style={{ color: 'var(--ax-text-muted)' }}>Cargando…</p>}

        {r && k && (
          <>
            <section className="ax-statgroup ax-col--12" aria-label="Indicadores">
              <Kpi icon="shopping-cart" tono="c1" label="Ventas" valor={usd(k.ventas)} pct={delta(k.ventas, k.ventasPrevias)} />
              <Kpi icon="article" tono="c2" label="Pedidos válidos" valor={num(k.pedidosValidos)} pct={delta(k.pedidosValidos, k.pedidosPrevios)} />
              <Kpi icon="user" tono="c3" label="Ticket promedio" valor={usd(k.ticketPromedio)} />
              <Kpi icon="folders" tono="c4" label="Unidades vendidas" valor={num(k.unidades)} />
            </section>
            <section className="ax-statgroup ax-col--12" aria-label="Detalle de montos">
              <Kpi icon="bell" tono="c1" label="Por cobrar (sin pago confirmado)" valor={usd(k.porCobrar)} />
              <Kpi icon="article" tono="c2" label="IGV incluido" valor={usd(k.igv)} />
              <Kpi icon="shopping-cart" tono="c3" label="Envíos cobrados" valor={usd(k.envios)} />
              <Kpi icon="files" tono="c4" label="Cancelados" valor={num(k.cancelados)} />
            </section>

            <section className="ax-card ax-col--8" aria-label="Ingresos por día">
              <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Ventas por día</h2><p className="ax-card__subtitle">{r.rango.desde} → {r.rango.hasta} ({r.rango.dias} días) · vs. periodo anterior: {usd(k.ventasPrevias)}</p></div></div>
              <div className="ax-card__body" style={{ paddingTop: 0 }}>
                {k.ventas > 0 ? (
                  <ApexChart type="area" height={300} legend="none" accent ariaLabel="Ventas por día" series={[{ name: 'Ventas', data: r.porDia.map((d) => d.ventas) }]} apex={{ xaxis: { categories: etiquetasDias, tickAmount: Math.min(etiquetasDias.length - 1, 10) } }} />
                ) : <p style={{ margin: 0, padding: 'var(--ax-space-6) 0', textAlign: 'center', color: 'var(--ax-text-subtle)' }}>No hay ventas en este periodo.</p>}
              </div>
            </section>
            <section className="ax-card ax-col--4" aria-label="Pedidos por estado">
              <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Pedidos por estado</h2></div></div>
              <div className="ax-card__body" style={{ paddingTop: 0 }}>
                {r.porEstado.length ? <ApexChart type="donut" height={260} legend="bottom" ariaLabel="Pedidos por estado" series={r.porEstado.map((e) => e.pedidos)} apex={{ labels: r.porEstado.map((e) => etiqueta(e.nombre)), stroke: { width: 0 } }} /> : <p style={{ margin: 0, color: 'var(--ax-text-subtle)' }}>Sin pedidos.</p>}
              </div>
            </section>

            <Tabla titulo="Medio de pago" filas={r.porPago} />
            <Tabla titulo="Entrega" filas={r.porEntrega} />
            <Tabla titulo="Envíos por departamento" filas={r.porDepartamento} />

            <section className="ax-card ax-col--6" aria-label="Productos más vendidos">
              <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Productos más vendidos</h2><p className="ax-card__subtitle">Por unidades</p></div></div>
              <div className="ax-card__body" style={{ paddingTop: 0 }}>
                {r.topProductos.length === 0 ? <p style={{ margin: 0, color: 'var(--ax-text-subtle)' }}>Sin ventas.</p> : (
                  <div className="ax-table-wrap"><table className="ax-table"><thead className="ax-table__head"><tr><th className="ax-table__th" scope="col">Producto</th><th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Unid.</th><th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Total</th></tr></thead>
                    <tbody>{r.topProductos.map((p) => <tr key={p.sku || p.nombre} className="ax-table__row"><td className="ax-table__td"><div style={{ fontSize: 'var(--ax-text-sm)' }}>{p.nombre}</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{p.sku}</div></td><td className="ax-table__td" style={{ textAlign: 'right' }}>{p.unidades}</td><td className="ax-table__td ax-num" style={{ textAlign: 'right' }}>{usd(p.total)}</td></tr>)}</tbody></table></div>
                )}
              </div>
            </section>
            <section className="ax-card ax-col--6" aria-label="Mejores clientes">
              <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Mejores clientes</h2><p className="ax-card__subtitle">Por monto comprado</p></div></div>
              <div className="ax-card__body" style={{ paddingTop: 0 }}>
                {r.topClientes.length === 0 ? <p style={{ margin: 0, color: 'var(--ax-text-subtle)' }}>Sin ventas.</p> : (
                  <div className="ax-table-wrap"><table className="ax-table"><thead className="ax-table__head"><tr><th className="ax-table__th" scope="col">Cliente</th><th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Pedidos</th><th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Total</th></tr></thead>
                    <tbody>{r.topClientes.map((c) => <tr key={c.email} className="ax-table__row"><td className="ax-table__td"><div style={{ fontSize: 'var(--ax-text-sm)' }}>{c.nombre}</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{c.email}</div></td><td className="ax-table__td" style={{ textAlign: 'right' }}>{c.pedidos}</td><td className="ax-table__td ax-num" style={{ textAlign: 'right' }}>{usd(c.total)}</td></tr>)}</tbody></table></div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}

export default ReportesVentas;
