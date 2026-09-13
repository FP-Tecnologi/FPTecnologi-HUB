'use client';
/*
 * FPTecnologi-HUB · Dashboard — Two-step verification (app autenticadora / TOTP).
 * Counterpart to TwoStepBasic for users who enabled 2FA via app instead of
 * email OTP. A single code field (not 6 auto-advancing cells) because it
 * must accept either a 6-digit TOTP or a 10-character backup code.
 */
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthStandalone, OffappTools, BrandCentered } from './authShared';
import { useAuth, ApiError } from '../../context/AuthContext';

function TwoStepTotpInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyTotp } = useAuth();
  const email = searchParams.get('email') || (typeof window !== 'undefined' ? window.localStorage.getItem('ax:auth:email') : null) || '';
  const [code, setCode] = useState('');
  const [trust, setTrust] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState('Código inválido. Intenta de nuevo.');

  function verify(ev: React.FormEvent) {
    ev.preventDefault();
    if (!code.trim() || !email) return;
    setLoading(true);
    setInvalid(false);
    verifyTotp(email, code.trim(), trust)
      .then(() => {
        setLoading(false);
        router.push('/');
      })
      .catch((err: unknown) => {
        setLoading(false);
        setInvalid(true);
        setInvalidMessage(err instanceof ApiError ? err.message : 'Código inválido. Intenta de nuevo.');
        setCode('');
      });
  }

  return (
    <AuthStandalone>
      <OffappTools style={{ position: 'fixed', insetBlockStart: 'var(--ax-space-5)', insetInlineEnd: 'var(--ax-space-5)', zIndex: 5 }} />

      <main className="ax-center" id="ax-main" style={{ inlineSize: '100%', maxInlineSize: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ inlineSize: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
          <BrandCentered />

          <section className="ax-card" role="region" aria-label="Verificación con app autenticadora" style={{ borderRadius: 'var(--ax-radius-xl)' }}>
            <div className="ax-card__body" style={{ padding: 'var(--ax-space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
              <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)', alignItems: 'center' }}>
                <span className="ax-center" aria-hidden="true" style={{ inlineSize: 56, blockSize: 56, borderRadius: 'var(--ax-radius-pill)', background: 'var(--ax-accent-wash)', color: 'var(--ax-accent)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={26} height={26}>
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M12 18h.01" />
                  </svg>
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-1)' }}>
                  <h1 style={{ margin: 0, fontFamily: 'var(--ax-font-display)', fontSize: 'var(--ax-text-2xl)', fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)', letterSpacing: '-.015em' }}>Verificación en dos pasos</h1>
                  <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Ingresa el código de tu app autenticadora para <b style={{ color: 'var(--ax-text-strong)' }}>{email || 'tu cuenta'}</b>.</p>
                </div>
              </header>

              {invalid && (
                <div role="alert" className="ax-alert ax-alert--danger" style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                  <svg className="ax-alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                  <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{invalidMessage}</p></div>
                </div>
              )}

              <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }} noValidate>
                <div className="ax-field">
                  <label className="ax-label" htmlFor="totp-code">Código de la app o de respaldo</label>
                  <input id="totp-code" type="text" inputMode="text" autoComplete="one-time-code" autoFocus
                    className={`ax-input${invalid ? ' is-invalid' : ''}`} placeholder="123456"
                    value={code} onChange={(e) => { setInvalid(false); setCode(e.target.value); }} aria-invalid={invalid ? 'true' : 'false'} />
                </div>

                <label className="ax-check" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text)' }}>
                  <input type="checkbox" className="ax-checkbox" checked={trust} onChange={(e) => setTrust(e.target.checked)} />
                  <span>Confiar en este dispositivo por 30 días</span>
                </label>

                <button type="submit" className={`ax-btn ax-btn--primary ax-btn--lg ax-btn--block${loading ? ' is-loading' : ''}`} disabled={!code.trim()} aria-busy={loading}>
                  <span className="ax-btn__spinner" aria-hidden="true"></span>
                  <span className="ax-btn__label">Verificar</span>
                </button>
              </form>

              <div className="ax-center" style={{ flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
                <Link className="ax-link" href="/auth/sign-in" style={{ fontSize: 'var(--ax-text-sm)' }}>Usar otro método</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AuthStandalone>
  );
}

export function TwoStepTotp() {
  return (
    <Suspense fallback={null}>
      <TwoStepTotpInner />
    </Suspense>
  );
}

export default TwoStepTotp;
