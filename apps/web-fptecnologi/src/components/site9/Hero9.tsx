import Image from 'next/image';
import { STATS } from '@/lib/content';
import { Navbar9 } from './Navbar9';
import { SparkleIcon, ArrowUpRightIcon, ChevronRightIcon } from '@/components/site/icons';

/**
 * Hero del Modelo 9 -- misma mecánica que el spec de referencia de "RIVR"
 * (dashboard DeFi): tarjeta redondeada a pantalla completa con foto de
 * fondo, nav propio, badge+titular centrados y dos tarjetas de vidrio
 * flotantes -- una con un stat real, otra con el truco de "esquina
 * recortada" en SVG puro (2 máscaras que tapan la intersección de bordes
 * redondeados, sin ninguna librería). Fondo: foto de stock de Unsplash
 * (oficina moderna, licencia libre, ver "Fuente de la imagen" en el commit)
 * en vez del mp4 de CloudFront del spec original -- no es un asset propio.
 */
export function Hero9() {
  return (
    <div className="flex w-full items-center justify-center bg-[#f0f0f0] p-3 md:p-5">
      <section className="relative flex h-[92vh] w-full max-w-[1536px] flex-col items-center overflow-hidden rounded-[1.5rem] bg-white/10 md:rounded-[3rem]">
        <Image
          src="/images/modelo9/hero-office.jpg"
          alt="Oficina moderna con equipos de escritorio — FPTecnologi"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 object-cover object-[65%_center] lg:object-center"
        />
        <div className="absolute inset-0 z-[1] bg-white/35" />

        <div className="relative z-10 flex h-full w-full flex-col items-center">
          <Navbar9 />

          <div className="flex w-full max-w-4xl flex-col items-center px-6 pt-6 text-center">
            <div
              className="v9-appear v9-appear--up mx-auto mb-3 flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/60 px-4 py-2 backdrop-blur-md"
              style={{ animationDelay: '0ms' }}
            >
              <SparkleIcon className="h-4 w-4 text-[rgba(30,50,90,0.8)]" />
              <span className="text-sm text-[rgba(30,50,90,0.9)]">Distribución autorizada</span>
            </div>

            <h1
              className="v9-appear v9-appear--scale mb-2 text-4xl font-normal leading-[1.05] tracking-tight text-[#3d4452] sm:text-5xl md:text-6xl lg:text-[72px]"
              style={{ animationDelay: '200ms' }}
            >
              Tecnología sin fricción para tu empresa
            </h1>
            <p
              className="v9-appear v9-appear--fade max-w-xl text-sm leading-relaxed text-[#3d4452]/80 sm:text-base md:text-lg"
              style={{ animationDelay: '400ms' }}
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

function BottomLeftCard() {
  const stat = STATS[0];
  return (
    <div
      className="v9-appear v9-appear--left absolute bottom-28 left-auto right-4 flex w-fit min-w-[140px] flex-col gap-2 rounded-[1.2rem] bg-white/40 p-3 backdrop-blur-xl md:bottom-6 md:left-6 md:right-auto md:min-w-[150px] md:rounded-[1.5rem] md:p-4 lg:bottom-10 lg:left-10 lg:gap-3 lg:rounded-[2.2rem] lg:p-5"
      style={{ animationDelay: '260ms' }}
    >
      <div>
        <p className="text-2xl font-normal tracking-tight text-[rgba(30,50,90,0.9)] md:text-3xl">
          {stat.value}
          {stat.suffix}
        </p>
        <p className="text-[10px] font-normal uppercase tracking-wider text-[rgba(30,50,90,0.6)] md:text-[12px]">{stat.label}</p>
      </div>
      <a href="/#catalogo" className="flex items-center gap-2 self-start rounded-full bg-white py-1.5 pl-1.5 pr-5 transition-colors hover:bg-white/90">
        <span className="flex items-center justify-center rounded-full bg-[rgba(30,50,90,0.1)] p-1">
          <ArrowUpRightIcon className="h-4 w-4 text-[rgba(30,50,90,0.9)]" />
        </span>
        <span className="text-sm font-normal text-[rgba(30,50,90,0.9)]">Ver catálogo</span>
      </a>
    </div>
  );
}

function BottomRightCorner() {
  return (
    <div
      className="v9-appear v9-appear--up absolute bottom-0 right-0 flex items-center gap-3 rounded-tl-[1.5rem] bg-[#f0f0f0] p-3 pl-8 pt-5 sm:gap-4 sm:rounded-tl-[2rem] sm:p-4 sm:pl-10 sm:pt-6 md:gap-6 md:rounded-tl-[3.5rem] md:p-6 md:pl-14 md:pt-8"
      style={{ animationDelay: '380ms' }}
    >
      {/* Máscaras que "recortan" la esquina de la tarjeta contra el fondo
          #f0f0f0 -- mismo truco del spec de RIVR, CSS/SVG puro reusable. */}
      <div className="pointer-events-none absolute -top-[1.5rem] right-0 h-[1.5rem] w-[1.5rem] sm:-top-[2rem] sm:h-[2rem] sm:w-[2rem] md:-top-[3.5rem] md:h-[3.5rem] md:w-[3.5rem]">
        <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none">
          <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#f0f0f0" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -left-[1.5rem] bottom-0 h-[1.5rem] w-[1.5rem] sm:-left-[2rem] sm:h-[2rem] sm:w-[2rem] md:-left-[3.5rem] md:h-[3.5rem] md:w-[3.5rem]">
        <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none">
          <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#f0f0f0" />
        </svg>
      </div>

      <a href="https://wa.me/51908856286" target="_blank" rel="noreferrer" className="flex items-center gap-3 md:gap-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(30,50,90,0.1)] bg-[rgba(30,50,90,0.05)] md:h-14 md:w-14">
          <ArrowUpRightIcon className="h-4 w-4 text-[rgba(30,50,90,0.8)] md:h-5 md:w-5" />
        </span>
        <span className="flex flex-col text-left">
          <span className="text-[16px] font-normal text-[rgba(30,50,90,0.95)] md:text-[20px]">Contáctanos</span>
          <span className="flex items-center gap-1 text-[rgba(30,50,90,0.6)] transition-colors hover:text-[rgba(30,50,90,0.8)]">
            <span className="text-[12px] font-normal md:text-[15px]">WhatsApp</span>
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </span>
        </span>
      </a>
    </div>
  );
}
