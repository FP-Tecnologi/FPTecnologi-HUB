'use client';
/*
 * FPTecnologi-HUB · Dashboard — Sign in (basic, real).
 * Tarjeta centrada con formulario correo/contraseña (login real vía
 * AuthContext → bifurca a OTP o TOTP), botón real de Google y enlace a
 * crear cuenta.
 */
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AuthStandalone, OffappTools, BrandCentered, EYE, EYE_OFF,
} from './authShared';
import { useAuth, ApiError } from '../../context/AuthContext';

// Términos y privacidad: los de la web pública (fptecnologi.com), no una copia dentro del dashboard.
const WEB = (process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'https://fptecnologi.com').replace(/\/$/, '');

const GOOGLE_ERROR_MESSAGE = 'No pudimos completar el ingreso con Google. Solicita acceso al equipo de desarrollo.';

function SignInBasicInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const [error, setError] = useState(searchParams.get('error') === 'google');
  const [errorMessage, setErrorMessage] = useState(
    searchParams.get('error') === 'google' ? GOOGLE_ERROR_MESSAGE : 'Correo o contraseña incorrectos. Intenta de nuevo.',
  );
  const [loading, setLoading] = useState(false);

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
        // Dispositivo confiable: el backend ya devolvió tokens, sin 2FA.
        if (!result.requiresOtp && !result.requiresTotp) {
          window.location.assign('/');
          return;
        }
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
                <div className="ax-field" style={{ marginBlockStart: 'var(--ax-space-2)' }}>
                  <label className="ax-label" htmlFor="si-email">Correo o usuario</label>
                  <input id="si-email" type="text" className={`ax-input${emailErr ? ' is-invalid' : ''}`} autoComplete="username" placeholder="tu@correo.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={emailErr ? 'true' : 'false'} aria-describedby="si-email-msg" required />
                  {emailErr && <p id="si-email-msg" className="ax-field__message ax-field__message--error">{emailErr}</p>}
                </div>

                <div className="ax-field">
                  <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                    <label className="ax-label" htmlFor="si-pass">Contraseña</label>
                    <Link className="ax-link" href="/auth/restablecer-contrasena" style={{ fontSize: 'var(--ax-text-xs)' }}>¿Olvidaste tu contraseña?</Link>
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
              <p style={{ margin: 0, textAlign: 'center', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
                ¿Necesitas soporte o una cuenta nueva? Solicítala al equipo de desarrollo:{' '}
                <a className="ax-link" href="mailto:dev@fptecnologi.com" style={{ fontWeight: 'var(--ax-weight-medium)' }}>dev@fptecnologi.com</a>
              </p>
            </div>
          </section>

          <p style={{ textAlign: 'center', margin: 0, fontSize: 'var(--ax-text-2xs)', color: 'var(--ax-text-subtle)' }}>
            Al continuar aceptas los <a className="ax-link" href={`${WEB}/legal/terminos`} target="_blank" rel="noopener noreferrer">Términos</a> y la <a className="ax-link" href={`${WEB}/legal/privacidad`} target="_blank" rel="noopener noreferrer">Política de privacidad</a>.
          </p>
        </div>
      </main>
    </AuthStandalone>
  );
}

export function SignInBasic() {
  return (
    <Suspense fallback={null}>
      <SignInBasicInner />
    </Suspense>
  );
}

export default SignInBasic;
