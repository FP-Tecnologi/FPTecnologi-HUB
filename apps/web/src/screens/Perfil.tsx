'use client';
/*
 * FPTecnologi-HUB — "Mi perfil": identidad real, stats y marcas asignadas
 * (parte visible del grupo Mi cuenta). La edición vive en Configuración.
 */
import { PageHead } from '../components/shell/PageHead';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';

export function Perfil() {
  const { user, marcas, activeMarcaId, setActiveMarcaId } = useAuth();
  const marcaActiva = marcas.find((m) => m.marcaId === activeMarcaId) ?? marcas[0] ?? null;
  const esAdmin = marcas.some((m) => m.rol.nombre.toLowerCase() === 'admin');

  return (
    <>
      <PageHead title="Mi perfil" subtitle="Tu identidad y las marcas a tu cargo." />
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" role="region" aria-label="Identidad">
          <div className="ax-card__body">
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-4)', alignItems: 'center' }}>
              <Avatar nombre={user?.nombre} email={user?.email} avatarUrl={user?.avatarUrl} size={64} />
              <div style={{ minInlineSize: 0 }}>
                <h2 className="ax-card__title" style={{ margin: 0 }}>{user?.nombre || user?.email || 'Cuenta'}</h2>
                <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{user?.email}</p>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginTop: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                  {marcas.map((m) => (
                    <span key={m.marcaId} className={`ax-badge ax-badge--soft ax-badge--pill${m.marcaId === activeMarcaId ? ' ax-badge--accent' : ' ax-badge--neutral'}`}>
                      {m.marca.nombre} · {m.rol.nombre}
                    </span>
                  ))}
                  {marcas.length === 0 && <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Sin marcas asignadas</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ax-card ax-col--12" role="region" aria-label="Resumen">
          <div className="ax-card__body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ax-space-4)' }}>
              <div>
                <div className="ax-num" style={{ fontSize: 'var(--ax-text-2xl)', fontWeight: 600, color: 'var(--ax-text-strong)' }}>{marcas.length}</div>
                <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>Marcas asignadas</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--ax-text-2xl)', fontWeight: 600, color: 'var(--ax-text-strong)', textTransform: 'capitalize' }}>{marcaActiva ? marcaActiva.rol.nombre : '—'}</div>
                <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>Rol en marca activa</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--ax-text-2xl)', fontWeight: 600, color: 'var(--ax-text-strong)' }}>{esAdmin ? 'Sí' : 'No'}</div>
                <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>Administrador global</div>
              </div>
            </div>
          </div>
        </section>

        <section className="ax-card ax-col--12" role="region" aria-label="Marcas asignadas">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Empresas que administras</h2></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {marcas.length === 0 && (
              <p style={{ color: 'var(--ax-text-muted)', margin: 0 }}>No tienes ninguna marca asignada todavía.</p>
            )}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
              {marcas.map((m) => (
                <li
                  key={m.marcaId}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 'var(--ax-space-3) var(--ax-space-4)', borderRadius: 'var(--ax-radius-md)',
                    background: m.marcaId === activeMarcaId ? 'var(--ax-accent-wash)' : 'var(--ax-surface-subtle)',
                  }}
                >
                  <span>
                    <b style={{ textTransform: 'capitalize' }}>{m.marca.nombre}</b>
                    <span style={{ marginLeft: 'var(--ax-space-2)', color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-sm)' }}>{m.rol.nombre}</span>
                  </span>
                  {m.marcaId === activeMarcaId ? (
                    <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-accent)', fontWeight: 600 }}>Activa</span>
                  ) : (
                    <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setActiveMarcaId(m.marcaId)}>Usar esta marca</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

export default Perfil;
