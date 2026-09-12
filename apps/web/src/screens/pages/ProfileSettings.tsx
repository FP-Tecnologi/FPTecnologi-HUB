'use client';
/*
 * FPTecnologi-HUB — Ajustes de perfil (ruta "pages/profile-settings").
 *
 * Tres secciones: Cuenta (nombre + correo reales con `PATCH /usuarios/me`),
 * Seguridad (enlace a cambiar contraseña + nota del segundo factor) y
 * Avisos (interruptores locales con useState, sin backend por ahora).
 * Sin facturación: el proyecto no tendrá pagos en esta fase.
 */
import { useState } from 'react';
import Link from 'next/link';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';

type Tab = 'cuenta' | 'seguridad' | 'avisos';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'cuenta', label: 'Cuenta', icon: <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /></svg> },
  { key: 'seguridad', label: 'Seguridad', icon: <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" /><path d="M11 11a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /><path d="M12 12l0 2.5" /></svg> },
  { key: 'avisos', label: 'Avisos', icon: <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></svg> },
];

interface Aviso {
  id: string;
  titulo: string;
  detalle: string;
}

const AVISOS: Aviso[] = [
  { id: 'pedidos', titulo: 'Pedidos', detalle: 'Cambios de estado en tus pedidos' },
  { id: 'cotizaciones', titulo: 'Cotizaciones', detalle: 'Respuestas a tus solicitudes de cotización' },
  { id: 'seguridad', titulo: 'Alertas de seguridad', detalle: 'Nuevos inicios de sesión y cambios de cuenta' },
  { id: 'resumen', titulo: 'Resumen semanal', detalle: 'Actividad de tus marcas cada semana' },
];

export function ProfileSettings() {
  const [tab, setTab] = useState<Tab>('cuenta');

  // --- Cuenta: datos reales de sesión (misma lógica que Cuenta.tsx) ---
  const { user, updateProfile } = useAuth();
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

  async function submitCuenta(ev: React.FormEvent) {
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
      // updateProfile llama a api.patch('/usuarios/me', ...) y actualiza la sesión.
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

  // --- Avisos: interruptores locales, sin backend ---
  const [avisos, setAvisos] = useState<Record<string, boolean>>({
    pedidos: true,
    cotizaciones: true,
    seguridad: true,
    resumen: false,
  });
  const [resumenFrecuencia, setResumenFrecuencia] = useState('Semanal');
  const [silenciarTodo, setSilenciarTodo] = useState(false);

  const toggleAviso = (id: string) =>
    setAvisos((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <PageHead
        title="Ajustes de perfil"
        subtitle="Administra tu cuenta, tu seguridad y tus avisos."
      />

      <div className="ax-dash-grid">
        {/* COLUMNA DE PESTAÑAS */}
        <nav className="ax-card ax-col--3" role="region" aria-label="Secciones de ajustes" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body" style={{ padding: 'var(--ax-space-3)' }}>
            <div role="tablist" aria-orientation="vertical" aria-label="Ajustes" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {TABS.map((t) => (
                <button key={t.key} type="button" role="tab" className={`ax-btn ax-btn--ghost ax-btn--block${tab === t.key ? ' is-selected' : ''}`} style={{ justifyContent: 'flex-start' }} aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
                  {t.icon}
                  <span className="ax-btn__label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* PANELES */}
        <div className="ax-col--9" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-6)' }}>

          {/* CUENTA */}
          {tab === 'cuenta' && (
            <div role="tabpanel" aria-label="Ajustes de cuenta" className="ax-stack" style={{ ['--ax-gap' as string]: 'var(--ax-space-6)' }}>
              <section className="ax-card" role="region" aria-label="Datos personales">
                <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Datos personales</h2><p className="ax-card__subtitle">Tu nombre y tu correo de acceso al dashboard.</p></div></div>
                <div className="ax-card__body" style={{ paddingTop: 0 }}>
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

                  <form onSubmit={submitCuenta} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)', maxWidth: 480 }}>
                    <div className="ax-field">
                      <label className="ax-label" htmlFor="ps-nombre">Nombre</label>
                      <input
                        id="ps-nombre" type="text" className="ax-input" autoComplete="name"
                        value={nombre} onChange={(e) => setNombre(e.target.value)} required
                      />
                    </div>
                    <div className="ax-field">
                      <label className="ax-label" htmlFor="ps-email">Correo</label>
                      <input
                        id="ps-email" type="email" className="ax-input" autoComplete="email"
                        value={email} onChange={(e) => setEmail(e.target.value)} required
                      />
                      <span className="ax-help">Si cambias tu correo deberás confirmar tu contraseña actual.</span>
                    </div>
                    {emailChanged && (
                      <div className="ax-field">
                        <label className="ax-label" htmlFor="ps-password">Contraseña actual (para confirmar el cambio de correo)</label>
                        <input
                          id="ps-password" type="password" className="ax-input" autoComplete="current-password"
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
                </div>
              </section>
            </div>
          )}

          {/* SEGURIDAD */}
          {tab === 'seguridad' && (
            <div role="tabpanel" aria-label="Ajustes de seguridad" className="ax-stack" style={{ ['--ax-gap' as string]: 'var(--ax-space-6)' }}>
              <section className="ax-card" role="region" aria-label="Contraseña">
                <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Contraseña</h2><p className="ax-card__subtitle">Cambia tu contraseña cuando lo necesites.</p></div></div>
                <div className="ax-card__body" style={{ paddingTop: 0 }}>
                  <Link className="ax-btn ax-btn--secondary" href="/auth/reset-password">
                    <span className="ax-btn__label">Cambiar contraseña</span>
                  </Link>
                </div>
              </section>

              <section className="ax-card" role="region" aria-label="Segundo factor">
                <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Segundo factor</h2></div></div>
                <div className="ax-card__body" style={{ paddingTop: 0 }}>
                  <p style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)', margin: 0 }}>
                    El segundo factor (código por correo u aplicación de autenticación) se verifica al iniciar sesión.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* AVISOS */}
          {tab === 'avisos' && (
            <div role="tabpanel" aria-label="Ajustes de avisos" className="ax-stack" style={{ ['--ax-gap' as string]: 'var(--ax-space-6)' }}>
              <section className="ax-card" role="region" aria-label="Avisos">
                <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Avisos</h2><p className="ax-card__subtitle">Elige qué avisos quieres recibir. Se guardan solo en este navegador por ahora.</p></div></div>
                <div className="ax-card__body" style={{ paddingTop: 0 }}>
                  <ul className="ax-list">
                    {AVISOS.map((a) => (
                      <li key={a.id} className="ax-list__row" style={{ paddingInline: 0 }}>
                        <span className="ax-list__content">
                          <span className="ax-list__title">{a.titulo}</span>
                          <span className="ax-list__meta">{a.detalle}</span>
                        </span>
                        <span className="ax-list__trailing">
                          <input
                            type="checkbox"
                            className="ax-switch"
                            aria-label={a.titulo}
                            checked={silenciarTodo ? false : (avisos[a.id] ?? false)}
                            disabled={silenciarTodo}
                            onChange={() => toggleAviso(a.id)}
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="ax-card" role="region" aria-label="Preferencias de envío">
                <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Preferencias de envío</h2></div></div>
                <div className="ax-card__body" style={{ paddingTop: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ax-space-5)' }}>
                  <div className="ax-field">
                    <label className="ax-label" htmlFor="ps-resumen">Frecuencia del resumen</label>
                    <select id="ps-resumen" className="ax-select" value={resumenFrecuencia} onChange={(e) => setResumenFrecuencia(e.target.value)}>
                      <option>Diaria</option>
                      <option>Semanal</option>
                      <option>Mensual</option>
                      <option>Nunca</option>
                    </select>
                  </div>
                  <div className="ax-cluster" style={{ gridColumn: '1 / -1', justifyContent: 'space-between', paddingTop: 'var(--ax-space-2)', borderTop: '1px solid var(--ax-border)' }}>
                    <div><div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)', fontSize: 'var(--ax-text-sm)' }}>Silenciar todos los avisos</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Pausa temporalmente todos los avisos</div></div>
                    <input type="checkbox" className="ax-switch" aria-label="Silenciar todos los avisos" checked={silenciarTodo} onChange={(e) => setSilenciarTodo(e.target.checked)} />
                  </div>
                </div>
              </section>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default ProfileSettings;
