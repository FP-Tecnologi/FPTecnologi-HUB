'use client';
/*
 * Menú de acciones de una fila (botón de tres puntos). El menú sale por un portal con posición fija: no lo recorta el
 * scroll horizontal de las tablas. Se cierra al elegir una opción, al hacer clic fuera, con Escape o al hacer scroll.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface OpcionMenu {
  etiqueta: string;
  onClick?: () => void;
  href?: string;
  peligro?: boolean;
}

export function MenuPuntos({ opciones, etiqueta = 'Acciones' }: { opciones: OpcionMenu[]; etiqueta?: string }) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pos) return;
    const cerrar = () => setPos(null);
    const fuera = (e: MouseEvent) => { if (!menu.current?.contains(e.target as Node) && !boton.current?.contains(e.target as Node)) cerrar(); };
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') { cerrar(); boton.current?.focus(); } };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', tecla);
    window.addEventListener('scroll', cerrar, true);
    window.addEventListener('resize', cerrar);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', tecla);
      window.removeEventListener('scroll', cerrar, true);
      window.removeEventListener('resize', cerrar);
    };
  }, [pos]);

  function alternar() {
    if (pos) return setPos(null);
    const r = boton.current!.getBoundingClientRect();
    // Si no cabe debajo, se abre hacia arriba (alto estimado: 40 px por opción).
    const alto = opciones.length * 40 + 12;
    const top = r.bottom + alto > window.innerHeight ? Math.max(8, r.top - alto) : r.bottom + 4;
    setPos({ top, right: window.innerWidth - r.right });
  }

  const estiloItem = { justifyContent: 'flex-start', textDecoration: 'none' } as const;

  return (
    <>
      <button ref={boton} type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label={etiqueta} aria-haspopup="menu" aria-expanded={!!pos} onClick={alternar} style={{ fontSize: 20, lineHeight: 1, paddingInline: 8 }}>
        ⋮
      </button>
      {pos && createPortal(
        <div ref={menu} role="menu" className="ax-card" style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 300, minWidth: 190, padding: 'var(--ax-space-1)', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          {opciones.map((o) => {
            const cls = 'ax-btn ax-btn--ghost ax-btn--sm ax-btn--block';
            const estilo = { ...estiloItem, ...(o.peligro ? { color: 'var(--ax-danger-500)' } : {}) };
            return o.href ? (
              <a key={o.etiqueta} role="menuitem" className={cls} style={estilo} href={o.href} target="_blank" rel="noreferrer" onClick={() => setPos(null)}>{o.etiqueta}</a>
            ) : (
              <button key={o.etiqueta} type="button" role="menuitem" className={cls} style={estilo} onClick={() => { setPos(null); o.onClick?.(); }}>{o.etiqueta}</button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
