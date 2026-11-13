'use client';
/*
 * FPTecnologi-HUB — CRM → Reportes: pipeline abierto (total y ponderado por probabilidad), ganado por mes, embudo por
 * etapa, desempeño por comercial y por origen (qué canal de la web trae ventas), conversión y ciclo de venta.
 * Montos separados por moneda (S/ y US$). Datos de GET /crm/reportes.
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../../components/shell/PageHead';
import { ApexChart } from '../../../components/charts/ApexChart';
import { Card, Kpi, Vacio, viz } from '../../../components/dashboard/piezas';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Alerta, ORIGENES, etapa, montos, msg, type Etapa, type Origen } from './comun';

interface Reporte {
  meses: number;
  totales: { abiertas: number; pipeline: Record<string, number>; ponderado: Record<string, number>; ganadas: number; perdidas: number; montoGanado: Record<string, number>; conversion: number | null; cicloDias: number | null };
  embudo: { etapa: Etapa; cantidad: number; montos: Record<string, number> }[];
  porMes: { mes: string; ganadas: number; perdidas: number; montos: Record<string, number> }[];
  porComercial: { asignadoId: string | null; nombre: string; abiertas: number; ganadas: number; perdidas: number; montos: Record<string, number>; conversion: number | null }[];
  porOrigen: { origen: Origen; creadas: number; ganadas: number; montos: Record<string, number> }[];
}
const MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const RANGOS = [3, 6, 12] as const;

export function CrmReportes() {
  const { activeMarcaId } = useAuth();
  const [meses, setMeses] = useState<(typeof RANGOS)[number]>(12);
  const [r, setR] = useState<Reporte | null>(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try { setR(await api.get<Reporte>(`/crm/reportes?meses=${meses}`)); setError(''); } catch (e) { setError(msg(e, 'No se pudieron cargar los reportes.')); }
  }, [activeMarcaId, meses]);
  useEffect(() => { cargar(); }, [cargar]);

  const monedas = r ? [...new Set(r.porMes.flatMap((m) => Object.keys(m.montos)))].sort() : [];
  const etiquetas = r?.porMes.map((m) => MES[Number(m.mes.slice(5)) - 1]!) ?? [];
  const t = r?.totales;

  return (
    <>
      <PageHead title="Reportes comerciales" subtitle="Ventas ganadas, embudo y desempeño del equipo comercial de la marca." actions={
        <div className="ax-segment" role="group" aria-label="Periodo">
          {RANGOS.map((n) => <button key={n} type="button" className="ax-segment__option" aria-pressed={meses === n} onClick={() => setMeses(n)}>{n} meses</button>)}
        </div>
      } />
      {error && <div style={{ marginBlockEnd: 'var(--ax-space-4)' }}><Alerta>{error}</Alerta></div>}

      <div className="ax-dash-grid">
        <section className="ax-card ax-card--flat ax-col--12" aria-label="Resumen" aria-busy={!r}>
          <div className="ax-card__body"><div className="ax-statgroup">
            <Kpi icon="shopping-bag" tono="c2" label={`Ganado (${meses} meses)`} valor={t ? montos(t.montoGanado) : '—'} />
            <Kpi icon="briefcase-2" tono="c4" label="Pipeline abierto" valor={t ? montos(t.pipeline) : '—'} />
            <Kpi icon="sparkles" tono="c5" label="Pipeline ponderado" valor={t ? montos(t.ponderado) : '—'} />
            <Kpi icon="article" tono="c3" label="Oportunidades abiertas" valor={t ? String(t.abiertas) : '—'} />
            <Kpi icon="shield-check" tono="c6" label="Conversión (ganadas / cerradas)" valor={t?.conversion == null ? '—' : `${t.conversion}%`} />
            <Kpi icon="bell" tono="c2" label="Ciclo de venta promedio" valor={t?.cicloDias == null ? '—' : `${t.cicloDias} días`} />
          </div></div>
        </section>

        <Card titulo="Ventas ganadas por mes" sub="Monto de las oportunidades ganadas, por mes de cierre" cols={8}>
          {r && r.porMes.some((m) => m.ganadas) ? (
            <ApexChart type="bar" height={300} legend={monedas.length > 1 ? 'bottom' : 'none'} ariaLabel="Ventas ganadas por mes"
              series={monedas.map((mon) => ({ name: mon === 'USD' ? 'US$' : 'S/', data: r.porMes.map((m) => Math.round((m.montos[mon] ?? 0) * 100) / 100) }))}
              apex={{ colors: viz(), plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } }, xaxis: { categories: etiquetas } }} />
          ) : <Vacio texto="Aún no hay oportunidades ganadas en este periodo." />}
        </Card>
        <Card titulo="Embudo actual" sub="Oportunidades abiertas por etapa" cols={4}>
          {r && r.embudo.some((e) => e.cantidad) ? (
            <ApexChart type="bar" height={300} legend="none" ariaLabel="Oportunidades abiertas por etapa"
              series={[{ name: 'Oportunidades', data: r.embudo.map((e) => e.cantidad) }]}
              apex={{ colors: viz(), plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: true, barHeight: '60%' } }, xaxis: { categories: r.embudo.map((e) => etapa(e.etapa).label), labels: { show: false } }, dataLabels: { enabled: true } }} />
          ) : <Vacio texto="No hay oportunidades abiertas." />}
        </Card>

        <Card titulo="Por comercial" sub="Abiertas hoy; ganadas y perdidas en el periodo" cols={8}>
          {r && r.porComercial.length ? (
            <div className="ax-table-wrap"><table className="ax-table">
              <thead className="ax-table__head"><tr>
                <th className="ax-table__th" scope="col">Comercial</th><th className="ax-table__th" scope="col">Abiertas</th><th className="ax-table__th" scope="col">Ganadas</th>
                <th className="ax-table__th" scope="col">Perdidas</th><th className="ax-table__th" scope="col">Conversión</th><th className="ax-table__th" scope="col">Monto ganado</th>
              </tr></thead>
              <tbody>{r.porComercial.map((c) => (
                <tr key={c.asignadoId ?? 'sin'} className="ax-table__row">
                  <td className="ax-table__td" style={{ color: c.asignadoId ? undefined : 'var(--ax-text-subtle)' }}>{c.nombre}</td>
                  <td className="ax-table__td ax-num">{c.abiertas}</td><td className="ax-table__td ax-num">{c.ganadas}</td><td className="ax-table__td ax-num">{c.perdidas}</td>
                  <td className="ax-table__td ax-num">{c.conversion == null ? '—' : `${c.conversion}%`}</td><td className="ax-table__td ax-num">{montos(c.montos)}</td>
                </tr>
              ))}</tbody>
            </table></div>
          ) : <Vacio />}
        </Card>
        <Card titulo="Por origen" sub="Qué canal trae oportunidades y cuáles se ganan" cols={4}>
          {r && r.porOrigen.length ? (
            <ol className="ax-ranklist">
              {r.porOrigen.map((o, i) => {
                const max = Math.max(...r.porOrigen.map((x) => x.creadas), 1);
                return (
                  <li key={o.origen} className="ax-ranklist__item" title={`Ganado: ${montos(o.montos)}`}>
                    <span className="ax-ranklist__rank">{i + 1}</span>
                    <span className="ax-ranklist__label">{ORIGENES[o.origen]}</span>
                    <span className="ax-ranklist__value">{o.creadas} · {o.ganadas} gan.</span>
                    <span className="ax-ranklist__bar"><i style={{ width: `${(o.creadas / max) * 100}%` }} /></span>
                  </li>
                );
              })}
            </ol>
          ) : <Vacio />}
        </Card>
      </div>
    </>
  );
}

export default CrmReportes;
