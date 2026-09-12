'use client';
/*
 * FPTecnologi-HUB — "Mi cuenta": centro único de perfil (antes repartido en
 * Mi cuenta + Ver perfil + Configuración). Pestañas: Perfil (identidad y
 * marcas), Cuenta (editar nombre/correo vía PATCH /usuarios/me), Seguridad
 * (cambiar contraseña) y Avisos (preferencias locales, sin backend aún).
 */
import { useState } from 'react';
import Link from 'next/link';
import { PageHead } from '../components/shell/PageHead';
import { useAuth, ApiError } from '../context/AuthContext';

type Tab = 'perfil' | 'cuenta' | 'seguridad' | 'avisos';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'perfil', label: 'Perfil', icon: <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a2 2 0 0 1 4 -4h4a2 2 0 0 1 4 4v2" /></svg> },
  { key: 'cuenta', label: 'Cuenta', icon: <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /></svg> },
  { key: 'seguridad', label: 'Seguridad', icon: <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" /><path d="M11 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 12l0 2.5" /></svg> },
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

function initialsOf(nombre: string | null | undefined, email: string | undefined): string {
  const parts = (nombre || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (email || '?').slice(0, 2).toUpperCase();
}

export function Cuenta() {
  const { user, marcas, activeMarcaId, setActiveMarcaId, updateProfile, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('perfil');

  const marcaActiva = marcas.find((m) => m.marcaId === activeMarcaId) ?? marcas[0] ?? null;
  const esAdmin = marcas.some((m) => m.rol.nombre.toLowerCase() === 'admin');

  // --- Cuenta: edición real vía PATCH /usuarios/me ---
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

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
  const toggleAviso = (id: string) => setAvisos((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <PageHead title="Mi cuenta" subtitle="Tu perfil, tus datos, tu seguridad y tus avisos." />

      <div className="ax-dash-grid">
        {/* COLUMNA DE PESTAÑAS */}
        <nav className="ax-card ax-col--3" role="region" aria-label="Secciones de mi cuenta" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body" style={{ padding: 'var(--ax-space-3)' }}>
            <div role="tablist" aria-orientation="vertical" aria-label="Mi cuenta" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {TABS.map((t) => (
                <button key={t.key} type="button" role="tab" className={`ax-btn ax-btn--ghost ax-btn--block${tab === t.key ? ' is-selected' : ''}`} style={{ justifyContent: 'flex-start' }} aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
                  {t.icon}
                  <span className="ax-btn__label">{t.label}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 'var(--ax-space-3)', paddingTop: 'var(--ax-space-3)', borderTop: '1px solid var(--ax-border)' }}>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--block ax-btn--sm" style={{ justifyContent: 'flex-start' }} onClick={() => logout()}>
                <span className="ax-btn__label">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </nav>

        {/* PANELES */}
        <div className="ax-col--9" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-6)' }}>

          {/* PERFIL */}
          {tab === 'perfil' && (
            <div role="tabpanel" aria-label="Perfil" className="ax-stack" style={{ ['--ax-gap' as string]: 'var(--ax-space-6)' }}>
              <section className="ax-card" role="region" aria-label="Identidad">
                <div className="ax-card__body">
                  <div className="ax-cluster" style={{ gap: 'var(--ax-space-4)', alignItems: 'center' }}>
                    <span className="ax-avatar" style={{ width: 64, height: 64, fontSize: 22, borderRadius: 'var(--ax-radius-pill)', background: 'var(--ax-accent-wash)', color: 'var(--ax-accent)' }}>
                      <span className="ax-avatar__initials">{initialsOf(user?.nombre, user?.email)}</span>
                    </span>
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

              <section className="ax-card" role="region" aria-label="Resumen">
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

              <section className="ax-card" role="region" aria-label="Marcas asignadas">
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
          )}

          {/* CUENTA (editar) */}
          {tab === 'cuenta' && (
            <div role="tabpanel" aria-label="Editar cuenta" className="ax-stack" style={{ ['--ax-gap' as string]: 'var(--ax-space-6)' }}>
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
                      <label className="ax-label" htmlFor="cuenta-nombre">Nombre</label>
                      <input id="cuenta-nombre" type="text" className="ax-input" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="ax-field">
                      <label className="ax-label" htmlFor="cuenta-email">Correo</label>
                      <input id="cuenta-email" type="email" className="ax-input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      <span className="ax-help">Si cambias tu correo deberás confirmar tu contraseña actual.</span>
                    </div>
                    {emailChanged && (
                      <div className="ax-field">
                        <label className="ax-label" htmlFor="cuenta-password">Contraseña actual (para confirmar el cambio de correo)</label>
                        <input id="cuenta-password" type="password" className="ax-input" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                      </div>
                    )}
                    <div>
                      <button type="submit" className={`ax-btn ax-btn--primary${saving ? ' is-loading' : ''}`} disabled={!dirty || saving} aria-busy={saving}>
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
            <div role="tabpanel" aria-label="Seguridad" className="ax-stack" style={{ ['--ax-gap' as string]: 'var(--ax-space-6)' }}>
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
            <div role="tabpanel" aria-label="Avisos" className="ax-stack" style={{ ['--ax-gap' as string]: 'var(--ax-space-6)' }}>
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
                    <label className="ax-label" htmlFor="cuenta-resumen">Frecuencia del resumen</label>
                    <select id="cuenta-resumen" className="ax-select" value={resumenFrecuencia} onChange={(e) => setResumenFrecuencia(e.target.value)}>
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

export default Cuenta;
