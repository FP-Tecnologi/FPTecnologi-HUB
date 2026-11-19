'use client';
/*
 * FPTecnologi-HUB — Inicio de la vista Comercial: lo que el comercial necesita al abrir el día (sus pendientes y su
 * embudo) y accesos directos a sus herramientas. Los datos salen del CRM de la marca con la que trabaja; la etiqueta
 * de marca arriba (PageHead) dice cuál es, y se cambia en el selector del menú lateral.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHead } from '../../components/shell/PageHead';
import { Icon } from '../../components/ui/Icon';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ABIERTAS, EtiquetaMarca, dinero, montos, vencida, type MarcaRef, type Oportunidad } from './crm/comun';

interface Agenda { tareas: { id: string; texto: string; fecha: string; marcaId: string; marca: MarcaRef; oportunidad: { id: string; titulo: string } }[]; acciones: Oportunidad[] }

const ATAJOS: { href: string; icon: string; titulo: string; detalle: string }[] = [
  { href: '/crm/mi-embudo', icon: 'layout-grid', titulo: 'Mi embudo', detalle: 'Mueve tus oportunidades por etapa' },
  { href: '/crm/mi-agenda', icon: 'bell', titulo: 'Mi agenda', detalle: 'Llamadas, reuniones y tareas' },
  { href: '/crm/empresas', icon: 'users-group', titulo: 'Empresas y contactos', detalle: 'Clientes y prospectos' },
  { href: '/cotizador/leads', icon: 'article', titulo: 'Leads del cotizador', detalle: 'Solicitudes nuevas de la web' },
  { href: '/campanas/landings', icon: 'diamond', titulo: 'Campañas y landings', detalle: 'Tus páginas de captación' },
  { href: '/mailing/editor', icon: 'article', titulo: 'Mailing', detalle: 'Correos a tus clientes' },
  { href: '/web/folletos', icon: 'photo', titulo: 'Folletos', detalle: 'Catálogos para compartir' },
  { href: '/web/recursos', icon: 'folders', titulo: 'Recursos', detalle: 'Logos, videos y material' },
];

const ESTILOS = `
.ci-lista{display:flex;flex-direction:column;gap:var(--ax-space-2);margin:0;padding:0;list-style:none}
.ci-fila{all:unset;box-sizing:border-box;width:100%;display:grid;grid-template-columns:56px minmax(0,1fr);gap:var(--ax-space-3);align-items:center;padding:var(--ax-space-3);border-radius:var(--ax-radius-md);border:1px solid var(--ax-border);border-inline-start:3px solid var(--c,var(--ax-border));background:var(--ax-surface-raised,var(--ax-surface));cursor:pointer;transition:box-shadow .2s}
.ci-fila:hover{box-shadow:var(--ax-shadow-sm,0 1px 6px rgba(0,0,0,.08))}
.ci-fila:focus-visible{outline:2px solid var(--ax-focus-ring,var(--ax-accent));outline-offset:2px}
.ci-hora{display:flex;flex-direction:column;line-height:1.25}
.ci-hora b{font-size:var(--ax-text-sm);color:var(--ax-text-strong);font-variant-numeric:tabular-nums}
.ci-hora span{font-size:var(--ax-text-xs);color:var(--ax-text-subtle)}
.ci-cuerpo{display:flex;flex-direction:column;gap:4px;min-width:0}
.ci-tit{font-weight:var(--ax-weight-semibold);color:var(--ax-text-strong);line-height:1.3;overflow-wrap:anywhere}
.ci-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;font-size:var(--ax-text-xs);color:var(--ax-text-muted)}
`;

export function ComercialInicio() {
  const router = useRouter();
  const { user, marcas, activeMarcaId, setActiveMarcaId } = useAuth();
  const [abiertas, setAbiertas] = useState<Oportunidad[] | null>(null);
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeMarcaId) return;
    setAbiertas(null); setAgenda(null); setError('');
    // Todas las marcas donde trabajas, en una sola lista (cada fila trae su marca).
    api.get<Oportunidad[]>('/crm/global/oportunidades?estado=abiertas&asignado=yo').then(setAbiertas).catch(() => setError('No se pudo cargar tu embudo del CRM.'));
    api.get<Agenda>('/crm/global/agenda?mias=1').then(setAgenda).catch(() => setError('No se pudo cargar tu agenda del CRM.'));
  }, [activeMarcaId]);

  /** Abre la oportunidad en su embudo; si es de otra marca, cambia primero de marca sin salir de la vista Comercial. */
  function abrir(marcaId: string | undefined, id: string) {
    if (marcaId && marcaId !== activeMarcaId) setActiveMarcaId(marcaId, { mantenerVista: true });
    router.push(`/crm/mi-embudo?id=${id}`);
  }
  const pipeline = (abiertas ?? []).reduce<Record<string, number>>((a, o) => ((a[o.moneda] = (a[o.moneda] ?? 0) + Number(o.monto ?? 0)), a), {});

  const hoy = new Date(); hoy.setHours(23, 59, 59, 999);
  const tareasHoy = (agenda?.tareas ?? []).filter((t) => new Date(t.fecha).getTime() <= hoy.getTime());
  const accionesVencidas = (agenda?.acciones ?? []).filter((o) => ABIERTAS.includes(o.etapa) && vencida(o.proximaAccionAt));
  // Pendientes de hoy y vencidos (tareas y próximas acciones) en una sola lista, del más antiguo al más próximo.
  const pendientes = [
    ...tareasHoy.map((t) => ({ clave: `t${t.id}`, tarea: true, fecha: t.fecha, titulo: t.texto, detalle: t.oportunidad.titulo, marcaId: t.marcaId, marca: t.marca, opId: t.oportunidad.id, vencida: vencida(t.fecha) })),
    ...accionesVencidas.map((o) => ({ clave: `a${o.id}`, tarea: false, fecha: o.proximaAccionAt!, titulo: o.proximaAccion ?? 'Dar seguimiento', detalle: `${o.titulo} (${dinero(o.monto, o.moneda)})`, marcaId: o.marcaId, marca: o.marca, opId: o.id, vencida: true })),
  ].sort((x, y) => new Date(x.fecha).getTime() - new Date(y.fecha).getTime());
  const nombre = (user?.nombre ?? '').split(' ')[0];

  return (
    <>
      <style>{ESTILOS}</style>
      <PageHead title={nombre ? `Hola, ${nombre}` : 'Inicio comercial'} subtitle={`Tu trabajo de hoy en ${marcas.length > 1 ? 'todas tus marcas' : 'tu marca'}. La marca con la que abres el CRM se cambia desde el menú lateral.`} />
      {error && <div className="ax-alert ax-alert--danger" role="alert" style={{ marginBottom: 'var(--ax-space-4)' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'var(--ax-space-3)', marginBottom: 'var(--ax-space-5)' }}>
        <Tarjeta etiqueta="Mis oportunidades abiertas" valor={abiertas ? String(abiertas.length) : '…'} />
        <Tarjeta etiqueta="Mi pipeline" valor={abiertas ? montos(pipeline) : '…'} />
        <Tarjeta etiqueta="Pendientes de hoy" valor={agenda ? String(pendientes.length) : '…'} />
        <Tarjeta etiqueta="Marcas en las que trabajo" valor={String(new Set((abiertas ?? []).map((o) => o.marcaId)).size || marcas.length)} />
      </div>

      <div className="ax-card" style={{ marginBottom: 'var(--ax-space-5)' }}>
        <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Pendientes de hoy</h2><p className="ax-card__subtitle">Tareas por hacer y oportunidades con próxima acción vencida.</p></div></div>
        <div className="ax-card__body">
          {!agenda ? <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>Cargando…</p> : pendientes.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>No tienes pendientes para hoy.</p>
          ) : (
            <><ul className="ci-lista">
              {pendientes.map((i) => (
                <li key={i.clave}>
                  <button type="button" className="ci-fila" style={{ ['--c' as string]: i.vencida ? 'var(--ax-danger-500)' : i.tarea ? 'var(--ax-viz-amber)' : 'var(--ax-viz-emerald)' }} onClick={() => abrir(i.marcaId, i.opId)}>
                    <span className="ci-hora"><b>{new Date(i.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</b><span>{new Date(i.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</span></span>
                    <span className="ci-cuerpo">
                      <span className="ci-tit">{i.titulo}</span>
                      <span className="ci-meta">
                        <span className={`ax-badge ax-badge--soft ax-badge--sm ${i.tarea ? 'ax-badge--warning' : 'ax-badge--success'}`}>{i.tarea ? 'Tarea' : 'Próxima acción'}</span>
                        {i.vencida && <span className="ax-badge ax-badge--soft ax-badge--sm ax-badge--danger">Vencida</span>}
                        <EtiquetaMarca m={i.marca} />
                        <span>{i.detalle}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <Link href="/crm/mi-agenda" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ marginBlockStart: 'var(--ax-space-3)' }}>Ver mi agenda completa</Link></>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: 'var(--ax-text-md)', margin: '0 0 var(--ax-space-3)' }}>Tus herramientas</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 'var(--ax-space-3)' }}>
        {ATAJOS.map((a) => (
          <Link key={a.href} href={a.href} className="ax-card" style={{ padding: 'var(--ax-space-4)', display: 'flex', gap: 'var(--ax-space-3)', alignItems: 'center', textDecoration: 'none' }}>
            <Icon name={a.icon} className="ax-icon" />
            <span><b style={{ display: 'block', color: 'var(--ax-text-strong)' }}>{a.titulo}</b><span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>{a.detalle}</span></span>
          </Link>
        ))}
      </div>
    </>
  );
}

function Tarjeta({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="ax-card" style={{ padding: 'var(--ax-space-4)' }}>
      <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>{etiqueta}</div>
      <div style={{ fontSize: 'var(--ax-text-lg)', fontWeight: 600, color: 'var(--ax-text-strong)', marginTop: 2 }}>{valor}</div>
    </div>
  );
}

export default ComercialInicio;
