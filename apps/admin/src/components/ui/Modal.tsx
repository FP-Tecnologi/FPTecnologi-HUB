'use client';
/*
 * Popup reutilizable para formularios y detalles cortos (nuevo cliente, nuevo producto, editar fila…).
 * Reemplaza los paneles que se abrían al costado de la tabla. Se cierra con Escape, con la X o al hacer clic en el fondo.
 * Los formularios largos (varias secciones) mejor van en su propia página; ver AGENTS.md.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export function Modal({ titulo, subtitulo, acciones, onCerrar, children, pie, tamano = 'md' }: {
  titulo: ReactNode;
  /** Botones extra junto a la X (por ejemplo "Ver en CRM"). */
  acciones?: ReactNode;
  subtitulo?: ReactNode;
  onCerrar: () => void;
  children: ReactNode;
  /** Botones del pie (Cancelar / Guardar). */
  pie?: ReactNode;
  tamano?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const dialogo = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogo, true);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [onCerrar]);

  const cls = `ax-modal__dialog ax-modal__dialog--scrollable${tamano === 'md' ? '' : ` ax-modal__dialog--${tamano}`}`;
  return createPortal(
    <div className="ax-modal ax-modal--centered" role="presentation">
      <div className="ax-modal__backdrop" onClick={onCerrar} />
      <div className={cls} role="dialog" aria-modal="true" aria-label={typeof titulo === 'string' ? titulo : undefined} ref={dialogo}>
        <div className="ax-modal__header">
          <div>
            <h2 className="ax-modal__title">{titulo}</h2>
            {subtitulo && <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{subtitulo}</p>}
          </div>
          {acciones && <div style={{ marginInlineStart: 'auto' }}>{acciones}</div>}
          <button type="button" className="ax-modal__close" aria-label="Cerrar" onClick={onCerrar} style={{ fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>
        <div className="ax-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>{children}</div>
        {pie && <div className="ax-modal__footer">{pie}</div>}
      </div>
    </div>,
    document.body,
  );
}
