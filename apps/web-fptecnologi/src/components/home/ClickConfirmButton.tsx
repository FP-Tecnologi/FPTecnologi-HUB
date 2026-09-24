'use client';

import { useRef, useState, type ReactNode } from 'react';

type Phase = 'idle' | 'sweeping' | 'done';

const SWEEP_MS = 600;
const DONE_MS = 1400;

/**
 * Botón final de "click con efecto sweep" -- promovido desde
 * guia-estilos/ClickConfirmButton.tsx (sección 2.3), elegido como el efecto
 * de clic para primario/secundario/texto en todo el sitio: el ícono viaja de
 * un lado al otro mientras el texto se borra (clip-path), y recién ahí el
 * botón pasa al estado final ("Agregado" / etc.). Generaliza el patrón real
 * que ya usaba "Agregar al carrito" (site2/FeaturedProducts.tsx). El botón
 * mantiene siempre su ancho natural medido al montar, nunca cambia de tamaño.
 *
 * `icon`/`doneIcon` son funciones que reciben `rotated` (true en hover o
 * apenas arranca el sweep) -- el caller decide qué gira con eso (normalmente
 * solo el glyph del ícono, no un fondo/chip alrededor) en vez de que este
 * componente rote el bloque completo. El wrapper de acá (`iconRef`) solo se
 * encarga de la traslación (deslizarse de lado a lado), nunca del giro.
 */
export function ClickConfirmButton({
  icon,
  label,
  doneIcon,
  doneLabel,
  className = 'btn-glow rounded-full px-6 py-3 text-sm font-semibold text-white',
  doneClassName = 'bg-emerald-500 shadow-lg shadow-emerald-500/40 rounded-full px-6 py-3 text-sm font-semibold text-white',
  onConfirm,
  collapsed = false,
}: {
  icon: (rotated: boolean) => ReactNode;
  label: string;
  doneIcon: (rotated: boolean) => ReactNode;
  doneLabel: string;
  className?: string;
  doneClassName?: string;
  onConfirm?: () => void;
  /** Solo ícono en reposo; el texto se despliega al pasar el cursor. */
  collapsed?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [hovered, setHovered] = useState(false);
  const [width, setWidth] = useState<number>();
  const [iconTravel, setIconTravel] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  // Medido al hacer click (no al montar): así el ancho sigue al tamaño de
  // fuente responsive y el texto no queda cortado al cambiar de pantalla.
  // Solo se fija durante el sweep/done para que el botón no salte de tamaño.
  function handleClick() {
    if (phase !== 'idle' || !btnRef.current || !iconRef.current) return;
    const btnRect = btnRef.current.getBoundingClientRect();
    const iconRect = iconRef.current.getBoundingClientRect();
    const paddingRight = parseFloat(getComputedStyle(btnRef.current).paddingRight) || 0;
    setWidth(btnRect.width);
    setIconTravel(btnRect.width - paddingRight - iconRect.width - (iconRect.left - btnRect.left));
    setPhase('sweeping');
    // onConfirm al terminar el sweep -- si no, abrir/navegar tapa el efecto.
    window.setTimeout(() => {
      setPhase('done');
      onConfirm?.();
    }, SWEEP_MS);
    window.setTimeout(() => {
      setPhase('idle');
      setWidth(undefined);
    }, SWEEP_MS + DONE_MS);
  }

  const sweeping = phase === 'sweeping';
  const done = phase === 'done';
  // El giro del ícono (hover o recién arrancando el sweep) lo decide el
  // caller vía la función `icon(rotated)` -- acá solo se traslada.
  const rotated = hovered || sweeping;
  const labelOpen = !collapsed || hovered || phase !== 'idle';

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={width ? { width } : undefined}
      className={`relative flex items-center justify-center overflow-hidden transition-colors duration-300 ${done ? doneClassName : className}`}
    >
      {done ? (
        <span className="flex items-center gap-2">
          {doneIcon(false)}
          {doneLabel}
        </span>
      ) : (
        // justify-center: en botones más anchos que su contenido (w-full),
        // ícono + texto quedan centrados; en los de ancho natural no cambia.
        <span className="relative flex w-full items-center justify-center">
          <span
            ref={iconRef}
            className="flex shrink-0 items-center ease-out"
            style={{ transform: sweeping ? `translateX(${iconTravel}px)` : 'translateX(0)', transition: `transform ${SWEEP_MS}ms ease-out` }}
          >
            {icon(rotated)}
          </span>
          <span
            className="overflow-hidden whitespace-nowrap ease-out"
            style={{
              clipPath: sweeping ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0%)',
              // collapsed: solo ícono; el texto se despliega al hover (y
              // queda abierto durante el sweep).
              maxWidth: labelOpen ? '16rem' : 0,
              marginLeft: labelOpen ? '0.5rem' : 0,
              transition: `clip-path ${SWEEP_MS}ms ease-out, max-width 300ms ease-out, margin-left 300ms ease-out`,
            }}
          >
            {label}
          </span>
        </span>
      )}
    </button>
  );
}
