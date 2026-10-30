'use client';
/*
 * FPTecnologi-HUB — Reportes por área (Marketing, Comercial, Soporte, Finanzas, Dirección). Una sola pantalla para
 * todas: lee GET /reportes/<area>?desde&hasta, que siempre responde { rango, kpis, serie, tablas }, y pinta los
 * indicadores (con comparación contra el periodo anterior), la serie diaria y las tablas. Con varias marcas permite
 * comparar los indicadores de todas las webs. Exporta el reporte completo a CSV.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { ApexChart } from '../../components/charts/ApexChart';
import { Icon } from '../../components/ui/Icon';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Formato = 'num' | 'usd' | 'pct' | 'dias';
interface Kpi { clave: string; label: string; valor: number; previo?: number; formato: Formato }
interface Tabla { titulo: string; subtitulo?: string; columnas: string[]; filas: (string | number)[][] }
interface Reporte {
  area: string;
  rango: { desde: string; hasta: string; dias: number };
  kpis: Kpi[];
  serie: { titulo: string; etiquetas: string[]; series: { nombre: string; datos: number[] }[] };
  tablas: Tabla[];
}

export type AreaReporte = 'marketing' | 'comercial' | 'soporte' | 'finanzas' | 'direccion';
const AREAS: Record<AreaReporte, { titulo: string; subtitulo: string; iconos: string[] }> = {
  marketing: { titulo: 'Reporte de marketing', subtitulo: 'Tráfico de la web, leads (cotizador, contacto, cotizaciones y presupuestos), conversión y boletín.', iconos: ['world', 'users-group', 'article', 'bell', 'sparkles', 'files', 'messages'] },
  comercial: { titulo: 'Reporte comercial', subtitulo: 'Leads, cotizaciones, presupuestos y embudo del CRM por comercial.', iconos: ['users-group', 'article', 'files', 'briefcase-2', 'diamond', 'layout-dashboard', 'shopping-cart', 'folders'] },
  soporte: { titulo: 'Reporte de soporte', subtitulo: 'Tickets, tiempos de resolución, libro de reclamaciones y chats.', iconos: ['headset', 'bell', 'article', 'layout-dashboard', 'files', 'alert-triangle', 'messages'] },
  finanzas: { titulo: 'Reporte de finanzas', subtitulo: 'Cobrado y por cobrar de la tienda, IGV, medios de pago y presupuestos aceptados (USD).', iconos: ['shopping-cart', 'article', 'bell', 'layout-dashboard', 'files', 'folders', 'briefcase-2', 'alert-triangle'] },
  direccion: { titulo: 'Reporte de dirección', subtitulo: 'Resumen ejecutivo cruzado: ventas, marketing, comercial y soporte frente al periodo anterior.', iconos: ['shopping-cart', 'article', 'world', 'users-group', 'diamond', 'send', 'headset', 'alert-triangle'] },
};
const TONOS = ['c1', 'c2', 'c3', 'c4'];

const hoyLima = () => new Date(Date.now() - 5 * 3600_000).toISOString().slice(0, 10);
const restarDias = (iso: string, d: number) => new Date(new Date(`${iso}T00:00:00Z`).getTime() - d * 86_400_000).toISOString().slice(0, 10);
const PRESETS = [{ id: '7', label: '7 días', dias: 6 }, { id: '30', label: '30 días', dias: 29 }, { id: '90', label: '90 días', dias: 89 }, { id: '365', label: '12 meses', dias: 364 }];

function fmt(n: number, f: Formato) {
  if (f === 'usd') return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (f === 'pct') return `${n.toLocaleString('es-PE', { maximumFractionDigits: 1 })}%`;
  return n.toLocaleString('es-PE', { maximumFractionDigits: 2 });
}
const celda = (v: string | number) => (typeof v === 'number' ? v.toLocaleString('es-PE', { maximumFractionDigits: 2 }) : v.charAt(0) === '/' ? v : v.replace(/_/g, ' '));
const delta = (a: number, b?: number) => (b === undefined ? null : b === 0 ? (a === 0 ? null : 100) : ((a - b) / b) * 100);

function descargar(nombre: string, filas: (string | number | null)[][]) {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + filas.map((f) => f.map(esc).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}

function KpiCelda({ k, icon, tono }: { k: Kpi; icon: string; tono: string }) {
  const pct = delta(k.valor, k.previo);
  return (
    <div className="ax-statgroup__cell">
      <span className={`ax-statgroup__icon ax-statgroup__icon--${tono}`}><Icon name={icon} /></span>
      <span className="ax-statgroup__text"><span className="ax-statgroup__label">{k.label}</span><span className="ax-statgroup__value ax-num">{fmt(k.valor, k.formato)}</span></span>
      {pct != null && <span className={`ax-statgroup__delta ax-statgroup__delta--${pct >= 0 ? 'up' : 'down'}`}>{pct >= 0 ? '+' : '−'}{Math.abs(pct).toFixed(1)}%</span>}
    </div>
  );
}

function TablaCard({ t, ancho }: { t: Tabla; ancho: 4 | 6 | 12 }) {
  return (
    <section className={`ax-card ax-col--${ancho}`} aria-label={t.titulo}>
      <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">{t.titulo}</h2>{t.subtitulo && <p className="ax-card__subtitle">{t.subtitulo}</p>}</div></div>
      <div className="ax-card__body" style={{ paddingTop: 0 }}>
        {t.filas.length === 0 ? <p style={{ margin: 0, color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-sm)' }}>Sin datos en el periodo.</p> : (
          <div className="ax-table-wrap">
            <table className="ax-table">
              <thead className="ax-table__head"><tr>{t.columnas.map((c, i) => <th key={c} className="ax-table__th" scope="col" style={i ? { textAlign: 'right' } : undefined}>{c}</th>)}</tr></thead>
              <tbody>{t.filas.map((f, i) => <tr key={i} className="ax-table__row">{f.map((v, j) => <td key={j} className={`ax-table__td${j ? ' ax-num' : ''}`} style={j ? { textAlign: 'right' } : { fontSize: 'var(--ax-text-sm)' }}>{celda(v)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export function ReportesArea({ area }: { area: AreaReporte }) {
  const cfg = AREAS[area];
  const { activeMarcaId, marcas } = useAuth();
  const [preset, setPreset] = useState('30');
  const [desde, setDesde] = useState(restarDias(hoyLima(), 29));
  const [hasta, setHasta] = useState(hoyLima());
  const [r, setR] = useState<Reporte | null>(null);
  const [comparativo, setComparativo] = useState<{ nombre: string; r: Reporte }[]>([]);
  const [err, setErr] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    setCargando(true); setErr('');
    const url = `/reportes/${area}?desde=${desde}&hasta=${hasta}`;
    try { setR(await api.get<Reporte>(url)); }
    catch (e) { setErr(e instanceof ApiError ? e.message : 'No se pudo cargar el reporte.'); setR(null); }
    finally { setCargando(false); }
    // Comparativo entre todas las marcas a las que el usuario tiene acceso (las que su rol no permita se omiten).
    if (marcas.length > 1) {
      const res = await Promise.all(marcas.map((m) => api.get<Reporte>(url, { marcaId: m.marcaId }).then((x) => ({ nombre: m.marca.nombre, r: x })).catch(() => null)));
      setComparativo(res.filter((x): x is { nombre: string; r: Reporte } => !!x));
    } else setComparativo([]);
  }, [activeMarcaId, area, desde, hasta, marcas]);
  useEffect(() => { void cargar(); }, [cargar]);

  const etiquetas = useMemo(() => (r?.serie.etiquetas ?? []).map((d) => d.slice(5).replace('-', '/')), [r]);

  function exportar() {
    if (!r) return;
    const filas: (string | number | null)[][] = [[cfg.titulo, `${r.rango.desde} a ${r.rango.hasta}`], [], ['Indicador', 'Valor', 'Periodo anterior'], ...r.kpis.map((k) => [k.label, k.valor, k.previo ?? null])];
    for (const t of r.tablas) filas.push([], [t.titulo], t.columnas, ...t.filas);
    filas.push([], [r.serie.titulo], ['Fecha', ...r.serie.series.map((s) => s.nombre)], ...r.serie.etiquetas.map((d, i) => [d, ...r.serie.series.map((s) => s.datos[i] ?? 0)]));
    descargar(`reporte-${area}-${desde}_a_${hasta}.csv`, filas);
  }

  const hayDatos = !!r && r.serie.series.some((s) => s.datos.some((n) => n > 0));
  const compKpis = comparativo[0]?.r.kpis ?? [];

  return (
    <>
      <PageHead
        title={cfg.titulo}
        subtitle={`${cfg.subtitulo} Días en hora de Lima.`}
        actions={<button type="button" className="ax-btn ax-btn--secondary" disabled={!r} onClick={exportar}>Exportar reporte (CSV)</button>}
      />
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" aria-label="Periodo">
          <div className="ax-card__body ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Periodo rápido">
              {PRESETS.map((p) => <button key={p.id} type="button" role="radio" aria-checked={preset === p.id} className={`ax-btn ax-btn--sm${preset === p.id ? ' is-selected' : ''}`} onClick={() => { setPreset(p.id); setHasta(hoyLima()); setDesde(restarDias(hoyLima(), p.dias)); }}>{p.label}</button>)}
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

        {r && (
          <>
            <section className="ax-statgroup ax-col--12" aria-label="Indicadores">
              {r.kpis.slice(0, 4).map((k, i) => <KpiCelda key={k.clave} k={k} icon={cfg.iconos[i] ?? 'article'} tono={TONOS[i % 4]!} />)}
            </section>
            {r.kpis.length > 4 && (
              <section className="ax-statgroup ax-col--12" aria-label="Más indicadores">
                {r.kpis.slice(4).map((k, i) => <KpiCelda key={k.clave} k={k} icon={cfg.iconos[i + 4] ?? 'article'} tono={TONOS[i % 4]!} />)}
              </section>
            )}

            <section className="ax-card ax-col--12" aria-label={r.serie.titulo}>
              <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">{r.serie.titulo}</h2><p className="ax-card__subtitle">{r.rango.desde} → {r.rango.hasta} ({r.rango.dias} días)</p></div></div>
              <div className="ax-card__body" style={{ paddingTop: 0 }}>
                {hayDatos ? (
                  <ApexChart type="area" height={300} legend="top" ariaLabel={r.serie.titulo} series={r.serie.series.map((s) => ({ name: s.nombre, data: s.datos }))} apex={{ xaxis: { categories: etiquetas, tickAmount: Math.min(etiquetas.length - 1, 10) } }} />
                ) : <p style={{ margin: 0, padding: 'var(--ax-space-6) 0', textAlign: 'center', color: 'var(--ax-text-subtle)' }}>No hay actividad en este periodo.</p>}
              </div>
            </section>

            {comparativo.length > 1 && (
              <TablaCard
                ancho={12}
                t={{
                  titulo: 'Comparativo por marca / web',
                  subtitulo: 'Todas las marcas a las que tienes acceso con este reporte',
                  columnas: ['Marca', ...compKpis.map((k) => k.label)],
                  filas: comparativo.map((c) => [c.nombre, ...compKpis.map((k, i) => c.r.kpis[i]?.valor ?? 0)]),
                }}
              />
            )}

            {r.tablas.map((t) => <TablaCard key={t.titulo} t={t} ancho={t.columnas.length > 3 || t.filas.length > 12 ? 6 : 4} />)}
          </>
        )}
      </div>
    </>
  );
}

export default ReportesArea;
