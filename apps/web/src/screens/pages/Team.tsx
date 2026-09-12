'use client';
/*
 * FPTecnologi-HUB — "Usuarios y equipo": directorio del equipo con datos de
 * EJEMPLO para que la vista no se vea vacía (se reemplazarán por el endpoint
 * real GET /marcas/:marcaId/equipo cuando se limpie). Buscador, filtro por
 * rol y modal de invitación (local por ahora). Todo en español.
 */
import { useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';

interface Miembro {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  marca: string;
  estado: 'Activo' | 'Pendiente';
}

const MIEMBROS_EJEMPLO: Miembro[] = [
  { id: 'm1', nombre: 'Jaime Tarazona', email: 'jaime@fptecnologi.com', rol: 'admin', marca: 'FPTecnologi', estado: 'Activo' },
  { id: 'm2', nombre: 'María Fernández', email: 'maria.fernandez@fptecnologi.com', rol: 'ventas', marca: 'FPTecnologi', estado: 'Activo' },
  { id: 'm3', nombre: 'Carlos Quispe', email: 'carlos.quispe@fimavperu.com', rol: 'ventas', marca: 'Fimavperu', estado: 'Activo' },
  { id: 'm4', nombre: 'Lucía Ramos', email: 'lucia.ramos@kelqa.com', rol: 'marketing', marca: 'Kelqa', estado: 'Activo' },
  { id: 'm5', nombre: 'Diego Huamán', email: 'diego.huaman@imaninki.com', rol: 'soporte', marca: 'Imaninki', estado: 'Activo' },
  { id: 'm6', nombre: 'Sofía Mendoza', email: 'sofia.mendoza@quamtu.com', rol: 'comercial', marca: 'Quamtu', estado: 'Activo' },
  { id: 'm7', nombre: 'Pedro Castillo', email: 'pedro.castillo@fptecnologi.com', rol: 'logistica', marca: 'FPTecnologi', estado: 'Activo' },
  { id: 'm8', nombre: 'Ana Torres', email: 'ana.torres@fptecnologi.com', rol: 'finanzas', marca: 'FPTecnologi', estado: 'Pendiente' },
  { id: 'm9', nombre: 'Luis Vargas', email: 'luis.vargas@kelqa.com', rol: 'asesores', marca: 'Kelqa', estado: 'Pendiente' },
  { id: 'm10', nombre: 'Carmen Flores', email: 'carmen.flores@fimavperu.com', rol: 'soporte', marca: 'Fimavperu', estado: 'Activo' },
];

const ROLES = ['Todos', 'admin', 'ventas', 'marketing', 'comercial', 'soporte', 'logistica', 'finanzas', 'asesores'];

function initialsOf(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
}

export function Team() {
  const [q, setQ] = useState('');
  const [rol, setRol] = useState('Todos');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [invNombre, setInvNombre] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [invRol, setInvRol] = useState('ventas');

  const filtrados = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return MIEMBROS_EJEMPLO.filter((m) => {
      if (rol !== 'Todos' && m.rol !== rol) return false;
      if (!needle) return true;
      return (
        m.nombre.toLowerCase().includes(needle) ||
        m.email.toLowerCase().includes(needle) ||
        m.marca.toLowerCase().includes(needle)
      );
    });
  }, [q, rol]);

  function sendInvite(ev: React.FormEvent) {
    ev.preventDefault();
    if (!invNombre.trim() || !invEmail.trim()) return;
    setInviteSent(true);
  }

  function closeInvite() {
    setInviteOpen(false);
    setInviteSent(false);
    setInvNombre('');
    setInvEmail('');
    setInvRol('ventas');
  }

  return (
    <>
      <PageHead
        title="Usuarios y equipo"
        subtitle="Quiénes trabajan en cada marca y con qué rol."
        actions={
          <button type="button" className="ax-btn ax-btn--primary" onClick={() => setInviteOpen(true)}>
            <span className="ax-btn__label">Invitar miembro</span>
          </button>
        }
      />

      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" role="region" aria-label="Directorio del equipo">
          <div className="ax-card__body">
            <p style={{ margin: '0 0 var(--ax-space-4)', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
              Datos de ejemplo — se reemplazarán por el equipo real.
            </p>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', marginBlockEnd: 'var(--ax-space-4)', flexWrap: 'wrap' }}>
              <div className="ax-field" style={{ minInlineSize: 220, flex: '1 1 auto' }}>
                <label className="ax-label" htmlFor="equipo-buscar">Buscar</label>
                <input
                  id="equipo-buscar" type="search" className="ax-input"
                  placeholder="Nombre, correo o marca…"
                  value={q} onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div className="ax-field" style={{ minInlineSize: 180 }}>
                <label className="ax-label" htmlFor="equipo-rol">Rol</label>
                <select id="equipo-rol" className="ax-select" value={rol} onChange={(e) => setRol(e.target.value)}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r === 'Todos' ? 'Todos los roles' : r}</option>
                  ))}
                </select>
              </div>
            </div>

            {filtrados.length === 0 && (
              <p style={{ color: 'var(--ax-text-muted)', margin: 0 }}>Sin resultados para esa búsqueda.</p>
            )}

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--ax-space-3)' }}>
              {filtrados.map((m) => (
                <li key={m.id} className="ax-card" style={{ margin: 0 }}>
                  <div className="ax-card__body" style={{ display: 'flex', gap: 'var(--ax-space-3)', alignItems: 'center' }}>
                    <span className="ax-avatar" style={{ width: 44, height: 44, fontSize: 15, borderRadius: 'var(--ax-radius-pill)', background: 'var(--ax-accent-wash)', color: 'var(--ax-accent)', flex: '0 0 auto' }}>
                      <span className="ax-avatar__initials">{initialsOf(m.nombre)}</span>
                    </span>
                    <div style={{ minInlineSize: 0, flex: '1 1 auto' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ax-text-strong)', fontSize: 'var(--ax-text-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.nombre}
                      </div>
                      <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.email}
                      </div>
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginTop: 'var(--ax-space-1)' }}>
                        <span className="ax-badge ax-badge--soft ax-badge--pill ax-badge--accent">{m.rol}</span>
                        <span style={{ fontSize: 'var(--ax-text-2xs)', color: 'var(--ax-text-subtle)', textTransform: 'capitalize' }}>{m.marca}</span>
                        <span style={{ fontSize: 'var(--ax-text-2xs)', color: m.estado === 'Activo' ? 'var(--ax-success-500)' : 'var(--ax-warning-500)' }}>· {m.estado}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p style={{ margin: 'var(--ax-space-4) 0 0', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
              {filtrados.length} de {MIEMBROS_EJEMPLO.length} miembros.
            </p>
          </div>
        </section>
      </div>

      {inviteOpen && (
        <div role="dialog" aria-modal="true" aria-label="Invitar miembro" style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.45)', padding: 'var(--ax-space-4)' }} onClick={closeInvite}>
          <div className="ax-card" style={{ width: '100%', maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="ax-card__body">
              <h2 className="ax-card__title" style={{ marginBottom: 'var(--ax-space-4)' }}>Invitar miembro</h2>
              {!inviteSent ? (
                <form onSubmit={sendInvite} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
                  <div className="ax-field">
                    <label className="ax-label" htmlFor="inv-nombre">Nombre</label>
                    <input id="inv-nombre" type="text" className="ax-input" value={invNombre} onChange={(e) => setInvNombre(e.target.value)} required />
                  </div>
                  <div className="ax-field">
                    <label className="ax-label" htmlFor="inv-email">Correo</label>
                    <input id="inv-email" type="email" className="ax-input" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} required />
                  </div>
                  <div className="ax-field">
                    <label className="ax-label" htmlFor="inv-rol">Rol</label>
                    <select id="inv-rol" className="ax-select" value={invRol} onChange={(e) => setInvRol(e.target.value)}>
                      {ROLES.filter((r) => r !== 'Todos').map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                    Por ahora la invitación es demostrativa: la creación real de cuentas llega con la limpieza de datos.
                  </p>
                  <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                    <button type="button" className="ax-btn ax-btn--ghost" onClick={closeInvite}>
                      <span className="ax-btn__label">Cancelar</span>
                    </button>
                    <button type="submit" className="ax-btn ax-btn--primary">
                      <span className="ax-btn__label">Enviar invitación</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div role="status" className="ax-alert ax-alert--success" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                    <div className="ax-alert__content"><p className="ax-alert__message">Invitación preparada para {invEmail}. Se enviará cuando se active la creación real.</p></div>
                  </div>
                  <div className="ax-cluster" style={{ justifyContent: 'flex-end' }}>
                    <button type="button" className="ax-btn ax-btn--secondary" onClick={closeInvite}>
                      <span className="ax-btn__label">Cerrar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Team;
