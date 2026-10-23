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
  /** Modo fundido: diapositivas apiladas que cambian con fundido (sin scroll), sin flechas ni puntos; solo queda el botón de pausa,
   *  visible únicamente con foco de teclado (WCAG 2.2.2). Avanza también con prefers-reduced-motion (cambio instantáneo). */
  fundido?: boolean;
  /** Muestra flechas laterales discretas en el modo fundido; la pausa queda disponible al enfocar con teclado. */
  controlesFundido?: boolean;
  /** Modo fundido: elemento decorativo hermano de la pista que depende de la diapositiva activa (p. ej. fotos del hero).
   *  Queda dentro del carrusel, así hover/foco/toque sobre él también pausan el avance (WCAG 2.2.2). */
  visual?: (activa: number) => React.ReactNode;
  className?: string;
};

const BTN = 'w-12 !px-0 sm:w-16';

/** Carrusel sin librerías: scroll-snap nativo (swipe táctil), autoavance que se pausa con hover/foco de teclado/toque y se apaga
 *  con prefers-reduced-motion, flechas, puntos y teclado (←/→). Las no visibles quedan `inert`.
 *  El botón Pausar/Reanudar es autoritativo: manda sobre hover y foco (WCAG 2.2.2). */
export default function Carrusel({ etiqueta, diapositivas, ancho = 'basis-full', gap = 'gap-0', auto = 0, controles = '', fundido = false, controlesFundido = false, visual, className = '' }: Props) {
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

  const todas = !fundido && visibles.every(Boolean);
  const vis = (i: number) => (fundido ? i === activa : visibles[i]);
  // Con prefers-reduced-motion no hay avance automático (se respeta el ajuste del SO); solo si el usuario pulsa Reproducir.
  const puedeAuto = auto > 0 && !todas && (!reducido || manual === 'play');
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
    const ioPantalla = new IntersectionObserver(([e]) => setEnPantalla(e.isIntersecting));
    ioPantalla.observe(r);
    if (fundido) return () => ioPantalla.disconnect();
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
  }, [N, fundido]);

  const ir = useCallback((i: number, usuario = true) => {
    if (fundido) { if (usuario) setReinicio((n) => n + 1); setActiva(i); return; }
    const el = pista.current;
    const h = el?.children[i] as HTMLElement | undefined;
    if (!el || !h) return;
    if (usuario) setReinicio((n) => n + 1);
    el.scrollTo({ left: h.offsetLeft - el.offsetLeft, behavior: reducido ? 'auto' : 'smooth' });
  }, [reducido, fundido]);

  const siguiente = (usuario = true) => ir(activa >= N - 1 ? 0 : activa + 1, usuario);
  const anterior = () => ir((activa - 1 + N) % N);

  const controlFundido = useRef<HTMLDivElement>(null);
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
      onTouchStart={() => setTocado(true)}
      onKeyDown={(e) => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        // Cualquier uso del teclado deja el carrusel en pausa hasta que el usuario pulse Reproducir.
        if (auto > 0) setManual('pausa');
        // La diapositiva enfocada pasará a `inert`: el foco se mueve antes a los controles del carrusel.
        if (fundido) controlFundido.current?.querySelector('button')?.focus();
        if (dir > 0) siguiente(); else anterior();
      }}
    >
      {fundido && visual?.(activa)}
      <div
        ref={pista}
        aria-live={reproduciendo ? 'off' : 'polite'}
        className={fundido ? 'relative z-10 grid lg:order-1' : `-my-4 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${gap}`}
      >
        {diapositivas.map((d, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${N}`}
            aria-hidden={vis(i) ? undefined : true}
            inert={!vis(i)}
            className={fundido
              ? `col-start-1 row-start-1 min-w-0 transition-opacity ease-out ${i === activa ? 'opacity-100 duration-500 delay-300' : 'pointer-events-none opacity-0 duration-300'}`
              : `min-w-0 shrink-0 grow-0 snap-start ${ancho}`}
          >
            {d}
          </div>
        ))}
      </div>

      {fundido && N > 1 && auto > 0 && (
        <div ref={controlFundido} className={controlesFundido ? 'contents' : 'pointer-events-none absolute bottom-1 left-4 z-10 opacity-0 focus-within:pointer-events-auto focus-within:opacity-100'}>
          {controlesFundido ? (
            <>
              <button type="button" aria-label="Diapositiva anterior" onClick={anterior} className="absolute left-2 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center text-white/65 drop-shadow-md transition duration-300 hover:scale-110 hover:text-white focus-visible:rounded-full focus-visible:outline-white sm:left-5 lg:left-8">
                <ChevronLeft aria-hidden="true" size={32} strokeWidth={1.6} />
              </button>
              <button type="button" aria-label="Siguiente diapositiva" onClick={() => siguiente()} className="absolute right-2 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center text-white/65 drop-shadow-md transition duration-300 hover:scale-110 hover:text-white focus-visible:rounded-full focus-visible:outline-white sm:right-5 lg:right-8">
                <ChevronRight aria-hidden="true" size={32} strokeWidth={1.6} />
              </button>
              <button type="button" onClick={() => setManual(reproduciendo ? 'pausa' : 'play')} className="sr-only focus:not-sr-only focus:fixed focus:bottom-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-carbon focus:px-4 focus:py-3 focus:text-white focus:shadow-lg focus-visible:outline-white">
                {reproduciendo ? 'Pausar avance automático' : 'Reanudar avance automático'}
              </button>
            </>
          ) : (
            <BotonHex variante="contorno" size="sm" icono={reproduciendo ? Pause : Play} onClick={() => setManual(reproduciendo ? 'pausa' : 'play')}>
              <span className="sr-only">{reproduciendo ? 'Pausar avance automático' : 'Reproducir avance automático'}</span>
            </BotonHex>
          )}
        </div>
      )}
      {!fundido && N > 1 && (
        <div className={`mt-5 flex items-center justify-start gap-2 sm:mt-6 sm:justify-center sm:gap-3 ${controles}`}>
          {auto > 0 && (puedeAuto ? (
            <BotonHex
              variante="contorno"
              size="sm"
              icono={reproduciendo ? Pause : Play}
              onClick={() => setManual(reproduciendo ? 'pausa' : 'play')}
              className={BTN}
            >
              <span className="sr-only">{reproduciendo ? 'Pausar avance automático' : 'Reproducir avance automático'}</span>
            </BotonHex>
          ) : (
            <span aria-hidden="true" className="w-12 sm:w-16" /> // reserva el hueco: nada se mueve al hidratar
          ))}
          <BotonHex variante="carbon" size="sm" icono={ChevronLeft} onClick={anterior} className={BTN}><span className="sr-only">Anterior</span></BotonHex>
          <ul className="flex items-center">
            {diapositivas.map((_, i) => (
              <li key={i}>
                <button
                  type="button"
                  aria-label={`Ir a la diapositiva ${i + 1}`}
                  aria-current={i === activa ? 'true' : undefined}
                  onClick={() => ir(i)}
                  className="group/punto grid h-11 w-6 place-items-center sm:w-11"
                >
                  {/* Inactivo carbon/60: 3.5:1 sobre blanco y 3.4:1 sobre gris; activo tinta y alargado (≈5:1 frente al inactivo). */}
                  <span className={`block h-2.5 rounded-full transition-all ${i === activa ? 'w-7 bg-tinta' : 'w-2.5 bg-carbon/60 group-hover/punto:bg-carbon'}`} />
                </button>
              </li>
            ))}
          </ul>
          <BotonHex variante="carbon" size="sm" icono={ChevronRight} onClick={() => siguiente()} className={BTN}><span className="sr-only">Siguiente</span></BotonHex>
        </div>
      )}
    </section>
  );
}
