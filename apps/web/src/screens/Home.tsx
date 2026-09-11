'use client';
/*
 * FPTecnologi-HUB — Panel general (ruta "/"): une todas las marcas en un
 * solo lugar para el administrador. Tarjeta por marca (tu rol + botón para
 * gestionarla) y accesos a Usuarios y Configuración. Los módulos de cada
 * marca (productos, pedidos…) viven bajo "Marca activa" y muestran
 * placeholders hasta que su CRUD real se construye.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHead } from '../components/shell/PageHead';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const router = useRouter();
  const { user, marcas, activeMarcaId, setActiveMarcaId } = useAuth();
  const esAdmin = marcas.some((m) => m.rol.nombre.toLowerCase() === 'admin');

  function gestionar(marcaId: string) {
    setActiveMarcaId(marcaId);
    router.push('/');
  }

  return (
    <>
      <PageHead title="Panel general" subtitle={`Bienvenido${user?.nombre ? `, ${user.nombre}` : ''} — ${marcas.length} marca(s) a tu cargo.`} />

      <div className="ax-dash-grid">
        {marcas.map((m) => {
          const activa = m.marcaId === activeMarcaId;
          return (
            <section key={m.marcaId} className="ax-card ax-col--4" role="region" aria-label={m.marca.nombre}>
              <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', alignItems: 'center' }}>
                  <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: '50%', background: activa ? 'var(--ax-accent)' : 'var(--ax-fill-hover)' }} />
                  <h2 className="ax-card__title" style={{ margin: 0, textTransform: 'capitalize' }}>{m.marca.nombre}</h2>
                  {activa && (
                    <span className="ax-badge ax-badge--soft ax-badge--accent ax-badge--pill" style={{ marginLeft: 'auto' }}>Activa</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
                  Tu rol: <b style={{ color: 'var(--ax-text-strong)' }}>{m.rol.nombre}</b>
                </p>
                {activa ? (
                  <p style={{ margin: 0, fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                    El menú “Marca activa” muestra sus módulos.
                  </p>
                ) : (
                  <button type="button" className="ax-btn ax-btn--secondary" onClick={() => gestionar(m.marcaId)}>
                    <span className="ax-btn__label">Gestionar esta marca</span>
                  </button>
                )}
              </div>
            </section>
          );
        })}

        {esAdmin && (
          <section className="ax-card ax-col--4" role="region" aria-label="Administración">
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              <h2 className="ax-card__title" style={{ margin: 0 }}>Administración</h2>
              <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
                Usuarios, roles y ajustes globales del HUB.
              </p>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
                <Link className="ax-btn ax-btn--ghost" href="/usuarios">
                  <span className="ax-btn__label">Usuarios y equipo</span>
                </Link>
                <Link className="ax-btn ax-btn--ghost" href="/configuracion">
                  <span className="ax-btn__label">Configuración</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {marcas.length === 0 && (
          <section className="ax-card ax-col--12" role="region" aria-label="Sin marcas">
            <div className="ax-card__body">
              <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>
                Tu usuario ({user?.email}) no tiene marcas asignadas todavía. Pide a un administrador que te agregue a un equipo.
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default Home;
