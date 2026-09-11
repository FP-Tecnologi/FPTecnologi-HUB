'use client';
/*
 * Vireo Next.js — Recuperar contraseña (real, 2 pasos).
 * Paso 1: pide el email -> POST /auth/password-reset/request (respuesta
 * genérica siempre, anti-enumeración). Paso 2: código de 6 dígitos +
 * contraseña nueva -> POST /auth/password-reset/confirm. Un solo archivo
 * en vez de una pantalla "create-password" aparte con ?token=... del email,
 * porque el backend usa el mismo patrón de código de 6 dígitos que el resto
 * del sistema (OtpCode), no un link mágico con token en la URL.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthStandalone, OffappTools, BrandCentered, EYE, EYE_OFF } from './authShared';
import { useAuth, ApiError } from '../../context/AuthContext';

export function ResetPasswordBasic() {
  const router = useRouter();
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [reveal, setReveal] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const rules = useMemo(() => [
    { id: 'len', text: 'Al menos 8 caracteres', ok: pw.length >= 8 },
    { id: 'num', text: 'Contiene un número', ok: /\d/.test(pw) },
    { id: 'upper', text: 'Contiene una mayúscula', ok: /[A-Z]/.test(pw) },
  ], [pw]);
  const match = confirm.length > 0 && pw === confirm;
  const canConfirm = rules.every((r) => r.ok) && match && codigo.trim().length === 6;

  function maskEmail(v: string) {
    const [u, d] = v.split('@');
    if (!d) return v;
    return (u[0] || '') + '•••@' + d;
  }

  function submitEmail(ev: React.FormEvent) {
    ev.preventDefault();
    const err = !email.trim() ? 'Ingresa tu correo.' : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? 'Ingresa un correo válido.' : '';
    setEmailErr(err);
    if (err) return;
    setLoading(true);
    requestPasswordReset(email.trim())
      .then(() => {
        setLoading(false);
        setStep('code');
      })
      .catch(() => {
        // Misma respuesta pase lo que pase: no revelamos si el correo existe.
        setLoading(false);
        setStep('code');
      });
  }

  function submitNewPassword(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canConfirm) return;
    setLoading(true);
    setConfirmError('');
    confirmPasswordReset(email.trim(), codigo.trim(), pw)
      .then(() => {
        setLoading(false);
        router.push('/auth/sign-in-basic?password=actualizada');
      })
      .catch((err: unknown) => {
        setLoading(false);
        setConfirmError(err instanceof ApiError ? err.message : 'Código inválido o vencido.');
      });
  }

  return (
    <AuthStandalone>
      <OffappTools style={{ position: 'fixed', insetBlockStart: 'var(--ax-space-5)', insetInlineEnd: 'var(--ax-space-5)', zIndex: 5 }} />

      <main className="ax-center" id="ax-main" style={{ inlineSize: '100%', maxInlineSize: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ inlineSize: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
          <BrandCentered />

          <section className="ax-card" role="region" aria-label="Recuperar contraseña" style={{ borderRadius: 'var(--ax-radius-xl)' }}>
            <div className="ax-card__body" style={{ padding: 'var(--ax-space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
              {step === 'email' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
                  <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-1)' }}>
                    <h1 style={{ margin: 0, fontFamily: 'var(--ax-font-display)', fontSize: 'var(--ax-text-2xl)', fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)', letterSpacing: '-.015em' }}>Recuperar contraseña</h1>
                    <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Ingresa tu correo y te mandamos un código para restablecerla.</p>
                  </header>

                  <form onSubmit={submitEmail} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} noValidate>
                    <div className="ax-field">
                      <label className="ax-label" htmlFor="rp-email">Correo</label>
                      <div className="ax-field__control">
                        <span className="ax-field__affix ax-field__affix--leading" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" /><path d="M3 7l9 6l9 -6" /></svg>
                        </span>
                        <input id="rp-email" type="email" className={`ax-input ax-input--with-leading-icon${emailErr ? ' is-invalid' : ''}`} autoComplete="email" placeholder="tu@correo.com"
                          value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={emailErr ? 'true' : 'false'} aria-describedby="rp-email-msg" required />
                      </div>
                      {emailErr && <p id="rp-email-msg" className="ax-field__message ax-field__message--error">{emailErr}</p>}
                    </div>

                    <button type="submit" className={`ax-btn ax-btn--primary ax-btn--lg ax-btn--block${loading ? ' is-loading' : ''}`} aria-busy={loading}>
                      <span className="ax-btn__spinner" aria-hidden="true"></span>
                      <span className="ax-btn__label">Enviar código</span>
                    </button>
                  </form>

                  <p style={{ textAlign: 'center', margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
                    ¿La recordaste? <Link className="ax-link" href="/auth/sign-in-basic" style={{ fontWeight: 'var(--ax-weight-medium)' }}>Iniciar sesión</Link>
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
                  <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-1)' }}>
                    <h1 style={{ margin: 0, fontFamily: 'var(--ax-font-display)', fontSize: 'var(--ax-text-2xl)', fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)', letterSpacing: '-.015em' }}>Revisa tu correo</h1>
                    <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Te mandamos un código a <b style={{ color: 'var(--ax-text-strong)' }}>{maskEmail(email.trim())}</b>. Ingrésalo junto a tu nueva contraseña.</p>
                  </header>

                  {confirmError && (
                    <div role="alert" className="ax-alert ax-alert--danger" style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                      <svg className="ax-alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                      <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{confirmError}</p></div>
                    </div>
                  )}

                  <form onSubmit={submitNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} noValidate>
                    <div className="ax-field">
                      <label className="ax-label" htmlFor="rp-code">Código de 6 dígitos</label>
                      <input id="rp-code" type="text" inputMode="numeric" maxLength={6} className="ax-input" placeholder="123456"
                        value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} required />
                    </div>

                    <div className="ax-field">
                      <label className="ax-label" htmlFor="rp-pass">Nueva contraseña</label>
                      <div className="ax-field__control">
                        <input id="rp-pass" className="ax-input ax-input--with-trailing" type={reveal ? 'text' : 'password'} autoComplete="new-password" placeholder="Ingresa una contraseña nueva"
                          value={pw} onChange={(e) => setPw(e.target.value)} />
                        <button type="button" className="ax-field__affix ax-field__affix--trailing ax-field__affix--button" aria-pressed={reveal} aria-label={reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setReveal((v) => !v)}>
                          {reveal ? EYE_OFF : EYE}
                        </button>
                      </div>
                      <ul className="ax-stack" style={{ ['--ax-gap' as string]: 'var(--ax-space-1)', marginBlockStart: 'var(--ax-space-3)', listStyle: 'none', padding: 0 }} aria-live="polite">
                        {rules.map((r) => (
                          <li key={r.id} className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-xs)', color: r.ok ? 'var(--ax-success-500)' : 'var(--ax-text-muted)' }}>
                            {r.ok
                              ? <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5l10 -10" /></svg>
                              : <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>}
                            <span>{r.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="ax-field">
                      <label className="ax-label" htmlFor="rp-confirm">Confirmar contraseña</label>
                      <input id="rp-confirm" type={reveal ? 'text' : 'password'} className="ax-input" autoComplete="new-password" placeholder="Vuelve a escribirla"
                        value={confirm} onChange={(e) => setConfirm(e.target.value)}
                        aria-invalid={confirm.length > 0 && !match}
                        style={confirm.length > 0 && !match ? { borderColor: 'var(--ax-danger-500)' } : undefined} />
                      {confirm.length > 0 && !match && <p className="ax-field__message ax-field__message--error">Todavía no coinciden.</p>}
                    </div>

                    <button type="submit" className={`ax-btn ax-btn--primary ax-btn--lg ax-btn--block${loading ? ' is-loading' : ''}`} disabled={!canConfirm} aria-busy={loading}>
                      <span className="ax-btn__spinner" aria-hidden="true"></span>
                      <span className="ax-btn__label">Guardar contraseña</span>
                    </button>
                  </form>

                  <div className="ax-center" style={{ flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
                    <button type="button" className="ax-btn ax-btn--link" onClick={() => setStep('email')} style={{ fontSize: 'var(--ax-text-sm)' }}>
                      Usar otro correo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <p style={{ textAlign: 'center', margin: 0, fontSize: 'var(--ax-text-2xs)', color: 'var(--ax-text-subtle)' }}>
            ¿No pediste esto? Puedes ignorar el correo con tranquilidad.
          </p>
        </div>
      </main>
    </AuthStandalone>
  );
}

export default ResetPasswordBasic;
