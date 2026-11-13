'use client';
/*
 * PWA: registra el service worker, ofrece "Instalar app", avisa de la conexión y sincroniza la cola offline del CRM.
 */
import { useCallback, useEffect, useState } from 'react';
import { sincronizarCola } from '../../lib/api';
import { listarCola, quitarDeCola, estaSincronizando, type CambioPendiente } from '../../lib/offline';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const CLAVE_DESCARTE = 'ax:pwa-install-dismissed';

export function PwaShell() {
  const [online, setOnline] = useState(true);
  const [instalador, setInstalador] = useState<InstallPromptEvent | null>(null);
  const [cola, setCola] = useState<CambioPendiente[]>([]);
  const [sync, setSync] = useState(false);
  const [desactualizado, setDesactualizado] = useState<number | null>(null);

  const refrescar = useCallback(() => {
    setSync(estaSincronizando());
    void listarCola().then(setCola);
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    refrescar();
    void sincronizarCola();
    const cada30s = window.setInterval(() => { if (navigator.onLine) void sincronizarCola(); }, 30_000);
    const alGuardados = (e: Event) => setDesactualizado((e as CustomEvent<number>).detail);
    window.addEventListener('ax:cola', refrescar);
    window.addEventListener('ax:datos-guardados', alGuardados);
    const alVolver = () => { setOnline(true); setDesactualizado(null); void sincronizarCola(); };
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
      window.clearInterval(cada30s);
      window.removeEventListener('ax:cola', refrescar);
      window.removeEventListener('ax:datos-guardados', alGuardados);
      window.removeEventListener('online', alVolver);
      window.removeEventListener('offline', alPerder);
      window.removeEventListener('beforeinstallprompt', alOfrecer);
      window.removeEventListener('appinstalled', alInstalar);
    };
  }, [refrescar]);

  const pendientes = cola.filter((c) => !c.error);
  const fallidos = cola.filter((c) => c.error);

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
      {(!online || pendientes.length > 0 || fallidos.length > 0) && (
        <div role="status" aria-live="polite" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999, background: online && !fallidos.length ? '#0369a1' : '#b45309', color: '#fff', padding: '8px 16px', fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span>
            {!online
              ? `Sin conexión: el CRM sigue disponible con lo último guardado${desactualizado ? ` (${new Date(desactualizado).toLocaleString('es-PE')})` : ''}; el resto vuelve con internet.`
              : sync ? 'Sincronizando cambios…' : null}
            {pendientes.length > 0 && ` ${pendientes.length} cambio${pendientes.length === 1 ? '' : 's'} pendiente${pendientes.length === 1 ? '' : 's'} de enviar.`}
          </span>
          {fallidos.map((c) => (
            <span key={c.id} style={{ fontWeight: 500 }}>
              No se pudo enviar un cambio ({c.method} {c.path}): {c.error}{' '}
              <button type="button" onClick={() => c.id !== undefined && void quitarDeCola(c.id)} style={{ background: 'rgba(255,255,255,.2)', color: '#fff', border: 0, borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>Descartar</button>
            </span>
          ))}
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
