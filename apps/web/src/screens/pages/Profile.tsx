'use client';
/*
 * FPTecnologi-HUB · Dashboard — Perfil.
 *
 * Cabecera de identidad con los datos reales de la sesión (nombre / correo de
 * useAuth), franja de stats derivada de las marcas asignadas y pestañas
 * Resumen / Actividad / Marcas. Sin datos inventados: donde no hay dato real
 * se muestra un estado vacío honesto.
 */
import { useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth } from '../../context/AuthContext';

type Tab = 'resumen' | 'actividad' | 'marcas';

function iniciales(nombre: string | undefined, email: string | undefined): string {
  const base = (nombre ?? '').trim();
  if (base) {
    const partes = base.split(/\s+/);
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return base.slice(0, 2).toUpperCase();
  }
  return (email ?? 'US').slice(0, 2).toUpperCase();
}

export function Profile() {
  const { user, marcas, activeMarcaId } = useAuth();
  const [tab, setTab] = useState<Tab>('resumen');

  const nombre = user?.nombre?.trim() || user?.email || 'Usuario';
  const correo = user?.email || 'Sin correo registrado';
  const sigla = iniciales(user?.nombre, user?.email);

  const asignacionActiva = marcas.find((m) => m.marcaId === activeMarcaId) ?? null;
  const rolEnActiva = asignacionActiva?.rol.nombre ?? 'Sin marca activa';
  const marcaActivaNombre = asignacionActiva?.marca.nombre ?? '—';
  const esAdminGlobal = marcas.some((m) => m.rol.nombre.toLowerCase() === 'admin');

  return (
    <>
      <PageHead
        title="Perfil"
        subtitle="Datos de tu cuenta y marcas asignadas en FPTecnologi-HUB."
      />

      <div className="ax-dash-grid">
        {/* CABECERA DE IDENTIDAD */}
        <section className="ax-card ax-col--12" role="region" aria-label="Datos de la cuenta" style={{ overflow: 'hidden' }}>
          <div aria-hidden="true" style={{ height: 168, background: 'radial-gradient(120% 160% at 12% 0%, color-mix(in oklab,var(--ax-accent) 42%,transparent), transparent 60%), radial-gradient(90% 140% at 88% 10%, color-mix(in oklab,var(--ax-viz-violet) 34%,transparent), transparent 58%), linear-gradient(120deg, var(--ax-surface-subtle), var(--ax-surface-raised))', position: 'relative' }}>
            <span style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--ax-border) 1px,transparent 1px),linear-gradient(90deg,var(--ax-border) 1px,transparent 1px)', backgroundSize: '34px 34px', opacity: 0.4 }} />
          </div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-5)', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: -56, position: 'relative' }}>
              <span className="ax-avatar ax-avatar--2xl ax-avatar--ringed" style={{ boxShadow: '0 0 0 4px var(--ax-surface-raised),0 0 0 6px var(--ax-accent)', background: 'color-mix(in oklab,var(--ax-accent) 16%,var(--ax-surface-solid))', color: 'var(--ax-accent)' }}>
                <span className="ax-avatar__initials" style={{ fontSize: 'var(--ax-text-2xl)' }}>{sigla}</span>
                <span className="ax-avatar__status ax-avatar__status--online" aria-hidden="true" />
              </span>
              <div style={{ flex: '1 1 240px', minWidth: 0, paddingBottom: 'var(--ax-space-2)' }}>
                <h2 style={{ fontFamily: 'var(--ax-font-display)', fontSize: 'var(--ax-text-xl)', fontWeight: 700, color: 'var(--ax-text-strong)', lineHeight: 1.2 }}>{nombre}</h2>
                <div style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)', marginTop: 2 }}>{correo}</div>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginTop: 'var(--ax-space-3)' }}>
                  {marcas.length === 0 && (
                    <span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">Sin marcas asignadas</span>
                  )}
                  {marcas.map((m) => (
                    <span key={m.marcaId} className="ax-badge ax-badge--soft ax-badge--accent ax-badge--pill">
                      {m.marca.nombre} · {m.rol.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FRANJA DE STATS REALES */}
        <div className="ax-card ax-kpi ax-col--4" role="region" aria-label="Marcas asignadas">
          <div className="ax-card__body">
            <div className="ax-kpi__label">Marcas asignadas</div>
            <div className="ax-kpi__value ax-num">{marcas.length}</div>
          </div>
        </div>
        <div className="ax-card ax-kpi ax-col--4" role="region" aria-label="Rol en la marca activa">
          <div className="ax-card__body">
            <div className="ax-kpi__label">Rol en la marca activa ({marcaActivaNombre})</div>
            <div className="ax-kpi__value" style={{ fontSize: 'var(--ax-text-lg)' }}>{rolEnActiva}</div>
          </div>
        </div>
        <div className="ax-card ax-kpi ax-col--4" role="region" aria-label="Acceso de administración global">
          <div className="ax-card__body">
            <div className="ax-kpi__label">Administración global</div>
            <div className="ax-kpi__value" style={{ fontSize: 'var(--ax-text-lg)' }}>{esAdminGlobal ? 'Sí' : 'No'}</div>
          </div>
        </div>

        {/* CONTENIDO POR PESTAÑAS */}
        <section className="ax-card ax-col--12" role="region" aria-label="Detalle del perfil">
          <div className="ax-card__body">
            <div className="ax-tabs">
              <div className="ax-tabs__list" role="tablist" aria-label="Secciones del perfil">
                <button type="button" className="ax-tabs__tab" role="tab" id="tab-resumen" aria-selected={tab === 'resumen'} onClick={() => setTab('resumen')}>Resumen</button>
                <button type="button" className="ax-tabs__tab" role="tab" id="tab-actividad" aria-selected={tab === 'actividad'} onClick={() => setTab('actividad')}>Actividad</button>
                <button type="button" className="ax-tabs__tab" role="tab" id="tab-marcas" aria-selected={tab === 'marcas'} onClick={() => setTab('marcas')}>Marcas</button>
              </div>

              {tab === 'resumen' && (
                <div className="ax-tabs__panel" role="tabpanel" aria-labelledby="tab-resumen">
                  <section role="region" aria-label="Acerca de">
                    <div className="ax-card__titles" style={{ marginBottom: 'var(--ax-space-3)' }}>
                      <h3 className="ax-card__title">Acerca de</h3>
                    </div>
                    <ul className="ax-list ax-list--compact">
                      <li className="ax-list__row" style={{ paddingInline: 0 }}>
                        <span className="ax-list__content"><span className="ax-list__title">{correo}</span></span>
                      </li>
                      {marcas.length === 0 ? (
                        <li className="ax-list__row" style={{ paddingInline: 0 }}>
                          <span className="ax-list__content"><span className="ax-list__title">Todavía no tienes marcas asignadas.</span></span>
                        </li>
                      ) : (
                        marcas.map((m) => (
                          <li key={m.marcaId} className="ax-list__row" style={{ paddingInline: 0 }}>
                            <span className="ax-list__content">
                              <span className="ax-list__title">{m.marca.nombre}</span>
                              <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Rol: {m.rol.nombre}</span>
                            </span>
                            {m.marcaId === activeMarcaId && (
                              <span className="ax-badge ax-badge--soft ax-badge--accent ax-badge--pill">Activa</span>
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                  </section>
                </div>
              )}

              {tab === 'actividad' && (
                <div className="ax-tabs__panel" role="tabpanel" aria-labelledby="tab-actividad">
                  <p style={{ color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-sm)' }}>
                    Todavía no hay actividad registrada para tu cuenta.
                  </p>
                </div>
              )}

              {tab === 'marcas' && (
                <div className="ax-tabs__panel" role="tabpanel" aria-labelledby="tab-marcas">
                  {marcas.length === 0 ? (
                    <p style={{ color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-sm)' }}>
                      Todavía no tienes marcas asignadas. Pide a un administrador que te asigne una.
                    </p>
                  ) : (
                    <ul className="ax-list ax-list--compact">
                      {marcas.map((m) => (
                        <li key={m.marcaId} className="ax-list__row" style={{ paddingInline: 0 }}>
                          <span className="ax-list__content">
                            <span className="ax-list__title">{m.marca.nombre}</span>
                            <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Rol: {m.rol.nombre}</span>
                          </span>
                          {m.marcaId === activeMarcaId && (
                            <span className="ax-badge ax-badge--soft ax-badge--accent ax-badge--pill">Activa</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Profile;
