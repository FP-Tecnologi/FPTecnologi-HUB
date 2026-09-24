'use client';

import { useEffect, useState, type ComponentType, type FormEvent } from 'react';
import { Navbar9 } from './Navbar9';
import { HERO_SLIDES } from '@/lib/content';
import { SparkleIcon, ArrowUpRightIcon } from '@/components/site/icons';
import { useChatWidget } from '@/context/ChatWidgetContext';
import { ParticlesBackground } from './ParticlesBackground';
import { StickyNav } from './StickyNav';
import { ClickConfirmButton } from './ClickConfirmButton';

// Solo Servicios/Tienda para este hero (a diferencia del carrusel de 3 del
// Modelo 1, acá no entra "Partners" -- pedido explícito del usuario). Mismo
// HERO_SLIDES real de content.ts, sin inventar copy nuevo.
const SLIDES = HERO_SLIDES.filter((s) => s.key === 'servicios' || s.key === 'tienda');
const ROTATE_MS = 7000;

/**
 * Hero del Modelo 9 -- misma mecánica que el spec de referencia de "RIVR"
 * (dashboard DeFi): tarjeta redondeada a pantalla completa con nav propio,
 * badge+titular centrados y dos tarjetas de vidrio flotantes -- una con un
 * stat real, otra con el truco de "esquina recortada" en SVG puro (2
 * máscaras que tapan la intersección de bordes redondeados, sin ninguna
 * librería). Fondo: video real del usuario (soluciones-ti.mp4, comprimido de
 * 326MB/4K a ~9.7MB/1080p con ffmpeg -- el original pesaba demasiado para
 * servir en la web tal cual, y recortado a 10s para no llegar al título en
 * inglés "IT SOLUTIONS" que trae el clip original hacia el segundo 16).
 *
 * Encima del video, el título/subtítulo/descripción ya no son fijos: rotan
 * cada 7s entre Servicios y Tienda (mismo mecanismo de HERO_SLIDES que tenía
 * el Modelo 1), con el título en dos colores (blanco + celeste #8fe0ee para
 * la frase que importa). La tarjeta flotante de abajo a la izquierda marca
 * en blanco cuál de los dos está activo en cada momento.
 */
export function Hero() {
  const [active, setActive] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % SLIDES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[active];

  return (
    // Sin ScrollReveal: al volver a subir, el hero se ocultaba antes de
    // tiempo. El texto rotativo sigue con su propia animación v9-appear.
    // Ancho completo (sin max-w fijo) para que escale en pantallas grandes;
    // alto en svh con un mínimo para pantallas bajas.
    <>
      <StickyNav />
      <div className="flex w-full items-center justify-center bg-paper p-3 md:p-5">
        <section className="relative flex h-[92svh] min-h-[560px] w-full flex-col items-center overflow-hidden rounded-[1.25rem] bg-white/10 md:rounded-[2.25rem]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/modelo9/hero-office.jpg"
          onCanPlay={() => setVideoReady(true)}
          aria-hidden
          className="absolute inset-0 z-0 h-full w-full object-cover object-[65%_center] lg:object-center"
        >
          <source src="/videos/soluciones-ti.mp4" type="video/mp4" />
        </video>
        {/* Imagen de respaldo mientras el video termina de cargar (conexión
            lenta) -- el atributo `poster` del <video> no siempre cubre ese
            hueco en todos los navegadores, así que se controla a mano con
            onCanPlay y se desvanece recién cuando el video puede reproducirse. */}
        <img
          src="/images/modelo9/hero-office.jpg"
          alt=""
          aria-hidden
          className={`absolute inset-0 z-0 h-full w-full object-cover object-[65%_center] transition-opacity duration-700 lg:object-center ${
            videoReady ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {/* Overlay negro semitransparente (antes era blanco) -- el texto
            claro necesita fondo oscuro para leerse bien encima de un video,
            no de una foto fija de oficina. Degradé extra al centro para que
            el bloque de texto tenga aún más contraste que los bordes. */}
        <div className="absolute inset-0 z-[1] bg-black/45" />
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,0,0,0.35),transparent)]" />

        {/* Mismo efecto de partículas del Hero de Modelo 1 (ver
            ParticlesBackground.tsx) -- puntos conectados encima del video,
            entre el overlay oscuro (z-1) y el contenido (z-10). */}
        <div className="absolute inset-0 z-[2]">
          <ParticlesBackground />
        </div>

        <div className="relative z-10 flex h-full w-full flex-col items-center">
          {/* Solo reserva el alto: el nav visible es StickyNav (fixed),
              ubicado justo encima de este hueco y que se comprime al bajar. */}
          <div className="invisible w-full" aria-hidden>
            <Navbar9 />
          </div>

          {/* flex-1 + relative: ocupa todo el alto que sobra debajo del nav,
              para que el bloque de texto de abajo se pueda centrar en ESE
              alto completo sin que el switch/AskAiCard (que van después,
              pegados abajo) lo corran hacia arriba. */}
          <div className="relative w-full flex-1">
            {/* `key` fuerza el remount solo de esto (subtítulo+título+
                descripción) para que se reanimen en cada rotación. Centrado
                en el alto de acá abajo, pero recortando el borde inferior de
                la caja (bottom-24/28 en vez de inset-0 parejo) para que el
                bloque quede un poco más arriba -- si no, se sentía "flotando
                en el medio" con demasiado aire libre debajo, cerca de las
                tarjetas de las esquinas (switch/AskAiCard). */}
            <div key={slide.key} className="absolute inset-x-0 top-0 bottom-24 flex flex-col items-center justify-center px-6 text-center lg:bottom-28">
              <div
                className="v9-appear v9-appear--up relative mx-auto mb-3 flex w-fit items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md"
                style={{ animationDelay: '0ms' }}
              >
                {/* Contorno fino que gira siempre, como los badges de sección. */}
                <span className="spin-border spin-border--thin" aria-hidden />
                <SparkleIcon className="h-4 w-4 text-white" />
                <span className="text-sm text-white">{slide.eyebrow}</span>
              </div>

              <h1
                className="v9-appear v9-appear--scale mx-auto mb-2 max-w-4xl text-4xl font-normal leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[72px] 2xl:max-w-6xl 2xl:text-[96px]"
                style={{ animationDelay: '200ms', textShadow: '0 4px 30px rgba(0,0,0,0.45)' }}
              >
                {/* Línea 1 (blanco) y línea 2 (color) forzadas con `block` en
                    vez de dejar que el texto fluya y rompa donde le
                    convenga -- así siempre son 2 líneas prolijas, no 3 ni
                    una línea larga pegada al borde. */}
                <span className="block">{slide.titleLead}</span>
                <span className="hero-title-shimmer block">{slide.titleAccent}</span>
              </h1>

              <p
                className="v9-appear v9-appear--fade mx-auto max-w-xl px-4 text-sm leading-relaxed text-white/85 sm:text-base md:text-lg 2xl:max-w-3xl 2xl:text-2xl"
                style={{ animationDelay: '400ms', textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
              >
                {slide.text}
              </p>
            </div>

            {/* Solo mobile/tablet: estos links van pegados abajo de este
                mismo bloque (no afectan el centrado de arriba porque está
                absolute) -- en desktop (lg+) se ocultan y la posición/texto
                original ("Ver soluciones"/"Ver tienda" + "Ver tienda /
                Catálogo completo") sigue en las tarjetas flotantes de
                siempre (BottomLeftCard/BottomRightCorner), sin cambios. */}
            <div className="v9-appear v9-appear--up absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 px-6 lg:hidden">
              {/* Mismo contenedor de vidrio que el desktop (BottomLeftCard),
                  pero en fila en vez de columna -- efecto "switch" con los
                  dos botones lado a lado dentro de una sola cápsula. Esquinas
                  suaves (rounded-xl), no círculo/píldora. */}
              <div className="flex items-center gap-1 rounded-xl border border-white/25 bg-white/10 p-1 backdrop-blur-md">
                <CornerLink href="/servicios" label="Servicios" icon={ServiceIcon} active={slide.key === 'servicios'} uppercase />
                <CornerLink href="/tienda" label="Tienda TI" icon={StoreIcon} active={slide.key === 'tienda'} uppercase />
              </div>
              <div className="w-full max-w-xs rounded-[1.25rem] border border-white/25 bg-white/10 p-2 backdrop-blur-md">
                <AskAiCard />
              </div>
            </div>
          </div>

          <BottomLeftCard activeKey={slide.key} />
          <BottomRightCorner />
        </div>
        </section>
      </div>
    </>
  );
}

/* Solo desktop (lg+), tal cual estaba antes de agregar la versión mobile --
   en mobile/tablet la pareja de links equivalente ya se renderiza en el
   flujo normal, antes de la descripción (ver arriba), así que acá se oculta
   para no duplicarla. Mismo efecto "vidrio" del badge "Distribución
   autorizada" (border-white/25 + bg-white/10 + backdrop-blur, texto
   blanco). El link que coincide con el slide activo se pinta de blanco
   sólido; el otro queda en su estado "vidrio" normal. */
function BottomLeftCard({ activeKey }: { activeKey: string }) {
  return (
    <div className="absolute bottom-10 left-10 hidden h-28 w-fit min-w-[150px] flex-col justify-center gap-2 rounded-[1.5rem] border border-white/25 bg-white/10 p-2 backdrop-blur-md lg:flex 2xl:bottom-14 2xl:left-14 2xl:h-32 2xl:p-3">
      <CornerLink href="/servicios" label="Servicios" icon={ServiceIcon} active={activeKey === 'servicios'} uppercase />
      <CornerLink href="/tienda" label="Tienda TI" icon={StoreIcon} active={activeKey === 'tienda'} uppercase />
    </div>
  );
}

// `uppercase` -- mismas etiquetas "Servicios"/"Tienda TI" en mayúscula que
// el bloque mobile (antes desktop decía "Ver soluciones"/"Ver tienda" en
// Type Case normal; el usuario pidió unificarlo). `icon` es distinto por
// link -- ServiceIcon para Servicios, StoreIcon para Tienda.
function CornerLink({
  href,
  label,
  icon: Icon,
  active,
  uppercase,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
  uppercase?: boolean;
}) {
  // Mismo efecto sweep que "Cotizar" (ClickConfirmButton): el ícono cruza
  // el botón mientras se borra el texto y recién ahí navega a `href`.
  const chip = (rotated: boolean) => (
    <span
      className={`flex items-center justify-center rounded-md p-1 ${
        active ? 'bg-[rgba(30,50,90,0.1)]' : 'bg-white/15'
      }`}
    >
      <Icon
        className={`h-4 w-4 transition-transform duration-300 ${rotated ? 'rotate-45' : ''} ${
          active ? 'text-[rgba(30,50,90,0.9)]' : 'text-white'
        }`}
      />
    </span>
  );
  const classes = `rounded-lg py-1.5 pl-1.5 pr-5 text-sm 2xl:text-base ${
    uppercase ? 'font-semibold uppercase tracking-wide' : 'font-normal'
  } ${active ? 'bg-white text-[rgba(30,50,90,0.9)] hover:bg-white/90' : 'text-white hover:bg-white/10'}`;

  return (
    <ClickConfirmButton
      icon={chip}
      label={label}
      doneIcon={() => chip(false)}
      doneLabel={label}
      onConfirm={() => {
        window.location.href = href;
      }}
      className={classes}
      doneClassName={classes}
    />
  );
}

function ServiceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 7h16v12H4V7Zm4 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 12h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 7h12l-1.2 13H7.2L6 7Zm3 0V5a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Antes era "Ver tienda / Catálogo completo" (link a /tienda). A pedido del
   usuario pasa a ser "Pregunta a nuestra IA": un campo de texto que manda
   la pregunta directo al asistente virtual del widget flotante (ChatWidget,
   ver ChatWidgetContext.askAI) -- no navega a ninguna página, abre el
   widget ya con la pregunta respondida por la misma lógica de siempre.
   Se deja fija (no rota con el slide activo).
   Solo desktop (lg+): en mobile/tablet el mismo campo (AskAiCard) ya se
   renderiza en el flujo normal, después de la descripción. */
function BottomRightCorner() {
  return (
    <div className="absolute bottom-10 right-10 hidden h-28 w-80 flex-col 2xl:bottom-14 2xl:right-14 2xl:h-32 2xl:w-[26rem] 2xl:p-4 justify-center rounded-[1.25rem] border border-white/25 bg-white/10 p-3 backdrop-blur-md lg:flex">
      <AskAiCard />
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Placeholder animado tipo "máquina de escribir" (mismo lenguaje visual que
// el TypewriterText del ChatWidget), rotando entre varios ejemplos de
// pregunta -- una por cada área real del sitio (servicios, tienda,
// partners), para que se note que el campo sirve para las tres, no solo
// para servicios. El botón de enviar usa la misma flechita
// (ArrowUpRightIcon) que el botón "Cotizar" del nav -- no un ícono de
// robot/mensaje aparte, para que todos los CTA del hero compartan un solo
// lenguaje de ícono.
// Cortas a propósito -- tienen que entrar completas en el campo (angosto,
// texto chico) sin cortarse ni scrollear.
const ASK_PLACEHOLDERS = ['¿Qué servicios ofrecen?', '¿Qué hay en la tienda?', '¿Cómo ser partner?'];
const TYPE_MS = 60;
const PAUSE_FULL_MS = 1600;
const ERASE_MS = 30;
const PAUSE_EMPTY_MS = 400;

// Un <input> nativo no permite animar el placeholder con HTML, así que se
// arma el string letra por letra a mano: escribe una pregunta, pausa, la
// borra, y pasa a la siguiente de la lista en loop -- con un cursor "▍" al
// final mientras hay texto.
function useTypewriterPlaceholder(texts: string[]) {
  const [value, setValue] = useState('');

  useEffect(() => {
    let textIndex = 0;
    let i = 0;
    let timeoutId: number;

    function typing() {
      const text = texts[textIndex];
      i++;
      setValue(text.slice(0, i) + '▍');
      if (i < text.length) {
        timeoutId = window.setTimeout(typing, TYPE_MS);
      } else {
        timeoutId = window.setTimeout(erasing, PAUSE_FULL_MS);
      }
    }

    function erasing() {
      const text = texts[textIndex];
      i--;
      setValue(text.slice(0, i) + (i > 0 ? '▍' : ''));
      if (i > 0) {
        timeoutId = window.setTimeout(erasing, ERASE_MS);
      } else {
        textIndex = (textIndex + 1) % texts.length;
        timeoutId = window.setTimeout(typing, PAUSE_EMPTY_MS);
      }
    }

    timeoutId = window.setTimeout(typing, TYPE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [texts]);

  return value;
}

const SEND_SWEEP_MS = 600;

function AskAiCard() {
  const { askAI } = useChatWidget();
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);
  const animatedPlaceholder = useTypewriterPlaceholder(ASK_PLACEHOLDERS);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (sent) return;
    const question = value.trim();
    if (!question) return;
    askAI(question);
    setValue('');
    // Mismo espíritu que el sweep de "Cotizar" (ClickConfirmButton) -- acá
    // no hay texto que borrar (es un botón de solo ícono), así que en vez
    // de deslizar la flecha sobre un label, la flecha gira y sale hacia un
    // lado mientras entra un check por el otro.
    setSent(true);
    window.setTimeout(() => setSent(false), SEND_SWEEP_MS);
  }

  return (
    <div className="w-full">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-white/70 sm:text-sm 2xl:mb-2 2xl:text-base">
        Pregunta a nuestra Inteligencia Artificial
        <SparkleIcon className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
      </span>
      <form onSubmit={handleSubmit} className="flex w-full min-w-0 items-center gap-2">
        {/* Fondo oscuro/vidrio en reposo; al enfocar pasa a blanco suave
            para que se note bien lo que se está escribiendo (texto pasa a
            oscuro en ese momento). Placeholder animado -- ver
            useTypewriterPlaceholder arriba. */}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={animatedPlaceholder}
          className="min-w-0 flex-1 rounded-lg bg-black/25 px-3.5 py-2.5 text-xs text-white outline-none transition-colors placeholder:text-white/60 focus:bg-white/95 focus:text-ink focus:placeholder:text-ink/40 md:text-sm 2xl:py-3 2xl:text-base"
        />
        <button
          type="submit"
          aria-label="Preguntar a la IA"
          className="group flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-dark text-white transition-[transform,background-color] hover:scale-105 hover:bg-brand-primary active:scale-95"
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            <ArrowUpRightIcon
              className={`absolute h-5 w-5 transition-all duration-300 ease-out ${
                sent ? 'translate-x-5 rotate-45 opacity-0' : 'translate-x-0 rotate-0 opacity-100 group-hover:rotate-45'
              }`}
            />
            <CheckIcon
              className={`absolute h-5 w-5 transition-all duration-300 ease-out ${
                sent ? 'translate-x-0 opacity-100' : '-translate-x-5 opacity-0'
              }`}
            />
          </span>
        </button>
      </form>
    </div>
  );
}
