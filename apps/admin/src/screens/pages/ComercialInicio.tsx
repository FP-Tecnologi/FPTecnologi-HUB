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
  const nombre = (user?.nombre ?? '').split(' ')[0];

  return (
    <>
      <PageHead title={nombre ? `Hola, ${nombre}` : 'Inicio comercial'} subtitle={`Tu trabajo de hoy en ${marcas.length > 1 ? 'todas tus marcas' : 'tu marca'}. La marca con la que abres el CRM se cambia desde el menú lateral.`} />
      {error && <div className="ax-alert ax-alert--danger" role="alert" style={{ marginBottom: 'var(--ax-space-4)' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'var(--ax-space-3)', marginBottom: 'var(--ax-space-5)' }}>
        <Tarjeta etiqueta="Mis oportunidades abiertas" valor={abiertas ? String(abiertas.length) : '…'} />
        <Tarjeta etiqueta="Mi pipeline" valor={abiertas ? montos(pipeline) : '…'} />
        <Tarjeta etiqueta="Pendientes de hoy" valor={agenda ? String(tareasHoy.length + accionesVencidas.length) : '…'} />
        <Tarjeta etiqueta="Marcas en las que trabajo" valor={String(new Set((abiertas ?? []).map((o) => o.marcaId)).size || marcas.length)} />
      </div>

      <div className="ax-card" style={{ marginBottom: 'var(--ax-space-5)' }}>
        <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Pendientes de hoy</h2><p className="ax-card__subtitle">Tareas por hacer y oportunidades con próxima acción vencida.</p></div></div>
        <div className="ax-card__body">
          {!agenda ? <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>Cargando…</p> : tareasHoy.length + accionesVencidas.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>No tienes pendientes para hoy.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
              {tareasHoy.map((t) => (
                <li key={t.id}><button type="button" onClick={() => abrir(t.marcaId, t.oportunidad.id)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 'var(--ax-space-2)', alignItems: 'center', flexWrap: 'wrap' }}><Icon name="bell" className="ax-icon" /><EtiquetaMarca m={t.marca} /><span><b>{t.texto}</b> · {t.oportunidad.titulo}</span></button></li>
              ))}
              {accionesVencidas.map((o) => (
                <li key={o.id}><button type="button" onClick={() => abrir(o.marcaId, o.id)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 'var(--ax-space-2)', alignItems: 'center', flexWrap: 'wrap' }}><Icon name="alert-triangle" className="ax-icon" /><EtiquetaMarca m={o.marca} /><span><b>{o.proximaAccion ?? 'Dar seguimiento'}</b> · {o.titulo} ({dinero(o.monto, o.moneda)})</span></button></li>
              ))}
            </ul>
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
