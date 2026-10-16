'use client';
/*
 * Verificación antes de una acción sensible: con 2FA por app activo se pide el código de la app autenticadora; si no, se envía
 * un código al correo de quien actúa (POST /usuarios/global/verificacion). Al confirmar, se ejecuta la acción con ese código.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export function VerificacionModal({ titulo, detalle, onConfirmar, onCerrar }: {
  titulo: string;
  detalle: string;
  /** Ejecuta la acción con el código; si lanza, el modal muestra el error y sigue abierto. */
  onConfirmar: (codigo: string) => Promise<void>;
  onCerrar: () => void;
}) {
  const [metodo, setMetodo] = useState<{ metodo: 'totp' | 'correo'; correo?: string } | null>(null);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);

  const pedir = () => {
    setError('');
    api.post<{ metodo: 'totp' | 'correo'; correo?: string }>('/usuarios/global/verificacion')
      .then(setMetodo)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'No se pudo iniciar la verificación.'));
  };
  useEffect(pedir, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCerrar]);

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!codigo.trim() || busy) return;
    setBusy(true); setError('');
    try { await onConfirmar(codigo.trim()); onCerrar(); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'No se pudo completar la acción.'); }
    finally { setBusy(false); }
  }

  return createPortal(
    <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 300, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
      <div onClick={onCerrar} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.6)', backdropFilter: 'blur(2px)' }} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="vf-title" className="ax-card" style={{ position: 'relative', maxWidth: 420, width: '100%' }}>
        <div className="ax-card__header">
          <div className="ax-card__titles"><h2 className="ax-card__title" id="vf-title">{titulo}</h2><p className="ax-card__subtitle">{detalle}</p></div>
        </div>
        <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} onSubmit={enviar}>
          {error && <div role="alert" className="ax-alert ax-alert--danger"><div className="ax-alert__content"><p className="ax-alert__message">{error}</p></div></div>}
          <div className="ax-field">
            <label className="ax-label" htmlFor="vf-codigo">
              {!metodo ? 'Preparando la verificación…' : metodo.metodo === 'totp' ? 'Código de tu app autenticadora' : `Código enviado a ${metodo.correo}`}
            </label>
            <input id="vf-codigo" className="ax-input" inputMode="numeric" autoComplete="one-time-code" autoFocus placeholder="000000" maxLength={12} disabled={!metodo} value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\s/g, ''))} />
            {metodo?.metodo === 'correo' && (
              <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                ¿No llegó? <button type="button" className="ax-btn ax-btn--link" onClick={() => { setMetodo(null); setCodigo(''); pedir(); }}>Enviar otro código</button>
              </span>
            )}
          </div>
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="ax-btn ax-btn--primary" disabled={!metodo || !codigo.trim() || busy}>{busy ? 'Verificando…' : 'Confirmar'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
