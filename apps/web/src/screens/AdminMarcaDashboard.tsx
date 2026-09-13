'use client';
/*
 * FPTecnologi-HUB — Dashboard de UNA marca visto desde Administración, sin
 * activarla ni salir del modo global (eso rompía el menú: cambiaba de marca
 * activa y sacaba a admin del modo Administración). Reutiliza ResumenMarca
 * en modo "soloResumen" (sin grid de Módulos, cuyos links dependen de la
 * marca activa del contexto).
 */
import { useRouter } from 'next/navigation';
import { PageHead } from '../components/shell/PageHead';
import { ResumenMarca } from '../components/dashboard/ResumenMarca';
import { useAuth } from '../context/AuthContext';

export function AdminMarcaDashboard({ marcaId }: { marcaId: string }) {
  const router = useRouter();
  const { marcas } = useAuth();
  const marca = marcas.find((m) => m.marcaId === marcaId);

  if (!marca) {
    return (
      <>
        <PageHead title="Marca no encontrada" subtitle="No tienes acceso a esta marca." />
        <div className="ax-dash-grid">
          <section className="ax-card ax-col--12" role="region" aria-label="Marca no encontrada">
            <div className="ax-card__body">
              <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>No tienes ninguna marca asignada con ese id.</p>
              <button type="button" className="ax-btn ax-btn--secondary" style={{ marginTop: 'var(--ax-space-4)' }} onClick={() => router.push('/')}>
                <span className="ax-btn__label">Volver</span>
              </button>
            </div>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title={marca.marca.nombre} subtitle={`Resumen de ${marca.marca.nombre} · vista de administración.`} />
      <div className="ax-dash-grid">
        <ResumenMarca marcaId={marca.marcaId} rol={marca.rol.nombre} soloResumen />
      </div>
    </>
  );
}

export default AdminMarcaDashboard;
