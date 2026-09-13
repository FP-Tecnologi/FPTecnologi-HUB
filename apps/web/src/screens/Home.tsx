'use client';
/*
 * FPTecnologi-HUB — Panel general (ruta "/"): une todas las marcas en un
 * solo lugar para el administrador. Primero la tarjeta Administración
 * (vista global, con estado seleccionado), luego una tarjeta por marca
 * (tu rol + botón para gestionarla). Los módulos de cada marca
 * (productos, pedidos…) viven bajo "Marca activa" y muestran
 * placeholders hasta que su CRUD real se construye.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHead } from '../components/shell/PageHead';
import { Icon } from '../components/ui/Icon';
import { WelcomeModal } from '../components/ui/WelcomeModal';
import { ResumenMarca } from '../components/dashboard/ResumenMarca';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const router = useRouter();
  const { user, marcas, activeMarcaId, adminMode, setAdminMode } = useAuth();
  const esAdmin = marcas.some((m) => m.rol.nombre.toLowerCase() === 'admin');

  function gestionar(marcaId: string) {
    // "Ver dashboard" desde Administración no debe activar la marca ni sacar
    // a admin del modo global (eso le cambiaba el menú) -- solo un vistazo a
    // su resumen. /inicio/dashboard?marca=<uuid> tampoco servía: ese slug no
    // tiene página propia, cae en el <Placeholder/> genérico.
    router.push(`/admin/marcas/${marcaId}`);
  }

  function verAdmin() {
    setAdminMode(true);
    router.push('/');
  }

  const fechaHoy = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  const marcaActiva = !adminMode ? (marcas.find((m) => m.marcaId === activeMarcaId) ?? null) : null;

  // Modo marca: su Resumen es su dashboard (sin módulos, sin vista global).
  if (!adminMode && marcaActiva) {
    return (
      <>
        <WelcomeModal nombre={user?.nombre} />
        <PageHead title={marcaActiva.marca.nombre} subtitle={`Dashboard de ${marcaActiva.marca.nombre} · ${fechaHoy}.`} />
        <div className="ax-dash-grid">
          <ResumenMarca marcaId={marcaActiva.marcaId} rol={marcaActiva.rol.nombre} />
        </div>
      </>
    );
  }

  return (
    <>
      <WelcomeModal nombre={user?.nombre} />
      <PageHead title={`¡Hola, ${user?.nombre || 'bienvenido'}! 👋`} subtitle={`Resumen general del estado de la plataforma hoy, ${fechaHoy}.`} />

      <div className="ax-dash-grid">
        {esAdmin && (
          <section
            className="ax-card ax-col--4"
            role="region"
            aria-label="Administración"
            style={adminMode ? { border: '1px solid var(--ax-accent)', background: 'var(--ax-accent-wash)' } : undefined}
          >
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', alignItems: 'center' }}>
                <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: '50%', background: adminMode ? 'var(--ax-accent)' : 'var(--ax-fill-hover)' }} />
                <h2 className="ax-card__title" style={{ margin: 0 }}>Administración</h2>
              </div>
              <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
                Vista global: panel unido, usuarios, notificaciones y soporte de todas las marcas.
              </p>
              {adminMode ? (
                <p style={{ margin: 0, fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                  Estás viendo la administración global.
                </p>
              ) : (
                <button type="button" className="ax-btn ax-btn--secondary" onClick={verAdmin}>
                  <span className="ax-btn__label">Ver administración</span>
                </button>
              )}
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
                <Link className="ax-btn ax-btn--glass ax-btn--sm" href="/reportes/ventas">
                  <Icon name="article" className="ax-btn__icon" />
                  <span className="ax-btn__label">Reportes</span>
                </Link>
                <Link className="ax-btn ax-btn--glass ax-btn--sm" href="/soporte">
                  <Icon name="files" className="ax-btn__icon" />
                  <span className="ax-btn__label">Soporte</span>
                </Link>
                <Link className="ax-btn ax-btn--glass ax-btn--sm" href="/configuracion">
                  <Icon name="components" className="ax-btn__icon" />
                  <span className="ax-btn__label">Configuración</span>
                </Link>
              </div>
            </div>
          </section>
        )}
        {marcas.map((m) => {
          const activa = !adminMode && m.marcaId === activeMarcaId;
          return (
            <section key={m.marcaId} className="ax-card ax-col--4" role="region" aria-label={m.marca.nombre} style={activa ? { border: '1px solid var(--ax-accent)', background: 'var(--ax-accent-wash)' } : undefined}>
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
                    <span className="ax-btn__label">Ver dashboard</span>
                  </button>
                )}
              </div>
            </section>
          );
        })}

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
