'use client';
/*
 * FPTecnologi-HUB · Dashboard — Crear cuenta (cliente / ecommerce).
 * Auto-registro real: siempre cae en el rol "cliente" (POST /auth/register),
 * nunca crea cuentas de staff — eso es admin-only (RolesController).
 * marcaId se resuelve solo desde GET /public/marcas (primer resultado; no
 * hay selector visible todavía porque hoy existe una sola marca real).
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AuthStandalone, OffappTools, BrandCentered, EYE, EYE_OFF,
} from './authShared';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

const STRENGTH = ['Débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];

export function SignUpBasic() {
  const router = useRouter();
  const { register } = useAuth();
  const [marcaId, setMarcaId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [termsTouched, setTermsTouched] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Ese correo ya está en uso. Intenta iniciar sesión.');
  const [nameErr, setNameErr] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const [confirmErr, setConfirmErr] = useState('');

  useEffect(() => {
    api.get<{ id: string; nombre: string }[]>('/public/marcas', { auth: false })
      .then((marcas) => setMarcaId(marcas[0]?.id ?? null))
      .catch(() => setMarcaId(null));
  }, []);

  function scorePassword(p: string) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    setScore(p.length < 8 ? Math.min(s, 1) : s);
  }
  function barClass(i: number) {
    if (i >= score) return '';
    if (score <= 1) return 'is-weak';
    if (score === 2) return 'is-weak';
    if (score === 3) return 'is-medium';
    return 'is-strong';
  }
  function validate() {
    const n = name.trim();
    const ne = !n ? 'Ingresa tu nombre completo.' : n.length < 2 || n.length > 60 ? 'El nombre debe tener entre 2 y 60 caracteres.' : '';
    const ee = !email.trim() ? 'Ingresa tu correo.' : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? 'Ingresa un correo válido.' : '';
    const pe = password.length < 8 ? 'Usa al menos 8 caracteres.' : '';
    const ce = confirm !== password ? 'Las contraseñas no coinciden.' : '';
    setNameErr(ne);
    setEmailErr(ee);
    setPassErr(pe);
    setConfirmErr(ce);
    setTermsTouched(true);
    return !ne && !ee && !pe && !ce && terms;
  }
  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(false);
    if (!validate()) return;
    if (!marcaId) {
      setError(true);
      setErrorMessage('No se pudo determinar la tienda. Intenta de nuevo en unos segundos.');
      return;
    }
    setLoading(true);
    register(email.trim(), password, marcaId, name.trim())
      .then(() => {
        setLoading(false);
        router.push('/auth/sign-in?cuenta=creada');
      })
      .catch((err: unknown) => {
        setLoading(false);
        setError(true);
        setErrorMessage(err instanceof ApiError ? err.message : 'Ese correo ya está en uso. Intenta iniciar sesión.');
      });
  }

  return (
    <AuthStandalone>
      <OffappTools style={{ position: 'fixed', insetBlockStart: 'var(--ax-space-5)', insetInlineEnd: 'var(--ax-space-5)', zIndex: 5 }} />

      <main className="ax-center" id="ax-main" style={{ inlineSize: '100%', maxInlineSize: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ inlineSize: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
          <BrandCentered />

          <section className="ax-card" role="region" aria-label="Crear cuenta" style={{ borderRadius: 'var(--ax-radius-xl)' }}>
            <div className="ax-card__body" style={{ padding: 'var(--ax-space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
              <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-1)' }}>
                <h1 style={{ margin: 0, fontFamily: 'var(--ax-font-display)', fontSize: 'var(--ax-text-2xl)', fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)', letterSpacing: '-.015em' }}>Crear cuenta</h1>
                <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Regístrate para comprar y hacer seguimiento a tus pedidos.</p>
              </header>

              {error && (
                <div role="alert" className="ax-alert ax-alert--danger" style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                  <svg className="ax-alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                  <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{errorMessage}</p></div>
                </div>
              )}

              <form className="ax-stack" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} noValidate>
                <div className="ax-field">
                  <label className="ax-label" htmlFor="su-name">Nombre completo</label>
                  <input id="su-name" type="text" className={`ax-input${nameErr ? ' is-invalid' : ''}`} autoComplete="name" placeholder="Ada Lovelace"
                    value={name} onChange={(e) => setName(e.target.value)} aria-invalid={nameErr ? 'true' : 'false'} aria-describedby="su-name-msg" required />
                  {nameErr && <p id="su-name-msg" className="ax-field__message ax-field__message--error">{nameErr}</p>}
                </div>

                <div className="ax-field">
                  <label className="ax-label" htmlFor="su-email">Correo</label>
                  <input id="su-email" type="email" className={`ax-input${emailErr ? ' is-invalid' : ''}`} autoComplete="email" placeholder="tu@correo.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={emailErr ? 'true' : 'false'} aria-describedby="su-email-msg" required />
                  {emailErr && <p id="su-email-msg" className="ax-field__message ax-field__message--error">{emailErr}</p>}
                </div>

                <div className="ax-field">
                  <label className="ax-label" htmlFor="su-pass">Contraseña</label>
                  <div className="ax-field__control">
                    <input id="su-pass" className={`ax-input ax-input--with-trailing${passErr ? ' is-invalid' : ''}`} autoComplete="new-password" placeholder="Al menos 8 caracteres"
                      type={reveal ? 'text' : 'password'} value={password}
                      onChange={(e) => { setPassword(e.target.value); scorePassword(e.target.value); }}
                      aria-invalid={passErr ? 'true' : 'false'} aria-describedby="su-pass-msg su-strength" required />
                    <button type="button" className="ax-field__affix ax-field__affix--trailing ax-field__affix--button" onClick={() => setReveal((v) => !v)} aria-pressed={reveal} aria-label={reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                      {reveal ? EYE_OFF : EYE}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div id="su-strength" className="ax-strength" aria-live="polite">
                      <div className="ax-strength__bars">
                        <span className={`ax-strength__bar ${barClass(0)}`}></span>
                        <span className={`ax-strength__bar ${barClass(1)}`}></span>
                        <span className={`ax-strength__bar ${barClass(2)}`}></span>
                        <span className={`ax-strength__bar ${barClass(3)}`}></span>
                      </div>
                      <span className="ax-strength__label">{`Seguridad de la contraseña: ${STRENGTH[score] || 'Débil'}`}</span>
                    </div>
                  )}
                  {passErr && <p id="su-pass-msg" className="ax-field__message ax-field__message--error">{passErr}</p>}
                </div>

                <div className="ax-field">
                  <label className="ax-label" htmlFor="su-confirm">Confirmar contraseña</label>
                  <input id="su-confirm" type="password" className={`ax-input${confirmErr ? ' is-invalid' : ''}`} autoComplete="new-password" placeholder="Vuelve a escribir tu contraseña"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={confirmErr ? 'true' : 'false'} aria-describedby="su-confirm-msg" required />
                  {confirmErr && <p id="su-confirm-msg" className="ax-field__message ax-field__message--error">{confirmErr}</p>}
                </div>

                <div className="ax-field" style={{ gap: 'var(--ax-space-1)' }}>
                  <label className="ax-check" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text)', alignItems: 'center', lineHeight: 1.45 }}>
                    <input type="checkbox" className="ax-checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                    <span>Acepto los <Link className="ax-link" href="/pages/terms">Términos de servicio</Link> y la <Link className="ax-link" href="/pages/privacy">Política de privacidad</Link>.</span>
                  </label>
                  {!terms && termsTouched && <p className="ax-field__hint" style={{ color: 'var(--ax-danger-500)' }}>Debes aceptar los términos para continuar.</p>}
                </div>

                <button type="submit" className={`ax-btn ax-btn--primary ax-btn--lg ax-btn--block${loading ? ' is-loading' : ''}`} disabled={!terms} aria-busy={loading}>
                  <span className="ax-btn__spinner" aria-hidden="true"></span>
                  <span className="ax-btn__label">Crear cuenta</span>
                </button>
              </form>

              <p style={{ textAlign: 'center', margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
                ¿Ya tienes cuenta? <Link className="ax-link" href="/auth/sign-in" style={{ fontWeight: 'var(--ax-weight-medium)' }}>Iniciar sesión</Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </AuthStandalone>
  );
}

export default SignUpBasic;
