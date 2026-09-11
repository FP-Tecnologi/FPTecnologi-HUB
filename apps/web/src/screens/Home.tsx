'use client';
/*
 * FPTecnologi-HUB — panel de inicio real (reemplaza el dashboard "Sales" de
 * muestra de Vireo). Sin datos de mentira: muestra sesión, marca activa y rol,
 * y sirve de punto de partida hasta que cada módulo real (equipo, servicios,
 * pedidos, cotizaciones…) tenga su propia pantalla.
 */
import { PageHead } from '../components/shell/PageHead';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { user, marcas, activeMarcaId } = useAuth();
  const marcaActiva = marcas.find((m) => m.marca.id === activeMarcaId) ?? marcas[0];

  return (
    <>
      <PageHead title="Inicio" subtitle={`Bienvenido${user?.nombre ? `, ${user.nombre}` : ''}.`} />
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" role="region" aria-label="Resumen de cuenta">
          <div className="ax-card__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <div>
                <h2 className="ax-card__title" style={{ marginBottom: 'var(--ax-space-2)' }}>Tu cuenta</h2>
                <p style={{ color: 'var(--ax-text-muted)', margin: 0 }}>
                  {user?.email} — {marcaActiva ? `${marcaActiva.marca.nombre} · ${marcaActiva.rol.nombre}` : 'sin marca asignada'}
                </p>
              </div>
              <p style={{ color: 'var(--ax-text-subtle)', margin: 0 }}>
                Los módulos (equipo, servicios, pedidos, cotizaciones…) se irán agregando aquí a medida que se construyen.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Home;
