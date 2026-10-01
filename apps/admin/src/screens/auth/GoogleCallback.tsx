'use client';
/*
 * FPTecnologi-HUB — destino final del login con Google. El backend ya validó
 * la cuenta con Google y redirige acá con los tokens en la URL (misma lógica
 * que verifyOtp/verifyTotp, solo que no hay 2FA de por medio). Esta pantalla
 * no se ve nunca en condiciones normales — solo el loader mientras procesa.
 */
import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthStandalone, BrandCentered } from './authShared';
import { useAuth } from '../../context/AuthContext';

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeGoogleLogin } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const usuarioRaw = searchParams.get('usuario');
    if (!accessToken || !refreshToken || !usuarioRaw) {
      router.replace('/auth/sign-in?error=google');
      return;
    }
    try {
      const usuario = JSON.parse(usuarioRaw);
      const primeraVez = searchParams.get('primeraVez') === 'true';
      completeGoogleLogin(accessToken, refreshToken, usuario, primeraVez).then(() => router.replace('/'));
    } catch {
      router.replace('/auth/sign-in?error=google');
    }
  }, [searchParams, completeGoogleLogin, router]);

  return (
    <AuthStandalone>
      <main className="ax-center" style={{ inlineSize: '100%', maxInlineSize: 400, flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
        <BrandCentered />
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
          <span className="ax-spinner" aria-hidden="true" />
          <span style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)' }}>Completando el ingreso con Google…</span>
        </div>
      </main>
    </AuthStandalone>
  );
}

export function GoogleCallback() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackInner />
    </Suspense>
  );
}

export default GoogleCallback;
