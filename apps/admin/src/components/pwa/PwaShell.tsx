'use client';
/*
 * PWA (Fase 1): registra el service worker, avisa cuando no hay conexión y ofrece "Instalar app".
 * Los datos offline y la cola de sincronización llegan en la Fase 2.
 */
import { useEffect, useState } from 'react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const CLAVE_DESCARTE = 'ax:pwa-install-dismissed';

export function PwaShell() {
  const [online, setOnline] = useState(true);
  const [instalador, setInstalador] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    const alVolver = () => setOnline(true);
    const alPerder = () => setOnline(false);
    window.addEventListener('online', alVolver);
    window.addEventListener('offline', alPerder);

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }

    const alOfrecer = (e: Event) => {
      e.preventDefault();
      let descartado = false;
      try { descartado = localStorage.getItem(CLAVE_DESCARTE) === '1'; } catch { /* sin storage */ }
      if (!descartado) setInstalador(e as InstallPromptEvent);
    };
    const alInstalar = () => setInstalador(null);
    window.addEventListener('beforeinstallprompt', alOfrecer);
    window.addEventListener('appinstalled', alInstalar);
    return () => {
      window.removeEventListener('online', alVolver);
      window.removeEventListener('offline', alPerder);
      window.removeEventListener('beforeinstallprompt', alOfrecer);
      window.removeEventListener('appinstalled', alInstalar);
    };
  }, []);

  const instalar = async () => {
    if (!instalador) return;
    await instalador.prompt();
    await instalador.userChoice.catch(() => null);
    setInstalador(null);
  };
  const descartar = () => {
    try { localStorage.setItem(CLAVE_DESCARTE, '1'); } catch { /* sin storage */ }
    setInstalador(null);
  };

  return (
    <>
      {!online && (
        <div role="status" aria-live="polite" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#b45309', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>
          Sin conexión: algunas funciones no estarán disponibles hasta que vuelva internet.
        </div>
      )}
      {instalador && online && (
        <div role="dialog" aria-label="Instalar aplicación" style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9998, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--ax-surface, #fff)', color: 'var(--ax-text, #1b2430)', border: '1px solid var(--ax-border, #d8dee6)', borderRadius: 12, padding: '10px 12px', boxShadow: '0 8px 24px rgba(0,0,0,.18)', fontSize: 13 }}>
          <span>Instala FPTecnologi como app</span>
          <button type="button" onClick={instalar} style={{ background: '#008dc5', color: '#fff', border: 0, borderRadius: 8, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Instalar</button>
          <button type="button" onClick={descartar} aria-label="Ahora no" style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}
    </>
  );
}
