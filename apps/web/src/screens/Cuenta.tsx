'use client';
/*
 * FPTecnologi-HUB — "Mi cuenta": datos reales de sesión (sin edición de
 * perfil todavía, no hay endpoint backend para eso). Muestra las marcas
 * asignadas al usuario y permite cambiar cuál está activa — la misma acción
 * que el selector del header, pero como pantalla completa.
 */
import Link from 'next/link';
import { PageHead } from '../components/shell/PageHead';
import { useAuth } from '../context/AuthContext';

export function Cuenta() {
  const { user, marcas, activeMarcaId, setActiveMarcaId, logout } = useAuth();

  return (
    <>
      <PageHead title="Mi cuenta" subtitle="Datos de tu sesión y las marcas que administras." />
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" role="region" aria-label="Datos de cuenta">
          <div className="ax-card__body">
            <h2 className="ax-card__title" style={{ marginBottom: 'var(--ax-space-4)' }}>Datos de cuenta</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--ax-space-2) var(--ax-space-4)', margin: 0 }}>
              <dt style={{ color: 'var(--ax-text-muted)' }}>Nombre</dt>
              <dd style={{ margin: 0 }}>{user?.nombre || '—'}</dd>
              <dt style={{ color: 'var(--ax-text-muted)' }}>Correo</dt>
              <dd style={{ margin: 0 }}>{user?.email}</dd>
            </dl>
            <div style={{ marginTop: 'var(--ax-space-5)', display: 'flex', gap: 'var(--ax-space-3)' }}>
              <Link className="ax-btn ax-btn--secondary ax-btn--sm" href="/auth/reset-password">Cambiar contraseña</Link>
              <button type="button" className="ax-btn ax-btn--danger ax-btn--sm" onClick={() => logout()}>Cerrar sesión</button>
            </div>
          </div>
        </section>

        <section className="ax-card ax-col--12" role="region" aria-label="Marcas asignadas">
          <div className="ax-card__body">
            <h2 className="ax-card__title" style={{ marginBottom: 'var(--ax-space-4)' }}>Empresas que administras</h2>
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
                    <b>{m.marca.nombre}</b>
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

export default Cuenta;
