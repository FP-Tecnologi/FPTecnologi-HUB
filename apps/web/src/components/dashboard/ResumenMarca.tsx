'use client';
/*
 * FPTecnologi-HUB — resumen real del dashboard por marca (reemplaza el
 * placeholder "los indicadores aparecerán aquí"). Layout inspirado en el
 * statgroup + grid de cards de la plantilla Sales de Vireo, pero sin ninguna
 * cifra inventada: los conteos salen de los endpoints reales de cada módulo
 * (si un módulo todavía no tiene pantalla propia, su card cae en el catch-all
 * "Starter page" — mismo comportamiento que el resto del sidebar).
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Icon } from '../ui/Icon';

interface Conteos {
  productos: number | null;
  pedidos: number | null;
  cotizaciones: number | null;
  equipo: number | null;
}

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

export function ResumenMarca({ marcaId, rol }: { marcaId: string; rol: string }) {
  const [conteos, setConteos] = useState<Conteos>({ productos: null, pedidos: null, cotizaciones: null, equipo: null });

  useEffect(() => {
    let vivo = true;
    async function cargar() {
      const [productos, pedidos, cotizaciones, equipo] = await Promise.all([
        api.get<unknown[]>('/productos', { marcaId }).catch(() => null),
        api.get<unknown[]>('/pedidos', { marcaId }).catch(() => null),
        api.get<unknown[]>('/cotizaciones', { marcaId }).catch(() => null),
        api.get<unknown[]>(`/marcas/${marcaId}/equipo`, { marcaId }).catch(() => null),
      ]);
      if (!vivo) return;
      setConteos({
        productos: productos?.length ?? null,
        pedidos: pedidos?.length ?? null,
        cotizaciones: cotizaciones?.length ?? null,
        equipo: equipo?.length ?? null,
      });
    }
    cargar();
    return () => { vivo = false; };
  }, [marcaId]);

  const stat = (n: number | null) => (n === null ? '—' : n.toLocaleString('es-PE'));

  return (
    <>
      <section className="ax-card ax-card--flat ax-col--12" role="region" aria-label="Resumen de la marca">
        <div className="ax-card__body">
          <div className="ax-statgroup">
            <div className="ax-statgroup__cell">
              <span className="ax-statgroup__icon ax-statgroup__icon--c3"><Icon name="folders" /></span>
              <span className="ax-statgroup__text">
                <span className="ax-statgroup__label">Productos</span>
                <span className="ax-statgroup__value ax-num">{stat(conteos.productos)}</span>
              </span>
            </div>
            <div className="ax-statgroup__cell">
              <span className="ax-statgroup__icon ax-statgroup__icon--c4"><Icon name="shopping-cart" /></span>
              <span className="ax-statgroup__text">
                <span className="ax-statgroup__label">Pedidos</span>
                <span className="ax-statgroup__value ax-num">{stat(conteos.pedidos)}</span>
              </span>
            </div>
            <div className="ax-statgroup__cell">
              <span className="ax-statgroup__icon ax-statgroup__icon--c5"><Icon name="article" /></span>
              <span className="ax-statgroup__text">
                <span className="ax-statgroup__label">Cotizaciones</span>
                <span className="ax-statgroup__value ax-num">{stat(conteos.cotizaciones)}</span>
              </span>
            </div>
            <div className="ax-statgroup__cell">
              <span className="ax-statgroup__icon ax-statgroup__icon--c2"><Icon name="users-group" /></span>
              <span className="ax-statgroup__text">
                <span className="ax-statgroup__label">Equipo</span>
                <span className="ax-statgroup__value ax-num">{stat(conteos.equipo)}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="ax-card ax-col--12" role="region" aria-label="Módulos de la marca">
        <div className="ax-card__body">
          <h2 className="ax-card__title" style={{ marginBottom: 'var(--ax-space-1)' }}>Módulos</h2>
          <p style={{ margin: '0 0 var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
            Tu rol aquí: <b style={{ color: 'var(--ax-text-strong)' }}>{rol}</b>. Los que todavía no tienen pantalla propia muestran un starter — se van completando módulo por módulo.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--ax-space-3)' }}>
            {MODULOS.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="ax-card ax-card--flat"
                style={{ padding: 'var(--ax-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)', textDecoration: 'none' }}
              >
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
    </>
  );
}

export default ResumenMarca;
