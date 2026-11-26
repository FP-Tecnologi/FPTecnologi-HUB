'use client';
/*
 * FPTecnologi-HUB · Dashboard — Selector de fecha propio (reemplaza el
 * calendario nativo del navegador, que cambia de aspecto en cada sistema).
 * Campo con el estilo de .ax-input que abre un calendario con los tokens del
 * dashboard (claro/oscuro): mes anterior/siguiente, semana de lunes a domingo,
 * hoy marcado y atajos Hoy / Mañana / En una semana / Quitar.
 * Valor = 'YYYY-MM-DD' (o '' sin fecha), igual que <input type="date">.
 * Teclado: flechas mueven el día, Enter elige, Esc cierra.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const aClave = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const deClave = (v: string) => {
  const [a, m, d] = v.split('-').map(Number);
  return a && m && d ? new Date(a, m - 1, d) : null;
};
const sumarDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const texto = (v: string) => {
  const d = deClave(v);
  return d ? d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
};

const ESTILOS = `
.cf-campo{position:relative;display:flex;align-items:center;width:100%;text-align:left;cursor:pointer;gap:8px}
.cf-campo .cf-ico{flex:none;width:18px;height:18px;color:var(--ax-text-muted)}
.cf-campo .cf-txt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cf-campo .cf-txt:not(.is-vacio)::first-letter{text-transform:uppercase}
.cf-campo .cf-txt.is-vacio{color:var(--ax-text-subtle)}
.cf-campo .cf-x{flex:none;display:inline-flex;border:0;background:none;color:var(--ax-text-subtle);padding:2px;border-radius:6px;cursor:pointer}
.cf-campo .cf-x:hover{color:var(--ax-text-strong);background:var(--ax-surface-subtle)}
.cf-pop{position:fixed;z-index:5000;width:296px;padding:12px;border-radius:var(--ax-radius-lg,14px);background:linear-gradient(var(--ax-surface-overlay),var(--ax-surface-overlay)),var(--ax-canvas,#fff);border:1px solid var(--ax-border-strong,var(--ax-border));box-shadow:var(--ax-shadow-lg,0 18px 40px rgba(0,0,0,.25));color:var(--ax-text-strong);font-size:var(--ax-text-sm)}
.cf-cab{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.cf-mes{font-weight:var(--ax-weight-semibold,600);text-transform:capitalize}
.cf-nav{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border:0;border-radius:8px;background:none;color:var(--ax-text-muted);cursor:pointer}
.cf-nav:hover{background:var(--ax-surface-subtle);color:var(--ax-text-strong)}
.cf-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.cf-dsem{text-align:center;font-size:11px;font-weight:600;color:var(--ax-text-subtle);padding:4px 0;text-transform:uppercase;letter-spacing:.04em}
.cf-dia{height:36px;border:0;border-radius:9px;background:none;color:var(--ax-text-strong);cursor:pointer;font-variant-numeric:tabular-nums;position:relative}
.cf-dia:hover{background:var(--ax-accent-wash,rgba(59,130,246,.12))}
.cf-dia.is-fuera{color:var(--ax-text-subtle);opacity:.55}
.cf-dia.is-hoy{font-weight:700;color:var(--ax-accent-500)}
.cf-dia.is-hoy::after{content:"";position:absolute;left:50%;bottom:5px;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:currentColor}
.cf-dia.is-sel{background:var(--ax-accent-500);color:#fff;font-weight:700}
.cf-dia.is-sel::after{background:#fff}
.cf-dia.is-foco{outline:2px solid var(--ax-accent-500);outline-offset:-2px}
.cf-dia:disabled{opacity:.3;cursor:not-allowed;background:none}
.cf-pie{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid var(--ax-border)}
.cf-atajo{border:1px solid var(--ax-border);background:none;color:var(--ax-text-strong);border-radius:999px;padding:4px 10px;font-size:12px;cursor:pointer}
.cf-atajo:hover{border-color:var(--ax-accent-500);color:var(--ax-accent-500)}
.cf-atajo.is-quitar{margin-left:auto;border-color:transparent;color:var(--ax-text-muted)}
`;

export function CampoFecha({
  id,
  value,
  onChange,
  placeholder = 'Elegir fecha',
  min,
  limpiable = true,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Fecha mínima 'YYYY-MM-DD' (los días anteriores quedan deshabilitados). */
  min?: string;
  /** Muestra la X para dejar el campo vacío. */
  limpiable?: boolean;
}) {
  const autoId = useId();
  const popId = `${id ?? autoId}-cal`;
  const boton = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const hoy = new Date();
  const sel = deClave(value);
  const [foco, setFoco] = useState<Date>(sel ?? hoy);
  const minD = min ? deClave(min) : null;

  const abrir = () => { setFoco(deClave(value) ?? new Date()); setAbierto(true); };
  const cerrar = (devolverFoco = true) => { setAbierto(false); if (devolverFoco) boton.current?.focus(); };
  const elegir = (d: Date) => { if (minD && d < minD) return; onChange(aClave(d)); cerrar(); };

  // Ubicación: debajo del campo; si no entra, arriba. Fixed para no cortarse dentro de modales con scroll.
  useLayoutEffect(() => {
    if (!abierto) return;
    const ubicar = () => {
      const r = boton.current?.getBoundingClientRect();
      if (!r) return;
      const alto = pop.current?.offsetHeight ?? 380;
      const ancho = 296;
      const abajo = r.bottom + 6 + alto <= window.innerHeight;
      setPos({
        top: abajo ? r.bottom + 6 : Math.max(8, r.top - alto - 6),
        left: Math.min(Math.max(8, r.left), window.innerWidth - ancho - 8),
      });
    };
    ubicar();
    window.addEventListener('resize', ubicar);
    window.addEventListener('scroll', ubicar, true);
    return () => { window.removeEventListener('resize', ubicar); window.removeEventListener('scroll', ubicar, true); };
  }, [abierto]);

  // Cerrar con click fuera.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!pop.current?.contains(t) && !boton.current?.contains(t)) cerrar(false);
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, [abierto]);

  useEffect(() => { if (abierto) pop.current?.focus(); }, [abierto]);

  const teclas = (e: React.KeyboardEvent) => {
    const mov: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in mov) { e.preventDefault(); setFoco((f) => sumarDias(f, mov[e.key])); }
    else if (e.key === 'Enter') { e.preventDefault(); elegir(foco); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(); }
  };

  // Cuadrícula de 6 semanas empezando en lunes.
  const primero = new Date(foco.getFullYear(), foco.getMonth(), 1);
  const inicio = sumarDias(primero, -((primero.getDay() + 6) % 7));
  const dias = Array.from({ length: 42 }, (_, i) => sumarDias(inicio, i));

  return (
    <>
      <style>{ESTILOS}</style>
      <button
        ref={boton}
        id={id}
        type="button"
        className="ax-input cf-campo"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls={abierto ? popId : undefined}
        onClick={() => (abierto ? cerrar() : abrir())}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' && !abierto) { e.preventDefault(); abrir(); } }}
      >
        <svg className="cf-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" /><path d="M8 15h2v2h-2z" />
        </svg>
        <span className={`cf-txt${value ? '' : ' is-vacio'}`}>{value ? texto(value) : placeholder}</span>
        {limpiable && value && (
          <span
            role="button"
            tabIndex={-1}
            className="cf-x"
            aria-label="Quitar fecha"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
          </span>
        )}
      </button>

      {abierto && typeof document !== 'undefined' && createPortal(
        <div ref={pop} id={popId} className="cf-pop" role="dialog" aria-label="Elegir fecha" tabIndex={-1} onKeyDown={teclas} style={{ top: pos.top, left: pos.left }}>
          <div className="cf-cab">
            <button type="button" className="cf-nav" aria-label="Mes anterior" onClick={() => setFoco((f) => new Date(f.getFullYear(), f.getMonth() - 1, 1))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6l6 6" /></svg>
            </button>
            <span className="cf-mes" aria-live="polite">{MESES[foco.getMonth()]} {foco.getFullYear()}</span>
            <button type="button" className="cf-nav" aria-label="Mes siguiente" onClick={() => setFoco((f) => new Date(f.getFullYear(), f.getMonth() + 1, 1))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6l-6 6" /></svg>
            </button>
          </div>
          <div className="cf-grid" role="grid">
            {DIAS.map((d) => <span key={d} className="cf-dsem" role="columnheader">{d}</span>)}
            {dias.map((d) => {
              const k = aClave(d);
              const clases = [
                'cf-dia',
                d.getMonth() !== foco.getMonth() && 'is-fuera',
                k === aClave(hoy) && 'is-hoy',
                k === value && 'is-sel',
                k === aClave(foco) && 'is-foco',
              ].filter(Boolean).join(' ');
              return (
                <button
                  key={k}
                  type="button"
                  className={clases}
                  disabled={!!minD && d < minD}
                  aria-pressed={k === value}
                  aria-label={d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  tabIndex={-1}
                  onClick={() => elegir(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          <div className="cf-pie">
            <button type="button" className="cf-atajo" onClick={() => elegir(new Date())}>Hoy</button>
            <button type="button" className="cf-atajo" onClick={() => elegir(sumarDias(new Date(), 1))}>Mañana</button>
            <button type="button" className="cf-atajo" onClick={() => elegir(sumarDias(new Date(), 7))}>En una semana</button>
            {limpiable && value && <button type="button" className="cf-atajo is-quitar" onClick={() => { onChange(''); cerrar(); }}>Quitar</button>}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
