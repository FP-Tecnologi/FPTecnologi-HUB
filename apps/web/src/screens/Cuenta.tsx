'use client';
/*
 * FPTecnologi-HUB — "Mi cuenta": datos reales de sesión con edición de
 * perfil (`PATCH /usuarios/me`). El nombre se actualiza directo; cambiar el
 * correo exige confirmar la contraseña actual. También lista las marcas
 * asignadas y permite cambiar cuál está activa.
 */
import { useState } from 'react';
import Link from 'next/link';
import { PageHead } from '../components/shell/PageHead';
import { useAuth, ApiError } from '../context/AuthContext';

export function Cuenta() {
  const { user, marcas, activeMarcaId, setActiveMarcaId, updateProfile, logout } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  // Sincroniza el form cuando la sesión termina de cargar.
  const [synced, setSynced] = useState(false);
  if (!synced && user) {
    setSynced(true);
    setNombre(user.nombre || '');
    setEmail(user.email || '');
  }

  const emailChanged = email.trim().toLowerCase() !== (user?.email || '').toLowerCase();
  const nombreChanged = nombre.trim() !== (user?.nombre || '');
  const dirty = emailChanged || nombreChanged;
  const needsPassword = emailChanged && !currentPassword;

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!dirty || saving) return;
    setOkMsg('');
    setErrMsg('');
    if (needsPassword) {
      setErrMsg('Para cambiar el correo confirma tu contraseña actual.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({
        ...(nombreChanged ? { nombre: nombre.trim() } : {}),
        ...(emailChanged ? { email: email.trim(), currentPassword } : {}),
      });
      setNombre(updated.nombre || '');
      setEmail(updated.email || '');
      setCurrentPassword('');
      setOkMsg('Perfil actualizado.');
    } catch (err: unknown) {
      setErrMsg(err instanceof ApiError ? err.message : 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHead title="Mi cuenta" subtitle="Datos de tu sesión y las marcas que administras." />
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" role="region" aria-label="Datos de cuenta">
          <div className="ax-card__body">
            <h2 className="ax-card__title" style={{ marginBottom: 'var(--ax-space-4)' }}>Datos de cuenta</h2>

            {okMsg && (
              <div role="status" className="ax-alert ax-alert--success" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                <div className="ax-alert__content"><p className="ax-alert__message">{okMsg}</p></div>
              </div>
            )}
            {errMsg && (
              <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{errMsg}</p></div>
              </div>
            )}

            <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)', maxWidth: 480 }}>
              <div className="ax-field">
                <label className="ax-label" htmlFor="cuenta-nombre">Nombre</label>
                <input
                  id="cuenta-nombre" type="text" className="ax-input" autoComplete="name"
                  value={nombre} onChange={(e) => setNombre(e.target.value)} required
                />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="cuenta-email">Correo</label>
                <input
                  id="cuenta-email" type="email" className="ax-input" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                />
              </div>
              {emailChanged && (
                <div className="ax-field">
                  <label className="ax-label" htmlFor="cuenta-password">Contraseña actual (para confirmar el cambio de correo)</label>
                  <input
                    id="cuenta-password" type="password" className="ax-input" autoComplete="current-password"
                    value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                  />
                </div>
              )}
              <div>
                <button
                  type="submit"
                  className={`ax-btn ax-btn--primary${saving ? ' is-loading' : ''}`}
                  disabled={!dirty || saving}
                  aria-busy={saving}
                >
                  <span className="ax-btn__spinner" aria-hidden="true"></span>
                  <span className="ax-btn__label">{saving ? 'Guardando…' : 'Guardar cambios'}</span>
                </button>
              </div>
            </form>

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
