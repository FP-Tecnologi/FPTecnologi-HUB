/*
 * FPTecnologi-HUB — piezas comunes de las tarjetas del dashboard (ResumenMarca, TraficoWeb): KPI, tarjeta, estado vacío
 * y la paleta --ax-viz-* para ApexCharts.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '../ui/Icon';

export const VIZ = ['--ax-viz-amber', '--ax-viz-cyan', '--ax-viz-violet', '--ax-viz-emerald', '--ax-viz-pink'];
export const VIZ_FALLBACK = ['#FBBF24', '#38BDF8', '#A78BFA', '#34D399', '#F472B6'];

/** --ax-viz-* a hex para ApexCharts (SSR-safe: el re-theme corrige tras hidratar). */
export function viz(n = VIZ.length): string[] {
  if (typeof document === 'undefined') return VIZ_FALLBACK.slice(0, n);
  const cs = getComputedStyle(document.documentElement);
  return VIZ.slice(0, n).map((t, i) => cs.getPropertyValue(t).trim() || VIZ_FALLBACK[i]);
}

export const num = (n: number | null) => (n === null ? '—' : n.toLocaleString('es-PE'));

export function Delta({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const sube = pct >= 0;
  return (
    <span className={`ax-statgroup__delta ax-statgroup__delta--${sube ? 'up' : 'down'}`}>
      {sube ? '+' : '−'}{Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function Kpi({ icon, tono, label, valor, pct }: { icon: string; tono: string; label: string; valor: string; pct?: number | null }) {
  return (
    <div className="ax-statgroup__cell">
      <span className={`ax-statgroup__icon ax-statgroup__icon--${tono}`}><Icon name={icon} /></span>
      <span className="ax-statgroup__text">
        <span className="ax-statgroup__label">{label}</span>
        <span className="ax-statgroup__value ax-num">{valor}</span>
      </span>
      {pct !== undefined && <Delta pct={pct} />}
    </div>
  );
}

export function Card({ titulo, sub, cols, enlace, accion, children }: { titulo: string; sub?: string; cols: 4 | 6 | 8 | 12; enlace?: { href: string; label: string }; accion?: ReactNode; children: ReactNode }) {
  return (
    <section className={`ax-card ax-col--${cols}`} role="region" aria-label={titulo}>
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <h2 className="ax-card__title">{titulo}</h2>
          {sub && <p className="ax-card__subtitle">{sub}</p>}
        </div>
        {accion}
        {enlace && <Link className="ax-btn ax-btn--link" href={enlace.href}>{enlace.label}</Link>}
      </div>
      <div className="ax-card__body" style={{ paddingTop: 0 }}>{children}</div>
    </section>
  );
}

export function Vacio({ texto = 'Sin datos para mostrar.' }: { texto?: string }) {
  return <p style={{ margin: 0, padding: 'var(--ax-space-6) 0', textAlign: 'center', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-subtle)' }}>{texto}</p>;
}
