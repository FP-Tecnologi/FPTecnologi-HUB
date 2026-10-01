'use client';
/*
 * FPTecnologi-HUB · Dashboard — Aceptar invitación del equipo (?token=).
 * Pública: cuenta nueva → nombre + contraseña; cuenta existente → un clic.
 * Usa GET/POST /public/invitaciones (sin sesión).
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthStandalone, OffappTools, BrandCentered } from './authShared';
import { ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Info { email: string; marca: string; rol: string; cuentaExiste: boolean }

export function AceptarInvitacion() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!token) { setError('El enlace de invitación no es válido.'); return; }
    api.get<Info>(`/public/invitaciones/${encodeURIComponent(token)}`, { auth: false })
      .then(setInfo)
      .catch((e: unknown) => setError(e instanceof ApiError ? e.message : 'No se pudo cargar la invitación.'));
  }, [token]);

  async function aceptar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!info || busy) return;
    setBusy(true); setError('');
    try {
      await api.post('/public/invitaciones/aceptar', { token, nombre: nombre.trim() || undefined, password: info.cuentaExiste ? undefined : password }, { auth: false });
      setListo(true);
      setTimeout(() => router.push('/auth/sign-in'), 1600);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo aceptar la invitación.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthStandalone>
      <OffappTools style={{ position: 'fixed', insetBlockStart: 'var(--ax-space-5)', insetInlineEnd: 'var(--ax-space-5)', zIndex: 5 }} />
      <main className="ax-center" id="ax-main" style={{ inlineSize: '100%', maxInlineSize: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ inlineSize: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
          <BrandCentered />
          <section className="ax-card" style={{ borderRadius: 'var(--ax-radius-xl)' }}>
            <div className="ax-card__body" style={{ padding: 'var(--ax-space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)' }}>
              <h1 style={{ margin: 0, fontFamily: 'var(--ax-font-display)', fontSize: 'var(--ax-text-2xl)', fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>Invitación al equipo</h1>

              {error && <div role="alert" className="ax-alert ax-alert--danger"><div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div></div>}

              {listo && <div role="status" className="ax-alert ax-alert--success"><div className="ax-alert__content"><p className="ax-alert__message">Listo. Te llevamos a iniciar sesión…</p></div></div>}

              {info && !listo && (
                <form onSubmit={aceptar} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
                  <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
                    Te sumaron a <b style={{ color: 'var(--ax-text-strong)' }}>{info.marca}</b> como <b style={{ color: 'var(--ax-text-strong)' }}>{info.rol}</b> ({info.email}).
                  </p>
                  {info.cuentaExiste ? (
                    <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Ya tienes cuenta: entrarás con tu contraseña de siempre.</p>
                  ) : (
                    <>
                      <div className="ax-field"><label className="ax-label" htmlFor="inv-nombre">Tu nombre</label><input id="inv-nombre" className="ax-input" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
                      <div className="ax-field"><label className="ax-label" htmlFor="inv-pass">Crea una contraseña (mín. 8 caracteres)</label><input id="inv-pass" type="password" className="ax-input" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                    </>
                  )}
                  <button type="submit" className="ax-btn ax-btn--primary ax-btn--block" disabled={busy || (!info.cuentaExiste && password.length < 8)} style={{ minHeight: 44 }}>
                    <span className="ax-btn__label">{busy ? 'Guardando…' : 'Aceptar invitación'}</span>
                  </button>
                </form>
              )}

              {!info && error && <Link className="ax-link" href="/auth/sign-in">Ir a iniciar sesión</Link>}
            </div>
          </section>
        </div>
      </main>
    </AuthStandalone>
  );
}

export default AceptarInvitacion;
