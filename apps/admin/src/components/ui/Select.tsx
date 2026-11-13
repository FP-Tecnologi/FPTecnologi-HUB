'use client';
/*
 * Desplegable con el diseño del sistema (reemplaza al <select> nativo, cuya lista se ve con el estilo del navegador).
 * Misma API que <select>: value/defaultValue, onChange(e) con e.target.value, hijos <option>, id, disabled, required,
 * name, className (usa "ax-select"), aria-*. La lista sale por un portal con posición fija, así no la recorta el scroll
 * de tablas ni de popups. Teclado: ↑ ↓ Inicio Fin Enter Espacio Esc y escribir para saltar a una opción.
 */
import { Children, isValidElement, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactElement, type ReactNode, type SelectHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';

interface Opcion { value: string; label: string; disabled: boolean }
export interface SelectChange { target: { value: string; name: string }; currentTarget: { value: string; name: string } }

type Base = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'defaultValue' | 'multiple' | 'size'>;
export interface SelectProps extends Base {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: SelectChange) => void;
  children?: ReactNode;
}

function texto(n: ReactNode): string {
  return Children.toArray(n).map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : isValidElement(c) ? texto((c as ReactElement<{ children?: ReactNode }>).props.children) : '')).join('');
}
function recoger(children: ReactNode, salida: Opcion[] = []): Opcion[] {
  Children.forEach(children, (c) => {
    if (!isValidElement(c)) return;
    const el = c as ReactElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>;
    if (el.type === 'option') {
      const label = texto(el.props.children);
      salida.push({ value: el.props.value !== undefined ? String(el.props.value) : label, label, disabled: !!el.props.disabled });
    } else if (el.props.children) recoger(el.props.children, salida);
  });
  return salida;
}

export function Select({ value, defaultValue, onChange, children, className, style, disabled, required, name, id, ...resto }: SelectProps) {
  const opciones = useMemo(() => recoger(children), [children]);
  const [interno, setInterno] = useState(String(defaultValue ?? opciones[0]?.value ?? ''));
  const actual = value !== undefined ? String(value) : interno;
  const sel = opciones.find((o) => o.value === actual);

  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; max: number } | null>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const buscar = useRef({ t: '', at: 0 });
  const uid = useId();

  function abrir() {
    if (disabled || !boton.current) return;
    const r = boton.current.getBoundingClientRect();
    const alto = Math.min(280, opciones.length * 36 + 8);
    const abajo = window.innerHeight - r.bottom - 8;
    const arriba = r.top - 8;
    const subir = abajo < Math.min(alto, 160) && arriba > abajo;
    const max = Math.max(120, Math.min(280, subir ? arriba : abajo));
    setPos({ top: subir ? Math.max(8, r.top - Math.min(alto, max) - 4) : r.bottom + 4, left: r.left, width: r.width, max });
    setActivo(Math.max(0, opciones.findIndex((o) => o.value === actual)));
    setAbierto(true);
  }
  function cerrar() { setAbierto(false); }

  function elegir(i: number) {
    const o = opciones[i];
    if (!o || o.disabled) return;
    if (value === undefined) setInterno(o.value);
    onChange?.({ target: { value: o.value, name: name ?? '' }, currentTarget: { value: o.value, name: name ?? '' } });
    cerrar();
    boton.current?.focus();
  }

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => { const t = e.target as Node; if (!lista.current?.contains(t) && !boton.current?.contains(t)) cerrar(); };
    const scroll = (e: Event) => { if (!lista.current?.contains(e.target as Node)) cerrar(); };
    document.addEventListener('mousedown', fuera);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', cerrar);
    return () => { document.removeEventListener('mousedown', fuera); window.removeEventListener('scroll', scroll, true); window.removeEventListener('resize', cerrar); };
  }, [abierto]);

  useEffect(() => {
    if (abierto) lista.current?.querySelector<HTMLElement>(`[data-i="${activo}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activo, abierto]);

  function mover(desde: number, paso: 1 | -1) {
    for (let i = desde + paso; i >= 0 && i < opciones.length; i += paso) if (!opciones[i].disabled) return i;
    return desde;
  }

  function teclado(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (!abierto) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); abrir(); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActivo((a) => mover(a, 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActivo((a) => mover(a, -1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActivo(mover(-1, 1)); }
    else if (e.key === 'End') { e.preventDefault(); setActivo(mover(opciones.length, -1)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(activo); }
    else if (e.key === 'Tab') cerrar();
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      const ahora = Date.now();
      buscar.current.t = ahora - buscar.current.at > 700 ? e.key.toLowerCase() : buscar.current.t + e.key.toLowerCase();
      buscar.current.at = ahora;
      const i = opciones.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(buscar.current.t));
      if (i >= 0) setActivo(i);
    }
  }

  const estiloBoton: CSSProperties = { display: 'flex', alignItems: 'center', textAlign: 'start', cursor: disabled ? 'not-allowed' : 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', ...style };

  return (
    <>
      <button
        {...(resto as object)}
        ref={boton}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={abierto ? `${uid}-lista` : undefined}
        aria-activedescendant={abierto && activo >= 0 ? `${uid}-o${activo}` : undefined}
        className={className ?? 'ax-select'}
        style={estiloBoton}
        disabled={disabled}
        onClick={() => (abierto ? cerrar() : abrir())}
        onKeyDown={teclado}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{sel?.label ?? ' '}</span>
      </button>
      {(name || required) && (
        // Mantiene la validación nativa (required) y el envío por nombre en formularios <form>.
        <input tabIndex={-1} aria-hidden="true" name={name} required={required} value={actual} onChange={() => {}} onFocus={() => boton.current?.focus()} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1, marginInlineStart: -1 }} />
      )}
      {abierto && pos && createPortal(
        <ul
          ref={lista}
          id={`${uid}-lista`}
          role="listbox"
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, maxWidth: 'min(480px, calc(100vw - 16px))', maxHeight: pos.max, overflowY: 'auto', margin: 0, padding: 'var(--ax-space-1)', listStyle: 'none', zIndex: 2000, background: 'var(--ax-surface-overlay, var(--ax-surface))', backdropFilter: 'blur(18px) saturate(1.1)', border: '1px solid var(--ax-border)', borderRadius: 'var(--ax-radius-md)', boxShadow: 'var(--ax-shadow-lg)' }}
        >
          {opciones.map((o, i) => {
            const elegida = o.value === actual;
            return (
              <li
                key={o.value + i}
                id={`${uid}-o${i}`}
                data-i={i}
                role="option"
                aria-selected={elegida}
                aria-disabled={o.disabled || undefined}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => !o.disabled && setActivo(i)}
                onClick={() => elegir(i)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--ax-space-3)', minHeight: 32, padding: '0 var(--ax-space-3)',
                  fontSize: 'var(--ax-text-sm)', borderRadius: 'var(--ax-radius-sm)', cursor: o.disabled ? 'not-allowed' : 'pointer',
                  color: o.disabled ? 'var(--ax-text-disabled)' : elegida ? 'var(--ax-accent)' : 'var(--ax-text)',
                  fontWeight: elegida ? 'var(--ax-weight-semibold)' : undefined,
                  background: i === activo ? 'var(--ax-fill-hover)' : elegida ? 'var(--ax-accent-wash)' : 'transparent',
                }}
              >
                <span>{o.label || ' '}</span>
                {elegida && <span aria-hidden="true">✓</span>}
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
    </>
  );
}
