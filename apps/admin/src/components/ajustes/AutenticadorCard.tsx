'use client';
/*
 * Configurar el 2FA por app autenticadora (TOTP) desde Ajustes:
 * POST /auth/totp/setup (QR) → POST /auth/totp/enable (código + códigos de respaldo)
 * y POST /auth/totp/disable (exige un código válido). Si no se activa, el login
 * sigue usando el código por correo.
 */
import { useEffect, useState } from 'react';
import { ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Setup { secret: string; qrCodeDataUrl: string }

export function AutenticadorCard() {
  const [activo, setActivo] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState('');
  const [respaldo, setRespaldo] = useState<string[] | null>(null);
  const [desactivando, setDesactivando] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get<{ totpEnabled: boolean }>('/usuarios/me/seguridad').then((r) => setActivo(r.totpEnabled)).catch(() => setActivo(false));
  }, []);

  async function run(fn: () => Promise<void>) {
    setBusy(true); setErr('');
    try { await fn(); } catch (e) { setErr(e instanceof ApiError ? e.message : 'No se pudo completar la acción.'); } finally { setBusy(false); }
  }

  const empezar = () => run(async () => { setSetup(await api.post<Setup>('/auth/totp/setup')); setCode(''); });
  const confirmar = () => run(async () => {
    const r = await api.post<{ backupCodes: string[] }>('/auth/totp/enable', { code: code.trim() });
    setRespaldo(r.backupCodes); setSetup(null); setActivo(true); setCode('');
  });
  const desactivar = () => run(async () => {
    await api.post('/auth/totp/disable', { code: code.trim() });
    setActivo(false); setDesactivando(false); setCode('');
  });

  return (
    <section className="ax-card ax-col--12" role="region" aria-label="App autenticadora">
      <div className="ax-card__header"><div className="ax-card__titles">
        <h2 className="ax-card__title">App autenticadora (2FA)</h2>
        <p className="ax-card__subtitle">Usa Google Authenticator, Authy o similar en lugar del código por correo. Al iniciar sesión podrás usar la app o pedir el código por correo.</p>
      </div></div>
      <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
        {err && <div role="alert" className="ax-alert ax-alert--danger"><div className="ax-alert__content"><p className="ax-alert__message">{err}</p></div></div>}

        {respaldo && (
          <div role="status" className="ax-alert ax-alert--success"><div className="ax-alert__content">
            <p className="ax-alert__message"><b>Guarda estos códigos de respaldo</b> (cada uno sirve una vez, no se vuelven a mostrar):</p>
            <p style={{ fontFamily: 'var(--ax-font-mono)', margin: 'var(--ax-space-2) 0 0', wordBreak: 'break-word' }}>{respaldo.join('  ')}</p>
          </div></div>
        )}

        {activo === null && <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>Cargando…</p>}

        {activo === false && !setup && (
          <div><button type="button" className="ax-btn ax-btn--secondary" onClick={empezar} disabled={busy}><span className="ax-btn__label">Configurar app autenticadora</span></button></div>
        )}

        {setup && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)', maxWidth: 320 }}>
            <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>1. Escanea el QR con tu app. 2. Escribe el código de 6 dígitos que genera.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={setup.qrCodeDataUrl} alt="Código QR para tu app autenticadora" width={180} height={180} />
            <p style={{ margin: 0, fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', wordBreak: 'break-all' }}>¿No puedes escanear? Clave: <span style={{ fontFamily: 'var(--ax-font-mono)' }}>{setup.secret}</span></p>
            <input className="ax-input" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" aria-label="Código de la app" value={code} onChange={(e) => setCode(e.target.value)} />
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
              <button type="button" className="ax-btn ax-btn--primary" onClick={confirmar} disabled={busy || code.trim().length < 6}><span className="ax-btn__label">Activar</span></button>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setSetup(null)}>Cancelar</button>
            </div>
          </div>
        )}

        {activo === true && !desactivando && (
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
            <span className="ax-badge ax-badge--soft ax-badge--success ax-badge--pill">Activada</span>
            <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => { setDesactivando(true); setRespaldo(null); }}>Desactivar</button>
          </div>
        )}

        {activo === true && desactivando && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)', maxWidth: 320 }}>
            <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Para desactivarla escribe un código actual de tu app (o uno de respaldo).</p>
            <input className="ax-input" autoComplete="one-time-code" aria-label="Código de la app" value={code} onChange={(e) => setCode(e.target.value)} />
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
              <button type="button" className="ax-btn ax-btn--secondary" onClick={desactivar} disabled={busy || !code.trim()}><span className="ax-btn__label">Desactivar</span></button>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setDesactivando(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
