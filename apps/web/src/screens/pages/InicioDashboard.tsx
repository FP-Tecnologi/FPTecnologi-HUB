'use client';
/*
 * FPTecnologi-HUB — Inicio → Dashboards: tablero comercial de la marca activa. Reúne lo que hay que ATENDER
 * (pedidos por confirmar, cotizaciones y leads sin responder, contactos, chats con asesor), el embudo comercial
 * (leads → cotizaciones → pedidos) y el rendimiento de campañas y landings. Todo sale de los endpoints reales
 * de cada módulo; si el rol no tiene acceso a alguno, esa tarjeta muestra el estado vacío.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { ApexChart } from '../../components/charts/ApexChart';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { useResumen, contarPorEstado, sumarPorMes, ultimosMeses } from '../../components/dashboard/useResumen';

interface CampanaFila { id: string; nombre: string; estado: string; registros: number; landings: { id: string; nombre: string; registros: number }[] }
interface LandingFila { id: string; nombre: string; slug: string; estado: string; _count: { registros: number } }

const usd = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

function Pendiente({ icon, tono, label, valor, href }: { icon: string; tono: string; label: string; valor: number | null; href: string }) {
  return (
    <Link href={href} className="ax-statgroup__cell" style={{ textDecoration: 'none', color: 'inherit' }}>
      <span className={`ax-statgroup__icon ax-statgroup__icon--${tono}`}><Icon name={icon} /></span>
      <span className="ax-statgroup__text"><span className="ax-statgroup__label">{label}</span><span className="ax-statgroup__value ax-num">{valor ?? '—'}</span></span>
    </Link>
  );
}

export function InicioDashboard() {
  const { activeMarcaId, marcas } = useAuth();
  const { datos, cargando } = useResumen(activeMarcaId ? [activeMarcaId] : []);
  const [campanas, setCampanas] = useState<CampanaFila[] | null>(null);
  const [landings, setLandings] = useState<LandingFila[] | null>(null);
  const marca = marcas.find((m) => m.marcaId === activeMarcaId)?.marca.nombre ?? 'la marca';

  useEffect(() => {
    if (!activeMarcaId) return;
    api.get<CampanaFila[]>('/campanas').then(setCampanas).catch(() => setCampanas(null));
    api.get<LandingFila[]>('/landings').then(setLandings).catch(() => setLandings(null));
  }, [activeMarcaId]);

  const cuenta = (filas: { estado: string }[] | null, ...estados: string[]) => (filas ? filas.filter((f) => estados.includes(f.estado)).length : null);
  const pedidosPorConfirmar = cuenta(datos.pedidos, 'PENDIENTE');
  const leadsNuevos = cuenta(datos.leads, 'NUEVO');
  const cotizPend = cuenta(datos.cotizaciones, 'PENDIENTE', 'EN_REVISION');
  const contactosNuevos = cuenta(datos.contactos, 'NUEVO');
  const chatsAsesor = cuenta(datos.chat, 'ASESOR');

  // Embudo: leads del cotizador → cotizaciones de servicios → pedidos válidos
  const nLeads = datos.leads?.length ?? null;
  const nCot = datos.cotizaciones?.length ?? null;
  const nPed = datos.pedidos ? datos.pedidos.filter((p) => p.estado !== 'CANCELADO').length : null;
  const nGanados = datos.leads ? datos.leads.filter((l) => l.estado === 'GANADO').length : null;
  const embudo = [
    { n: 'Leads del cotizador', v: nLeads }, { n: 'Cotizaciones de servicios', v: nCot }, { n: 'Pedidos de la tienda', v: nPed },
  ];
  const conv = nLeads ? Math.round(((nGanados ?? 0) / nLeads) * 100) : null;

  const meses = ultimosMeses(6);
  const ingresos = datos.pedidos ? sumarPorMes(datos.pedidos, meses) : null;
  const ventas30 = datos.pedidos
    ? datos.pedidos.filter((p) => p.estado !== 'CANCELADO' && Date.now() - new Date(p.createdAt).getTime() < 30 * 86_400_000).reduce((s, p) => s + Number(p.total), 0)
    : null;
  const stockBajo = datos.productos ? datos.productos.filter((p) => p.activo && p.stock <= 5).length : null;

  const topLandings = [...(landings ?? [])].sort((a, b) => b._count.registros - a._count.registros).slice(0, 5);

  return (
    <>
      <PageHead title="Dashboard comercial" subtitle={`Qué atender hoy y cómo van las ventas, cotizaciones y campañas de ${marca}.`} />
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" aria-label="Pendientes">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Por atender</h2><p className="ax-card__subtitle">{cargando ? 'Actualizando…' : 'Cada tarjeta lleva al módulo para gestionarlo.'}</p></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            <div className="ax-statgroup" style={{ boxShadow: 'none', border: 0, padding: 0 }}>
              <Pendiente icon="shopping-cart" tono="c1" label="Pedidos por confirmar" valor={pedidosPorConfirmar} href="/ecommerce/pedidos" />
              <Pendiente icon="article" tono="c2" label="Cotizaciones por responder" valor={cotizPend} href="/soluciones/cotizaciones" />
              <Pendiente icon="user" tono="c3" label="Leads nuevos" valor={leadsNuevos} href="/cotizador/leads" />
              <Pendiente icon="messages" tono="c4" label="Contactos nuevos" valor={contactosNuevos} href="/web/contactos" />
              <Pendiente icon="headset" tono="c1" label="Chats con asesor" valor={chatsAsesor} href="/chat/conversaciones" />
              <Pendiente icon="folders" tono="c2" label="Productos con stock bajo" valor={stockBajo} href="/ecommerce/productos" />
            </div>
          </div>
        </section>

        <section className="ax-card ax-col--8" aria-label="Ingresos">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Ingresos</h2><p className="ax-card__subtitle">Últimos 6 meses · {ventas30 !== null ? `${usd(ventas30)} en los últimos 30 días` : 'sin acceso a pedidos con tu rol'}</p></div><Link className="ax-btn ax-btn--link" href="/reportes/ventas">Reporte completo</Link></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {ingresos && ingresos.some((v) => v > 0) ? <ApexChart type="area" height={280} legend="none" accent ariaLabel="Ingresos mensuales" series={[{ name: 'Ingresos', data: ingresos }]} apex={{ xaxis: { categories: meses.map((m) => m.label) } }} /> : <p style={{ margin: 0, padding: 'var(--ax-space-6) 0', textAlign: 'center', color: 'var(--ax-text-subtle)' }}>Aún no hay ventas registradas.</p>}
          </div>
        </section>
        <section className="ax-card ax-col--4" aria-label="Embudo comercial">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Embudo comercial</h2><p className="ax-card__subtitle">{conv !== null ? `${conv}% de los leads cerró como ganado` : 'Leads → cotizaciones → pedidos'}</p></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {embudo.every((e) => !e.v) ? <p style={{ margin: 0, color: 'var(--ax-text-subtle)' }}>Sin datos todavía.</p> : (
              <ApexChart type="bar" height={230} legend="none" ariaLabel="Embudo comercial" series={[{ name: 'Total', data: embudo.map((e) => e.v ?? 0) }]} apex={{ plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '55%', distributed: true } }, xaxis: { categories: embudo.map((e) => e.n) }, dataLabels: { enabled: true } }} />
            )}
          </div>
        </section>

        <section className="ax-card ax-col--6" aria-label="Campañas">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Campañas</h2><p className="ax-card__subtitle">Registros captados por campaña</p></div><Link className="ax-btn ax-btn--link" href="/campanas/campanas">Ver campañas</Link></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {!campanas ? <p style={{ margin: 0, color: 'var(--ax-text-subtle)' }}>Sin acceso con tu rol.</p> : campanas.length === 0 ? <p style={{ margin: 0, color: 'var(--ax-text-subtle)' }}>Aún no hay campañas.</p> : (
              <ul className="ax-list">{campanas.slice(0, 6).map((c) => (
                <li key={c.id} className="ax-list__row" style={{ paddingInline: 0 }}><span className="ax-list__content"><span className="ax-list__title">{c.nombre}</span><span className="ax-list__meta">{c.estado.toLowerCase()} · {c.landings.length} landing{c.landings.length === 1 ? '' : 's'}</span></span><span className="ax-list__trailing ax-num">{c.registros}</span></li>
              ))}</ul>
            )}
          </div>
        </section>
        <section className="ax-card ax-col--6" aria-label="Landing pages">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Landing pages</h2><p className="ax-card__subtitle">Las que más registros traen</p></div><Link className="ax-btn ax-btn--link" href="/campanas/landings">Ver landings</Link></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {!landings ? <p style={{ margin: 0, color: 'var(--ax-text-subtle)' }}>Sin acceso con tu rol.</p> : topLandings.length === 0 ? <p style={{ margin: 0, color: 'var(--ax-text-subtle)' }}>Aún no hay landings.</p> : (
              <ul className="ax-list">{topLandings.map((l) => (
                <li key={l.id} className="ax-list__row" style={{ paddingInline: 0 }}><span className="ax-list__content"><span className="ax-list__title"><Link href={`/campanas/landings?id=${l.id}`}>{l.nombre}</Link></span><span className="ax-list__meta">/l/{l.slug} · {l.estado === 'PUBLICADA' ? 'publicada' : 'borrador'}</span></span><span className="ax-list__trailing ax-num">{l._count.registros}</span></li>
              ))}</ul>
            )}
          </div>
        </section>
        {datos.pedidos && (
          <section className="ax-card ax-col--12" aria-label="Pedidos por estado">
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Pedidos por estado</h2></div><Link className="ax-btn ax-btn--link" href="/ecommerce/pedidos">Gestionar pedidos</Link></div>
            <div className="ax-card__body ax-cluster" style={{ paddingTop: 0, gap: 'var(--ax-space-6)', flexWrap: 'wrap' }}>
              {['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'].map((e, i) => (
                <div key={e}><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>{e.charAt(0) + e.slice(1).toLowerCase()}</div><strong style={{ fontSize: 'var(--ax-text-xl)' }}>{contarPorEstado(datos.pedidos!, ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'])[i]}</strong></div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default InicioDashboard;
