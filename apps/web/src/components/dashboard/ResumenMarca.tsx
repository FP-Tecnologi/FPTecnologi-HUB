'use client';
/*
 * FPTecnologi-HUB — dashboard real por marca (o global sumando varias).
 * Layout y componentes de la plantilla Sales de Vireo (statgroup, ApexChart,
 * ranklist, progress), pero cada cifra sale de los endpoints reales de los
 * módulos (ver useResumen). Si un endpoint no responde (rol sin acceso o
 * módulo vacío) su card muestra un estado vacío en vez de inventar datos.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApexChart } from '../charts/ApexChart';
import { Icon } from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import {
  contarPorEstado, contarPorMes, sumarPorMes, ultimosMeses, useResumen, variacion,
  type NotifRow, type PedidoRow,
} from './useResumen';

const MODULOS: { href: string; label: string; icon: string; desc: string }[] = [
  { href: '/ecommerce/productos', label: 'Productos', icon: 'folders', desc: 'Catálogo y stock' },
  { href: '/ecommerce/pedidos', label: 'Pedidos', icon: 'shopping-cart', desc: 'Ventas y envíos' },
  { href: '/ecommerce/clientes', label: 'Clientes', icon: 'user', desc: 'Compradores' },
  { href: '/soluciones/servicios', label: 'Servicios', icon: 'briefcase-2', desc: 'Catálogo B2B' },
  { href: '/soluciones/cotizaciones', label: 'Cotizaciones', icon: 'article', desc: 'Solicitudes' },
  { href: '/usuarios', label: 'Usuarios y equipo', icon: 'users-group', desc: 'Roles del equipo' },
  { href: '/notificaciones', label: 'Notificaciones', icon: 'bell', desc: 'Avisos internos' },
  { href: '/soporte', label: 'Soporte', icon: 'files', desc: 'Ayuda y tickets' },
];

const ESTADOS_PEDIDO = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
const ESTADOS_LEAD = ['NUEVO', 'CONTACTADO', 'COTIZADO', 'GANADO', 'PERDIDO'];
const ESTADOS_COTIZ = ['PENDIENTE', 'EN_REVISION', 'ENVIADA', 'ACEPTADA', 'RECHAZADA'];
const ESTADOS_CHAT = ['BOT', 'ASESOR', 'CERRADA'];
const VIZ = ['--ax-viz-amber', '--ax-viz-cyan', '--ax-viz-violet', '--ax-viz-emerald', '--ax-viz-pink'];
const VIZ_FALLBACK = ['#FBBF24', '#38BDF8', '#A78BFA', '#34D399', '#F472B6'];

/** --ax-viz-* a hex para ApexCharts (SSR-safe: el re-theme corrige tras hidratar). */
function viz(n = VIZ.length): string[] {
  if (typeof document === 'undefined') return VIZ_FALLBACK.slice(0, n);
  const cs = getComputedStyle(document.documentElement);
  return VIZ.slice(0, n).map((t, i) => cs.getPropertyValue(t).trim() || VIZ_FALLBACK[i]);
}

const etiqueta = (e: string) => e.charAt(0) + e.slice(1).toLowerCase().replace('_', ' ');
const num = (n: number | null) => (n === null ? '—' : n.toLocaleString('es-PE'));
const usd = (n: number) => `$${n.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const sube = pct >= 0;
  return (
    <span className={`ax-statgroup__delta ax-statgroup__delta--${sube ? 'up' : 'down'}`}>
      {sube ? '+' : '−'}{Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function Kpi({ icon, tono, label, valor, pct }: { icon: string; tono: string; label: string; valor: string; pct?: number | null }) {
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

function Card({ titulo, sub, cols, enlace, children }: { titulo: string; sub?: string; cols: 4 | 6 | 8 | 12; enlace?: { href: string; label: string }; children: ReactNode }) {
  return (
    <section className={`ax-card ax-col--${cols}`} role="region" aria-label={titulo}>
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <h2 className="ax-card__title">{titulo}</h2>
          {sub && <p className="ax-card__subtitle">{sub}</p>}
        </div>
        {enlace && <Link className="ax-btn ax-btn--link" href={enlace.href}>{enlace.label}</Link>}
      </div>
      <div className="ax-card__body" style={{ paddingTop: 0 }}>{children}</div>
    </section>
  );
}

function Vacio({ texto = 'Sin datos para mostrar.' }: { texto?: string }) {
  return <p style={{ margin: 0, padding: 'var(--ax-space-6) 0', textAlign: 'center', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-subtle)' }}>{texto}</p>;
}

/** Barras horizontales (embudo / estados) con total numérico. */
function BarrasEstado({ estados, valores, nombre }: { estados: string[]; valores: number[] | null; nombre: string }) {
  if (!valores || valores.every((v) => v === 0)) return <Vacio />;
  return (
    <ApexChart
      type="bar"
      height={230}
      legend="none"
      ariaLabel={`Barras de ${nombre} por estado`}
      series={[{ name: nombre, data: valores }]}
      apex={{
        colors: viz(),
        plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: true, barHeight: '60%' } },
        xaxis: { categories: estados.map(etiqueta) },
        dataLabels: { enabled: true },
      }}
    />
  );
}

function Donut({ estados, valores, centro, nombre }: { estados: string[]; valores: number[] | null; centro: string; nombre: string }) {
  if (!valores || valores.every((v) => v === 0)) return <Vacio />;
  return (
    <>
      <ApexChart
        type="donut"
        height={230}
        legend="none"
        ariaLabel={`Dona de ${nombre}`}
        series={valores}
        apex={{
          labels: estados.map(etiqueta),
          colors: viz(estados.length),
          stroke: { width: 0 },
          plotOptions: { pie: { donut: { size: '72%', labels: { show: true, name: { fontFamily: 'var(--ax-font-sans)' }, value: { fontFamily: 'var(--ax-font-mono)', fontWeight: 600 }, total: { show: true, label: centro } } } } },
        }}
      />
      <ul className="ax-list ax-list--compact" style={{ marginTop: 'var(--ax-space-2)' }}>
        {estados.map((e, i) => (
          <li key={e} className="ax-list__row" style={{ border: 0, paddingInline: 0 }}>
            <span className="ax-list__leading"><i style={{ width: 9, height: 9, borderRadius: 3, background: viz()[i % VIZ.length], display: 'inline-block' }} /></span>
            <span className="ax-list__content"><span className="ax-list__title" style={{ fontWeight: 'var(--ax-weight-medium)' }}>{etiqueta(e)}</span></span>
            <span className="ax-list__trailing ax-num" style={{ color: 'var(--ax-text-strong)' }}>{valores[i]}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function topProductos(pedidos: PedidoRow[] | null) {
  const cuenta = new Map<string, number>();
  for (const p of pedidos ?? []) {
    if (p.estado === 'CANCELADO') continue;
    for (const it of p.items ?? []) {
      const nombre = it.producto?.nombre ?? it.nombre;
      if (nombre) cuenta.set(nombre, (cuenta.get(nombre) ?? 0) + it.cantidad);
    }
  }
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export function ResumenMarca({
  marcaId, marcaIds, rol, soloResumen = false, sinAccesos = false,
}: { marcaId: string; marcaIds?: string[]; rol: string; soloResumen?: boolean; sinAccesos?: boolean }) {
  const router = useRouter();
  const { setActiveMarcaId } = useAuth();
  const { datos, cargando } = useResumen(marcaIds ?? [marcaId]);

  const meses = ultimosMeses(6);
  const etiquetas = meses.map((m) => m.label);
  const ingresos = datos.pedidos ? sumarPorMes(datos.pedidos, meses) : null;
  const pedidosMes = datos.pedidos ? contarPorMes(datos.pedidos, meses) : null;
  const leadsMes = datos.leads ? contarPorMes(datos.leads, meses) : null;
  const cotizMes = datos.cotizaciones ? contarPorMes(datos.cotizaciones, meses) : null;
  const chatMes = datos.chat ? contarPorMes(datos.chat, meses) : null;
  const boletinMes = datos.boletin ? contarPorMes(datos.boletin, meses) : null;

  const ventasMes = ingresos ? ingresos[ingresos.length - 1] : null;
  const stockBajo = (datos.productos ?? []).filter((p) => p.activo && p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 5);
  const top = topProductos(datos.pedidos);
  const maxTop = top[0]?.[1] ?? 1;
  const chatAbiertas = datos.chat ? datos.chat.filter((c) => c.estado !== 'CERRADA').length : null;
  const blogPub = datos.blog ? datos.blog.filter((b) => b.estado === 'PUBLICADO').length : null;
  const notifs: NotifRow[] = (datos.notificaciones ?? []).slice(0, 6);

  const actividad = [
    { name: 'Leads', data: leadsMes },
    { name: 'Cotizaciones', data: cotizMes },
    { name: 'Chats', data: chatMes },
    { name: 'Suscriptores', data: boletinMes },
  ].filter((s): s is { name: string; data: number[] } => s.data !== null);

  return (
    <>
      {/* KPIs */}
      <section className="ax-card ax-card--flat ax-col--12" role="region" aria-label="Resumen de la marca" aria-busy={cargando}>
        <div className="ax-card__body">
          <div className="ax-statgroup">
            <Kpi icon="shopping-bag" tono="c2" label="Ventas del mes" valor={ventasMes === null ? '—' : usd(ventasMes)} pct={ingresos ? variacion(ingresos) : undefined} />
            <Kpi icon="shopping-cart" tono="c4" label="Pedidos" valor={num(datos.pedidos?.length ?? null)} pct={pedidosMes ? variacion(pedidosMes) : undefined} />
            <Kpi icon="article" tono="c5" label="Cotizaciones" valor={num(datos.cotizaciones?.length ?? null)} pct={cotizMes ? variacion(cotizMes) : undefined} />
            <Kpi icon="briefcase-2" tono="c3" label="Leads cotizador" valor={num(datos.leads?.length ?? null)} pct={leadsMes ? variacion(leadsMes) : undefined} />
            <Kpi icon="messages" tono="c6" label="Chats abiertos" valor={num(chatAbiertas)} />
            <Kpi icon="users-group" tono="c2" label="Equipo" valor={num(datos.equipo?.length ?? null)} />
          </div>
        </div>
      </section>

      {/* Ingresos + pedidos por estado */}
      <Card titulo="Ingresos" sub="Ventas de los últimos 6 meses (sin pedidos cancelados, USD)" cols={8} enlace={{ href: '/ecommerce/pedidos', label: 'Ver pedidos' }}>
        {ingresos && ingresos.some((v) => v > 0) ? (
          <ApexChart
            type="area"
            height={300}
            legend="none"
            accent
            ariaLabel="Gráfica de área de ingresos mensuales"
            series={[{ name: 'Ingresos', data: ingresos }]}
            apex={{ xaxis: { categories: etiquetas } }}
          />
        ) : <Vacio texto={datos.pedidos ? 'Aún no hay ventas registradas.' : 'Sin acceso a pedidos con tu rol.'} />}
      </Card>
      <Card titulo="Pedidos" cols={4}>
        <Donut estados={ESTADOS_PEDIDO} valores={datos.pedidos ? contarPorEstado(datos.pedidos, ESTADOS_PEDIDO) : null} centro="Pedidos" nombre="pedidos" />
      </Card>

      {/* Embudo comercial */}
      <Card titulo="Cotizador" sub="Leads del formulario web" cols={4} enlace={{ href: '/cotizador', label: 'Ver leads' }}>
        <BarrasEstado estados={ESTADOS_LEAD} valores={datos.leads ? contarPorEstado(datos.leads, ESTADOS_LEAD) : null} nombre="Leads" />
      </Card>
      <Card titulo="Cotizaciones" sub="Solicitudes sobre servicios" cols={4} enlace={{ href: '/soluciones/cotizaciones', label: 'Ver todas' }}>
        <BarrasEstado estados={ESTADOS_COTIZ} valores={datos.cotizaciones ? contarPorEstado(datos.cotizaciones, ESTADOS_COTIZ) : null} nombre="Cotizaciones" />
      </Card>
      <Card titulo="Actividad" sub="Leads, cotizaciones, chats y suscriptores" cols={4}>
        {actividad.some((s) => s.data.some((v) => v > 0)) ? (
          <ApexChart
            type="bar"
            height={230}
            legend="bottom"
            ariaLabel="Columnas de actividad mensual"
            series={actividad}
            apex={{ colors: viz(), plotOptions: { bar: { borderRadius: 3, columnWidth: '60%' } }, xaxis: { categories: etiquetas } }}
          />
        ) : <Vacio />}
      </Card>

      {/* Catálogo */}
      <Card titulo="Más vendidos" sub="Por unidades en pedidos no cancelados" cols={4} enlace={{ href: '/ecommerce/productos', label: 'Catálogo' }}>
        {top.length ? (
          <ol className="ax-ranklist">
            {top.map(([nombre, cant], i) => (
              <li key={nombre} className="ax-ranklist__item">
                <span className="ax-ranklist__rank">{i + 1}</span>
                <span className="ax-ranklist__label">{nombre}</span>
                <span className="ax-ranklist__value">{cant} u.</span>
                <span className="ax-ranklist__bar"><i style={{ width: `${(cant / maxTop) * 100}%` }} /></span>
              </li>
            ))}
          </ol>
        ) : <Vacio />}
      </Card>
      <Card titulo="Stock bajo" sub="Activos con 5 unidades o menos" cols={4} enlace={{ href: '/ecommerce/productos', label: 'Reponer' }}>
        {datos.productos === null ? <Vacio texto="Sin acceso a productos con tu rol." /> : stockBajo.length ? (
          <ul className="ax-list ax-list--compact">
            {stockBajo.map((p) => (
              <li key={p.id} className="ax-list__row" style={{ border: 0, paddingInline: 0 }}>
                <span className="ax-list__content"><span className="ax-list__title">{p.nombre}</span></span>
                <span className="ax-list__trailing ax-num" style={{ color: p.stock === 0 ? 'var(--ax-viz-pink)' : 'var(--ax-viz-amber)', fontWeight: 600 }}>
                  {p.stock === 0 ? 'Agotado' : `${p.stock} u.`}
                </span>
              </li>
            ))}
          </ul>
        ) : <Vacio texto="Todo el catálogo tiene stock suficiente." />}
      </Card>

      {/* Contenido y atención */}
      <Card titulo="Contenido" cols={4}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
          {[
            { label: 'Blog publicado', valor: blogPub, total: datos.blog?.length ?? null, color: 'var(--ax-viz-emerald)' },
            { label: 'Chats cerrados', valor: datos.chat ? contarPorEstado(datos.chat, ESTADOS_CHAT)[2] : null, total: datos.chat?.length ?? null, color: 'var(--ax-viz-cyan)' },
            { label: 'Suscriptores (mes)', valor: boletinMes ? boletinMes[boletinMes.length - 1] : null, total: datos.boletin?.length ?? null, color: 'var(--ax-viz-violet)' },
          ].map((f) => (
            <div key={f.label}>
              <div className="ax-cluster" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 'var(--ax-text-sm)' }}>{f.label}</span>
                <b className="ax-num" style={{ color: 'var(--ax-text-strong)' }}>{f.valor === null ? '—' : `${f.valor} / ${f.total}`}</b>
              </div>
              <div className="ax-progress ax-progress--sm"><div className="ax-progress__track"><div className="ax-progress__fill" style={{ width: `${f.total ? ((f.valor ?? 0) / f.total) * 100 : 0}%`, background: f.color }} /></div></div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notificaciones */}
      <Card titulo="Notificaciones" cols={12} enlace={{ href: '/notificaciones', label: 'Ver todas' }}>
        {notifs.length ? (
          <ul className="ax-list ax-list--compact">
            {notifs.map((n) => (
              <li key={n.id} className="ax-list__row" style={{ border: 0, paddingInline: 0 }}>
                <span className="ax-list__leading"><Icon name="bell" /></span>
                <span className="ax-list__content">
                  <span className="ax-list__title" style={{ fontWeight: n.leida ? undefined : 'var(--ax-weight-medium)' }}>{n.titulo ?? n.mensaje ?? 'Notificación'}</span>
                </span>
                <span className="ax-list__trailing" style={{ color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-xs)' }}>{fechaCorta(n.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : <Vacio texto="Sin notificaciones." />}
      </Card>

      {sinAccesos ? null : soloResumen ? (
        // Vista de administración "espiando" una marca sin activarla: los
        // links de Módulos navegan a rutas fijas (/ecommerce/...) que leen la
        // marca ACTIVA del contexto, no la de esta pantalla — mostrarlos acá
        // llevaría a gestionar la marca equivocada.
        <section className="ax-card ax-card--flat ax-col--12" role="region" aria-label="Gestionar esta marca">
          <div className="ax-card__body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--ax-space-4)', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
              Estás viendo este resumen desde Administración, sin salir de la vista global. Para entrar a sus módulos (productos, pedidos…) primero activá la marca.
            </p>
            <button type="button" className="ax-btn ax-btn--secondary" onClick={() => { setActiveMarcaId(marcaId); router.push('/'); }}>
              <span className="ax-btn__label">Activar y gestionar esta marca</span>
            </button>
          </div>
        </section>
      ) : (
        <section className="ax-card ax-col--12" role="region" aria-label="Módulos de la marca">
          <div className="ax-card__body">
            <h2 className="ax-card__title" style={{ marginBottom: 'var(--ax-space-1)' }}>Accesos rápidos</h2>
            <p style={{ margin: '0 0 var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
              Tu rol aquí: <b style={{ color: 'var(--ax-text-strong)' }}>{rol}</b>.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--ax-space-3)' }}>
              {MODULOS.map((m) => (
                <Link key={m.href} href={m.href} className="ax-card ax-card--flat" style={{ padding: 'var(--ax-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)', textDecoration: 'none' }}>
                  <span className="ax-center" aria-hidden="true" style={{ inlineSize: 36, blockSize: 36, borderRadius: 'var(--ax-radius-md)', background: 'var(--ax-accent-wash)', color: 'var(--ax-accent)' }}>
                    <Icon name={m.icon} />
                  </span>
                  <span style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)', fontSize: 'var(--ax-text-sm)' }}>{m.label}</span>
                  <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{m.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default ResumenMarca;
