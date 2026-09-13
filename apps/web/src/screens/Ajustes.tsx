'use client';
/*
 * FPTecnologi-HUB — "Configuración": editar cuenta (nombre/correo vía
 * PATCH /usuarios/me), seguridad (cambiar contraseña) y avisos
 * (preferencias locales, sin backend aún). Parte del grupo Mi cuenta.
 */
import { useState } from 'react';
import Link from 'next/link';
import { PageHead } from '../components/shell/PageHead';
import { useAuth, ApiError } from '../context/AuthContext';

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

export function Ajustes() {
  const { user, updateProfile } = useAuth();

  // --- Cuenta: edición real ---
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

  // --- Avisos: preferencias locales (sin backend), pero de verdad guardadas
  // en este navegador via localStorage -- antes decía "se guardan" y en
  // realidad era solo useState en memoria, se perdía al recargar.
  const AVISOS_KEY = 'ax:avisos';
  const AVISOS_DEFAULT = { pedidos: true, cotizaciones: true, seguridad: true, resumen: false };
  function leerAvisosGuardados(): { avisos: Record<string, boolean>; frecuencia: string; silenciar: boolean } {
    try {
      const raw = window.localStorage.getItem(AVISOS_KEY);
      if (raw) return { frecuencia: 'Semanal', silenciar: false, ...JSON.parse(raw) };
    } catch {
      /* localStorage no disponible — se queda con los valores por defecto */
    }
    return { avisos: AVISOS_DEFAULT, frecuencia: 'Semanal', silenciar: false };
  }
  const [avisos, setAvisos] = useState<Record<string, boolean>>(AVISOS_DEFAULT);
  const [resumenFrecuencia, setResumenFrecuencia] = useState('Semanal');
  const [silenciarTodo, setSilenciarTodo] = useState(false);
  const [avisosSynced, setAvisosSynced] = useState(false);
  if (!avisosSynced) {
    setAvisosSynced(true);
    const guardado = leerAvisosGuardados();
    setAvisos(guardado.avisos);
    setResumenFrecuencia(guardado.frecuencia);
    setSilenciarTodo(guardado.silenciar);
  }
  function guardarAvisos(next: { avisos?: Record<string, boolean>; frecuencia?: string; silenciar?: boolean }) {
    const avisosNext = next.avisos ?? avisos;
    const frecuenciaNext = next.frecuencia ?? resumenFrecuencia;
    const silenciarNext = next.silenciar ?? silenciarTodo;
    try {
      window.localStorage.setItem(AVISOS_KEY, JSON.stringify({ avisos: avisosNext, frecuencia: frecuenciaNext, silenciar: silenciarNext }));
    } catch {
      /* localStorage no disponible — el toggle sigue funcionando en memoria para esta sesión */
    }
  }
  const toggleAviso = (id: string) => {
    const next = { ...avisos, [id]: !avisos[id] };
    setAvisos(next);
    guardarAvisos({ avisos: next });
  };
  const setFrecuencia = (v: string) => {
    setResumenFrecuencia(v);
    guardarAvisos({ frecuencia: v });
  };
  const setSilenciar = (v: boolean) => {
    setSilenciarTodo(v);
    guardarAvisos({ silenciar: v });
  };

  return (
    <>
      <PageHead title="Configuración" subtitle="Tus datos, tu seguridad y tus avisos." />
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" role="region" aria-label="Datos personales">
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
                <label className="ax-label" htmlFor="aj-nombre">Nombre</label>
                <input id="aj-nombre" type="text" className="ax-input" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="aj-email">Correo</label>
                <input id="aj-email" type="email" className="ax-input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <span className="ax-help">Si cambias tu correo deberás confirmar tu contraseña actual.</span>
              </div>
              {emailChanged && (
                <div className="ax-field">
                  <label className="ax-label" htmlFor="aj-password">Contraseña actual (para confirmar el cambio de correo)</label>
                  <input id="aj-password" type="password" className="ax-input" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
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

        <section className="ax-card ax-col--12" role="region" aria-label="Contraseña">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Contraseña y segundo factor</h2><p className="ax-card__subtitle">Cambia tu contraseña cuando lo necesites. El segundo factor se verifica al iniciar sesión.</p></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            <Link className="ax-btn ax-btn--secondary" href="/auth/reset-password">
              <span className="ax-btn__label">Cambiar contraseña</span>
            </Link>
          </div>
        </section>

        <section className="ax-card ax-col--12" role="region" aria-label="Avisos">
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
            <div className="ax-field" style={{ marginTop: 'var(--ax-space-4)', maxWidth: 280 }}>
              <label className="ax-label" htmlFor="aj-resumen">Frecuencia del resumen</label>
              <select id="aj-resumen" className="ax-select" value={resumenFrecuencia} onChange={(e) => setFrecuencia(e.target.value)}>
                <option>Diaria</option>
                <option>Semanal</option>
                <option>Mensual</option>
                <option>Nunca</option>
              </select>
            </div>
            <div className="ax-cluster" style={{ justifyContent: 'space-between', paddingTop: 'var(--ax-space-3)', marginTop: 'var(--ax-space-3)', borderTop: '1px solid var(--ax-border)' }}>
              <div><div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)', fontSize: 'var(--ax-text-sm)' }}>Silenciar todos los avisos</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Pausa temporalmente todos los avisos</div></div>
              <input type="checkbox" className="ax-switch" aria-label="Silenciar todos los avisos" checked={silenciarTodo} onChange={(e) => setSilenciar(e.target.checked)} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Ajustes;
