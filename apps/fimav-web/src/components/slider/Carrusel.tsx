'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import BotonHex from '@/components/hex/BotonHex';

type Props = {
  /** Nombre accesible del carrusel. */
  etiqueta: string;
  diapositivas: React.ReactNode[];
  /** Ancho de cada diapositiva por breakpoint (clases Tailwind), p. ej. `basis-full lg:basis-1/3`. */
  ancho?: string;
  /** Separación entre diapositivas (clase `gap-*`). */
  gap?: string;
  /** Milisegundos entre avances automáticos; 0 = solo manual. */
  auto?: number;
  /** Clases de la fila de controles (p. ej. `lg:hidden` cuando en escritorio caben todas). */
  controles?: string;
  className?: string;
};

const BTN = 'w-14 !px-0 sm:w-16';

/** Carrusel sin librerías: scroll-snap nativo (swipe táctil), autoavance que se pausa con hover/foco/toque/botón y se apaga
 *  con prefers-reduced-motion, flechas, puntos, teclado (←/→) y arrastre con ratón. Las no visibles quedan `inert`. */
export default function Carrusel({ etiqueta, diapositivas, ancho = 'basis-full', gap = 'gap-0', auto = 0, controles = '', className = '' }: Props) {
  const pista = useRef<HTMLDivElement>(null);
  const [visibles, setVisibles] = useState<boolean[]>(() => diapositivas.map(() => true)); // SSR: todas visibles, sin JS no se oculta nada
  const [alFinal, setAlFinal] = useState(false);
  const [reducido, setReducido] = useState(true); // hasta saberlo, nada se mueve solo
  const [pausaUsuario, setPausaUsuario] = useState(false);
  const [encima, setEncima] = useState(false);
  const [foco, setFoco] = useState(false);
  const [tocado, setTocado] = useState(false);
  const arrastre = useRef<number | null>(null);
  const N = diapositivas.length;

  const primera = Math.max(0, visibles.indexOf(true));
  const todas = visibles.every(Boolean);
  const activa = alFinal ? N - 1 : primera;
  const puedeAuto = auto > 0 && !reducido && !todas;
  const reproduciendo = puedeAuto && !pausaUsuario && !encima && !foco && !tocado;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setReducido(mq.matches);
    f();
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);

  // Qué diapositivas se ven (>= 60 %) y si la pista llegó al final.
  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const hijos = Array.from(el.children) as HTMLElement[];
    const estado = hijos.map(() => true);
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) estado[hijos.indexOf(e.target as HTMLElement)] = e.intersectionRatio >= 0.6;
        setVisibles([...estado]);
        setAlFinal(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 && el.scrollLeft > 2);
      },
      { root: el, threshold: [0, 0.6, 1] },
    );
    hijos.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [N]);

  const ir = useCallback((i: number) => {
    const el = pista.current;
    const h = el?.children[i] as HTMLElement | undefined;
    if (!el || !h) return;
    el.scrollTo({ left: h.offsetLeft - el.offsetLeft, behavior: reducido ? 'auto' : 'smooth' });
  }, [reducido]);

  const siguiente = useCallback(() => ir(alFinal ? 0 : Math.min(N - 1, primera + 1)), [ir, alFinal, primera, N]);
  const anterior = () => ir(alFinal && primera === N - 1 ? Math.max(0, N - 2) : (primera - 1 + N) % N);

  const sig = useRef(siguiente);
  sig.current = siguiente;
  useEffect(() => {
    if (!reproduciendo) return;
    const t = setInterval(() => sig.current(), auto);
    return () => clearInterval(t);
  }, [reproduciendo, auto]);

  // El toque pausa el autoavance unos segundos.
  useEffect(() => {
    if (!tocado) return;
    const t = setTimeout(() => setTocado(false), 10000);
    return () => clearTimeout(t);
  }, [tocado]);

  return (
    <section
      aria-roledescription="carrusel"
      aria-label={etiqueta}
      className={className}
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={() => setFoco(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFoco(false); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); siguiente(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
      }}
    >
      <div
        ref={pista}
        aria-live={reproduciendo ? 'off' : 'polite'}
        onTouchStart={() => setTocado(true)}
        onPointerDown={(e) => { if (e.pointerType === 'mouse') arrastre.current = e.clientX; }}
        onPointerUp={(e) => {
          if (arrastre.current === null) return;
          const dx = e.clientX - arrastre.current;
          arrastre.current = null;
          if (Math.abs(dx) > 50) (dx < 0 ? siguiente : anterior)();
        }}
        className={`-my-4 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${gap}`}
      >
        {diapositivas.map((d, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${N}`}
            aria-hidden={visibles[i] ? undefined : true}
            inert={!visibles[i]}
            className={`min-w-0 shrink-0 grow-0 snap-start ${ancho}`}
          >
            {d}
          </div>
        ))}
      </div>

      {N > 1 && (
        <div className={`mt-6 flex items-center justify-center gap-2 sm:gap-3 ${controles}`}>
          <BotonHex variante="carbon" size="sm" icono={ChevronLeft} onClick={anterior} className={BTN}><span className="sr-only">Anterior</span></BotonHex>
          <ul className="flex items-center">
            {diapositivas.map((_, i) => (
              <li key={i}>
                <button
                  type="button"
                  aria-label={`Ir a la diapositiva ${i + 1}`}
                  aria-current={i === activa ? 'true' : undefined}
                  onClick={() => ir(i)}
                  className="group/punto grid h-11 w-8 place-items-center sm:w-11"
                >
                  <span className={`block h-2.5 rounded-full transition-all ${i === activa ? 'w-7 bg-rojo' : 'w-2.5 bg-carbon/40 group-hover/punto:bg-carbon'}`} />
                </button>
              </li>
            ))}
          </ul>
          <BotonHex variante="carbon" size="sm" icono={ChevronRight} onClick={siguiente} className={BTN}><span className="sr-only">Siguiente</span></BotonHex>
          {puedeAuto && (
            <BotonHex
              variante="contorno"
              size="sm"
              icono={pausaUsuario ? Play : Pause}
              onClick={() => setPausaUsuario((p) => !p)}
              className={BTN}
            >
              <span className="sr-only">{pausaUsuario ? 'Reanudar avance automático' : 'Pausar avance automático'}</span>
            </BotonHex>
          )}
        </div>
      )}
    </section>
  );
}
