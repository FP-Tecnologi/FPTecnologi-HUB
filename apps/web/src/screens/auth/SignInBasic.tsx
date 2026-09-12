'use client';
/*
 * FPTecnologi-HUB · Dashboard — Sign in (basic, real).
 * Tarjeta centrada con formulario correo/contraseña (login real vía
 * AuthContext → bifurca a OTP o TOTP), botón de Google (próximamente) y
 * enlace a crear cuenta.
 */
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AuthStandalone, OffappTools, BrandCentered, EYE, EYE_OFF,
} from './authShared';
import { useAuth, ApiError } from '../../context/AuthContext';

export function SignInBasic() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Correo o contraseña incorrectos. Intenta de nuevo.');
  const [loading, setLoading] = useState(false);
  const [googleInfo, setGoogleInfo] = useState(false);

  function validate() {
    const e = !email.trim()
      ? 'Ingresa tu correo o usuario.'
      : email.includes('@') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
        ? 'Ingresa un correo válido.'
        : '';
    const p = !password ? 'Ingresa tu contraseña.' : '';
    setEmailErr(e);
    setPassErr(p);
    return !e && !p;
  }
  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(false);
    if (!validate()) return;
    setLoading(true);
    login(email.trim(), password)
      .then((result) => {
        setLoading(false);
        if (remember && typeof window !== 'undefined') {
          window.localStorage.setItem('ax:auth:email', result.email);
        }
        const nextStep = result.requiresTotp ? 'two-step-totp' : 'two-step';
        router.push(`/auth/${nextStep}?email=${encodeURIComponent(result.email)}`);
      })
      .catch((err: unknown) => {
        setLoading(false);
        setError(true);
        setErrorMessage(err instanceof ApiError ? err.message : 'Correo o contraseña incorrectos. Intenta de nuevo.');
      });
  }

  return (
    <AuthStandalone>
      <OffappTools style={{ position: 'fixed', insetBlockStart: 'var(--ax-space-5)', insetInlineEnd: 'var(--ax-space-5)', zIndex: 5 }} />

      <main className="ax-center" id="ax-main" style={{ inlineSize: '100%', maxInlineSize: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ inlineSize: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
          <BrandCentered />

          <section className="ax-card" role="region" aria-label="Iniciar sesión" style={{ borderRadius: 'var(--ax-radius-xl)' }}>
            <div className="ax-card__body" style={{ padding: 'var(--ax-space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
              <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-1)' }}>
                <h1 style={{ margin: 0, fontFamily: 'var(--ax-font-display)', fontSize: 'var(--ax-text-2xl)', fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)', letterSpacing: '-.015em' }}>Iniciar sesión</h1>
                <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Bienvenido de nuevo — ingresa a tu cuenta.</p>
              </header>

              {error && (
                <div role="alert" className="ax-alert ax-alert--danger" style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                  <svg className="ax-alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                  <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{errorMessage}</p></div>
                </div>
              )}

              <form className="ax-stack" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} noValidate>
                <div className="ax-field">
                  <label className="ax-label" htmlFor="si-email">Correo o usuario</label>
                  <input id="si-email" type="text" className={`ax-input${emailErr ? ' is-invalid' : ''}`} autoComplete="username" placeholder="tu@correo.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={emailErr ? 'true' : 'false'} aria-describedby="si-email-msg" required />
                  {emailErr && <p id="si-email-msg" className="ax-field__message ax-field__message--error">{emailErr}</p>}
                </div>

                <div className="ax-field">
                  <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                    <label className="ax-label" htmlFor="si-pass">Contraseña</label>
                    <Link className="ax-link" href="/auth/reset-password" style={{ fontSize: 'var(--ax-text-xs)' }}>¿Olvidaste tu contraseña?</Link>
                  </div>
                  <div className="ax-field__control">
                    <input id="si-pass" className={`ax-input ax-input--with-trailing${passErr ? ' is-invalid' : ''}`} autoComplete="current-password" placeholder="••••••••••"
                      type={reveal ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={passErr ? 'true' : 'false'} aria-describedby="si-pass-msg" required />
                    <button type="button" className="ax-field__affix ax-field__affix--trailing ax-field__affix--button" onClick={() => setReveal((v) => !v)} aria-pressed={reveal} aria-label={reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                      {reveal ? EYE_OFF : EYE}
                    </button>
                  </div>
                  {passErr && <p id="si-pass-msg" className="ax-field__message ax-field__message--error">{passErr}</p>}
                </div>

                <label className="ax-check" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text)' }}>
                  <input type="checkbox" className="ax-checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Mantener sesión iniciada</span>
                </label>

                <button type="submit" className={`ax-btn ax-btn--primary ax-btn--lg ax-btn--block${loading ? ' is-loading' : ''}`} aria-busy={loading}>
                  <span className="ax-btn__spinner" aria-hidden="true"></span>
                  <span className="ax-btn__label">Iniciar sesión</span>
                </button>
              </form>

              <button
                type="button"
                className="ax-btn ax-btn--secondary ax-btn--lg ax-btn--block"
                onClick={() => setGoogleInfo(true)}
                aria-label="Continuar con Google"
              >
                <svg className="ax-btn__icon" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" /></svg>
                <span className="ax-btn__label">Continuar con Google</span>
              </button>
              {googleInfo && (
                <p role="status" style={{ margin: 0, fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)', textAlign: 'center' }}>
                  El ingreso con Google estará disponible próximamente. Por ahora usa tu correo y contraseña.
                </p>
              )}

              <p style={{ textAlign: 'center', margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
                ¿Todavía no tienes cuenta? <Link className="ax-link" href="/auth/sign-up" style={{ fontWeight: 'var(--ax-weight-medium)' }}>Crear cuenta</Link>
              </p>
            </div>
          </section>

          <p style={{ textAlign: 'center', margin: 0, fontSize: 'var(--ax-text-2xs)', color: 'var(--ax-text-subtle)' }}>
            Al continuar aceptas los <Link className="ax-link" href="/pages/terms">Términos</Link> y la <Link className="ax-link" href="/pages/privacy">Política de privacidad</Link>.
          </p>
        </div>
      </main>
    </AuthStandalone>
  );
}

export default SignInBasic;
