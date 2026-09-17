import { Navbar9 } from './Navbar9';
import { SparkleIcon, ArrowUpRightIcon, ChevronRightIcon } from '@/components/site/icons';

/**
 * Hero del Modelo 9 -- misma mecánica que el spec de referencia de "RIVR"
 * (dashboard DeFi): tarjeta redondeada a pantalla completa con nav propio,
 * badge+titular centrados y dos tarjetas de vidrio flotantes -- una con un
 * stat real, otra con el truco de "esquina recortada" en SVG puro (2
 * máscaras que tapan la intersección de bordes redondeados, sin ninguna
 * librería). Fondo: video real del usuario (soluciones-ti.mp4, comprimido de
 * 326MB/4K a ~9.7MB/1080p con ffmpeg -- el original pesaba demasiado para
 * servir en la web tal cual) -- el spec original de RIVR
 * también usaba un mp4 de fondo, así que esto es fiel al diseño de
 * referencia en vez de la foto estática que había antes por no tener un
 * video propio todavía.
 */
export function Hero9() {
  return (
    <div className="flex w-full items-center justify-center bg-[#f0f0f0] p-3 md:p-5">
      <section className="relative flex h-[92vh] w-full max-w-[1536px] flex-col items-center overflow-hidden rounded-[1.5rem] bg-white/10 md:rounded-[3rem]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/modelo9/hero-office.jpg"
          aria-hidden
          className="absolute inset-0 z-0 h-full w-full object-cover object-[65%_center] lg:object-center"
        >
          <source src="/videos/soluciones-ti.mp4" type="video/mp4" />
        </video>
        {/* Overlay negro semitransparente (antes era blanco) -- el texto
            claro necesita fondo oscuro para leerse bien encima de un video,
            no de una foto fija de oficina. Degradé extra al centro para que
            el bloque de texto tenga aún más contraste que los bordes. */}
        <div className="absolute inset-0 z-[1] bg-black/45" />
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,0,0,0.35),transparent)]" />

        <div className="relative z-10 flex h-full w-full flex-col items-center">
          <Navbar9 />

          <div className="flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 text-center">
            <div
              className="v9-appear v9-appear--up mx-auto mb-3 flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md"
              style={{ animationDelay: '0ms' }}
            >
              <SparkleIcon className="h-4 w-4 text-white" />
              <span className="text-sm text-white">Distribución autorizada</span>
            </div>

            <h1
              className="v9-appear v9-appear--scale mb-2 text-4xl font-normal leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[72px]"
              style={{ animationDelay: '200ms', textShadow: '0 4px 30px rgba(0,0,0,0.45)' }}
            >
              Tecnología sin fricción para tu empresa
            </h1>
            <p
              className="v9-appear v9-appear--fade max-w-xl text-sm leading-relaxed text-white/85 sm:text-base md:text-lg"
              style={{ animationDelay: '400ms', textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
            >
              Monitores, laptops, servidores y pantallas interactivas con stock local — cotización sin compromiso,
              distribución autorizada de las principales marcas.
            </p>
          </div>

          <BottomLeftCard />
          <BottomRightCorner />
        </div>
      </section>
    </div>
  );
}

/* Las 2 tarjetas flotantes ahora usan el mismo efecto "vidrio" del badge
   "Distribución autorizada" (border-white/25 + bg-white/10 + backdrop-blur,
   texto blanco) en vez del blanco sólido/translúcido original -- combinan
   con el fondo de video oscuro. */
function BottomLeftCard() {
  return (
    <div
      className="v9-appear v9-appear--left absolute bottom-28 right-4 flex w-fit min-w-[150px] flex-col gap-2 rounded-[1.2rem] border border-white/25 bg-white/10 p-2 backdrop-blur-md md:bottom-6 md:left-6 md:right-auto md:rounded-[1.5rem] lg:bottom-10 lg:left-10"
      style={{ animationDelay: '260ms' }}
    >
      <a href="/servicios" className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-5 transition-colors hover:bg-white/10">
        <span className="flex items-center justify-center rounded-full bg-white/15 p-1">
          <ArrowUpRightIcon className="h-4 w-4 text-white" />
        </span>
        <span className="text-sm font-normal text-white">Ver soluciones</span>
      </a>
      <a href="/tienda" className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-5 transition-colors hover:bg-white/90">
        <span className="flex items-center justify-center rounded-full bg-[rgba(30,50,90,0.1)] p-1">
          <ArrowUpRightIcon className="h-4 w-4 text-[rgba(30,50,90,0.9)]" />
        </span>
        <span className="text-sm font-normal text-[rgba(30,50,90,0.9)]">Ver tienda</span>
      </a>
    </div>
  );
}

/* Antes era "Contáctanos" -> WhatsApp con un truco de esquina recortada en
   SVG (2 máscaras color #f0f0f0 para que la tarjeta se mimetizara con el
   fondo claro de la página). Esa tarjeta pasó a ser "Ver tienda" y ahora
   flota con el mismo estilo de vidrio que las demás -- se quitó el truco de
   esquina porque estaba pensado para un fondo sólido claro, no para el
   video de fondo. */
function BottomRightCorner() {
  return (
    <div
      className="v9-appear v9-appear--up absolute bottom-6 right-4 flex items-center gap-3 rounded-[1.5rem] border border-white/25 bg-white/10 p-3 pr-5 backdrop-blur-md md:bottom-6 md:right-6 md:p-4 md:pr-6 lg:bottom-10 lg:right-10"
      style={{ animationDelay: '380ms' }}
    >
      <a href="/tienda" className="flex items-center gap-3 md:gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 md:h-14 md:w-14">
          <ArrowUpRightIcon className="h-4 w-4 text-white md:h-5 md:w-5" />
        </span>
        <span className="flex flex-col text-left">
          <span className="text-[16px] font-normal text-white md:text-[20px]">Ver tienda</span>
          <span className="flex items-center gap-1 text-white/60 transition-colors hover:text-white/80">
            <span className="text-[12px] font-normal md:text-[15px]">Catálogo completo</span>
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </span>
        </span>
      </a>
    </div>
  );
}
