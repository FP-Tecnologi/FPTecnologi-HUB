'use client';
/*
 * FPTecnologi-HUB — modal de bienvenida, una sola vez por cuenta.
 * AuthContext.completeSession() deja la bandera en sessionStorage cuando el
 * backend marca primeraVez (ver auth.service.ts issueTokens); esta pantalla
 * la lee al montar en Home y la borra, así nunca vuelve a aparecer aunque
 * se recargue la página en la misma pestaña.
 */
import { useEffect, useRef, useState } from 'react';
import { WELCOME_FLAG } from '../../context/AuthContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export function WelcomeModal({ nombre }: { nombre?: string | null }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(WELCOME_FLAG) === '1') {
        window.sessionStorage.removeItem(WELCOME_FLAG);
        setOpen(true);
      }
    } catch {
      /* sessionStorage no disponible (modo privado, etc.) — sin modal, no rompe nada */
    }
  }, []);

  useFocusTrap(dialogRef, open);

  if (!open) return null;

  return (
    <div className="ax-modal ax-modal--centered" role="presentation">
      <div className="ax-modal__backdrop" onClick={() => setOpen(false)} />
      <div className="ax-modal__dialog ax-modal__dialog--sm" role="dialog" aria-modal="true" aria-labelledby="welcome-title" ref={dialogRef}>
        <div className="ax-modal__body" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ax-space-4)', padding: 'var(--ax-space-8) var(--ax-space-6)' }}>
          <span aria-hidden="true" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 'var(--ax-radius-pill)',
            background: 'var(--ax-accent-wash)', color: 'var(--ax-accent)', fontSize: 30,
          }}>
            👋
          </span>
          <div>
            <h2 id="welcome-title" style={{ margin: '0 0 var(--ax-space-2)', fontFamily: 'var(--ax-font-display)', fontSize: 'var(--ax-text-xl)', fontWeight: 700, color: 'var(--ax-text-strong)' }}>
              ¡Bienvenido{nombre ? `, ${nombre}` : ''}!
            </h2>
            <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
              Tu cuenta ya está lista. Este es tu panel — desde acá vas a administrar tu marca a medida que se agreguen los módulos.
            </p>
          </div>
          <button type="button" className="ax-btn ax-btn--primary ax-btn--block" onClick={() => setOpen(false)}>
            <span className="ax-btn__label">Empezar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;
