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

/** Carrusel sin librerías: scroll-snap nativo (swipe táctil), autoavance que se pausa con hover/foco de teclado/toque y se apaga
 *  con prefers-reduced-motion, flechas, puntos y teclado (←/→). Las no visibles quedan `inert`.
 *  El botón Pausar/Reanudar es autoritativo: manda sobre hover y foco (WCAG 2.2.2). */
export default function Carrusel({ etiqueta, diapositivas, ancho = 'basis-full', gap = 'gap-0', auto = 0, controles = '', className = '' }: Props) {
  const raiz = useRef<HTMLElement>(null);
  const pista = useRef<HTMLDivElement>(null);
  const [visibles, setVisibles] = useState<boolean[]>(() => diapositivas.map(() => true)); // SSR: todas visibles, sin JS no se oculta nada
  const [activa, setActiva] = useState(0);
  const [reducido, setReducido] = useState(true); // hasta saberlo, nada se mueve solo
  const [manual, setManual] = useState<'pausa' | 'play' | null>(null); // elección explícita del usuario
  const [encima, setEncima] = useState(false);
  const [foco, setFoco] = useState(false); // solo foco de teclado
  const [tocado, setTocado] = useState(false);
  const [enPantalla, setEnPantalla] = useState(true);
  const [oculta, setOculta] = useState(false); // pestaña en segundo plano
  const [reinicio, setReinicio] = useState(0); // cada navegación manual reinicia el temporizador
  const N = diapositivas.length;

  const todas = visibles.every(Boolean);
  const puedeAuto = auto > 0 && !reducido && !todas;
  const automatica = manual === 'play' || (manual === null && !encima && !foco && !tocado);
  const reproduciendo = puedeAuto && automatica && enPantalla && !oculta;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setReducido(mq.matches);
    f();
    mq.addEventListener('change', f);
    const v = () => setOculta(document.hidden);
    document.addEventListener('visibilitychange', v);
    return () => { mq.removeEventListener('change', f); document.removeEventListener('visibilitychange', v); };
  }, []);

  // Qué diapositivas se ven (>= 60 %), posición activa según el scroll y si el carrusel está en pantalla.
  useEffect(() => {
    const el = pista.current, r = raiz.current;
    if (!el || !r) return;
    const hijos = Array.from(el.children) as HTMLElement[];
    const estado = hijos.map(() => true);
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) estado[hijos.indexOf(e.target as HTMLElement)] = e.intersectionRatio >= 0.6;
        setVisibles([...estado]);
      },
      { root: el, threshold: [0, 0.6, 1] },
    );
    hijos.forEach((h) => io.observe(h));
    const ioPantalla = new IntersectionObserver(([e]) => setEnPantalla(e.isIntersecting));
    ioPantalla.observe(r);
    // Activa = progreso del scroll mapeado a 0…N-1: llega a la última aunque el scroll no alcance su inicio.
    let raf = 0;
    const alScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = el.scrollWidth - el.clientWidth;
        setActiva(max > 2 ? Math.round((el.scrollLeft / max) * (N - 1)) : 0);
      });
    };
    el.addEventListener('scroll', alScroll, { passive: true });
    return () => { io.disconnect(); ioPantalla.disconnect(); el.removeEventListener('scroll', alScroll); cancelAnimationFrame(raf); };
  }, [N]);

  const ir = useCallback((i: number, usuario = true) => {
    const el = pista.current;
    const h = el?.children[i] as HTMLElement | undefined;
    if (!el || !h) return;
    if (usuario) setReinicio((n) => n + 1);
    el.scrollTo({ left: h.offsetLeft - el.offsetLeft, behavior: reducido ? 'auto' : 'smooth' });
  }, [reducido]);

  const siguiente = (usuario = true) => ir(activa >= N - 1 ? 0 : activa + 1, usuario);
  const anterior = () => ir((activa - 1 + N) % N);

  const sig = useRef(siguiente);
  sig.current = siguiente;
  useEffect(() => {
    if (!reproduciendo) return;
    const t = setInterval(() => sig.current(false), auto);
    return () => clearInterval(t);
  }, [reproduciendo, auto, reinicio]);

  // El toque pausa el autoavance unos segundos.
  useEffect(() => {
    if (!tocado) return;
    const t = setTimeout(() => setTocado(false), 10000);
    return () => clearTimeout(t);
  }, [tocado]);

  return (
    <section
      ref={raiz}
      aria-roledescription="carrusel"
      aria-label={etiqueta}
      className={className}
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={(e) => { if (e.target.matches(':focus-visible')) setFoco(true); }}
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
        <div className={`mt-5 flex items-center justify-center gap-2 sm:mt-6 sm:gap-3 ${controles}`}>
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
                  {/* Inactivo carbon/60: 3.5:1 sobre blanco y 3.4:1 sobre gris; activo tinta y alargado (≈5:1 frente al inactivo). */}
                  <span className={`block h-2.5 rounded-full transition-all ${i === activa ? 'w-7 bg-tinta' : 'w-2.5 bg-carbon/60 group-hover/punto:bg-carbon'}`} />
                </button>
              </li>
            ))}
          </ul>
          <BotonHex variante="carbon" size="sm" icono={ChevronRight} onClick={() => siguiente()} className={BTN}><span className="sr-only">Siguiente</span></BotonHex>
          {auto > 0 && (puedeAuto ? (
            <BotonHex
              variante="contorno"
              size="sm"
              icono={reproduciendo ? Pause : Play}
              onClick={() => setManual(reproduciendo ? 'pausa' : 'play')}
              className={BTN}
            >
              <span className="sr-only">{reproduciendo ? 'Pausar avance automático' : 'Reanudar avance automático'}</span>
            </BotonHex>
          ) : (
            <span aria-hidden="true" className="w-14 sm:w-16" /> // reserva el hueco: nada se mueve al hidratar
          ))}
        </div>
      )}
    </section>
  );
}
